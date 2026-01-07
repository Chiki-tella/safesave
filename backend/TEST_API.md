# API Testing Guide

## Prerequisites

1. Backend server running on `http://localhost:3000`
2. Use a tool like **Postman**, **Insomnia**, **Thunder Client**, or **curl**

## Step 1: Health Check

Test if the server is running:

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T...",
  "network": "preview"
}
```

---

## Step 2: Authentication

### Connect Wallet

```bash
curl -X POST http://localhost:3000/api/auth/connect-wallet \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "addr_test1qz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5qyq5z5l",
    "stakeAddress": "stake_test1uz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5qyq5z5l",
    "signature": "test_signature"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "walletAddress": "addr_test1...",
  "expiresIn": "24h"
}
```

**Save the token** - You'll need it for all subsequent requests!

### Get Current User

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Step 3: Savings Module

### Get User Savings

```bash
curl http://localhost:3000/api/savings/addr_test1qz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5qyq5z5l \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response (New User):**
```json
{
  "success": true,
  "savings": {
    "wallet": "addr_test1...",
    "totalSavings": 0,
    "totalSavingsLovelace": 0,
    "streak": 0,
    "lastDeposit": null,
    "isNewMember": true
  }
}
```

### Get Group Total

```bash
curl http://localhost:3000/api/savings/group/total \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "groupTotal": 0,
  "groupTotalLovelace": 0
}
```

### Prepare Deposit

```bash
curl -X POST http://localhost:3000/api/savings/deposit/prepare \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "amount": 100
  }'
```


**Expected Response:**
```json
{
  "success": true,
  "message": "Transaction prepared",
  "transaction": {
    "type": "deposit",
    "amount": 100,
    "lovelaceAmount": 100000000,
    "from": "addr_test1...",
    "to": "addr_test1wpqzkm0nn4c073m0a996te0r5twmpyg376kn7uqcnetxe5s7gjnhu",
    "cbor": "placeholder_transaction_cbor"
  }
}
```

### Get User Streak

```bash
curl http://localhost:3000/api/savings/streak/addr_test1qz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5qyq5z5l \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Step 4: Loan Module

### Get Loan Status

```bash
curl http://localhost:3000/api/loan/status/addr_test1qz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5qyq5z5l \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "loans": [],
  "activeLoans": 0,
  "totalBorrowed": 0
}
```

### Request Loan

```bash
curl -X POST http://localhost:3000/api/loan/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "amount": 500,
    "durationDays": 30
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Loan request prepared",
  "loan": {
    "borrower": "addr_test1...",
    "amount": 500,
    "interest": 25,
    "totalRepayment": 525,
    "dueDate": "2025-12-29T...",
    "durationDays": 30,
    "cbor": "placeholder_loan_transaction_cbor"
  }
}
```

### Repay Loan

```bash
curl -X POST http://localhost:3000/api/loan/repay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "amount": 200,
    "loanUtxoRef": "abc123def456...#0"
  }'
```

---

## Step 5: Investment Module

### List All Investments

```bash
curl http://localhost:3000/api/investment/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "investments": [],
  "summary": {
    "totalInvestments": 0,
    "totalInvested": 0,
    "totalProfit": 0,
    "roi": 0
  }
}
```

### Get Specific Investment

```bash
curl http://localhost:3000/api/investment/INV-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Register Investment

```bash
curl -X POST http://localhost:3000/api/investment/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "projectName": "Solar Farm Project",
    "amount": 10000,
    "expectedROI": 15
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Investment registration prepared",
  "investment": {
    "id": "INV-1732876800000",
    "projectName": "Solar Farm Project",
    "amount": 10000,
    "expectedROI": 15,
    "registeredBy": "addr_test1...",
    "cbor": "placeholder_investment_transaction_cbor"
  }
}
```

---

## Step 6: Rewards Module

### Get User Badges

