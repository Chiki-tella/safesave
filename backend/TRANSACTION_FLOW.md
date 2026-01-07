# Transaction Flow - How to Save Data on Blockchain

## Current Issue

The backend API only **reads** from the blockchain but doesn't **write** transactions. When you call `/api/savings/deposit/prepare`, it returns a placeholder transaction that doesn't actually save anything.

## Why You See Zero Savings

1. You call the API to "save" money
2. The API returns a placeholder transaction
3. No actual transaction is submitted to the blockchain
4. When you query savings, the blockchain has no data → returns 0

## The Correct Flow

### Step 1: Build Transaction (Backend)
The backend builds a proper Cardano transaction with:
- **Inputs**: UTxOs from your wallet (to pay for the deposit + fees)
- **Outputs**: 
  - UTxO to the savings contract with your Member datum
  - Change back to your wallet
- **Datum**: Your savings data (wallet, amount, streak, timestamp)

### Step 2: Sign Transaction (Frontend/Wallet)
The frontend receives the transaction CBOR and asks your Cardano wallet to sign it:
```javascript
const signedTx = await wallet.signTx(txCbor);
```

### Step 3: Submit Transaction (Backend or Frontend)
Submit the signed transaction to the blockchain:
```javascript
const txHash = await blockfrost.submitTransaction(signedTx);
```

### Step 4: Wait for Confirmation
Wait for the transaction to be confirmed (1-2 blocks, ~20-40 seconds)

### Step 5: Query Savings (Backend)
Now when you query `/api/savings/:walletAddress`, the backend finds your UTxO at the contract address with your Member datum and returns your actual savings!

## Two Approaches

### Approach 1: Full Backend Transaction Building (Complex)
**Pros:**
- Backend handles all transaction logic
- Frontend just signs and submits

**Cons:**
- Very complex to implement
- Requires cardano-serialization-lib
- Need to handle collateral, script refs, etc.

### Approach 2: Use a Transaction Library (Recommended)
**Pros:**
- Much simpler
- Libraries handle complexity
- Better tested

**Cons:**
- Additional dependency

**Recommended Libraries:**
- [Lucid](https://github.com/spacebudz/lucid) - Most popular, easy to use
- [Mesh](https://meshjs.dev/) - Full-featured
- [cardano-transaction-lib](https://github.com/Plutonomicon/cardano-transaction-lib) - PureScript

### Approach 3: Frontend-Only Transactions (Simplest for Now)
**Pros:**
- No backend transaction building needed
- Wallet handles everything
- Fastest to implement

**Cons:**
- Frontend needs to know contract logic
- Less secure (contract addresses exposed)

## Recommended Solution: Use Lucid

Let me show you how to integrate Lucid for transaction building:

### Install Lucid

```bash
npm install lucid-cardano
```

### Update Backend to Build Real Transactions

```javascript
import { Lucid, Blockfrost } from "lucid-cardano";

async function buildDepositTransaction(walletAddress, amount) {
  const lucid = await Lucid.new(
    new Blockfrost(
      "https://cardano-preview.blockfrost.io/api/v0",
      process.env.BLOCKFROST_PROJECT_ID
    ),
    "Preview"
  );

  // Set the user's wallet address
  lucid.selectWalletFromAddress(walletAddress, []);

  // Build the datum
  const memberDatum = Data.to({
    wallet: walletAddress,
    totalSavings: BigInt(amount * 1_000_000), // Convert ADA to lovelace
    streak: 1n,
    lastDeposit: BigInt(Date.now())
  });

  // Build transaction
  const tx = await lucid
    .newTx()
    .payToContract(
      process.env.SAVINGS_CONTRACT_ADDRESS,
      { inline: memberDatum },
      { lovelace: BigInt(amount * 1_000_000) }
    )
    .complete();

  // Return the transaction CBOR for wallet signing
  return tx.toString();
}
```

## Quick Fix: Frontend-Only Approach

For now, the **fastest solution** is to build transactions in the frontend using a wallet library:

### Using Nami Wallet (Example)

```javascript
// Frontend code
async function depositSavings(amount) {
  const cardano = window.cardano;
  const nami = await cardano.nami.enable();
  
  // Get wallet UTxOs
  const utxos = await nami.getUtxos();
  const address = await nami.getChangeAddress();
  
  // Build transaction (simplified)
  const tx = buildDepositTx(address, amount, utxos);
  
  // Sign with wallet
  const signedTx = await nami.signTx(tx);
  
  // Submit to blockchain
  const txHash = await nami.submitTx(signedTx);
  
  console.log("Transaction submitted:", txHash);
  
  // Wait for confirmation
  await waitForConfirmation(txHash);
  
  // Now query the API - you'll see your savings!
  const savings = await fetch(`/api/savings/${address}`);
}
```

## What You Need to Do Now

### Option 1: Quick Test (Manual Transaction)
1. Use a Cardano wallet (Nami, Eternl, etc.)
2. Manually send ADA to your savings contract address with proper datum
3. Then query the API - you'll see your savings!

### Option 2: Integrate Lucid (Recommended)
1. Install Lucid in backend: `npm install lucid-cardano`
2. Update the deposit endpoint to build real transactions
3. Frontend signs and submits the transaction
4. Query API to see savings

### Option 3: Frontend-Only (Fastest)
1. Build transactions entirely in frontend using wallet library
2. Backend only reads data (current state)
3. No backend changes needed

## Testing with Manual Transaction

You can test the blockchain integration right now by manually creating a transaction:

### Using cardano-cli:

```bash
# Build a transaction to the savings contract
cardano-cli transaction build \
  --tx-in YOUR_UTXO \
  --tx-out "addr_test1wpqzkm0nn4c073m0a996te0r5twmpyg376kn7uqcnetxe5s7gjnhu+100000000" \
  --tx-out-inline-datum-file member-datum.json \
  --change-address YOUR_ADDRESS \
  --testnet-magic 2 \
  --out-file tx.raw

# Sign it
cardano-cli transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --testnet-magic 2 \
  --out-file tx.signed

# Submit it
cardano-cli transaction submit \
  --tx-file tx.signed \
  --testnet-magic 2
```

Where `member-datum.json` contains:
```json
{
  "constructor": 1,
  "fields": [
    {"bytes": "YOUR_WALLET_ADDRESS_HEX"},
    {"int": 100000000},
    {"int": 1},
    {"int": 1732876800000}
  ]
}
```

After this transaction confirms, when you call `/api/savings/YOUR_ADDRESS`, you'll see your 100 ADA savings!

## Summary

**The backend is working correctly** - it reads from the blockchain. The issue is that **no data has been written to the blockchain yet**. You need to:

1. Build proper transactions (using Lucid or similar)
2. Sign them with a wallet
3. Submit them to the blockchain
4. Wait for confirmation
5. Then the API will return your actual savings

Would you like me to implement the Lucid integration for transaction building?
