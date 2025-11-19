# Payment Gateway Scripts

This directory contains scripts for testing and managing the payment gateway functionality.

## Scripts

### 1. `process-payment.sh` - Complete E2E Payment Flow

**Usage:**
```bash
./process-payment.sh [from_principal] [to_principal] [amount_php] [api_key] [description]
```

**Default Values:**
- `from_principal`: `yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae`
- `to_principal`: `6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae`
- `amount_php`: `8500`
- `api_key`: `sk_live_551000_2_1760411342561551000`
- `description`: `Flight PR 123: Manila → Cebu`

**What it does:**
1. ✅ Gets API key owner from the provided API key
2. ✅ Checks balances before transfer
3. ✅ Converts PHP amount to BTC (e8s)
4. ✅ Validates sufficient balance
5. ✅ Processes payment gateway transfer
6. ✅ Checks balances after transfer
7. ✅ Verifies transaction in payment gateway
8. ✅ Checks transaction in unified transactions list
9. ✅ Verifies transaction appears in user-specific lists

**Example:**
```bash
# Use defaults
./process-payment.sh

# Custom payment
./process-payment.sh "yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae" "6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae" "10000" "sk_live_551000_2_1760411342561551000" "Custom Payment"
```

### 2. `api-key-ops.sh` - API Key Management

**Usage:**
```bash
./api-key-ops.sh [create|get|list] [principal/api_key] [name]
```

**Operations:**

#### Create API Key
```bash
./api-key-ops.sh create "6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae" "My API Key"
```

#### Get API Key Details
```bash
./api-key-ops.sh get "sk_live_551000_2_1760411342561551000"
```

#### List API Keys for Principal
```bash
./api-key-ops.sh list "6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae"
```

## Test Flow

### Complete E2E Test
```bash
# 1. Create API key for merchant
./api-key-ops.sh create "6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae" "Test Merchant API Key"

# 2. Get the created API key
./api-key-ops.sh get "sk_live_XXXXX_XX_XXXXXXXXXXXXXXX"

# 3. Run complete payment flow
./process-payment.sh "yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae" "6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae" "8500" "sk_live_XXXXX_XX_XXXXXXXXXXXXXXX" "Test Payment"
```

## Expected Results

After running the complete E2E flow, you should see:

1. **✅ API Key lookup successful** - API key found with correct owner
2. **✅ Balances checked before and after** - FROM balance decreased, TO balance increased
3. **✅ Payment processed successfully** - Transfer ID generated
4. **✅ Transaction recorded in payment gateway** - Transaction visible in `getPaymentGatewayTransaction`
5. **✅ Transaction visible in unified transactions** - Transaction appears in `getUnifiedTransactions`
6. **✅ Transaction visible in user-specific lists** - Transaction appears in both FROM and TO user transaction lists

## Troubleshooting

### Common Issues

1. **API Key not found**: Make sure the API key exists and is active
2. **Insufficient balance**: Ensure the FROM principal has enough BTC
3. **Transaction not visible**: Check if the canister was properly deployed with the latest code

### Debug Commands

```bash
# Check canister status
dfx canister status split_dapp

# Check logs
dfx logs split_dapp

# Check specific balance
dfx canister call split_dapp getUserBitcoinBalance '(principal "yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae")'
```

## Notes

- All scripts use the local dfx network
- Scripts include color-coded output for easy reading
- Error handling is included for common failure scenarios
- Scripts are designed to be run from the project root directory
