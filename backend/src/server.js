import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import authRoutes from './routes/auth.js';
import savingsRoutes from './routes/savings.js';
import loanRoutes from './routes/loan.js';
import investmentRoutes from './routes/investment.js';
import rewardsRoutes from './routes/rewards.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Safe-Save API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and get network information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-12-03T10:30:00.000Z
 *                 network:
 *                   type: string
 *                   example: preview
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    network: process.env.BLOCKFROST_NETWORK || 'preview'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/rewards', rewardsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Safe-Save Backend running on port ${PORT}`);
  console.log(`📡 Network: ${process.env.BLOCKFROST_NETWORK || 'preprod'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;
