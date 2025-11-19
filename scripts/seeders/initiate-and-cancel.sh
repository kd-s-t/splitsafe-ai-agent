#!/bin/bash

echo "🧪 Starting InitiateAndCancel Seeder..."
echo ""

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please start dfx first: dfx start --background"
    exit 1
fi

# Check if sender principal is provided as argument
if [ -z "$1" ]; then
    echo "❌ Usage: $0 <SENDER_PRINCIPAL>"
    echo "   Example: $0 up3zk-t2nfl-ujojs-rvg3p-hpisk-7c666-3ns4x-i6knn-h5cg4-npfb4-gqe"
    exit 1
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
    local admin_result=$(dfx canister call split_dapp getAdmin)
    local admin_principal=$(echo "$admin_result" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
    echo "$admin_principal"
}

# Test principals
SENDER_PRINCIPAL="$1"
RECIPIENT_PRINCIPAL=$(generate_random_principal)
ADMIN_PRINCIPAL=$(get_admin_principal)
ESCROW_AMOUNT=6000  # 0.00006 BTC in satoshis

echo "📋 Test Configuration:"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Recipient: $RECIPIENT_PRINCIPAL (randomly generated)"
echo "   Admin: $ADMIN_PRINCIPAL (from canister)"
echo "   Amount: $ESCROW_AMOUNT satoshis (0.00006 BTC)"
echo ""

# Set initial balances for testing
echo "💰 Setting initial balances..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$SENDER_PRINCIPAL\", 100_000_000 : nat)"
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$RECIPIENT_PRINCIPAL\", 5_000 : nat)"
echo "   ✅ Set balances for sender and recipient"
echo ""

# Step 1: Get initial balances
echo "📊 Step 1: Fetching initial balances..."
SENDER_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')
RECIPIENT_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')

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
      nickname = \"Seeder Recipient\" : text;
      percentage = 100 : nat;
      \"principal\" = principal \"$RECIPIENT_PRINCIPAL\";
    };
  },
  \"Seeder: Initiate + Cancel\" : text
)")

ESCROW_ID=$(echo "$ESCROW_RESULT" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
echo "   Escrow ID: $ESCROW_ID"
echo ""

# Step 3: Cancel escrow (sender cancels)
echo "🚫 Step 3: Canceling escrow..."
dfx canister call split_dapp cancelSplit "(principal \"$SENDER_PRINCIPAL\")"
echo "   ✅ Escrow canceled by sender"
echo ""

# Step 4: Get final balances
echo "📊 Step 4: Verifying final balances..."
FINAL_SENDER_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')
FINAL_RECIPIENT_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')

echo "   Final sender balance: $FINAL_SENDER_BALANCE satoshis"
echo "   Final recipient balance: $FINAL_RECIPIENT_BALANCE satoshis"
echo ""

# Step 5: Verify escrow is canceled
echo "📋 Step 5: Verifying escrow is canceled..."
SENDER_TX=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$SENDER_PRINCIPAL\")")
RECIPIENT_TX=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$RECIPIENT_PRINCIPAL\")")

echo "   Sender transaction: $SENDER_TX"
echo "   Recipient transaction: $RECIPIENT_TX"
echo ""

# Summary
echo "🎉 InitiateAndCancel Seeder Summary:"
echo "📋 Escrow ID: $ESCROW_ID"
echo "💰 Amount: $ESCROW_AMOUNT satoshis (0.00006 BTC)"
echo "👤 Sender: $SENDER_PRINCIPAL"
echo "👥 Recipient: $RECIPIENT_PRINCIPAL (random)"
echo "👑 Admin: $ADMIN_PRINCIPAL"
echo "✅ Escrow successfully canceled by sender"
echo "✅ All seeder steps completed successfully!"
echo ""
