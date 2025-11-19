/**
 * SplitSafe SDK Usage Examples
 * 
 * These examples demonstrate common use cases for the SplitSafe SDK
 */

import { SplitSafeClient, convertPHPToE8s, generatePaymentGatewayUrl } from './index';

/**
 * Example 1: E-commerce Order Payment with Escrow
 */
export async function exampleEcommercePayment() {
  const client = new SplitSafeClient({
    apiKey: process.env.SPLITSAFE_API_KEY!,
    environment: 'production',
  });

  // Customer places an order for ₱8,500
  const orderId = 'ORD-12345';
  const orderTotal = 8500; // PHP
  const customerPrincipal = 'customer_principal_id';
  const merchantPrincipal = 'merchant_principal_id';

  // Create escrow for the order
  const escrow = await client.escrows.create({
    title: `Order #${orderId}`,
    totalAmount: convertPHPToE8s(orderTotal),
    participants: [
      {
        principal: customerPrincipal,
        role: 'initiator',
      },
      {
        principal: merchantPrincipal,
        role: 'recipient',
        share: 100,
      },
    ],
    description: `Payment for Order #${orderId}`,
    memo: `Order ID: ${orderId}`,
  });

  // Redirect customer to payment page
  console.log('Escrow created:', escrow.escrowId);
  console.log('Payment URL:', escrow.paymentUrl);

  // Later, check escrow status
  const status = await client.escrows.status(escrow.escrowId);
  if (status.status === 'released') {
    console.log('Payment completed! Order can be fulfilled.');
  }

  return escrow;
}

/**
 * Example 2: Instant Payment Gateway (No Escrow Needed)
 */
export async function exampleInstantPayment() {
  const client = new SplitSafeClient({
    apiKey: process.env.SPLITSAFE_API_KEY!,
    environment: 'production',
  });

  // For trusted merchants like Cebu Pacific, use instant payment
  const payment = await client.payments.process({
    to: 'cebu_pacific_principal_id',
    amount: convertPHPToE8s(8500),
    memo: 'Flight PR 123: Manila → Cebu',
    merchantId: 'cebu_pacific',
    useSeiNetwork: true, // Fast settlement via SEI network
  });

  console.log('Payment processed:', payment.transferId);
  console.log('Status:', payment.status);
  console.log('Fee:', payment.fee);

  return payment;
}

/**
 * Example 3: Payment Gateway Redirect Flow
 */
export function examplePaymentRedirect() {
  // Generate payment URL for customer redirect
  const paymentUrl = generatePaymentGatewayUrl({
    merchant: 'Cebu Pacific',
    amount: '8500',
    currency: 'PHP',
    description: 'Flight PR 123: Manila → Cebu',
    returnUrl: 'https://cebupacific.com/booking/success',
    cancelUrl: 'https://cebupacific.com/booking',
    apiKey: process.env.SPLITSAFE_API_KEY!,
    useSeiNetwork: true,
  });

  // Redirect customer
  // window.location.href = paymentUrl;

  return paymentUrl;
}

/**
 * Example 4: Milestone-Based Escrow (Service Payments)
 */
export async function exampleMilestoneEscrow() {
  const client = new SplitSafeClient({
    apiKey: process.env.SPLITSAFE_API_KEY!,
    environment: 'production',
  });

  const escrow = await client.escrows.create({
    title: 'Website Development Project',
    totalAmount: convertPHPToE8s(50000), // ₱50,000
    participants: [
      {
        principal: 'client_principal_id',
        role: 'initiator',
      },
      {
        principal: 'developer_principal_id',
        role: 'recipient',
        share: 100,
      },
    ],
    milestones: [
      {
        title: 'Design Phase',
        amount: convertPHPToE8s(10000), // 20%
        description: 'Complete UI/UX design',
      },
      {
        title: 'Development Phase',
        amount: convertPHPToE8s(25000), // 50%
        description: 'Frontend and backend development',
      },
      {
        title: 'Testing & Launch',
        amount: convertPHPToE8s(15000), // 30%
        description: 'Testing and deployment',
      },
    ],
    description: 'Full-stack website development with milestone payments',
  });

  return escrow;
}

/**
 * Example 5: List Transactions for Merchant Dashboard
 */
export async function exampleListTransactions() {
  const client = new SplitSafeClient({
    apiKey: process.env.SPLITSAFE_API_KEY!,
    environment: 'production',
  });

  // Get recent payments
  const payments = await client.payments.list({
    page: 1,
    limit: 20,
    status: 'completed',
  });

  console.log(`Found ${payments.total} payments`);
  payments.transactions.forEach((payment) => {
    console.log(`- ${payment.transferId}: ${payment.amount} e8s`);
  });

  // Get recent escrows
  const escrows = await client.escrows.list({
    page: 1,
    limit: 20,
  });

  console.log(`Found ${escrows.total} escrows`);
  escrows.escrows.forEach((escrow) => {
    console.log(`- ${escrow.escrowId}: ${escrow.status}`);
  });

  return { payments, escrows };
}

/**
 * Example 6: API Key Management
 */
export async function exampleApiKeyManagement() {
  const client = new SplitSafeClient({
    apiKey: process.env.SPLITSAFE_API_KEY!,
    environment: 'production',
  });

  // Get current API key details
  const currentKey = await client.apiKeys.get();
  console.log('Current API key:', currentKey.name);

  // List all API keys
  const allKeys = await client.apiKeys.list();
  console.log(`You have ${allKeys.keys.length} API keys`);

  // Create a new API key for staging
  const newKey = await client.apiKeys.create({
    name: 'Staging Environment Key',
    permissions: ['read', 'write'],
  });
  console.log('New API key created:', newKey.key);
  console.log('⚠️ Save this key securely! It won\'t be shown again.');

  return newKey;
}

