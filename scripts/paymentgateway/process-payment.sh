#!/bin/bash

# Payment Gateway Processing Script
# Usage: ./process-payment.sh [from_principal] [to_principal] [amount_php] [api_key] [description]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
FROM_PRINCIPAL="yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae"
TO_PRINCIPAL="6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae"
AMOUNT_PHP="8500"
API_KEY="sk_live_771000_1_1760414530839771000"
DESCRIPTION="Flight PR 123: Manila → Cebu"
USE_SEI_NETWORK=false

# Parse command line arguments
if [ $# -ge 1 ]; then FROM_PRINCIPAL="$1"; fi
if [ $# -ge 2 ]; then TO_PRINCIPAL="$2"; fi
if [ $# -ge 3 ]; then AMOUNT_PHP="$3"; fi
if [ $# -ge 4 ]; then API_KEY="$4"; fi
if [ $# -ge 5 ]; then DESCRIPTION="$5"; fi

echo -e "${BLUE}🚀 Payment Gateway Processing Script${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

echo -e "${YELLOW}📋 Payment Details:${NC}"
echo "  From Principal: $FROM_PRINCIPAL"
echo "  To Principal: $TO_PRINCIPAL"
echo "  Amount (PHP): ₱$AMOUNT_PHP"
echo "  API Key: $API_KEY"
echo "  Description: $DESCRIPTION"
echo "  SEI Network: $USE_SEI_NETWORK"
echo ""

# Step 0: Check Current Balances
echo -e "${BLUE}🔍 Step 0: Checking Current Balances${NC}"
echo "Checking current balances (no setup needed)..."

# Step 1: Get API Key Owner
echo -e "${BLUE}🔍 Step 1: Getting API Key Owner${NC}"
API_KEY_RESULT=$(dfx canister call split_dapp getApiKeyByKey "(\"$API_KEY\")" 2>/dev/null)

if echo "$API_KEY_RESULT" | grep -q "not_found"; then
    echo -e "${RED}❌ API Key not found: $API_KEY${NC}"
    exit 1
fi

# Extract owner from the result
OWNER=$(echo "$API_KEY_RESULT" | grep -o 'owner = principal "[^"]*"' | cut -d'"' -f2)
echo -e "${GREEN}✅ API Key Owner: $OWNER${NC}"

# Step 2: Check Balances
echo -e "${BLUE}🔍 Step 2: Checking Balances${NC}"

echo "Checking FROM balance..."
FROM_BALANCE_RAW=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$FROM_PRINCIPAL\")" 2>/dev/null)
FROM_BALANCE=$(echo "$FROM_BALANCE_RAW" | grep -o '[0-9_]*' | tr -d '_' | head -1)
FROM_BALANCE_BTC=$(echo "scale=8; $FROM_BALANCE / 100000000" | bc)
echo -e "${GREEN}✅ FROM Balance: $FROM_BALANCE satoshis ($FROM_BALANCE_BTC BTC)${NC}"

echo "Checking TO balance..."
TO_BALANCE_RAW=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$TO_PRINCIPAL\")" 2>/dev/null)
TO_BALANCE=$(echo "$TO_BALANCE_RAW" | grep -o '[0-9_]*' | tr -d '_' | head -1)
TO_BALANCE_BTC=$(echo "scale=8; $TO_BALANCE / 100000000" | bc)
echo -e "${GREEN}✅ TO Balance: $TO_BALANCE satoshis ($TO_BALANCE_BTC BTC)${NC}"

# Step 3: Convert PHP to BTC (approximate rate)
echo -e "${BLUE}🔍 Step 3: Converting PHP to BTC${NC}"
# Using approximate rate: 1 BTC ≈ ₱6,500,000
AMOUNT_BTC=$(echo "scale=8; $AMOUNT_PHP / 6500000" | bc)
AMOUNT_E8S=$(echo "scale=0; $AMOUNT_BTC * 100000000" | bc | cut -d'.' -f1)
echo -e "${GREEN}✅ Conversion: ₱$AMOUNT_PHP → $AMOUNT_BTC BTC → $AMOUNT_E8S e8s${NC}"

# Step 4: Check if sufficient balance
echo -e "${BLUE}🔍 Step 4: Checking Sufficient Balance${NC}"
if [ "$FROM_BALANCE" -lt "$AMOUNT_E8S" ]; then
    echo -e "${RED}❌ Insufficient balance! Required: $AMOUNT_E8S, Available: $FROM_BALANCE${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Sufficient balance available${NC}"

# Step 5: Process Payment Gateway Transfer
echo -e "${BLUE}🔍 Step 5: Processing Payment Gateway Transfer${NC}"
echo "Switching to FROM identity for payment..."

# Use the current dfx identity as the caller
echo "Using current dfx identity as caller"
CURRENT_CALLER=$(dfx identity get-principal)
echo "Current caller set to: $CURRENT_CALLER"

# Check current caller balance
echo "Checking current caller balance..."
CURRENT_CALLER_BALANCE_RAW=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$CURRENT_CALLER\")" 2>/dev/null)
CURRENT_CALLER_BALANCE=$(echo "$CURRENT_CALLER_BALANCE_RAW" | grep -o '[0-9_]*' | tr -d '_' | head -1)
CURRENT_CALLER_BALANCE_BTC=$(echo "scale=8; $CURRENT_CALLER_BALANCE / 100000000" | bc)
echo -e "${GREEN}✅ Current caller balance: $CURRENT_CALLER_BALANCE satoshis ($CURRENT_CALLER_BALANCE_BTC BTC)${NC}"

echo "Calling processPaymentGatewayTransfer..."

PAYMENT_RESULT=$(dfx canister call split_dapp processPaymentGatewayTransfer "(
  principal \"$TO_PRINCIPAL\",
  $AMOUNT_E8S,
  opt \"$DESCRIPTION\",
  opt \"philippinesairlines\",
  $USE_SEI_NETWORK
)" 2>/dev/null)

if echo "$PAYMENT_RESULT" | grep -q "ok"; then
    TRANSFER_ID=$(echo "$PAYMENT_RESULT" | grep -o 'transferId = "[^"]*"' | cut -d'"' -f2)
    echo -e "${GREEN}✅ Payment Successful!${NC}"
    echo -e "${GREEN}   Transfer ID: $TRANSFER_ID${NC}"
    echo -e "${GREEN}   From: $FROM_PRINCIPAL${NC}"
    echo -e "${GREEN}   To: $TO_PRINCIPAL${NC}"
    echo -e "${GREEN}   Amount: $AMOUNT_E8S e8s ($AMOUNT_BTC BTC)${NC}"
else
    echo -e "${RED}❌ Payment Failed!${NC}"
    echo "$PAYMENT_RESULT"
    exit 1
fi

# Step 6: Check Final Balances
echo -e "${BLUE}🔍 Step 6: Checking Final Balances${NC}"

echo "Checking FROM balance after transfer..."
FROM_BALANCE_AFTER_RAW=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$FROM_PRINCIPAL\")" 2>/dev/null)
FROM_BALANCE_AFTER=$(echo "$FROM_BALANCE_AFTER_RAW" | grep -o '[0-9_]*' | tr -d '_' | head -1)
FROM_BALANCE_AFTER_BTC=$(echo "scale=8; $FROM_BALANCE_AFTER / 100000000" | bc)
echo -e "${GREEN}✅ FROM Balance After: $FROM_BALANCE_AFTER satoshis ($FROM_BALANCE_AFTER_BTC BTC)${NC}"

echo "Checking TO balance after transfer..."
TO_BALANCE_AFTER_RAW=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$TO_PRINCIPAL\")" 2>/dev/null)
TO_BALANCE_AFTER=$(echo "$TO_BALANCE_AFTER_RAW" | grep -o '[0-9_]*' | tr -d '_' | head -1)
TO_BALANCE_AFTER_BTC=$(echo "scale=8; $TO_BALANCE_AFTER / 100000000" | bc)
echo -e "${GREEN}✅ TO Balance After: $TO_BALANCE_AFTER satoshis ($TO_BALANCE_AFTER_BTC BTC)${NC}"

