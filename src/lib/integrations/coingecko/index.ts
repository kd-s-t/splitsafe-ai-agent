/**
 * CoinGecko API Integration
 * 
 * Provides real-time cryptocurrency price data and conversion rates
 * using the free CoinGecko API (no API key required)
 */

export interface CoinGeckoPrice {
  bitcoin?: {
    usd?: number;
    php?: number;
    eur?: number;
    gbp?: number;
    jpy?: number;
  };
  'internet-computer'?: {
    usd?: number;
    php?: number;
    eur?: number;
    gbp?: number;
    jpy?: number;
  };
  'usd-coin'?: {
    php?: number;
    eur?: number;
    gbp?: number;
    jpy?: number;
  };
}

export interface ConversionResult {
  amount: number;
  rate: number;
  currency: string;
  timestamp: number;
}

// Cache for price data
let cachedPrices: CoinGeckoPrice | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the cache (useful for testing or forcing fresh data)
 */
export function clearCoinGeckoCache(): void {
  cachedPrices = null;
  lastFetchTime = 0;
  console.log('🧹 CoinGecko cache cleared');
}

/**
 * Fetch cryptocurrency prices from CoinGecko API
 */
export async function fetchCoinGeckoPrices(forceRefresh: boolean = false): Promise<CoinGeckoPrice> {
  const now = Date.now();
  
  // Return cached prices if still valid and not forcing refresh
  if (!forceRefresh && cachedPrices !== null && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedPrices;
  }

  try {
    // Fetch Bitcoin and ICP prices in multiple currencies
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,internet-computer,usd-coin&vs_currencies=usd,php,eur,gbp,jpy',
      {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CoinGeckoPrice = await response.json();
    
    // Validate the response has the expected structure
    if (data.bitcoin && typeof data.bitcoin.usd === 'number') {
      cachedPrices = data;
      lastFetchTime = now;
      return data;
    } else {
      throw new Error('Invalid response structure from CoinGecko API');
    }
  } catch (error) {
    console.warn('CoinGecko API failed:', error);
    
    // Return cached prices if available, otherwise fallback
    if (cachedPrices !== null) {
      return cachedPrices;
    }
    
    // Fallback to approximate rates
    return {
      bitcoin: {
        usd: 114764.80,
        php: 6000000, // Approximate rate
        eur: 105000,
        gbp: 90000,
        jpy: 17000000,
      },
      'internet-computer': {
        usd: 7.65,
        php: 400,
        eur: 7.0,
        gbp: 6.0,
        jpy: 1100,
      },
      'usd-coin': {
        php: 56.5,
        eur: 0.92,
        gbp: 0.79,
        jpy: 148,
      },
    };
  }
}

/**
 * Get Bitcoin price in a specific currency
 */
export async function getBitcoinPrice(currency: 'usd' | 'php' | 'eur' | 'gbp' | 'jpy' = 'usd'): Promise<number> {
  const prices = await fetchCoinGeckoPrices();
  return prices.bitcoin?.[currency] || 0;
}

/**
 * Get ICP price in a specific currency
 */
export async function getIcpPrice(currency: 'usd' | 'php' | 'eur' | 'gbp' | 'jpy' = 'usd'): Promise<number> {
  const prices = await fetchCoinGeckoPrices();
  return prices['internet-computer']?.[currency] || 0;
}

/**
 * Get USD to other currency conversion rate
 */
export async function getUsdToCurrencyRate(currency: 'php' | 'eur' | 'gbp' | 'jpy'): Promise<number> {
  const prices = await fetchCoinGeckoPrices();
  return prices['usd-coin']?.[currency] || 1;
}

/**
 * Convert Bitcoin to a specific currency
 */
export async function convertBitcoinToCurrency(
  btcAmount: number, 
  currency: 'usd' | 'php' | 'eur' | 'gbp' | 'jpy'
): Promise<ConversionResult> {
  const rate = await getBitcoinPrice(currency);
  const amount = btcAmount * rate;
  
  return {
    amount,
    rate,
    currency: currency.toUpperCase(),
    timestamp: Date.now(),
  };
}

/**
 * Convert a specific currency to Bitcoin
 */
export async function convertCurrencyToBitcoin(
  amount: number, 
  currency: 'usd' | 'php' | 'eur' | 'gbp' | 'jpy'
): Promise<ConversionResult> {
  const rate = await getBitcoinPrice(currency);
  const btcAmount = amount / rate;
  
  return {
    amount: btcAmount,
    rate,
    currency: currency.toUpperCase(),
    timestamp: Date.now(),
  };
}

/**
 * Convert Bitcoin to Philippine Peso (specialized function)
 */
export async function btcToPhp(btcAmount: number): Promise<number> {
  const result = await convertBitcoinToCurrency(btcAmount, 'php');
  return result.amount;
}

/**
 * Convert Philippine Peso to Bitcoin (specialized function)
 */
export async function phpToBtc(phpAmount: number): Promise<number> {
  const result = await convertCurrencyToBitcoin(phpAmount, 'php');
  return result.amount;
}

/**
 * Convert Bitcoin to USD (specialized function)
 */
export async function btcToUsd(btcAmount: number): Promise<number> {
  const result = await convertBitcoinToCurrency(btcAmount, 'usd');
  return result.amount;
}

/**
 * Convert USD to Bitcoin (specialized function)
 */
export async function usdToBtc(usdAmount: number): Promise<number> {
  const result = await convertCurrencyToBitcoin(usdAmount, 'usd');
  return result.amount;
}

/**
 * Convert ckBTC to USD (ckBTC is 1:1 with BTC)
 */
export async function ckBtcToUsd(ckbtcAmount: number): Promise<number> {
  return await btcToUsd(ckbtcAmount);
}

/**
 * Get all current prices (useful for dashboard displays)
 */
export async function getAllPrices(): Promise<{
  bitcoin: { usd: number; php: number; eur: number; gbp: number; jpy: number };
  icp: { usd: number; php: number; eur: number; gbp: number; jpy: number };
  usdToPhp: number;
}> {
  const prices = await fetchCoinGeckoPrices();
  
  return {
    bitcoin: {
      usd: prices.bitcoin?.usd || 0,
      php: prices.bitcoin?.php || 0,
      eur: prices.bitcoin?.eur || 0,
      gbp: prices.bitcoin?.gbp || 0,
      jpy: prices.bitcoin?.jpy || 0,
    },
    icp: {
      usd: prices['internet-computer']?.usd || 0,
      php: prices['internet-computer']?.php || 0,
      eur: prices['internet-computer']?.eur || 0,
      gbp: prices['internet-computer']?.gbp || 0,
      jpy: prices['internet-computer']?.jpy || 0,
    },
    usdToPhp: prices['usd-coin']?.php || 56.5,
  };
}
