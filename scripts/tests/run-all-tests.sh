#!/bin/bash

# Usage: ./scripts/tests/run-all-tests.sh [BROWSER_PRINCIPAL] [NETWORK]
# Browser principal: The principal to test with
# Network can be 'local' or 'ic' (default: local)

BROWSER_PRINCIPAL=${1:-""}
NETWORK=${2:-"local"}

# Validate browser principal
if [[ -z "$BROWSER_PRINCIPAL" ]]; then
    echo "❌ Error: Browser principal is required"
    echo ""
    echo "📖 Usage: ./scripts/tests/run-all-tests.sh [BROWSER_PRINCIPAL] [NETWORK]"
    echo "   Example: ./scripts/tests/run-all-tests.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe ic"
    exit 1
fi

echo "🧪 Running All E2E Integration Tests"
echo "===================================="
echo "🌐 Network: $NETWORK"
echo "👤 Browser Principal: $BROWSER_PRINCIPAL"
echo ""

# Check if dfx is running (only for local network)
if [[ "$NETWORK" == "local" ]]; then
    if ! dfx ping > /dev/null 2>&1; then
        echo "❌ DFX is not running. Please start dfx first: dfx start --background"
        exit 1
    fi
fi

echo "🚀 Starting test sequence..."
echo ""

# Test 1: Withdraw
echo "1️⃣ Running: Withdraw Test"
echo "------------------------"
./scripts/tests/test-withdraw.sh "$BROWSER_PRINCIPAL" "$NETWORK"
if [ $? -ne 0 ]; then
    echo "❌ Withdraw test failed"
    exit 1
fi
echo ""

# Test 2: Decline Split
echo "2️⃣ Running: Decline Split Test"
echo "-----------------------------"
./scripts/tests/test-decline-split.sh "$BROWSER_PRINCIPAL" "$NETWORK"
if [ $? -ne 0 ]; then
    echo "❌ Decline split test failed"
    exit 1
fi
echo ""

# Test 3: Cancel Split
echo "3️⃣ Running: Cancel Split Test"
echo "----------------------------"
./scripts/tests/test-cancel-split.sh "$BROWSER_PRINCIPAL" "$NETWORK"
if [ $? -ne 0 ]; then
    echo "❌ Cancel split test failed"
    exit 1
fi
echo ""

# Test 4: Release Split
echo "4️⃣ Running: Release Split Test"
echo "------------------------------"
./scripts/tests/test-release-split.sh "$BROWSER_PRINCIPAL" "$NETWORK"
if [ $? -ne 0 ]; then
    echo "❌ Release split test failed"
    exit 1
fi
echo ""


echo "✅ All tests completed successfully!"
echo ""
echo "📊 Test Summary:"
echo "   • ✅ Withdraw functionality"
echo "   • ✅ Escrow decline functionality"
echo "   • ✅ Escrow cancellation functionality"
echo "   • ✅ Escrow release functionality"
echo ""
echo "🎉 All E2E integration tests passed!"
echo ""