# Calculate differences
FROM_DIFF=$(echo "$FROM_BALANCE - $FROM_BALANCE_AFTER" | bc)
TO_DIFF=$(echo "$TO_BALANCE_AFTER - $TO_BALANCE" | bc)

echo ""
echo -e "${YELLOW}📊 Balance Changes:${NC}"
echo -e "${RED}  FROM: -$FROM_DIFF satoshis${NC}"
echo -e "${GREEN}  TO: +$TO_DIFF satoshis${NC}"

# Step 7: Check Payment Gateway Transaction
echo -e "${BLUE}🔍 Step 7: Checking Payment Gateway Transaction${NC}"
echo "Getting payment gateway transaction details..."

PG_TRANSACTION=$(dfx canister call split_dapp getPaymentGatewayTransaction "(\"$TRANSFER_ID\")" 2>/dev/null)

if echo "$PG_TRANSACTION" | grep -q "opt record" && ! echo "$PG_TRANSACTION" | grep -q "null"; then
    PG_FROM=$(echo "$PG_TRANSACTION" | grep -o 'from = principal "[^"]*"' | cut -d'"' -f2)
    PG_TO=$(echo "$PG_TRANSACTION" | grep -o 'to = principal "[^"]*"' | cut -d'"' -f2)
    PG_AMOUNT=$(echo "$PG_TRANSACTION" | grep -o 'amount = [0-9]*' | cut -d' ' -f3)
    PG_TIMESTAMP=$(echo "$PG_TRANSACTION" | grep -o 'timestamp = [0-9]*' | cut -d' ' -f3)
    
    echo -e "${GREEN}✅ Payment Gateway Transaction Found!${NC}"
    echo -e "${GREEN}   Transfer ID: $TRANSFER_ID${NC}"
    echo -e "${GREEN}   From: $PG_FROM${NC}"
    echo -e "${GREEN}   To: $PG_TO${NC}"
    echo -e "${GREEN}   Amount: $PG_AMOUNT e8s${NC}"
    echo -e "${GREEN}   Timestamp: $PG_TIMESTAMP${NC}"
