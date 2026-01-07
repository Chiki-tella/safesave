# Safe-Save Backend API

Backend API for the Safe-Save decentralized savings platform built on Cardano blockchain.

## 🚀 Features

- **Wallet Authentication** - JWT-based authentication with Cardano wallets
- **Savings Management** - Track deposits, balances, and saving streaks
- **Loan System** - Request loans, track repayments, and manage penalties
- **Investment Tracking** - Monitor group investments and ROI
- **Rewards & Badges** - NFT badge minting for achievements
- **Blockchain Integration** - Direct interaction with Aiken smart contracts via Blockfrost

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Blockfrost API key ([Get one here](https://blockfrost.io))
- Deployed Aiken smart contracts on Cardano testnet/mainnet

## 🛠️ Installation

1. **Clone and navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
BLOCKFROST_PROJECT_ID=your-blockfrost-project-id
BLOCKFROST_NETWORK=preprod

# Add your deployed contract addresses
SAVINGS_CONTRACT_ADDRESS=addr_test1...
LOAN_CONTRACT_ADDRESS=addr_test1...
INVESTMENT_CONTRACT_ADDRESS=addr_test1...
REWARDS_CONTRACT_ADDRESS=addr_test1...
GOVERNANCE_CONTRACT_ADDRESS=addr_test1...
```

4. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

The API includes comprehensive **Swagger/OpenAPI documentation** for easy exploration and testing.

### Access Interactive Documentation

Once the server is running, visit:

**http://localhost:3000/api-docs**

The Swagger UI provides:
- Complete API reference with request/response examples
- Interactive "Try it out" feature to test endpoints
- Authentication support
- Schema definitions for all data models

For detailed information, see [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

## 📡 API Endpoints

### Authentication

#### Connect Wallet
```http
POST /api/auth/connect-wallet
Content-Type: application/json

{
  "walletAddress": "addr_test1...",
  "stakeAddress": "stake_test1...",
  "signature": "..."
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "walletAddress": "addr_test1...",
  "expiresIn": "24h"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Savings

#### Get User Savings
```http
GET /api/savings/:walletAddress
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "savings": {
    "wallet": "addr_test1...",
    "totalSavings": 1500.5,
    "totalSavingsLovelace": 1500500000,
    "streak": 5,
    "lastDeposit": "2025-11-29T10:30:00Z",
    "utxoRef": "abc123...#0"
  }
}
```

#### Get Group Total
```http
GET /api/savings/group/total
Authorization: Bearer <token>
```

#### Prepare Deposit
```http
POST /api/savings/deposit/prepare
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100
}
```

#### Get User Streak
```http
GET /api/savings/streak/:walletAddress
Authorization: Bearer <token>
```

### Loans

#### Get Loan Status
```http
GET /api/loan/status/:walletAddress
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "loans": [
    {
      "borrower": "addr_test1...",
      "loanAmount": 500,
      "interest": 25,
      "dueDate": "2025-12-29T10:30:00Z",
      "repaidAmount": 200,
      "remainingAmount": 325,
      "status": "Active",
      "utxoRef": "def456...#0"
    }
  ],
  "activeLoans": 1,
  "totalBorrowed": 500
}
```

#### Request Loan
```http
POST /api/loan/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500,
  "durationDays": 30
}
```

#### Repay Loan
```http
POST /api/loan/repay
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 200,
  "loanUtxoRef": "def456...#0"
}
```

### Investments

#### List All Investments
```http
GET /api/investment/list
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "investments": [
    {
      "id": "INV-001",
      "projectName": "Solar Farm",
      "amountInvested": 10000,
      "expectedROI": 15,
      "realProfit": 1200,
      "status": "Active",
      "utxoRef": "ghi789...#0"
    }
  ],
  "summary": {
    "totalInvestments": 1,
    "totalInvested": 10000,
    "totalProfit": 1200,
    "roi": 12
  }
}
```

#### Get Specific Investment
```http
GET /api/investment/:id
Authorization: Bearer <token>
```

#### Register Investment
```http
POST /api/investment/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectName": "Solar Farm",
  "amount": 10000,
  "expectedROI": 15
}
```

### Rewards

#### Get User Badges
```http
GET /api/rewards/:walletAddress
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "badges": [
    {
      "assetId": "policy123...asset456",
      "quantity": "1",
      "name": "Streak Master"
    }
  ],
  "totalBadges": 1
}
```

#### Claim Badge
```http
POST /api/rewards/claim/:badgeType
Authorization: Bearer <token>

# Badge types: "streak" or "early-repay"
```

#### Check Eligibility
```http
GET /api/rewards/eligibility/:walletAddress
Authorization: Bearer <token>
```

## 🏗️ Architecture

```
backend/
├── src/
│   ├── server.js              # Express app setup
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── errorHandler.js    # Error handling
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── savings.js         # Savings endpoints
│   │   ├── loan.js            # Loan endpoints
│   │   ├── investment.js      # Investment endpoints
│   │   └── rewards.js         # Rewards endpoints
│   └── services/
│       ├── blockfrost.js      # Blockfrost API wrapper
│       └── cardano.js         # Cardano utilities
├── package.json
├── .env.example
└── README.md
```

## 🔐 Security Notes

**⚠️ IMPORTANT FOR PRODUCTION:**

1. **Signature Verification** - Currently, wallet authentication trusts the provided address. In production, implement proper signature verification:
   ```javascript
   // Verify wallet signature against a challenge message
   const message = "Sign this message to authenticate";
   const isValid = verifySignature(walletAddress, signature, message);
   ```

2. **Rate Limiting** - Add rate limiting to prevent abuse
3. **Input Validation** - Add comprehensive input validation
4. **HTTPS Only** - Use HTTPS in production
5. **Environment Variables** - Never commit `.env` file
6. **JWT Secret** - Use a strong, random JWT secret

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/savings/addr_test1...
```

## 📝 TODO for Production

- [ ] Implement actual transaction building with cardano-serialization-lib
- [ ] Add signature verification for wallet authentication
- [ ] Implement proper datum parsing for all contract types
- [ ] Add database layer for caching and analytics
- [ ] Add comprehensive error handling
- [ ] Add request validation middleware
- [ ] Add rate limiting
- [ ] Add logging (Winston/Pino)
- [x] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit and integration tests
- [ ] Add monitoring and alerting
- [ ] Implement WebSocket for real-time updates

## 🤝 Integration with Frontend

The frontend should:

1. **Connect wallet** using a Cardano wallet library (Nami, Eternl, etc.)
2. **Get JWT token** from `/api/auth/connect-wallet`
3. **Store token** in localStorage/sessionStorage
4. **Include token** in all API requests via Authorization header
5. **Sign transactions** returned by the API using the wallet
6. **Submit signed transactions** back to the API or directly to blockchain

## 📚 Resources

- [Blockfrost API Docs](https://docs.blockfrost.io/)
- [Cardano Serialization Lib](https://github.com/Emurgo/cardano-serialization-lib)
- [Aiken Documentation](https://aiken-lang.org/)
- [Cardano Developer Portal](https://developers.cardano.org/)

## 📄 License

MIT
