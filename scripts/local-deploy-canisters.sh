#!/bin/bash

# Local Development Deployment Script - Fixed Version
# This script stops dfx, starts it clean, and deploys canisters
# Usage: ./scripts/local-deploy-fixed.sh [ADMIN_PRINCIPAL]

set -e  # Exit on any error

# Fix for dfx color output issue on macOS
export TERM=xterm-256color

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "SplitSafe Local Deployment Script"
    echo "================================="
    echo ""
    echo "Usage: $0 [ADMIN_PRINCIPAL]"
    echo ""
    echo "Arguments:"
    echo "  ADMIN_PRINCIPAL    Principal ID to use as admin (optional)"
    echo "                     Default: 6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Use default admin principal"
    echo "  $0 your-principal-id-here            # Use custom admin principal"
    echo ""
    echo "This script will:"
    echo "  1. Stop and clean dfx"
    echo "  2. Start dfx with clean state"
    echo "  3. Deploy split_dapp canister"
    echo "  4. Generate TypeScript declarations"
    echo "  5. Set up initial balances for testing"
    echo ""
    exit 0
fi

# Check if admin principal is provided as argument
if [ -n "$1" ]; then
    ADMIN_PRINCIPAL="$1"
    echo "🚀 Starting local deployment process with admin principal: $ADMIN_PRINCIPAL"
else
    # Use default principal if none provided
    ADMIN_PRINCIPAL="6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae"
    echo "🚀 Starting local deployment process with default admin principal: $ADMIN_PRINCIPAL"
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

# Step 1: Stop dfx if running
print_status "Stopping dfx if running..."
if pgrep -f "dfx" > /dev/null; then
    dfx stop
    sleep 3  # Give dfx time to fully stop
    print_success "dfx stopped"
else
    print_warning "dfx was not running"
fi

# Step 2: Clean dfx cache more thoroughly
print_status "Cleaning dfx cache..."
rm -rf .dfx/local 2>/dev/null || true
sleep 2
print_success "dfx cache cleaned"

# Step 3: Start dfx in background
print_status "Starting dfx in background..."
nohup dfx start --clean --background > dfx.log 2>&1 &
DFX_PID=$!

# Wait for dfx to start
print_status "Waiting for dfx to start..."
sleep 10  # Give dfx more time to start up

# Check if dfx is running
if ! pgrep -f "dfx" > /dev/null; then
    print_error "Failed to start dfx"
    cat dfx.log
    exit 1
fi

print_success "dfx started successfully (PID: $DFX_PID)"

# Step 4: Wait for dfx to be ready with longer timeout
print_status "Waiting for dfx to be ready..."
for i in {1..60}; do  # Increased timeout to 60 seconds
    if dfx ping local > /dev/null 2>&1; then
        print_success "dfx is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "dfx failed to start within 60 seconds"
        print_error "Checking dfx logs:"
        cat dfx.log
        exit 1
    fi
    sleep 1
done

# Step 5: Get current principal
print_status "Getting current principal..."
CURRENT_PRINCIPAL=$(dfx identity get-principal)
print_success "Current principal: $CURRENT_PRINCIPAL"

# Step 6: Deploy canisters
print_status "Deploying canisters..."

# For local development, use admin principal as placeholder cKBTC IDs
# In production, these would be real cKBTC canister IDs
print_status "Using admin principal as placeholder cKBTC IDs for local development..."
CKBTC_LEDGER_ID="$ADMIN_PRINCIPAL"
CKBTC_MINTER_ID="$ADMIN_PRINCIPAL"
print_success "cKBTC Ledger ID: $CKBTC_LEDGER_ID (placeholder)"
print_success "cKBTC Minter ID: $CKBTC_MINTER_ID (placeholder)"

# Deploy split_dapp with admin principal and placeholder cKBTC canister IDs
print_status "Deploying split_dapp..."
echo "yes" | dfx deploy split_dapp --network local --mode=reinstall --argument "(principal \"$ADMIN_PRINCIPAL\", \"$CKBTC_LEDGER_ID\", \"$CKBTC_MINTER_ID\")"

if [ $? -ne 0 ]; then
    print_error "Failed to deploy split_dapp canister"
    exit 1
fi

# Generate TypeScript declarations for frontend
print_status "Generating TypeScript declarations..."
dfx generate split_dapp --network local

if [ $? -ne 0 ]; then
    print_error "Failed to generate TypeScript declarations"
    exit 1
fi

print_success "TypeScript declarations generated successfully"

# Frontend is deployed separately on EC2

# Step 6: Get canister IDs
print_status "Getting canister IDs..."
SPLIT_DAPP_ID=$(dfx canister id --network local split_dapp)

# Step 7: Set initial balances for testing
print_status "Setting initial balances for testing..."
print_status "Setting 1 BTC balance for current user..."

# Set 1 BTC (100,000,000 satoshis) for the admin user
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$ADMIN_PRINCIPAL\", 100_000_000)" --network local

# Set 1 BTC (100,000,000 satoshis) for the current user principal
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$CURRENT_PRINCIPAL\", 100_000_000)" --network local

# Set 100 BTC (10,000,000,000 satoshis) for specific user
print_status "Setting 100 BTC balance for specific users..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"hxmjs-porgp-cfkrg-37ls7-ph6op-5nfza-v2v3a-c7asz-xecxj-fidqe-qqe\", 10_000_000_000)" --network local
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"nonqc-wgbnk-7pmsf-y7jpv-qreee-qxpyq-ld5q7-od5q5-jqtop-upzbq-hqe\", 10_000_000_000)" --network local

# Set 100 BTC balance for the specified admin principal
print_status "Ensuring 100 BTC balance for admin principal (for testing)..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae\", 10_000_000_000)" --network local

# Set 100 BTC balance and generate addresses for anonymous principal (used in development)
print_status "Setting 100 BTC balance and generating address for anonymous principal..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"2vxsx-fae\", 10_000_000_000)" --network local
dfx canister call split_dapp adminSetBitcoinAddress "(principal \"2vxsx-fae\", \"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\")" --network local

# Set 100 BTC balance and generate address for specific user principal
print_status "Setting 100 BTC balance and generating address for specific user principal..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"z5ogu-fswbs-c4ckq-nmfa3-jukwt-ktdl7-u2jal-q4i6s-4eltd-sz3wk-rqe\", 10_000_000_000)" --network local

# Set 20 BTC balance for yetlc principal
print_status "Setting 20 BTC balance for yetlc principal..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae\", 2_000_000_000)" --network local

print_status "cKBTC integration initialized - balances managed by ledger..."

# Real cKBTC balances are managed by the ledger
print_status "cKBTC integration ready for real transactions..."

print_success "Initial balances set!"
print_success "   - 1 BTC (100,000,000 satoshis) for admin and current user"
print_success "   - 100 BTC (10,000,000,000 satoshis) for hxmjs-porgp-cfkrg-37ls7-ph6op-5nfza-v2v3a-c7asz-xecxj-fidqe-qqe"
print_success "   - 20 BTC (2,000,000,000 satoshis) for yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae"

print_success "Deployment completed!"
echo
echo "📋 Canister IDs:"
echo "   split_dapp: $SPLIT_DAPP_ID"
echo
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   dfx: http://localhost:4943"
echo "   split_dapp: http://$SPLIT_DAPP_ID.localhost:4943"
echo
echo "📝 Logs:"
echo "   dfx logs: tail -f dfx.log"
echo
print_success "Local deployment complete! 🎉"
