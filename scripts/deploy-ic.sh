#!/bin/bash

# SplitSafe IC Deployment Script
# This script deploys the frontend to Internet Computer

set -e

# Default values
NETWORK="ic"
DEPLOY_BACKEND=false
DOMAIN=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --network)
            NETWORK="$2"
            shift 2
            ;;
        --deploy-backend)
            DEPLOY_BACKEND=true
            shift
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --network NETWORK    Target network (ic|local, default: ic)"
            echo "  --deploy-backend     Also deploy backend canister"
            echo "  --domain DOMAIN      Custom domain for deployment"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🚀 Deploying SplitSafe to Internet Computer..."
echo "📡 Network: $NETWORK"

# Check if build exists
if [ ! -d "out" ]; then
    echo "❌ Build not found. Running build first..."
    ./scripts/build-ic-react.sh
fi

# Deploy frontend assets
echo "📦 Deploying frontend assets..."
dfx deploy frontend --network $NETWORK

# Get frontend canister ID
FRONTEND_ID=$(dfx canister --network $NETWORK id frontend)
echo "🎯 Frontend canister ID: $FRONTEND_ID"

# Deploy backend if requested
if [ "$DEPLOY_BACKEND" = true ]; then
    echo "🔧 Deploying backend canister..."
    dfx deploy split_dapp --network $NETWORK
    
    BACKEND_ID=$(dfx canister --network $NETWORK id split_dapp)
    echo "🎯 Backend canister ID: $BACKEND_ID"
fi

# Display access URLs
if [ "$NETWORK" = "ic" ]; then
    echo ""
    echo "🌐 Deployment successful!"
    echo "🔗 Frontend URL: https://$FRONTEND_ID.icp0.io"
    
    if [ "$DEPLOY_BACKEND" = true ]; then
        echo "🔗 Backend URL: https://$BACKEND_ID.icp0.io"
    fi
    
    if [ -n "$DOMAIN" ]; then
        echo "🔗 Custom domain: https://$DOMAIN"
        echo "📝 Don't forget to configure DNS: CNAME $DOMAIN ic0.app"
    fi
else
    echo ""
    echo "🌐 Local deployment successful!"
    echo "🔗 Frontend URL: http://localhost:4943/?canisterId=$FRONTEND_ID"
    
    if [ "$DEPLOY_BACKEND" = true ]; then
        echo "🔗 Backend URL: http://localhost:4943/?canisterId=$BACKEND_ID"
    fi
fi

echo ""
echo "✅ Deployment completed successfully!"
