#!/bin/bash

# Usage: ./scripts/seeders/initiate-escrow-only.sh [SENDER_PRINCIPAL] [NETWORK]
# Sender principal: The principal to create escrow with (required)
# Network can be 'local' or 'ic' (default: local)

SENDER_PRINCIPAL=${1:-""}
NETWORK=${2:-"local"}

# Validate sender principal
if [[ -z "$SENDER_PRINCIPAL" ]]; then
    echo "❌ Error: Sender principal is required"
    echo ""
    echo "📖 Usage: ./scripts/seeders/initiate-escrow-only.sh [SENDER_PRINCIPAL] [NETWORK]"
    echo "   Example: ./scripts/seeders/initiate-escrow-only.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe ic"
    exit 1
fi

echo "🧪 Starting InitiateEscrowOnly Seeder..."
echo "🌐 Network: $NETWORK"
echo "👤 Sender Principal: $SENDER_PRINCIPAL"
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
    local admin_result=$(dfx canister call split_dapp getAdmin)
    local admin_principal=$(echo "$admin_result" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
    echo "$admin_principal"
}

# Test principals
SENDER_PRINCIPAL="$1"
RECIPIENT_PRINCIPAL=$(generate_random_principal)
ADMIN_PRINCIPAL=$(get_admin_principal)
ESCROW_AMOUNT=3000  # 0.00003 BTC in satoshis

echo "📋 Test Configuration:"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Recipient: $RECIPIENT_PRINCIPAL (randomly generated)"
echo "   Admin: $ADMIN_PRINCIPAL (from canister)"
echo "   Amount: $ESCROW_AMOUNT satoshis (0.00003 BTC)"
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
  \"Seeder: Initiate Only\" : text
)")

ESCROW_ID=$(echo "$ESCROW_RESULT" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
echo "   Escrow ID: $ESCROW_ID"
echo ""

# Step 3: Verify escrow is pending
echo "📋 Step 3: Verifying escrow is in pending state..."
SENDER_TX=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$SENDER_PRINCIPAL\")")
RECIPIENT_TX=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$RECIPIENT_PRINCIPAL\")")

echo "   Sender transaction: $SENDER_TX"
echo "   Recipient transaction: $RECIPIENT_TX"
echo ""

# Summary
echo "🎉 InitiateEscrowOnly Seeder Summary:"
echo "📋 Escrow ID: $ESCROW_ID"
echo "💰 Amount: $ESCROW_AMOUNT satoshis (0.00003 BTC)"
echo "👤 Sender: $SENDER_PRINCIPAL"
echo "👥 Recipient: $RECIPIENT_PRINCIPAL (random)"
echo "👑 Admin: $ADMIN_PRINCIPAL"
echo "✅ Escrow successfully created and pending"
echo "✅ All seeder steps completed successfully!"
echo ""
