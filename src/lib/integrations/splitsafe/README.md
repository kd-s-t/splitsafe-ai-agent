# SplitSafe SDK

Official TypeScript SDK for integrating SplitSafe payment gateway and escrow services into your applications.

## Installation

```bash
npm install @splitsafe/sdk
# or
yarn add @splitsafe/sdk
```

## Quick Start

### Initialize the Client

```typescript
import { SplitSafeClient } from '@splitsafe/sdk';

const client = new SplitSafeClient({
  apiKey: 'sk_live_...', // Your SplitSafe API key
  environment: 'production' // or 'sandbox'
});
```

### Create an Escrow

```typescript
const escrow = await client.escrows.create({
  title: 'Payment for Flight Booking',
  totalAmount: 850000000, // 0.85 BTC in e8s (satoshis)
  participants: [
    {
      principal: 'customer_principal_id',
      role: 'initiator',
    },
    {
      principal: 'merchant_principal_id',
      role: 'recipient',
      share: 100, // 100% of the payment
    }
  ],
  description: 'Flight PR 123: Manila → Cebu',
  memo: 'Booking ID: ABC123'
});

console.log('Escrow created:', escrow.escrowId);
console.log('Payment URL:', escrow.paymentUrl);
```

### Process a Payment (Payment Gateway)

```typescript
const payment = await client.payments.process({
  to: 'merchant_principal_id',
  amount: 850000000, // 0.85 BTC in e8s
  memo: 'Flight: Manila → Cebu',
  merchantId: 'cebu_pacific',
  useSeiNetwork: true // Optional: use SEI network for faster settlement
});

console.log('Payment processed:', payment.transferId);
console.log('Status:', payment.status);
```

### Get Transaction Details

```typescript
// Get escrow status
const escrowStatus = await client.escrows.status('escrow_1234567890_abc123def');

// Get payment transaction
const paymentDetails = await client.payments.get('PGW_1234567890-sender-123456');

// Get any transaction
const transaction = await client.transactions.get('transaction_id');
```

## API Reference

### SplitSafeClient

Main client class for interacting with SplitSafe APIs.

#### Constructor

```typescript
new SplitSafeClient(config: SplitSafeConfig)
```

**Config Options:**
- `apiKey` (required): Your SplitSafe API key
- `environment` (optional): `'production'` or `'sandbox'` (default: `'production'`)
- `baseUrl` (optional): Custom API base URL
- `fetch` (optional): Custom fetch implementation
- `timeout` (optional): Request timeout in milliseconds (default: 30000)

### Escrows API

#### `client.escrows.create(params)`

Create a new escrow transaction.

#### `client.escrows.get(escrowId)`

Get escrow details by ID.

#### `client.escrows.status(escrowId)`

Get escrow status and current state.

#### `client.escrows.list(params?)`

List escrows for the authenticated merchant.

### Payments API

#### `client.payments.process(params)`

Process an instant payment gateway transfer (no approval needed).

#### `client.payments.get(transferId)`

Get payment transaction details.

#### `client.payments.list(params?)`

List payment transactions.

### Transactions API

#### `client.transactions.get(transactionId)`

Get any transaction by ID (works for both escrows and payments).

#### `client.transactions.list(params?)`

List all transactions.

### API Keys API

#### `client.apiKeys.get(apiKeyId?)`

Get API key details (current key if no ID provided).

#### `client.apiKeys.list()`

List all API keys for the authenticated merchant.

#### `client.apiKeys.create(params)`

Create a new API key.

#### `client.apiKeys.revoke(apiKeyId)`

Revoke an API key.

## Utility Functions

### Amount Conversion

```typescript
import { convertPHPToE8s, convertE8sToPHP, formatAmount } from '@splitsafe/sdk';

// Convert PHP to Bitcoin satoshis
const e8s = convertPHPToE8s(8500); // ~850000000 e8s

// Convert Bitcoin satoshis to PHP
const php = convertE8sToPHP(850000000); // ~8500 PHP

// Format for display
const formatted = formatAmount(850000000, 'PHP'); // "₱8,500.00"
```

### Payment Gateway URL Generation

```typescript
import { generatePaymentGatewayUrl } from '@splitsafe/sdk';

const paymentUrl = generatePaymentGatewayUrl({
  merchant: 'Cebu Pacific',
  amount: '8500',
  currency: 'PHP',
  description: 'Flight PR 123: Manila → Cebu',
  returnUrl: 'https://cebupacific.com/booking/success',
  cancelUrl: 'https://cebupacific.com/booking',
  apiKey: 'sk_live_...'
});

// Redirect customer to paymentUrl
window.location.href = paymentUrl;
```

### Validation

```typescript
import { isValidPrincipal, isValidApiKey, getEnvironmentFromApiKey } from '@splitsafe/sdk';

// Validate Principal ID
if (isValidPrincipal(principalId)) {
  // Valid Principal ID
}

// Validate API key format
if (isValidApiKey(apiKey)) {
  // Valid API key format
}

// Get environment from API key
const env = getEnvironmentFromApiKey(apiKey); // 'production' | 'sandbox' | null
```

## Error Handling

```typescript
try {
  const payment = await client.payments.process({...});
} catch (error) {
  if (error instanceof SplitSafeSDKError) {
    console.error('Error Code:', error.code);
    console.error('Status Code:', error.statusCode);
    console.error('Request ID:', error.requestId);
    console.error('Message:', error.message);
  }
}
```

## Examples

### E-commerce Integration

```typescript
// 1. Customer selects SplitSafe as payment method
// 2. Create escrow for order
const escrow = await client.escrows.create({
  title: `Order #${orderId}`,
  totalAmount: convertPHPToE8s(orderTotal),
  participants: [
    { principal: customerPrincipal, role: 'initiator' },
    { principal: merchantPrincipal, role: 'recipient' }
  ],
  memo: `Order ID: ${orderId}`
});

// 3. Redirect customer to payment URL
window.location.href = escrow.paymentUrl;

// 4. Webhook: Check escrow status when customer returns
const status = await client.escrows.status(escrow.escrowId);
if (status.status === 'released') {
  // Mark order as paid
}
```

### Payment Gateway Integration (Instant Payments)

```typescript
// For trusted merchants, use instant payment gateway
const payment = await client.payments.process({
  to: merchantPrincipal,
  amount: convertPHPToE8s(8500),
  memo: 'Flight Booking',
  merchantId: 'cebu_pacific',
  useSeiNetwork: true
});

// Payment is instant, no approval needed
if (payment.status === 'completed') {
  // Mark booking as paid immediately
}
```

## License

MIT

