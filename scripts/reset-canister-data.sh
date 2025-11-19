#!/bin/bash

# Reset SplitSafe Canister Data Script
# This script resets all data in the canister using --mode=reinstall
# WARNING: This will DELETE ALL DATA in the canister but keep the same canister ID
# Usage: ./scripts/reset-canister-data.sh [ADMIN_PRINCIPAL]

set -e  # Exit on any error

# Fix for dfx color output issue on macOS
export TERM=xterm-256color
export DFX_WARNING=-mainnet_plaintext_identity

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "SplitSafe Canister Data Reset Script"
    echo "===================================="
    echo ""
    echo "⚠️  WARNING: This will DELETE ALL DATA in the canister!"
    echo "   - All escrows, transactions, and user data will be lost"
    echo "   - The canister ID will remain the same"
    echo ""
    echo "Usage: $0 [ADMIN_PRINCIPAL]"
    echo ""
    echo "Arguments:"
    echo "  ADMIN_PRINCIPAL    Principal ID to use as admin (optional)"
    echo "                     Default: foj7a-xll5u-qiecr-quazw-tsad5-lhqex-e25yi-i4cwj-rdq3v-4pomz-hae"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Use default admin principal"
    echo "  $0 your-principal-id-here            # Use custom admin principal"
    echo ""
    exit 0
fi

# Check if admin principal is provided as argument
if [ -n "$1" ]; then
    ADMIN_PRINCIPAL="$1"
    echo "🚀 Resetting canister data with admin principal: $ADMIN_PRINCIPAL"
else
    # Use default principal from production
    ADMIN_PRINCIPAL="foj7a-xll5u-qiecr-quazw-tsad5-lhqex-e25yi-i4cwj-rdq3v-4pomz-hae"
    echo "🚀 Resetting canister data with default admin principal: $ADMIN_PRINCIPAL"
    echo "💡 Tip: You can specify a custom admin principal: $0 your-principal-id"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Confirmation prompt
print_warning "⚠️  WARNING: This will DELETE ALL DATA in the canister!"
print_warning "   - All escrows, transactions, and user data will be lost"
print_warning "   - The canister ID will remain the same (efzgd-dqaaa-aaaai-q323a-cai)"
echo ""
read -p "Are you sure you want to continue? Type 'yes' to confirm: " confirmation

if [ "$confirmation" != "yes" ]; then
    print_error "Reset cancelled. No changes made."
    exit 1
fi

# Step 1: Check current identity
print_status "Checking current identity..."
CURRENT_IDENTITY=$(dfx identity whoami)
CURRENT_PRINCIPAL=$(dfx identity get-principal)
print_success "Using identity: $CURRENT_IDENTITY"
print_success "Current principal: $CURRENT_PRINCIPAL"

# Step 2: Check canister status
print_status "Checking canister status..."
SPLIT_DAPP_ID=$(dfx canister --network ic id split_dapp)
print_success "Canister ID: $SPLIT_DAPP_ID"

# Verify canister exists and is accessible
if ! dfx canister --network ic status split_dapp > /dev/null 2>&1; then
    print_error "Canister $SPLIT_DAPP_ID is not accessible or does not exist"
    exit 1
fi

# Step 3: Build canister
print_status "Building canister for reinstall..."
dfx build --network ic split_dapp

if [ $? -ne 0 ]; then
    print_error "Failed to build canister"
    exit 1
fi

print_success "Canister built successfully"

# Step 4: Reinstall canister (this resets all data)
print_status "Reinstalling canister (this will reset all data)..."
print_warning "This operation cannot be undone!"

# Mainnet cKBTC canister IDs
CKBTC_LEDGER_ID="mxzaz-hqaaa-aaaar-qaada-cai"
CKBTC_MINTER_ID="mqygn-kiaaa-aaaar-qaadq-cai"

echo "yes" | dfx canister --network ic install split_dapp \
    --mode=reinstall \
    --argument "(principal \"$ADMIN_PRINCIPAL\", \"$CKBTC_LEDGER_ID\", \"$CKBTC_MINTER_ID\")"

if [ $? -ne 0 ]; then
    print_error "Failed to reinstall canister"
    exit 1
fi

print_success "Canister reinstalled successfully - all data has been reset!"

# Step 5: Verify canister is working
print_status "Verifying canister is working..."
dfx canister --network ic status split_dapp

# Step 6: Generate TypeScript declarations
print_status "Generating TypeScript declarations..."
dfx generate split_dapp --network ic

if [ $? -ne 0 ]; then
    print_warning "Failed to generate TypeScript declarations (non-critical)"
else
    print_success "TypeScript declarations generated successfully"
fi

echo ""
print_success "✅ Canister data reset completed!"
echo ""
echo "📋 Summary:"
echo "   Canister ID: $SPLIT_DAPP_ID (unchanged)"
echo "   Admin Principal: $ADMIN_PRINCIPAL"
echo "   All data: RESET (all escrows, transactions, and user data deleted)"
echo ""
echo "🌐 Canister URL: https://$SPLIT_DAPP_ID.icp0.io"
echo ""
print_warning "Note: You may want to set up initial test data using setBitcoinBalance calls"

