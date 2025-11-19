#!/bin/bash

# Set username for a user
# Usage: ./scripts/set-username.sh [PRINCIPAL] [USERNAME] [NETWORK]
# If no principal provided, uses the default one
# Network can be 'local' or 'ic' (default: local)

PRINCIPAL=${1:-""}

# Validate principal
if [[ -z "$PRINCIPAL" ]]; then
    echo "❌ Error: Principal is required"
    echo ""
    echo "📖 Usage: ./scripts/set-username.sh [PRINCIPAL] [USERNAME] [NETWORK]"
    echo "   Example: ./scripts/set-username.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe myusername ic"
    exit 1
fi
USERNAME=${2:-"admin"}
NETWORK=${3:-"local"}

# Validate network parameter
if [[ "$NETWORK" != "local" && "$NETWORK" != "ic" ]]; then
    echo "❌ Error: Invalid network '$NETWORK'"
    echo "   Valid networks: 'local' or 'ic'"
    echo ""
    echo "💡 Did you mean:"
    echo "   ./scripts/set-username.sh $PRINCIPAL $USERNAME local"
    echo "   ./scripts/set-username.sh $PRINCIPAL $USERNAME ic"
    echo ""
    echo "📖 Usage: ./scripts/set-username.sh [PRINCIPAL] [USERNAME] [NETWORK]"
    exit 1
fi

echo "👤 Setting username for principal: $PRINCIPAL"
echo "👤 Username: $USERNAME"
echo "🌐 Network: $NETWORK"
dfx canister call split_dapp setUsername "(principal \"$PRINCIPAL\", \"$USERNAME\")" --network $NETWORK
