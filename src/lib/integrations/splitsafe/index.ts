/**
 * SplitSafe Integration SDK
 * 
 * Official TypeScript SDK for integrating SplitSafe payment gateway and escrow services.
 * 
 * @packageDocumentation
 */

export {
    ApiKeysClient, EscrowsClient,
    PaymentsClient, SplitSafeClient, TransactionsClient, type ApiKeyResponse, type CreateApiKeyParams, type CreateEscrowParams,
    type EscrowResponse,
    type EscrowStatusResponse, type ListApiKeysResponse, type ListEscrowsParams,
    type ListEscrowsResponse, type ListPaymentsParams,
    type ListPaymentsResponse, type ListTransactionsParams,
    type ListTransactionsResponse, type PaymentResponse,
    type PaymentTransactionResponse, type ProcessPaymentParams, type SplitSafeConfig,
    type SplitSafeSDKError, type TransactionResponse
} from './client';

// Export convenience factory function
export { createSplitSafeClient } from './factory';

// Export utilities
export * from './api-url';
export * from './utils';