```bash
curl http://localhost:3000/api/rewards/addr_test1qz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5qyq5z5l \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "badges": [],
  "totalBadges": 0
}
```

### Claim Streak Badge

```bash
curl -X POST http://localhost:3000/api/rewards/claim/streak \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Badge claim prepared",
  "badge": {
    "type": "streak",
    "recipient": "addr_test1...",
    "cbor": "placeholder_badge_mint_transaction_cbor"
  }
}
```

### Claim Early Repay Badge

```bash
curl -X POST http://localhost:3000/api/rewards/claim/early-repay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Check Badge Eligibility

```bash
curl http://localhost:3000/api/rewards/eligibility/addr_test1qz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5qyq5z5l \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "walletAddress": "addr_test1...",
  "eligibility": {
    "streakBadge": {
      "eligible": false,
      "currentStreak": 0,
      "requiredStreak": 10,
      "reason": "Need 10+ consecutive savings"
    },
    "earlyRepayBadge": {
      "eligible": false,
      "reason": "No early loan repayments found"
    }
  }
}
```

---

## Postman Collection

Import this into Postman for easier testing:

1. Create a new collection called "Safe-Save API"
2. Add an environment variable `baseUrl` = `http://localhost:3000`
3. Add an environment variable `token` = (paste your JWT token after authentication)
4. Use `{{baseUrl}}` and `{{token}}` in your requests

### Example Postman Request:

**URL:** `{{baseUrl}}/api/savings/{{walletAddress}}`  
**Method:** GET  
**Headers:**
- `Authorization`: `Bearer {{token}}`

---

## Testing with Real Blockchain Data

To test with actual blockchain data, you need to:

1. **Have a Cardano testnet wallet** with some test ADA
2. **Interact with the deployed contracts** to create UTxOs with proper datums
3. **Use your real wallet address** in the API calls

### Get Test ADA:
Visit the [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)

### Your Deployed Contract Addresses:
- **Savings:** `addr_test1wpqzkm0nn4c073m0a996te0r5twmpyg376kn7uqcnetxe5s7gjnhu`
- **Loan:** `addr_test1wrh4ya6wux9dyumlc4juc4l326n8w9susk93943yrf98wlsgrlgl5`
- **Investment:** `addr_test1wz32m6kvhkwd3znunyse283xgz5l5a8phangxkvudz2k7fgv9p3fd`
- **Rewards:** Policy ID `810ff238668f96c0c2e0fd157272ac46e967ff65a31e84ed17300e72`

---

## Common Issues

### 401 Unauthorized
- Make sure you included the `Authorization: Bearer TOKEN` header
- Check that your token hasn't expired (24h validity)
- Get a new token by calling `/api/auth/connect-wallet` again

### 404 Not Found
- Verify the endpoint URL is correct
- Check that the server is running on port 3000

### 500 Internal Server Error
- Check the server logs for detailed error messages
- Verify your `.env` file has all required variables
- Ensure Blockfrost API key is valid

---

## Quick Test Script

Save this as `test-api.sh` (Linux/Mac) or `test-api.ps1` (Windows):

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# 1. Health check
echo "Testing health endpoint..."
curl $BASE_URL/health

# 2. Connect wallet
echo -e "\n\nConnecting wallet..."
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/connect-wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"addr_test1qz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5qyq5z5l","stakeAddress":"stake_test1uz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5qyq5z5l","signature":"test"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 3. Get savings
echo -e "\n\nGetting savings..."
curl $BASE_URL/api/savings/addr_test1qz8fg2e9yn0ga68wq7vjz5x7wnl5cq0p8xrm0lv5lvz5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5q5z5l5qyq5z5l \
  -H "Authorization: Bearer $TOKEN"

# 4. Get group total
echo -e "\n\nGetting group total..."
curl $BASE_URL/api/savings/group/total \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\nTests complete!"
```

Make it executable: `chmod +x test-api.sh`  
Run it: `./test-api.sh`

---

**Happy Testing! 🚀**
