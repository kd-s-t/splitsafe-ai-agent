/**
 * SplitSafe SDK Client
 * 
 * Official TypeScript SDK for integrating SplitSafe payment gateway and escrow services
 * into your applications.
 * 
 * @example
 * ```typescript
 * import { SplitSafeClient } from '@splitsafe/sdk';
 * 
 * const client = new SplitSafeClient({
 *   apiKey: 'sk_live_...',
 *   environment: 'production'
 * });
 * 
 * // Create an escrow
 * const escrow = await client.escrows.create({
 *   title: 'Payment for Services',
 *   totalAmount: 100000000,
 *   participants: [...]
 * });
 * 
 * // Process a payment
 * const payment = await client.payments.process({
 *   to: 'merchant_principal_id',
 *   amount: 850000000,
 *   memo: 'Flight Booking'
 * });
 * ```
 */

export interface SplitSafeConfig {
  /** Your SplitSafe API key (starts with 'sk_live_' or 'sk_test_') */
  apiKey: string;
  
  /** Environment: 'production' or 'sandbox' */
  environment?: 'production' | 'sandbox';
  
  /** Base URL override (optional) */
  baseUrl?: string;
  
  /** Custom fetch implementation (optional) */
  fetch?: typeof fetch;
  
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

export interface SplitSafeSDKError extends Error {
  code?: string;
  statusCode?: number;
  requestId?: string;
}

export class SplitSafeClient {
  private apiKey: string;
  private baseUrl: string;
  private environment: 'production' | 'sandbox';
  private fetchImpl: typeof fetch;
  private timeout: number;

  // Sub-clients
  public readonly escrows: EscrowsClient;
  public readonly payments: PaymentsClient;
  public readonly transactions: TransactionsClient;
  public readonly apiKeys: ApiKeysClient;

  constructor(config: SplitSafeConfig) {
    this.apiKey = config.apiKey;
    this.environment = config.environment || 'production';
    
    // Handle fetch implementation (browser vs Node.js)
    if (config.fetch) {
      this.fetchImpl = config.fetch;
    } else if (typeof fetch !== 'undefined') {
      this.fetchImpl = fetch;
    } else {
      // Node.js environment - would need node-fetch in standalone package
      throw new Error('fetch is not available. Please provide a fetch implementation in config.fetch or install node-fetch');
    }
    
    this.timeout = config.timeout || 30000;

    // Determine base URL
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else {
      this.baseUrl = this.environment === 'production'
        ? 'https://api.thesplitsafe.com/v1'
        : 'https://sandbox-api.thesplitsafe.com/v1';
    }

    // Initialize sub-clients
    this.escrows = new EscrowsClient(this);
    this.payments = new PaymentsClient(this);
    this.transactions = new TransactionsClient(this);
    this.apiKeys = new ApiKeysClient(this);
  }

  /**
   * Make an authenticated request to the SplitSafe API
   */
  async request<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await this.fetchImpl(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        const error: SplitSafeSDKError = new Error(
          responseData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
        error.code = responseData.error?.code;
        error.statusCode = response.status;
        error.requestId = responseData.requestId;
        throw error;
      }

      return responseData.data as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * Get SDK version
   */
  getVersion(): string {
    return '1.0.0';
  }

  /**
   * Get current environment
   */
  getEnvironment(): 'production' | 'sandbox' {
    return this.environment;
  }
}

// Escrows Client
export class EscrowsClient {
  constructor(private client: SplitSafeClient) {}

  /**
   * Create a new escrow transaction
   */
  async create(params: CreateEscrowParams): Promise<EscrowResponse> {
    return this.client.request<EscrowResponse>('POST', '/escrow/create', params);
  }

  /**
   * Get escrow details by ID
   */
  async get(escrowId: string): Promise<EscrowResponse> {
    return this.client.request<EscrowResponse>('GET', `/escrow/${escrowId}`);
  }

  /**
   * Get escrow status
   */
  async status(escrowId: string): Promise<EscrowStatusResponse> {
    return this.client.request<EscrowStatusResponse>('GET', `/escrow/${escrowId}/status`);
  }

  /**
   * List escrows for the authenticated merchant
   */
  async list(params?: ListEscrowsParams): Promise<ListEscrowsResponse> {
    const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    const endpoint = `/escrow${query ? `?${query}` : ''}`;
    return this.client.request<ListEscrowsResponse>('GET', endpoint);
  }
}

// Payments Client
export class PaymentsClient {
  constructor(private client: SplitSafeClient) {}

