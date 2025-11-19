#!/bin/bash

# Add Bitcoin balance for a user
# Usage: ./scripts/set-bitcoin-balance.sh [PRINCIPAL] [AMOUNT] [NETWORK]
# If no principal provided, uses the default one
# Amount should be in satoshis (e.g., 100000000 for 1 BTC)
# Network can be 'local' or 'ic' (default: local)

PRINCIPAL=${1:-""}

# Validate principal
if [[ -z "$PRINCIPAL" ]]; then
    echo "❌ Error: Principal is required"
    echo ""
    echo "📖 Usage: ./scripts/set-bitcoin-balance.sh [PRINCIPAL] [AMOUNT] [NETWORK]"
    echo "   Example: ./scripts/set-bitcoin-balance.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe 100000000 ic"
    exit 1
fi
AMOUNT=${2:-"100000000"}
NETWORK=${3:-"local"}

# Validate network parameter
if [[ "$NETWORK" != "local" && "$NETWORK" != "ic" ]]; then
    echo "❌ Error: Invalid network '$NETWORK'"
    echo "   Valid networks: 'local' or 'ic'"
    echo ""
    echo "💡 Did you mean:"
    echo "   ./scripts/set-bitcoin-balance.sh $PRINCIPAL $AMOUNT local"
    echo "   ./scripts/set-bitcoin-balance.sh $PRINCIPAL $AMOUNT ic"
    echo ""
    echo "📖 Usage: ./scripts/set-bitcoin-balance.sh [PRINCIPAL] [AMOUNT] [NETWORK]"
    exit 1
fi

echo "💰 Adding Bitcoin balance for principal: $PRINCIPAL"
echo "💰 Amount: $AMOUNT satoshis ($(echo "scale=8; $AMOUNT/100000000" | bc) BTC)"
echo "🌐 Network: $NETWORK"
dfx canister call split_dapp addBitcoinBalance "(principal \"$(dfx identity get-principal)\", principal \"$PRINCIPAL\", $AMOUNT)" --network $NETWORK