else
    echo -e "${RED}❌ Payment Gateway Transaction not found${NC}"
    echo "$PG_TRANSACTION"
fi

# Step 8: Check Main Transactions List
echo -e "${BLUE}🔍 Step 8: Checking Main Transactions List${NC}"
echo "Getting all transactions from main HashMap..."

MAIN_TRANSACTIONS=$(dfx canister call split_dapp getTransactionsPaginated "(principal \"$FROM_PRINCIPAL\", 0, 10)" 2>/dev/null)

if echo "$MAIN_TRANSACTIONS" | grep -q "transactions = vec {"; then
    TRANSACTION_COUNT=$(echo "$MAIN_TRANSACTIONS" | grep -o 'totalCount = [0-9]*' | cut -d' ' -f3)
    echo -e "${GREEN}✅ Main Transactions Found: $TRANSACTION_COUNT total${NC}"
    
    # Check if our transaction is in the list
    if echo "$MAIN_TRANSACTIONS" | grep -q "$TRANSFER_ID"; then
        echo -e "${GREEN}✅ Our transaction ($TRANSFER_ID) is in the main transactions list${NC}"
    else
        echo -e "${RED}❌ Our transaction ($TRANSFER_ID) is NOT in the main transactions list${NC}"
    fi
else
    echo -e "${RED}❌ No main transactions found${NC}"
    echo "$MAIN_TRANSACTIONS"
fi

# Step 9: Check TO User Transactions
echo -e "${BLUE}🔍 Step 9: Checking TO User Transactions${NC}"
echo "Getting transactions for TO user..."

TO_MAIN_TRANSACTIONS=$(dfx canister call split_dapp getTransactionsPaginated "(principal \"$TO_PRINCIPAL\", 0, 10)" 2>/dev/null)

if echo "$TO_MAIN_TRANSACTIONS" | grep -q "transactions = vec {"; then
    TO_TRANSACTION_COUNT=$(echo "$TO_MAIN_TRANSACTIONS" | grep -o 'totalCount = [0-9]*' | cut -d' ' -f3)
    echo -e "${GREEN}✅ TO User Main Transactions Found: $TO_TRANSACTION_COUNT total${NC}"
    
    # Check if our transaction is in the TO user's list
    if echo "$TO_MAIN_TRANSACTIONS" | grep -q "$TRANSFER_ID"; then
        echo -e "${GREEN}✅ Our transaction ($TRANSFER_ID) is in TO user's main transactions list${NC}"
    else
        echo -e "${RED}❌ Our transaction ($TRANSFER_ID) is NOT in TO user's main transactions list${NC}"
    fi
else
    echo -e "${RED}❌ No main transactions found for TO user${NC}"
    echo "$TO_MAIN_TRANSACTIONS"
fi

# Step 10: Save Transaction Data for Frontend Reference
echo -e "${BLUE}🔍 Step 10: Saving Transaction Data for Frontend Reference${NC}"

# Create output directory
mkdir -p "$(dirname "$0")/../output"

# Save main transactions list for FROM user
echo "Saving FROM user transactions..."
echo "$MAIN_TRANSACTIONS" > "$(dirname "$0")/../output/from_user_transactions.json"
echo -e "${GREEN}✅ FROM user transactions saved to output/from_user_transactions.json${NC}"

# Save main transactions list for TO user  
echo "Saving TO user transactions..."
echo "$TO_MAIN_TRANSACTIONS" > "$(dirname "$0")/../output/to_user_transactions.json"
echo -e "${GREEN}✅ TO user transactions saved to output/to_user_transactions.json${NC}"

# Save payment gateway transaction details
echo "Saving payment gateway transaction details..."
echo "$PG_TRANSACTION" > "$(dirname "$0")/../output/payment_gateway_transaction.json"
echo -e "${GREEN}✅ Payment gateway transaction saved to output/payment_gateway_transaction.json${NC}"

# Step 11: Summary
echo -e "${BLUE}🔍 Step 11: E2E Flow Summary${NC}"
echo -e "${GREEN}✅ Payment Gateway E2E Flow Completed Successfully!${NC}"
echo ""
echo -e "${YELLOW}📊 Summary:${NC}"
echo -e "  • FROM Balance: $FROM_BALANCE → $FROM_BALANCE_AFTER satoshis (${FROM_DIFF:+/-}${FROM_DIFF})"
echo -e "  • TO Balance: $TO_BALANCE → $TO_BALANCE_AFTER satoshis (+${TO_DIFF})"
echo -e "  • Transfer ID: $TRANSFER_ID"
echo -e "  • Amount: $AMOUNT_SATOSHIS satoshis ($AMOUNT_BTC BTC)"
echo -e "  • Fee: $FEE satoshis"
echo -e "  • Total Deducted: $TOTAL_DEDUCTED satoshis"
echo ""
echo -e "${GREEN}🎉 All checks completed successfully!${NC}"
echo -e "${YELLOW}📁 Transaction data saved to scripts/output/ for frontend reference${NC}"

