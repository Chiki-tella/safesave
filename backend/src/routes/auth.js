import express from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';
import { authenticateWallet } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/connect-wallet:
 *   post:
 *     summary: Connect wallet and get JWT token
 *     description: Authenticate a Cardano wallet and receive a JWT token for subsequent API calls
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WalletConnectRequest'
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/connect-wallet', async (req, res, next) => {
  try {
    const { walletAddress, stakeAddress, signature } = req.body;

    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }


    const token = jwt.sign(
      { 
        walletAddress, 
        stakeAddress: stakeAddress || null 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      walletAddress,
      expiresIn: '24h'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Retrieve information about the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticateWallet, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify JWT token
 *     description: Verify if the provided JWT token is valid
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify', authenticateWallet, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.user
  });
});

export default router;
