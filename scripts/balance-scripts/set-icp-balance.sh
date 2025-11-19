#!/bin/bash

# Set ICP balance for a user
# Usage: ./scripts/set-icp-balance.sh [PRINCIPAL] [AMOUNT] [NETWORK]
# If no principal provided, uses the default one
# Amount should be in e8s (e.g., 1000000000 for 10 ICP)
# Network can be 'local' or 'ic' (default: local)

PRINCIPAL=${1:-""}

# Validate principal
if [[ -z "$PRINCIPAL" ]]; then
    echo "❌ Error: Principal is required"
    echo ""
    echo "📖 Usage: ./scripts/set-icp-balance.sh [PRINCIPAL] [AMOUNT] [NETWORK]"
    echo "   Example: ./scripts/set-icp-balance.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe 100000000 ic"
    exit 1
fi
AMOUNT=${2:-"1000000000"}
NETWORK=${3:-"local"}

# Validate network parameter
if [[ "$NETWORK" != "local" && "$NETWORK" != "ic" ]]; then
    echo "❌ Error: Invalid network '$NETWORK'"
    echo "   Valid networks: 'local' or 'ic'"
    echo ""
    echo "💡 Did you mean:"
    echo "   ./scripts/set-icp-balance.sh $PRINCIPAL $AMOUNT local"
    echo "   ./scripts/set-icp-balance.sh $PRINCIPAL $AMOUNT ic"
    echo ""
    echo "📖 Usage: ./scripts/set-icp-balance.sh [PRINCIPAL] [AMOUNT] [NETWORK]"
    exit 1
fi

echo "💰 Setting ICP balance for principal: $PRINCIPAL"
echo "💰 Amount: $AMOUNT e8s ($(echo "scale=8; $AMOUNT/100000000" | bc) ICP)"
echo "🌐 Network: $NETWORK"
dfx canister call split_dapp setInitialBalance "(principal \"$PRINCIPAL\", $AMOUNT, principal \"$(dfx identity get-principal)\")" --network $NETWORK
