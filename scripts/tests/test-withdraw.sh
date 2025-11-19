#!/bin/bash

# Usage: ./scripts/tests/test-withdraw.sh [BROWSER_PRINCIPAL] [NETWORK]
# Browser principal: The principal to test with
# Network can be 'local' or 'ic' (default: local)

BROWSER_PRINCIPAL=${1:-""}
NETWORK=${2:-"local"}

# Validate browser principal
if [[ -z "$BROWSER_PRINCIPAL" ]]; then
    echo "❌ Error: Browser principal is required"
    echo ""
    echo "📖 Usage: ./scripts/tests/test-withdraw.sh [BROWSER_PRINCIPAL] [NETWORK]"
    echo "   Example: ./scripts/tests/test-withdraw.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe ic"
    exit 1
fi

# Validate network parameter
if [[ "$NETWORK" != "local" && "$NETWORK" != "ic" ]]; then
    echo "❌ Error: Invalid network '$NETWORK'"
    echo "   Valid networks: 'local' or 'ic'"
    echo ""
    echo "💡 Did you mean:"
    echo "   ./scripts/tests/test-withdraw.sh local"
    echo "   ./scripts/tests/test-withdraw.sh ic"
    echo ""
    echo "📖 Usage: ./scripts/tests/test-withdraw.sh [NETWORK]"
    exit 1
fi

echo "🧪 Starting Withdraw E2E Test..."
echo "🌐 Network: $NETWORK"
echo ""

# Check if dfx is running (only for local network)
if [[ "$NETWORK" == "local" ]]; then
    if ! dfx ping > /dev/null 2>&1; then
        echo "❌ DFX is not running. Please start dfx first: dfx start --background"
        exit 1
    fi
fi

# Get admin principal from canister
get_admin_principal() {
    local admin_result=$(dfx canister call split_dapp getAdmin --network $NETWORK)
    local admin_principal=$(echo "$admin_result" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
    echo "$admin_principal"
}

# Test user principal (from argument)
USER_PRINCIPAL="$BROWSER_PRINCIPAL"
ADMIN_PRINCIPAL=$(get_admin_principal)

echo "📋 Test Configuration:"
echo "   User: $USER_PRINCIPAL"
echo "   Admin: $ADMIN_PRINCIPAL (from canister)"
echo ""

# Set up initial balances for testing
echo "💰 Setting initial balances for testing..."

# Add initial ckBTC balance (1 ckBTC = 100,000,000 satoshis)
dfx canister call split_dapp addBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$USER_PRINCIPAL\", 100_000_000 : nat)" --network $NETWORK
echo "   ✅ Added 1 BTC balance for user"
echo ""

# Check initial balances
echo "📊 Step 1: Checking initial balances..."

CKBTC_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$USER_PRINCIPAL\")" --network $NETWORK)
echo "   Initial ckBTC balance: $CKBTC_BALANCE"
echo ""

echo "🔐 Step 2: Testing ckBTC to BTC withdrawal..."

# Test ckBTC to BTC Withdrawal
CKBTC_WITHDRAW_AMOUNT=10_000_000  # 0.1 BTC
BTC_RECIPIENT_ADDRESS="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"

echo "   Withdrawing $CKBTC_WITHDRAW_AMOUNT satoshis (0.1 BTC) to BTC address: $BTC_RECIPIENT_ADDRESS"

CKBTC_RESULT=$(dfx canister call split_dapp withdrawBitcoin "(principal \"$USER_PRINCIPAL\", $CKBTC_WITHDRAW_AMOUNT : nat, \"$BTC_RECIPIENT_ADDRESS\")" --network $NETWORK)

if echo "$CKBTC_RESULT" | grep -q "ok"; then
    echo "   ✅ ckBTC to BTC withdrawal successful"
    echo "   Result: $CKBTC_RESULT"
else
    echo "   ❌ ckBTC to BTC withdrawal failed"
    echo "   Result: $CKBTC_RESULT"
    exit 1
fi
echo ""

# Check final balances
echo "📊 Step 3: Checking final balances..."

FINAL_CKBTC_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$USER_PRINCIPAL\")" --network $NETWORK)
echo "   Final ckBTC balance: $FINAL_CKBTC_BALANCE"
echo ""

# Summary
echo "🎉 Withdraw E2E Test Summary:"
echo "👤 User: $USER_PRINCIPAL"
echo "👑 Admin: $ADMIN_PRINCIPAL"
echo "💰 ckBTC Withdrawal: $CKBTC_WITHDRAW_AMOUNT satoshis (0.1 BTC) → $BTC_RECIPIENT_ADDRESS"
echo "✅ All withdrawal tests completed successfully!"
echo ""
