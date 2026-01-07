import express from 'express';
import { authenticateWallet } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import blockfrostService from '../services/blockfrost.js';

const router = express.Router();

/**
 * @swagger
 * /api/rewards/{walletAddress}:
 *   get:
 *     summary: Get user badges
 *     description: Retrieve all NFT badges owned by a wallet
 *     tags: [Rewards]
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
 *         description: Badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadgesResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:walletAddress', authenticateWallet, async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const rewardsContractAddress = process.env.REWARDS_CONTRACT_ADDRESS;

    if (!rewardsContractAddress) {
      throw new AppError('Rewards contract address not configured', 500);
    }

    let assets = [];
    try {
      assets = await blockfrostService.api.addressesExtended(walletAddress);
    } catch (error) {
      // If address not found or has no assets, return empty array
      if (error.status_code === 404 || error.message.includes('not been found')) {
        assets = [];
      } else {
        throw error;
      }
    }
    
    const badges = (assets.amount || [])
      .filter(asset => asset.unit !== 'lovelace' && asset.unit.startsWith(rewardsContractAddress))
      .map(asset => ({
        assetId: asset.unit,
        quantity: asset.quantity,
        name: decodeBadgeName(asset.unit)
      }));

    res.json({
      success: true,
      badges,
      totalBadges: badges.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rewards/claim/{badgeType}:
 *   post:
 *     summary: Claim a badge
 *     description: Claim an NFT badge based on achievements (streak or early-repay)
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: badgeType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [streak, early-repay]
 *         description: Type of badge to claim
 *         example: streak
 *     responses:
 *       200:
 *         description: Badge claim prepared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadgeClaimResponse'
 *       400:
 *         description: Invalid badge type
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
router.post('/claim/:badgeType', authenticateWallet, async (req, res, next) => {
  try {
    const { badgeType } = req.params;
    const { walletAddress } = req.user;

    const validBadgeTypes = ['streak', 'early-repay'];
    
    if (!validBadgeTypes.includes(badgeType)) {
      throw new AppError('Invalid badge type', 400);
    }

    // TODO: Verify eligibility from blockchain state
    // For streak badge: check if user has 10+ streak
    // For early-repay badge: check if user repaid loan early

    res.json({
      success: true,
      message: 'Badge claim prepared',
      badge: {
        type: badgeType,
        recipient: walletAddress,
        // In production, return transaction CBOR for signing
        cbor: 'placeholder_badge_mint_transaction_cbor'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rewards/eligibility/{walletAddress}:
 *   get:
 *     summary: Check badge eligibility
 *     description: Check if a wallet is eligible for any badges
 *     tags: [Rewards]
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
 *         description: Eligibility checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EligibilityResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/eligibility/:walletAddress', authenticateWallet, async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    // TODO: Check actual blockchain state for eligibility
    // This is a placeholder implementation

    const eligibility = {
      streakBadge: {
        eligible: false,
        currentStreak: 0,
        requiredStreak: 10,
        reason: 'Need 10+ consecutive savings'
      },
      earlyRepayBadge: {
        eligible: false,
        reason: 'No early loan repayments found'
      }
    };

    res.json({
      success: true,
      walletAddress,
      eligibility
    });
  } catch (error) {
    next(error);
  }
});

// Helper to decode badge name from asset unit
function decodeBadgeName(assetUnit) {
  // Extract the asset name from the unit (policy_id + asset_name)
  const assetName = assetUnit.substring(56); // Policy ID is 56 chars
  try {
    return Buffer.from(assetName, 'hex').toString('utf8');
  } catch {
    return 'Unknown Badge';
  }
}

export default router;
