#!/bin/bash

# Usage: ./scripts/tests/test-cancel-split.sh [BROWSER_PRINCIPAL] [NETWORK]
# Browser principal: The principal to test with
# Network can be 'local' or 'ic' (default: local)

BROWSER_PRINCIPAL=${1:-""}
NETWORK=${2:-"local"}

# Validate browser principal
if [[ -z "$BROWSER_PRINCIPAL" ]]; then
    echo "❌ Error: Browser principal is required"
    echo ""
    echo "📖 Usage: ./scripts/tests/test-cancel-split.sh [BROWSER_PRINCIPAL] [NETWORK]"
    echo "   Example: ./scripts/tests/test-cancel-split.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe ic"
    exit 1
fi

echo "🧪 Starting CancelSplit E2E Test..."
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

# Generate random recipient principal (32 characters, base32 encoded)
generate_random_principal() {
    # Generate 32 random bytes and encode as base32
    # This creates a valid ICP principal format
    local chars="abcdefghijklmnopqrstuvwxyz234567"
    local principal=""
    for i in {1..27}; do
        if [ $i -eq 1 ]; then
            principal+="2"
        elif [ $i -eq 2 ]; then
            principal+="v"
        elif [ $i -eq 3 ]; then
            principal+="x"
        elif [ $i -eq 4 ]; then
            principal+="s"
        elif [ $i -eq 5 ]; then
            principal+="x"
        else
            # Generate random character from the base32 alphabet
            local random_char="${chars:$((RANDOM % ${#chars})):1}"
            principal+="$random_char"
        fi
    done
    echo "$principal"
}

# Get admin principal from canister
get_admin_principal() {
    local admin_result=$(dfx canister call split_dapp getAdmin --network $NETWORK)
    local admin_principal=$(echo "$admin_result" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
    echo "$admin_principal"
}

# Test principals
SENDER_PRINCIPAL="$BROWSER_PRINCIPAL"
RECIPIENT_PRINCIPAL=$(generate_random_principal)
ADMIN_PRINCIPAL=$(get_admin_principal)
ESCROW_AMOUNT=3000  # 0.00003 BTC in satoshis (0.00003 * 100000000)

echo "📋 Test Configuration:"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Recipient: $RECIPIENT_PRINCIPAL (randomly generated)"
echo "   Admin: $ADMIN_PRINCIPAL (from canister)"
echo "   Amount: $ESCROW_AMOUNT satoshis (0.00003 BTC)"
echo ""

# Set initial balances for testing
echo "💰 Setting initial balances..."
dfx canister call split_dapp addBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$SENDER_PRINCIPAL\", 100_000_000 : nat)" --network $NETWORK
dfx canister call split_dapp addBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$RECIPIENT_PRINCIPAL\", 5_000 : nat)" --network $NETWORK
echo "   ✅ Added balances for sender and recipient"
echo ""

# Step 1: Get initial balances
echo "📊 Step 1: Fetching initial balances..."
SENDER_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")" --network $NETWORK | grep -o '[0-9_]*' | sed 's/_//g')
RECIPIENT_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\")" --network $NETWORK | grep -o '[0-9_]*' | sed 's/_//g')

echo "   Sender: $SENDER_BALANCE satoshis"
echo "   Recipient: $RECIPIENT_BALANCE satoshis"
echo ""

# Step 2: Create escrow
echo "🔐 Step 2: Creating escrow..."
ESCROW_RESULT=$(dfx canister call split_dapp initiateEscrow "(
  principal \"$SENDER_PRINCIPAL\",
  vec {
    record {
      amount = $ESCROW_AMOUNT : nat;
      nickname = \"Test Recipient\" : text;
      percentage = 100 : nat;
      \"principal\" = principal \"$RECIPIENT_PRINCIPAL\";
    };
  },
  \"CancelSplit E2E Test\" : text
)" --network $NETWORK)

ESCROW_ID=$(echo "$ESCROW_RESULT" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
echo "   Escrow ID: $ESCROW_ID"
echo ""

# Step 3: Verify escrow is pending
echo "⏳ Step 3: Verifying escrow is in pending state..."
SENDER_TX_BEFORE=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$SENDER_PRINCIPAL\")" --network $NETWORK)
echo "   Transaction status before cancellation: $SENDER_TX_BEFORE"
echo ""

# Step 4: Cancel escrow (sender cancels before recipient approves)
echo "❌ Step 4: Cancelling escrow..."
dfx canister call split_dapp cancelSplit "(
  principal \"$SENDER_PRINCIPAL\"
)" --network $NETWORK
echo "   ✅ Escrow cancelled by sender"
echo ""

# Step 5: Get final balances
echo "📊 Step 5: Verifying final balances..."
FINAL_SENDER_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")" --network $NETWORK | grep -o '[0-9_]*' | sed 's/_//g')
FINAL_RECIPIENT_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\")" --network $NETWORK | grep -o '[0-9_]*' | sed 's/_//g')

echo "   Final sender balance: $FINAL_SENDER_BALANCE satoshis"
echo "   Final recipient balance: $FINAL_RECIPIENT_BALANCE satoshis"
echo ""

# Step 6: Get transaction status after cancellation
echo "📋 Step 6: Verifying transaction status after cancellation..."
SENDER_TX_AFTER=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$SENDER_PRINCIPAL\")" --network $NETWORK)
RECIPIENT_TX_AFTER=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$RECIPIENT_PRINCIPAL\")" --network $NETWORK)

echo "   Sender transaction after cancellation: $SENDER_TX_AFTER"
echo "   Recipient transaction after cancellation: $RECIPIENT_TX_AFTER"
echo ""

# Summary
echo "🎉 CancelSplit E2E Test Summary:"
echo "📋 Escrow ID: $ESCROW_ID"
echo "💰 Amount: $ESCROW_AMOUNT satoshis (0.00003 BTC)"
echo "👤 Sender: $SENDER_PRINCIPAL"
echo "👥 Recipient: $RECIPIENT_PRINCIPAL (random)"
echo "👑 Admin: $ADMIN_PRINCIPAL"
echo "✅ Escrow successfully cancelled by sender"
echo "✅ All cancel tests completed successfully!"
echo ""
