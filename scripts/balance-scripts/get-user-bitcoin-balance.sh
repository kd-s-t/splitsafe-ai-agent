#!/bin/bash

# Get Bitcoin balance for a user
# Usage: ./scripts/get-user-bitcoin-balance.sh [PRINCIPAL] [NETWORK]
# If no principal provided, uses the default one
# Network can be 'local' or 'ic' (default: local)

PRINCIPAL=${1:-""}

# Validate principal
if [[ -z "$PRINCIPAL" ]]; then
    echo "❌ Error: Principal is required"
    echo ""
    echo "📖 Usage: ./scripts/get-user-bitcoin-balance.sh [PRINCIPAL] [NETWORK]"
    echo "   Example: ./scripts/get-user-bitcoin-balance.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe ic"
    exit 1
fi
NETWORK=${2:-"local"}

# Validate network parameter
if [[ "$NETWORK" != "local" && "$NETWORK" != "ic" ]]; then
    echo "❌ Error: Invalid network '$NETWORK'"
    echo "   Valid networks: 'local' or 'ic'"
    echo ""
    echo "💡 Did you mean:"
    echo "   ./scripts/get-user-bitcoin-balance.sh $PRINCIPAL local"
    echo "   ./scripts/get-user-bitcoin-balance.sh $PRINCIPAL ic"
    echo ""
    echo "📖 Usage: ./scripts/get-user-bitcoin-balance.sh [PRINCIPAL] [NETWORK]"
    exit 1
fi

echo "🔍 Getting Bitcoin balance for principal: $PRINCIPAL"
echo "🌐 Network: $NETWORK"
dfx canister call split_dapp getUserBitcoinBalance "(principal \"$PRINCIPAL\")" --network $NETWORK