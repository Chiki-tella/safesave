# Safe-Save API Quick Reference

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints (except `/health` and `/api/auth/connect-wallet`) require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### Connect Wallet
```http
POST /api/auth/connect-wallet
Content-Type: application/json

{
  "walletAddress": "addr_test1qz...",
  "stakeAddress": "stake_test1uz..."
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Verify Token
```http
POST /api/auth/verify
Authorization: Bearer <token>
```

---

## 💰 Savings Endpoints

### Get User Savings
```http
GET /api/savings/{walletAddress}
Authorization: Bearer <token>
```

### Get Group Total
```http
GET /api/savings/group/total
Authorization: Bearer <token>
```

### Prepare Deposit
```http
POST /api/savings/deposit/prepare
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100
}
```

### Get User Streak
```http
GET /api/savings/streak/{walletAddress}
Authorization: Bearer <token>
```

---

## 🏦 Loan Endpoints

### Get Loan Status
```http
GET /api/loan/status/{walletAddress}
Authorization: Bearer <token>
```

### Request Loan
```http
POST /api/loan/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500,
  "durationDays": 30
}
```

### Repay Loan
```http
POST /api/loan/repay
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 200,
  "loanUtxoRef": "def456...#0"
}
```

---

## 📈 Investment Endpoints

### List All Investments
```http
GET /api/investment/list
Authorization: Bearer <token>
```

### Get Specific Investment
```http
GET /api/investment/{id}
Authorization: Bearer <token>
```

### Register Investment
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

---

## 🏆 Rewards Endpoints

### Get User Badges
```http
GET /api/rewards/{walletAddress}
Authorization: Bearer <token>
```

### Claim Badge
```http
POST /api/rewards/claim/{badgeType}
Authorization: Bearer <token>

# Badge types: "streak" or "early-repay"
```

### Check Eligibility
```http
GET /api/rewards/eligibility/{walletAddress}
Authorization: Bearer <token>
```

---

## ❤️ Health Check

### Health Status
```http
GET /health
```

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 🔗 Interactive Documentation

For detailed schemas, examples, and interactive testing:

**http://localhost:3000/api-docs**

---

## 💡 Quick Start Example

```bash
# 1. Connect wallet and get token
curl -X POST http://localhost:3000/api/auth/connect-wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "addr_test1qz..."}'

# Response: { "token": "eyJhbGc..." }

# 2. Use token to get savings
curl http://localhost:3000/api/savings/addr_test1qz... \
  -H "Authorization: Bearer eyJhbGc..."

# 3. Prepare a deposit
curl -X POST http://localhost:3000/api/savings/deposit/prepare \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

---

## 🛠️ Environment Variables

Required in `.env`:
```env
PORT=3000
JWT_SECRET=your-secret-key
BLOCKFROST_PROJECT_ID=your-blockfrost-id
BLOCKFROST_NETWORK=preprod
SAVINGS_CONTRACT_ADDRESS=addr_test1...
LOAN_CONTRACT_ADDRESS=addr_test1...
INVESTMENT_CONTRACT_ADDRESS=addr_test1...
REWARDS_CONTRACT_ADDRESS=addr_test1...
```

---

## 📦 Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

For more details, see:
- [README.md](./README.md) - Full documentation
- [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) - Swagger documentation guide
- [API Documentation](http://localhost:3000/api-docs) - Interactive Swagger UI
