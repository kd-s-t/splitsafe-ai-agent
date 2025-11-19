#!/bin/bash

# Get ICP balance for a user
# Usage: ./scripts/get-icp-balance.sh [PRINCIPAL] [NETWORK]
# Principal: The principal to check balance for (required)
# Network can be 'local' or 'ic' (default: local)

PRINCIPAL=${1:-""}
NETWORK=${2:-"local"}

# Validate principal
if [[ -z "$PRINCIPAL" ]]; then
    echo "❌ Error: Principal is required"
    echo ""
    echo "📖 Usage: ./scripts/get-icp-balance.sh [PRINCIPAL] [NETWORK]"
    echo "   Example: ./scripts/get-icp-balance.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe ic"
    exit 1
fi

# Validate network parameter
if [[ "$NETWORK" != "local" && "$NETWORK" != "ic" ]]; then
    echo "❌ Error: Invalid network '$NETWORK'"
    echo "   Valid networks: 'local' or 'ic'"
    echo ""
    echo "💡 Did you mean:"
    echo "   ./scripts/get-icp-balance.sh $PRINCIPAL local"
    echo "   ./scripts/get-icp-balance.sh $PRINCIPAL ic"
    echo ""
    echo "📖 Usage: ./scripts/get-icp-balance.sh [PRINCIPAL] [NETWORK]"
    exit 1
fi

echo "🔍 Getting ICP balance for principal: $PRINCIPAL"
echo "🌐 Network: $NETWORK"
dfx canister call split_dapp getBalance "(principal \"$PRINCIPAL\")" --network $NETWORK
