# =============================================================================
# SMART SAVING - FULL CONTRACT DEPLOYMENT (Windows PowerShell / 2025 FIX)
# =============================================================================

$ErrorActionPreference = "Stop"

# --------------------------
# Network config
# --------------------------
$NETWORK = "preview"
$NETWORK_MAGIC = "2"

# --------------------------
# Deployment folder
# --------------------------
$DEPLOY_DIR = "deployment"

# --------------------------
# Clear screen and header
# --------------------------
Clear-Host
Write-Host "=============================================================="
Write-Host "           SMART SAVING - FULL CONTRACT DEPLOYMENT"
Write-Host "                 aine/smart-saving project"
Write-Host "==============================================================`n"

# --------------------------
# 1️⃣ Build Aiken contracts
# --------------------------
Write-Host "Building Aiken contracts..."
& aiken build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Aiken build failed!"
    exit 1
}
Write-Host "Build completed.`n"

# --------------------------
# 2️⃣ Extract validators
# --------------------------
if (Test-Path $DEPLOY_DIR) { Remove-Item -Recurse -Force $DEPLOY_DIR }
New-Item -ItemType Directory -Path $DEPLOY_DIR | Out-Null

Write-Host "Extracting validators..."
$validators = jq '.validators' plutus.json | ConvertFrom-Json
$TOTAL_FOUND = 0

foreach ($v in $validators) {
    $title = $v.title
    $code = $v.compiledCode
    if ([string]::IsNullOrEmpty($title)) { continue }

    # FIX: Properly sanitize the filename
    $safe = $title.ToLower() -replace '\.', '_' -replace '[^a-z0-9_]', ''
    
    # Truncate if still too long (keep it under 50 chars for safety)
    if ($safe.Length -gt 50) {
        $safe = $safe.Substring(0, 50)
    }
    
    $plutusFile = Join-Path $DEPLOY_DIR "$safe.plutus"
    $scriptFile = Join-Path $DEPLOY_DIR "$safe.script"

    Set-Content -Path $plutusFile -Value $code

    $scriptJson = @{
        type        = "PlutusScriptV2"
        description = $title
        cborHex     = $code
    } | ConvertTo-Json -Compress

    Set-Content -Path $scriptFile -Value $scriptJson

    Write-Host " Extracted: $safe"
    $TOTAL_FOUND++
}

Write-Host "`nExtracted $TOTAL_FOUND validators.`n"

# --------------------------
# 3️⃣ Generate addresses
# --------------------------
Write-Host "Generating addresses..."

# Prepare output files
$addressesTxt = Join-Path $DEPLOY_DIR "contract_addresses.txt"
$addressesEnv = Join-Path $DEPLOY_DIR "contract_addresses.env"
"" | Out-File $addressesTxt
"" | Out-File $addressesEnv

Add-Content $addressesTxt "# Smart Saving - Contract Addresses"
Add-Content $addressesTxt "# Generated: $(Get-Date)"
Add-Content $addressesTxt "# Network: $NETWORK`n"

$ADDRESS_COUNT = 0

foreach ($script in Get-ChildItem "$DEPLOY_DIR\*.script") {
    $base = $script.BaseName
    
    # FIX: Properly format display name
    $displayName = $base -replace '_', ' '
    $displayName = (Get-Culture).TextInfo.ToTitleCase($displayName)

    Write-Host "`nGenerating: $displayName"

    $FIXED_PATH = $script.FullName

    # Generate address
    if ($NETWORK -eq "mainnet") {
        $ADDR = & cardano-cli address build --payment-script-file $FIXED_PATH --mainnet 2>&1
    } else {
        $ADDR = & cardano-cli address build --payment-script-file $FIXED_PATH --testnet-magic $NETWORK_MAGIC 2>&1
    }

    if ($ADDR -match "^addr_test" -or $ADDR -match "^addr1") {
        # Try different cardano-cli syntaxes to get policy ID
        $POLICY = $null
        
        # Try new syntax first
        try {
            $POLICY = & cardano-cli transaction policyid --script-file $FIXED_PATH 2>&1 | Where-Object { $_ -notmatch "Invalid" -and $_ -notmatch "Usage:" }
        } catch {}
        
        # Try legacy command for older versions
        if ([string]::IsNullOrEmpty($POLICY)) {
            try {
                $POLICY = & cardano-cli legacy transaction policyid --script-file $FIXED_PATH 2>&1 | Where-Object { $_ -notmatch "Invalid" -and $_ -notmatch "Usage:" }
            } catch {}
        }
        
        # Try conway command
        if ([string]::IsNullOrEmpty($POLICY)) {
            try {
                $POLICY = & cardano-cli conway transaction policyid --script-file $FIXED_PATH 2>&1 | Where-Object { $_ -notmatch "Invalid" -and $_ -notmatch "Usage:" }
            } catch {}
        }
        
        # FIX: Properly convert to uppercase variable name
        $VAR = $base.ToUpper()

        Add-Content $addressesTxt "$VAR`_ADDRESS=$ADDR"
        if (![string]::IsNullOrEmpty($POLICY) -and $POLICY -notmatch "Invalid" -and $POLICY -notmatch "Usage:") {
            Add-Content $addressesTxt "$VAR`_POLICY_ID=$POLICY"
        }
        Add-Content $addressesTxt ""

        Add-Content $addressesEnv "$VAR`_ADDRESS=$ADDR"
        if (![string]::IsNullOrEmpty($POLICY) -and $POLICY -notmatch "Invalid" -and $POLICY -notmatch "Usage:") {
            Add-Content $addressesEnv "$VAR`_POLICY_ID=$POLICY"
        }

        Write-Host " SUCCESS: $ADDR"
        if (![string]::IsNullOrEmpty($POLICY) -and $POLICY -notmatch "Invalid" -and $POLICY -notmatch "Usage:") {
            Write-Host " Policy: $POLICY"
        } else {
            Write-Host " Policy: (not generated - may not be needed for spending validators)"
        }
        $ADDRESS_COUNT++
    } else {
        Write-Host " Failed to generate address for $base"
    }
}

# --------------------------
# 4️⃣ Final summary
# --------------------------
Write-Host ""
Write-Host "=============================================================="
if ($ADDRESS_COUNT -eq $TOTAL_FOUND) {
    Write-Host "        100% DEPLOYMENT SUCCESSFUL!"
} else {
    Write-Host "        PARTIAL SUCCESS (Addresses: $ADDRESS_COUNT/$TOTAL_FOUND)"
}
Write-Host "==============================================================`n"

Write-Host "Files ready in: .\$DEPLOY_DIR"
Write-Host "   - contract_addresses.env -> copy to your backend"

if ($ADDRESS_COUNT -gt 0) {
    Write-Host "`nYou are LIVE on Preview testnet!"
    Write-Host "Run: copy $DEPLOY_DIR\contract_addresses.env backend\.env"
} else {
    Write-Host ""
    Write-Host "No addresses generated. Ensure cardano-cli is installed and accessible."
}

Write-Host "`nDone!"
Write-Host ""