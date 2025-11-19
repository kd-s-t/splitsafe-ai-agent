#!/bin/bash

# API Key Operations Script
# Usage: ./api-key-ops.sh [create|get|list] [principal] [name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

OPERATION=${1:-"help"}
PRINCIPAL=${2:-"6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae"}
NAME=${3:-"Payment Gateway API Key"}

echo -e "${BLUE}🔑 API Key Operations Script${NC}"
echo -e "${BLUE}============================${NC}"
echo ""

case $OPERATION in
    "create")
        echo -e "${YELLOW}📝 Creating API Key${NC}"
        echo "  Principal: $PRINCIPAL"
        echo "  Name: $NAME"
        echo ""
        
        RESULT=$(dfx canister call split_dapp createApiKey "(
          principal \"$PRINCIPAL\",
          record {
            name = \"$NAME\";
            permissions = vec { variant { escrow_create }; variant { escrow_read }; variant { escrow_update } };
          }
        )" 2>/dev/null)
        
        if echo "$RESULT" | grep -q "ok"; then
            API_KEY=$(echo "$RESULT" | grep -o 'key = "[^"]*"' | cut -d'"' -f2)
            OWNER=$(echo "$RESULT" | grep -o 'owner = principal "[^"]*"' | cut -d'"' -f2)
            echo -e "${GREEN}✅ API Key Created Successfully!${NC}"
            echo -e "${GREEN}   API Key: $API_KEY${NC}"
            echo -e "${GREEN}   Owner: $OWNER${NC}"
        else
            echo -e "${RED}❌ Failed to create API key${NC}"
            echo "$RESULT"
        fi
        ;;
        
    "get")
        echo -e "${YELLOW}🔍 Getting API Key Details${NC}"
        echo "  API Key: $PRINCIPAL"
        echo ""
        
        RESULT=$(dfx canister call split_dapp getApiKeyByKey "(\"$PRINCIPAL\")" 2>/dev/null)
        
        if echo "$RESULT" | grep -q "ok"; then
            API_KEY=$(echo "$RESULT" | grep -o 'key = "[^"]*"' | cut -d'"' -f2)
            OWNER=$(echo "$RESULT" | grep -o 'owner = principal "[^"]*"' | cut -d'"' -f2)
            NAME=$(echo "$RESULT" | grep -o 'name = "[^"]*"' | cut -d'"' -f2)
            STATUS=$(echo "$RESULT" | grep -o 'status = variant { [^}]* }' | cut -d'{' -f2 | cut -d'}' -f1)
            
            echo -e "${GREEN}✅ API Key Found!${NC}"
            echo -e "${GREEN}   API Key: $API_KEY${NC}"
            echo -e "${GREEN}   Name: $NAME${NC}"
            echo -e "${GREEN}   Owner: $OWNER${NC}"
            echo -e "${GREEN}   Status: $STATUS${NC}"
        else
            echo -e "${RED}❌ API Key not found${NC}"
            echo "$RESULT"
        fi
        ;;
        
    "list")
        echo -e "${YELLOW}📋 Listing API Keys for Principal${NC}"
        echo "  Principal: $PRINCIPAL"
        echo ""
        
        RESULT=$(dfx canister call split_dapp listApiKeysForPrincipal "(principal \"$PRINCIPAL\")" 2>/dev/null)
        
        if echo "$RESULT" | grep -q "ok"; then
            echo -e "${GREEN}✅ API Keys Found:${NC}"
            echo "$RESULT" | grep -A 20 "keys = vec"
        else
            echo -e "${RED}❌ Failed to list API keys${NC}"
            echo "$RESULT"
        fi
        ;;
        
    "help"|*)
        echo -e "${YELLOW}Usage:${NC}"
        echo "  ./api-key-ops.sh create [principal] [name]"
        echo "  ./api-key-ops.sh get [api_key]"
        echo "  ./api-key-ops.sh list [principal]"
        echo ""
        echo -e "${YELLOW}Examples:${NC}"
        echo "  ./api-key-ops.sh create 6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae \"My API Key\""
        echo "  ./api-key-ops.sh get sk_live_551000_2_1760411342561551000"
        echo "  ./api-key-ops.sh list 6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae"
        ;;
esac
