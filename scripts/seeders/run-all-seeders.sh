#!/bin/bash

echo "🌱 Running All Seeder Scripts"
echo "=============================="
echo ""

# Check if sender principal is provided as argument
if [ -z "$1" ]; then
    echo "❌ Usage: $0 <SENDER_PRINCIPAL> [NETWORK]"
    echo "   Example: $0 up3zk-t2nfl-ujojs-rvg3p-hpisk-7c666-3ns4x-i6knn-h5cg4-npfb4-gqe local"
    echo "   Example: $0 up3zk-t2nfl-ujojs-rvg3p-hpisk-7c666-3ns4x-i6knn-h5cg4-npfb4-gqe ic"
    exit 1
fi

SENDER_PRINCIPAL="$1"
NETWORK="${2:-local}"
echo "👤 Using sender principal: $SENDER_PRINCIPAL"
echo "🌐 Using network: $NETWORK"
echo ""

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please start dfx first: dfx start --background"
    exit 1
fi

# Make all scripts executable
chmod +x scripts/seeders/*.sh

echo "🚀 Starting seeder sequence..."
echo ""

# Run each seeder script
echo "1️⃣ Running: Initiate Escrow Only"
echo "--------------------------------"
./scripts/seeders/initiate-escrow-only.sh "$SENDER_PRINCIPAL" "$NETWORK"
echo ""

echo "2️⃣ Running: Initiate + Approve"
echo "-------------------------------"
./scripts/seeders/initiate-and-approve.sh "$SENDER_PRINCIPAL" "$NETWORK"
echo ""

echo "3️⃣ Running: Initiate + Decline"
echo "-------------------------------"
./scripts/seeders/initiate-and-decline.sh "$SENDER_PRINCIPAL" "$NETWORK"
echo ""

echo "4️⃣ Running: Initiate + Cancel"
echo "------------------------------"
./scripts/seeders/initiate-and-cancel.sh "$SENDER_PRINCIPAL" "$NETWORK"
echo ""

echo "✅ All seeder scripts completed!"
echo ""
echo "📊 Summary of created transactions:"
echo "   • 1 Pending escrow (waiting for approval)"
echo "   • 1 Approved escrow (ready for release)"
echo "   • 1 Declined escrow (funds returned)"
echo "   • 1 Canceled escrow (funds returned)"
echo ""
echo "🎉 Database seeded with test data!"
