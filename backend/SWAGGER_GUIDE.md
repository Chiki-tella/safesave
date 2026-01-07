# Safe-Save API Documentation Guide

## 📚 Swagger/OpenAPI Documentation

The Safe-Save Backend API now includes comprehensive Swagger/OpenAPI documentation for easy API exploration and testing.

## 🚀 Accessing the Documentation

### Start the Server

```bash
cd backend
npm install
npm run dev
```

### View Documentation

Once the server is running, access the interactive API documentation at:

**http://localhost:3000/api-docs**

You can also access the raw OpenAPI JSON specification at:

**http://localhost:3000/api-docs.json**

## 🔑 Authentication

Most endpoints require authentication. To use the API:

1. **Connect Wallet**: Use the `/api/auth/connect-wallet` endpoint to get a JWT token
2. **Authorize**: Click the "Authorize" button in Swagger UI (top right)
3. **Enter Token**: Paste your JWT token in the format: `Bearer YOUR_TOKEN_HERE`
4. **Test Endpoints**: Now you can test all authenticated endpoints

## 📋 API Endpoints Overview

### Authentication
- `POST /api/auth/connect-wallet` - Connect wallet and get JWT token
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/verify` - Verify JWT token

### Savings
- `GET /api/savings/{walletAddress}` - Get user savings data
- `GET /api/savings/group/total` - Get total group savings
- `POST /api/savings/deposit/prepare` - Prepare a deposit transaction
- `GET /api/savings/streak/{walletAddress}` - Get user savings streak

### Loans
- `GET /api/loan/status/{walletAddress}` - Get loan status for user
- `POST /api/loan/request` - Request a loan
- `POST /api/loan/repay` - Repay a loan

### Investments
- `GET /api/investment/list` - List all investments
- `GET /api/investment/{id}` - Get specific investment
- `POST /api/investment/register` - Register a new investment

### Rewards
- `GET /api/rewards/{walletAddress}` - Get user badges
- `POST /api/rewards/claim/{badgeType}` - Claim a badge
- `GET /api/rewards/eligibility/{walletAddress}` - Check badge eligibility

### Health
- `GET /health` - Health check endpoint

## 🧪 Testing with Swagger UI

### Example: Connect Wallet and Get Savings

1. **Connect Wallet**
   - Navigate to `POST /api/auth/connect-wallet`
   - Click "Try it out"
   - Enter your wallet address in the request body:
     ```json
     {
       "walletAddress": "addr_test1qz...",
       "stakeAddress": "stake_test1uz..."
     }
     ```
   - Click "Execute"
   - Copy the `token` from the response

2. **Authorize**
   - Click the "Authorize" button at the top
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize" then "Close"

3. **Get Savings**
   - Navigate to `GET /api/savings/{walletAddress}`
   - Click "Try it out"
   - Enter your wallet address
   - Click "Execute"
   - View your savings data in the response

## 📦 Dependencies

The Swagger documentation uses:
- `swagger-jsdoc` - Generate OpenAPI spec from JSDoc comments
- `swagger-ui-express` - Serve interactive Swagger UI

These are automatically installed when you run `npm install`.

## 🛠️ Customization

### Modify API Documentation

The Swagger configuration is in `src/swagger.js`. You can customize:
- API title and description
- Server URLs
- Security schemes
- Reusable schemas

### Add Documentation to New Endpoints

Use JSDoc comments above route handlers:

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Your endpoint summary
 *     description: Detailed description
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 */
router.get('/your-endpoint', async (req, res) => {
  // Your code
});
```

## 🌐 Production Deployment

When deploying to production:

1. Update the server URL in `src/swagger.js`:
   ```javascript
   servers: [
     {
       url: 'https://api.your-domain.com',
       description: 'Production server',
     },
   ],
   ```

2. Consider adding authentication to the `/api-docs` endpoint for security

3. Optionally disable Swagger in production by checking `NODE_ENV`:
   ```javascript
   if (process.env.NODE_ENV !== 'production') {
     app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
   }
   ```

## 📖 OpenAPI Specification

The API follows OpenAPI 3.0.0 specification. You can:
- Import the spec into Postman
- Generate client SDKs using OpenAPI Generator
- Use the spec for API testing and validation

## 🔗 Useful Links

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JSDoc to OpenAPI](https://github.com/Surnet/swagger-jsdoc)

## 💡 Tips

- Use the "Try it out" feature to test endpoints directly from the browser
- Check the "Schemas" section at the bottom for all data models
- Use the "Download" button to export the OpenAPI spec
- The documentation auto-updates when you restart the server

## 🐛 Troubleshooting

**Swagger UI not loading?**
- Check that the server is running on the correct port
- Verify `swagger-ui-express` and `swagger-jsdoc` are installed
- Check browser console for errors

**Endpoints not showing?**
- Ensure JSDoc comments are properly formatted
- Check that route files are listed in `swagger.js` apis array
- Restart the server after making changes

**Authentication not working?**
- Make sure to include "Bearer " prefix before the token
- Check that the token hasn't expired (24h validity)
- Verify the JWT_SECRET is set in your .env file
