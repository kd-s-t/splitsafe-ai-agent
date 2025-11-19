#!/bin/bash

# Set nickname for a user
# Usage: ./scripts/set-nickname.sh [PRINCIPAL] [NICKNAME] [NETWORK]
# If no principal provided, uses the default one
# Network can be 'local' or 'ic' (default: local)

PRINCIPAL=${1:-""}

# Validate principal
if [[ -z "$PRINCIPAL" ]]; then
    echo "❌ Error: Principal is required"
    echo ""
    echo "📖 Usage: ./scripts/set-nickname.sh [PRINCIPAL] [NICKNAME] [NETWORK]"
    echo "   Example: ./scripts/set-nickname.sh ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe mynickname ic"
    exit 1
fi
NICKNAME=${2:-"admin"}
NETWORK=${3:-"local"}

# Validate network parameter
if [[ "$NETWORK" != "local" && "$NETWORK" != "ic" ]]; then
    echo "❌ Error: Invalid network '$NETWORK'"
    echo "   Valid networks: 'local' or 'ic'"
    echo ""
    echo "💡 Did you mean:"
    echo "   ./scripts/set-nickname.sh $PRINCIPAL $NICKNAME local"
    echo "   ./scripts/set-nickname.sh $PRINCIPAL $NICKNAME ic"
    echo ""
    echo "📖 Usage: ./scripts/set-nickname.sh [PRINCIPAL] [NICKNAME] [NETWORK]"
    exit 1
fi

echo "📝 Setting nickname for principal: $PRINCIPAL"
echo "📝 Nickname: $NICKNAME"
echo "🌐 Network: $NETWORK"
dfx canister call split_dapp setNickname "(principal \"$PRINCIPAL\", \"$NICKNAME\")" --network $NETWORK
