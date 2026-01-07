#!/usr/bin/env node

/**
 * Smart Saving - Cardano Smart Contract Deployment Script (Node.js)
 * Cross-platform deployment script for Windows/Mac/Linux
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const NETWORK = 'preprod'; // Change to 'mainnet' for production
const NETWORK_MAGIC = '1'; // 1 for preprod, 2 for preview
const DEPLOY_DIR = 'deployment';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    if (!silent) console.log(output);
    return output.trim();
  } catch (error) {
    log(`Error executing: ${command}`, 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function checkPrerequisites() {
  log('Checking prerequisites...', 'yellow');

  try {
    exec('aiken --version', true);
    log('✓ Aiken is installed', 'green');
  } catch {
    log('Error: Aiken is not installed', 'red');
    log('Install from: https://aiken-lang.org/installation-instructions', 'red');
    process.exit(1);
  }

  try {
    exec('cardano-cli --version', true);
    log('✓ cardano-cli is installed', 'green');
  } catch {
    log('Error: cardano-cli is not installed', 'red');
    log(
      'Install from: https://developers.cardano.org/docs/get-started/installing-cardano-node',
      'red'
    );
    process.exit(1);
  }

  log('');
}

function buildContracts() {
  log('Building Aiken contracts...', 'yellow');
  exec('aiken build');
  log('✓ Contracts built successfully', 'green');
  log('');
}

function extractValidators() {
  log('Extracting validator scripts...', 'yellow');

  // Create deployment directory
  if (!fs.existsSync(DEPLOY_DIR)) {
    fs.mkdirSync(DEPLOY_DIR, { recursive: true });
  }

  // Read plutus.json
  const plutusJson = JSON.parse(fs.readFileSync('plutus.json', 'utf8'));

  const validators = ['savings', 'loan', 'investment', 'rewards', 'governance'];

  validators.forEach((validator) => {
    log(`  Extracting ${validator} validator...`);

    // Find the validator in plutus.json
    const validatorData = plutusJson.validators.find(
      (v) => v.title === `${validator}.spend` || v.title === `${validator}.mint`
    );

    if (!validatorData) {
      log(`Error: Could not find ${validator} validator in plutus.json`, 'red');
      process.exit(1);
    }

    // Save compiled code
    const plutusFile = path.join(DEPLOY_DIR, `${validator}.plutus`);
    fs.writeFileSync(plutusFile, validatorData.compiledCode);

    // Create script file
    const scriptFile = path.join(DEPLOY_DIR, `${validator}.script`);
    const scriptContent = {
      type: 'PlutusScriptV2',
      description: `${validator} validator`,
      cborHex: validatorData.compiledCode,
    };
    fs.writeFileSync(scriptFile, JSON.stringify(scriptContent, null, 2));

    log(`  ✓ ${validator} validator extracted`, 'green');
  });

  log('');
}

function generateAddresses() {
  log('Generating script addresses...', 'yellow');

  const validators = ['savings', 'loan', 'investment', 'rewards', 'governance'];
  const addresses = {};

  const addressesFile = path.join(DEPLOY_DIR, 'contract_addresses.txt');
  const envFile = path.join(DEPLOY_DIR, 'contract_addresses.env');

  let addressesContent = '# Smart Saving Contract Addresses\n';
  addressesContent += `# Generated on ${new Date().toISOString()}\n`;
  addressesContent += `# Network: ${NETWORK}\n\n`;

  let envContent = '# Smart Saving Contract Addresses for .env\n';
  envContent += '# Copy these to your backend/.env file\n\n';

  validators.forEach((validator) => {
    log(`  Generating address for ${validator}...`);

    const scriptFile = path.join(DEPLOY_DIR, `${validator}.script`);

    // Generate script address
    let addressCmd = `cardano-cli address build --payment-script-file "${scriptFile}"`;
    if (NETWORK === 'mainnet') {
      addressCmd += ' --mainnet';
    } else {
      addressCmd += ` --testnet-magic ${NETWORK_MAGIC}`;
    }

    const address = exec(addressCmd, true);

    // Get script hash
    const scriptHash = exec(
      `cardano-cli transaction policyid --script-file "${scriptFile}"`,
      true
    );

    addresses[validator] = { address, scriptHash };

    // Add to files
    const varName = validator.toUpperCase();
    addressesContent += `${varName}_CONTRACT_ADDRESS=${address}\n`;
    addressesContent += `${varName}_SCRIPT_HASH=${scriptHash}\n\n`;

    envContent += `${varName}_CONTRACT_ADDRESS=${address}\n`;

    log(`  ✓ ${validator}: ${address}`, 'green');
  });

  fs.writeFileSync(addressesFile, addressesContent);
  fs.writeFileSync(envFile, envContent);

  log('');
  return addresses;
}

function createDeploymentInfo(addresses) {
  log('Creating deployment info...', 'yellow');

  const deploymentInfo = {
    network: NETWORK,
    networkMagic: NETWORK_MAGIC,
    deploymentDate: new Date().toISOString(),
    contracts: {},
  };

  Object.entries(addresses).forEach(([validator, data]) => {
    deploymentInfo.contracts[validator] = {
      address: data.address,
      scriptHash: data.scriptHash,
      scriptFile: `${validator}.script`,
    };
  });

  const infoFile = path.join(DEPLOY_DIR, 'deployment_info.json');
  fs.writeFileSync(infoFile, JSON.stringify(deploymentInfo, null, 2));

  log('✓ Deployment info created', 'green');
  log('');
}

function createIntegrationGuide() {
  const guide = `# Smart Saving - Backend Integration Guide

## Contract Addresses

All contract addresses have been generated and saved to:
- \`contract_addresses.txt\` - Human-readable format
- \`contract_addresses.env\` - Ready to copy to \`.env\`
- \`deployment_info.json\` - JSON format for programmatic use

## Integration Steps

### 1. Update Backend Environment Variables

Copy the addresses from \`contract_addresses.env\` to your \`backend/.env\` file:

**Windows (PowerShell):**
\`\`\`powershell
Get-Content deployment/contract_addresses.env | Add-Content backend/.env
\`\`\`

**Mac/Linux:**
\`\`\`bash
cat deployment/contract_addresses.env >> backend/.env
\`\`\`

### 2. Verify Blockfrost Configuration

Make sure your \`.env\` has:
\`\`\`
BLOCKFROST_PROJECT_ID=your-project-id
BLOCKFROST_NETWORK=${NETWORK}
\`\`\`

Get your Blockfrost API key from: https://blockfrost.io

### 3. Test Contract Queries

\`\`\`bash
cd backend
npm run test:contracts
\`\`\`

### 4. Query Contract UTxOs

Example using Blockfrost:
\`\`\`javascript
const response = await fetch(
  \`https://cardano-\${network}.blockfrost.io/api/v0/addresses/\${contractAddress}/utxos\`,
  {
    headers: { 'project_id': BLOCKFROST_PROJECT_ID }
  }
);
\`\`\`

## Contract Functions

### Savings Contract
- **deposit()** - User deposits funds
- **penalize()** - Reset streak for missed deposit
- **borrow()** - Issue loan from group funds
- **invest()** - Register investment

### Loan Contract
- **repayLoan()** - Repay loan amount
- **checkLate()** - Apply penalty for late payment

### Investment Contract
- **updateProfit()** - Record investment profit
- **distribute()** - Distribute profits to group

### Rewards Contract
- **mintStreakBadge()** - Mint NFT for 10+ streak
- **mintEarlyRepayBadge()** - Mint NFT for early repayment

### Governance Contract
- **updateRules()** - Update system rules (leader only)

## Testing on Testnet

1. Get test ADA from faucet: https://docs.cardano.org/cardano-testnet/tools/faucet
2. Use Eternl or Nami wallet on testnet
3. Test each contract function
4. Monitor transactions on: https://preprod.cardanoscan.io

## Production Deployment

When ready for mainnet:
1. Change \`NETWORK="mainnet"\` in deploy.js
2. Remove \`NETWORK_MAGIC\` parameter
3. Re-run deployment script
4. Update backend \`.env\` with mainnet addresses
5. Test thoroughly before going live!
`;

  const guideFile = path.join(DEPLOY_DIR, 'INTEGRATION_GUIDE.md');
  fs.writeFileSync(guideFile, guide);

  log('✓ Integration guide created', 'green');
  log('');
}

function printSummary() {
  log('========================================', 'blue');
  log('Deployment Complete!', 'blue');
  log('========================================', 'blue');
  log('');
  log('All contracts deployed successfully!', 'green');
  log('');
  log(`Deployment files created in: ${DEPLOY_DIR}/`, 'yellow');
  log('');
  log('📁 Files created:');
  log('  • contract_addresses.txt - Human-readable addresses', 'yellow');
  log('  • contract_addresses.env - Ready for .env file', 'yellow');
  log('  • deployment_info.json - JSON format', 'yellow');
  log('  • INTEGRATION_GUIDE.md - Integration instructions', 'yellow');
  log('  • *.script - Validator scripts (5 files)', 'yellow');
  log('');
  log('Next steps:', 'yellow');
  log('  1. Copy addresses to backend/.env:');
  log(
    `     ${
      process.platform === 'win32'
        ? 'Get-Content deployment/contract_addresses.env | Add-Content backend/.env'
        : 'cat deployment/contract_addresses.env >> backend/.env'
    }`,
    'blue'
  );
  log('');
  log('  2. Add your Blockfrost API key to backend/.env');
  log('');
  log('  3. Read the integration guide:');
  log(`     cat ${DEPLOY_DIR}/INTEGRATION_GUIDE.md`, 'blue');
  log('');
  log('Happy building! 🚀', 'green');
}

// Main execution
async function main() {
  log('========================================', 'blue');
  log('Smart Saving - Contract Deployment', 'blue');
  log('========================================', 'blue');
  log('');

  checkPrerequisites();
  buildContracts();
  extractValidators();
  const addresses = generateAddresses();
  createDeploymentInfo(addresses);
  createIntegrationGuide();
  printSummary();
}

main().catch((error) => {
  log('Deployment failed:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
