import express from 'express';
import { authenticateWallet } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import blockfrostService from '../services/blockfrost.js';
import cardanoService from '../services/cardano.js';

const router = express.Router();

/**
 * @swagger
 * /api/loan/status/{walletAddress}:
 *   get:
 *     summary: Get loan status for user
 *     description: Retrieve all loans and their status for a specific wallet
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Cardano wallet address
 *         example: addr_test1qz...
 *     responses:
 *       200:
 *         description: Loan status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanStatus'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status/:walletAddress', authenticateWallet, async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const loanContractAddress = process.env.LOAN_CONTRACT_ADDRESS;

    if (!loanContractAddress) {
      throw new AppError('Loan contract address not configured', 500);
    }

    const utxos = await blockfrostService.getScriptUtxos(loanContractAddress);
    
    const loans = [];
    
    for (const utxo of utxos) {
      if (utxo.inline_datum) {
        const parsed = cardanoService.parseDatum(utxo.inline_datum);
        
        // Loan datum structure: Loan(borrower, loan_amount, interest, due_date, repaid_amount, status)
        if (parsed && parsed.fields) {
          const [borrower, loanAmount, interest, dueDate, repaidAmount, status] = parsed.fields;
          
          if (borrower === walletAddress.substring(2)) {
            const remaining = loanAmount + interest - repaidAmount;
            
            loans.push({
              borrower: walletAddress,
              loanAmount: cardanoService.lovelaceToAda(loanAmount),
              interest: cardanoService.lovelaceToAda(interest),
              dueDate: new Date(dueDate).toISOString(),
              repaidAmount: cardanoService.lovelaceToAda(repaidAmount),
              remainingAmount: cardanoService.lovelaceToAda(remaining),
              status: this.getLoanStatus(status),
              utxoRef: `${utxo.tx_hash}#${utxo.output_index}`
            });
          }
        }
      }
    }

    res.json({
      success: true,
      loans,
      activeLoans: loans.filter(l => l.status === 'Active').length,
      totalBorrowed: loans.reduce((sum, l) => sum + l.loanAmount, 0)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/loan/request:
 *   post:
 *     summary: Request a loan
 *     description: Submit a loan request with specified amount and duration
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoanRequest'
 *     responses:
 *       200:
 *         description: Loan request prepared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanRequestResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/request', authenticateWallet, async (req, res, next) => {
  try {
    const { amount, durationDays } = req.body;
    const { walletAddress } = req.user;

    if (!amount || amount <= 0) {
      throw new AppError('Invalid loan amount', 400);
    }

    if (!durationDays || durationDays <= 0) {
      throw new AppError('Invalid loan duration', 400);
    }

    // Check eligibility (simplified)
    // TODO: Check actual savings balance from blockchain
    const minSavingsRequired = amount * 0.5; // 50% of loan amount

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);

    // Calculate interest (5% for example)
    const interestRate = 0.05;
    const interest = amount * interestRate;

    res.json({
      success: true,
      message: 'Loan request prepared',
      loan: {
        borrower: walletAddress,
        amount,
        interest,
        totalRepayment: amount + interest,
        dueDate: dueDate.toISOString(),
        durationDays,
        // In production, return transaction CBOR for signing
        cbor: 'placeholder_loan_transaction_cbor'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/loan/repay:
 *   post:
 *     summary: Repay a loan
 *     description: Make a repayment towards an existing loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RepaymentRequest'
 *     responses:
 *       200:
 *         description: Repayment transaction prepared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RepaymentResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/repay', authenticateWallet, async (req, res, next) => {
  try {
    const { amount, loanUtxoRef } = req.body;
    const { walletAddress } = req.user;

    if (!amount || amount <= 0) {
      throw new AppError('Invalid repayment amount', 400);
    }

    if (!loanUtxoRef) {
      throw new AppError('Loan UTxO reference required', 400);
    }

    const lovelaceAmount = cardanoService.adaToLovelace(amount);

    res.json({
      success: true,
      message: 'Repayment transaction prepared',
      repayment: {
        borrower: walletAddress,
        amount,
        lovelaceAmount,
        loanUtxoRef,
        // In production, return transaction CBOR for signing
        cbor: 'placeholder_repayment_transaction_cbor'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper to decode loan status
function getLoanStatus(statusConstructor) {
  switch (statusConstructor) {
    case '0': return 'Active';
    case '1': return 'Cleared';
    case '2': return 'Late';
    default: return 'Unknown';
  }
}

export default router;
