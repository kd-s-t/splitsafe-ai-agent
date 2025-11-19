/**
 * SplitSafe SDK Utility Functions
 */

/**
 * Convert PHP amount to Bitcoin satoshis (e8s)
 * 
 * @param phpAmount - Amount in PHP
 * @param btcPricePHP - Current BTC price in PHP (default: uses approximate rate)
 * @returns Amount in e8s (satoshis)
 * 
 * @example
 * ```typescript
 * const amountInE8s = convertPHPToE8s(8500); // ~0.85 BTC at typical rates
 * ```
 */
export function convertPHPToE8s(phpAmount: number, btcPricePHP: number = 500000): number {
  // BTC price in PHP (approximate, should fetch from API in production)
  const btcAmount = phpAmount / btcPricePHP;
  // Convert to satoshis (e8s)
  return Math.round(btcAmount * 100000000);
}

/**
 * Convert Bitcoin satoshis (e8s) to PHP
 * 
 * @param e8s - Amount in e8s (satoshis)
 * @param btcPricePHP - Current BTC price in PHP (default: uses approximate rate)
 * @returns Amount in PHP
 * 
 * @example
 * ```typescript
 * const phpAmount = convertE8sToPHP(850000000); // ~8500 PHP
 * ```
 */
export function convertE8sToPHP(e8s: number, btcPricePHP: number = 500000): number {
  const btcAmount = e8s / 100000000;
  return btcAmount * btcPricePHP;
}

/**
 * Format amount for display
 * 
 * @param e8s - Amount in e8s (satoshis)
 * @param currency - Currency to format as ('BTC' | 'PHP')
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatAmount(850000000, 'BTC'); // "0.85000000 BTC"
 * formatAmount(850000000, 'PHP'); // "₱8,500.00"
 * ```
 */
export function formatAmount(e8s: number, currency: 'BTC' | 'PHP' = 'BTC'): string {
  if (currency === 'BTC') {
    const btc = e8s / 100000000;
    return `${btc.toFixed(8)} BTC`;
  } else {
    const php = convertE8sToPHP(e8s);
    return `₱${php.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Validate Principal ID format
 * 
 * @param principal - Principal ID string
 * @returns true if valid
 */
export function isValidPrincipal(principal: string): boolean {
  // Basic Principal ID format validation
  // Principal IDs are base32-encoded strings with specific format
  const principalRegex = /^[a-z0-9]{5}(-[a-z0-9]{5})*-([a-z0-9]{3})$/;
  return principalRegex.test(principal);
}

/**
 * Validate API key format
 * 
 * @param apiKey - API key string
 * @returns true if valid format
 */
export function isValidApiKey(apiKey: string): boolean {
  // API keys start with sk_live_ or sk_test_ followed by alphanumeric string
  const apiKeyRegex = /^sk_(live|test)_\d+(_\d+)*$/;
  return apiKeyRegex.test(apiKey);
}

/**
 * Extract environment from API key
 * 
 * @param apiKey - API key string
 * @returns 'production' | 'sandbox' | null
 */
export function getEnvironmentFromApiKey(apiKey: string): 'production' | 'sandbox' | null {
  if (apiKey.startsWith('sk_live_')) {
    return 'production';
  }
  if (apiKey.startsWith('sk_test_')) {
    return 'sandbox';
  }
  return null;
}

/**
 * Calculate payment gateway fee
 * 
 * @param amount - Amount in e8s
 * @returns Fee in e8s (0.1% with minimum 100 e8s)
 */
export function calculatePaymentFee(amount: number): number {
  const feePercentage = 0.001; // 0.1%
  const minimumFee = 100; // 100 e8s minimum
  const calculatedFee = Math.round(amount * feePercentage);
  return Math.max(calculatedFee, minimumFee);
}

/**
 * Generate payment gateway URL for redirect flow
 * 
 * @param params - Payment parameters
 * @returns Payment gateway URL
 */
export interface PaymentGatewayUrlParams {
  merchant: string;
  amount: string; // Amount in PHP or e8s
  currency?: 'PHP' | 'BTC';
  description: string;
  returnUrl?: string;
  cancelUrl?: string;
  apiKey: string;
  useSeiNetwork?: boolean;
}

export function generatePaymentGatewayUrl(params: PaymentGatewayUrlParams): string {
  const baseUrl = 'https://thesplitsafe.com/payment-gateway';
  const searchParams = new URLSearchParams({
    merchant: params.merchant,
    amount: params.amount,
    currency: params.currency || 'PHP',
    description: params.description,
    api_key: params.apiKey,
    ...(params.returnUrl && { return_url: params.returnUrl }),
    ...(params.cancelUrl && { cancel_url: params.cancelUrl }),
    ...(params.useSeiNetwork && { use_sei_network: 'true' }),
  });

  return `${baseUrl}?${searchParams.toString()}`;
}