  /**
   * Process a payment gateway transfer (instant payment, no approval needed)
   */
  async process(params: ProcessPaymentParams): Promise<PaymentResponse> {
    return this.client.request<PaymentResponse>('POST', '/payment-gateway/transfer', params);
  }

  /**
   * Get payment transaction details
   */
  async get(transferId: string): Promise<PaymentTransactionResponse> {
    return this.client.request<PaymentTransactionResponse>('GET', `/payment-gateway/transfer/${transferId}`);
  }

  /**
   * List payment transactions
   */
  async list(params?: ListPaymentsParams): Promise<ListPaymentsResponse> {
    const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    const endpoint = `/payment-gateway/transactions${query ? `?${query}` : ''}`;
    return this.client.request<ListPaymentsResponse>('GET', endpoint);
  }
}

// Transactions Client
export class TransactionsClient {
  constructor(private client: SplitSafeClient) {}

  /**
   * Get transaction by ID (works for both escrows and payments)
   */
  async get(transactionId: string): Promise<TransactionResponse> {
    return this.client.request<TransactionResponse>('GET', `/transactions/${transactionId}`);
  }

  /**
   * List all transactions
   */
  async list(params?: ListTransactionsParams): Promise<ListTransactionsResponse> {
    const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    const endpoint = `/transactions${query ? `?${query}` : ''}`;
    return this.client.request<ListTransactionsResponse>('GET', endpoint);
  }
}

// API Keys Client
export class ApiKeysClient {
  constructor(private client: SplitSafeClient) {}

  /**
   * Get API key details
   */
  async get(apiKeyId?: string): Promise<ApiKeyResponse> {
    const endpoint = apiKeyId ? `/api-keys/${apiKeyId}` : '/api-keys/current';
    return this.client.request<ApiKeyResponse>('GET', endpoint);
  }

  /**
   * List all API keys for the authenticated merchant
   */
  async list(): Promise<ListApiKeysResponse> {
    return this.client.request<ListApiKeysResponse>('GET', '/api-keys');
  }

  /**
   * Create a new API key
   */
  async create(params: CreateApiKeyParams): Promise<ApiKeyResponse> {
    return this.client.request<ApiKeyResponse>('POST', '/api-keys', params);
  }

  /**
   * Revoke an API key
   */
  async revoke(apiKeyId: string): Promise<void> {
    return this.client.request<void>('DELETE', `/api-keys/${apiKeyId}`);
  }
}

// Type definitions
export interface CreateEscrowParams {
  title: string;
  totalAmount: number; // Amount in e8s (satoshis)
  participants: Array<{
    principal: string;
    role: 'initiator' | 'recipient';
    share?: number; // Percentage (0-100)
  }>;
  milestones?: Array<{
    title: string;
    amount: number;
    description?: string;
  }>;
  description?: string;
  memo?: string;
}

export interface EscrowResponse {
  escrowId: string;
  status: 'created' | 'pending' | 'approved' | 'released' | 'refunded' | 'cancelled';
  paymentUrl: string;
  createdAt: string;
}

export interface EscrowStatusResponse {
  escrowId: string;
  status: string;
  totalAmount: number;
  releasedAmount?: number;
  participants: Array<{
    principal: string;
    role: string;
    share?: number;
  }>;
}

export interface ListEscrowsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface ListEscrowsResponse {
  escrows: EscrowResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ProcessPaymentParams {
  to: string; // Recipient Principal ID
  amount: number; // Amount in e8s (satoshis)
  memo?: string;
  merchantId?: string;
  useSeiNetwork?: boolean; // Use SEI network for faster settlement
}

export interface PaymentResponse {
  transferId: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
  memo?: string;
  merchantId?: string;
}

export interface PaymentTransactionResponse extends PaymentResponse {
  // Extended payment transaction details
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface ListPaymentsResponse {
  transactions: PaymentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface TransactionResponse {
  id: string;
  type: 'escrow' | 'payment';
  status: string;
  amount: number;
  participants: Array<{
    principal: string;
    role: string;
  }>;
  createdAt: string;
}

export interface ListTransactionsParams {
  page?: number;
  limit?: number;
  type?: 'escrow' | 'payment';
  status?: string;
}

export interface ListTransactionsResponse {
  transactions: TransactionResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateApiKeyParams {
  name: string;
  permissions?: string[];
  expiresAt?: string; // ISO 8601 date string
}

export interface ApiKeyResponse {
  id: string;
  key: string; // Only returned on creation
  name: string;
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface ListApiKeysResponse {
  keys: Omit<ApiKeyResponse, 'key'>[]; // Keys are never returned in list
}

