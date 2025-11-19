export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ')
}
export function truncatePrincipal(principalId: string) {
  return principalId.slice(0, 5) + '...' + principalId.slice(-4);
}
export function getAvatarUrl(seed?: string, profilePicture?: string | null) {
  if (profilePicture && profilePicture.trim() !== '') {
    const hasExtension = profilePicture.endsWith('.png');
    const result = `/profiles/${profilePicture}${hasExtension ? '' : '.png'}`;
    return result;
  }
  
  if (seed) {
    const availablePictures = [
      '10790790', '10790797', '10790803', '10790804', '10790809', 
      '10790811', '10790812', '10790814', '10790815', '10790816'
    ];
    
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const pictureIndex = Math.abs(hash) % availablePictures.length;
    const defaultPicture = availablePictures[pictureIndex];
    
    const result = `/profiles/${defaultPicture}.png`;
    return result;
  }
  
  const avatarSeed = seed || 'default';
  
  // Generate a deterministic color based on the seed
  const colors = ['6366f1', '8b5cf6', 'a855f7', 'c084fc', 'd8b4fe'];
  const hash = avatarSeed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];
  
  // Generate a simple SVG avatar locally
  const svg = `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#${color}" opacity="0.1"/>
      <circle cx="60" cy="40" r="20" fill="#${color}"/>
      <path d="M20 100 Q60 80 100 100" stroke="#${color}" stroke-width="3" fill="none"/>
      <text x="60" y="110" text-anchor="middle" font-family="Arial" font-size="8" fill="#${color}">
        ${avatarSeed.slice(0, 3).toUpperCase()}
      </text>
    </svg>
  `;
  
  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
  return dataUrl;
}

// Function to ensure user has a profile picture
export function ensureUserHasProfilePicture(principal: string, currentProfilePicture?: string | null): string {
  // If user already has a profile picture, return it
  if (currentProfilePicture) {
    return currentProfilePicture;
  }
  
  // Generate a deterministic profile picture based on the principal
  const availablePictures = [
    '10790790', '10790797', '10790803', '10790804', '10790809', 
    '10790811', '10790812', '10790814', '10790815', '10790816'
  ];
  
  const hash = principal.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const pictureIndex = Math.abs(hash) % availablePictures.length;
  
  return availablePictures[pictureIndex];
}

// Function to generate a random name for users
export function generateRandomName(principal: string): string {
  const adjectives = [
    'Swift', 'Bright', 'Cool', 'Smart', 'Bold', 'Quick', 'Sharp', 'Bright',
    'Fast', 'Strong', 'Wise', 'Kind', 'Brave', 'Calm', 'Wild', 'Gentle',
    'Happy', 'Lucky', 'Magic', 'Royal', 'Golden', 'Silver', 'Crystal', 'Diamond'
  ];
  
  const nouns = [
    'Tiger', 'Eagle', 'Wolf', 'Lion', 'Fox', 'Bear', 'Hawk', 'Falcon',
    'Phoenix', 'Dragon', 'Shark', 'Whale', 'Dolphin', 'Butterfly', 'Raven', 'Owl',
    'Star', 'Moon', 'Sun', 'Ocean', 'Mountain', 'River', 'Forest', 'Storm'
  ];
  
  // Generate a deterministic name based on the principal
  const hash = principal.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const adjectiveIndex = Math.abs(hash) % adjectives.length;
  const nounIndex = Math.abs(hash >> 4) % nouns.length;
  
  return `${adjectives[adjectiveIndex]} ${nouns[nounIndex]}`;
}

// Function to ensure user has a name
export function ensureUserHasName(principal: string, currentName?: string | null): string {
  // If user already has a name, return it
  if (currentName && currentName.trim() !== '') {
    return currentName;
  }
  
  // Generate a deterministic name based on the principal
  return generateRandomName(principal);
}

// Import CoinGecko integration functions for internal use
import {
  btcToPhp,
  btcToUsd,
  ckBtcToUsd,
  clearCoinGeckoCache,
  convertBitcoinToCurrency,
  convertCurrencyToBitcoin,
  getAllPrices,
  getBitcoinPrice,
  getIcpPrice,
  phpToBtc,
  usdToBtc,
} from '@/lib/integrations/coingecko';

// Re-export CoinGecko integration functions for backward compatibility
export {
  btcToPhp, btcToUsd, ckBtcToUsd, clearCoinGeckoCache, convertBitcoinToCurrency,
  convertCurrencyToBitcoin,
  getAllPrices, getBitcoinPrice,
  getIcpPrice, phpToBtc, usdToBtc
};

export const truncateAddress = (addr: string) => {
  if (addr.length <= 12) return addr;
  return addr.slice(0, 7) + '...' + addr.slice(-5);
}

/**
 * Formats satoshis to BTC with 8 decimal places
 * @param satoshis - Amount in satoshis (number or string)
 * @returns Formatted BTC amount as string
 */
export const formatBTC = (satoshis: number | string): string => {
  const satoshisNum = typeof satoshis === 'string' ? Number(satoshis) : satoshis;
  return (satoshisNum / 1e8).toFixed(8);
};

/**
 * Converts fiat currency amounts to BTC using real-time rates
 * @param amount - Amount in fiat currency
 * @param currency - Currency code or symbol
 * @returns Promise<BTC amount as string with 8 decimal places>
 */
export const convertCurrencyToBTC = async (amount: number, currency: string): Promise<string> => {
  // If already in BTC, return as is
  if (currency === 'BTC' || currency === 'btc' || currency === 'bitcoin') {
    return amount.toFixed(8);
  }

  // For USD, use real-time rate
  if (currency === '$' || currency === 'USD') {
    try {
      const btcAmount = await usdToBtc(amount);
      return btcAmount.toFixed(8);
    } catch {
      // Fallback to approximate rate
      const fallbackRate = 0.000025; // $1 ≈ 0.000025 BTC
      const btcAmount = amount * fallbackRate;
      return btcAmount.toFixed(8);
    }
  }

  // For other currencies, use approximate rates (these could also be made real-time)
  const conversionRates: { [key: string]: number } = {
    '€': 0.0000087, // €1 EUR ≈ 0.0000087 BTC (1 BTC ≈ €114,764)
    '£': 0.0000074, // £1 GBP ≈ 0.0000074 BTC (1 BTC ≈ £135,000)
    '¥': 0.000000078, // ¥1 JPY ≈ 0.000000078 BTC (1 BTC ≈ ¥12,800,000)
    'EUR': 0.0000087,
    'GBP': 0.0000074,
    'JPY': 0.000000078,
    'CAD': 0.0000067, // Canadian Dollar
    'AUD': 0.0000061, // Australian Dollar
    'CHF': 0.0000095, // Swiss Franc
  };

  const rate = conversionRates[currency] || conversionRates['$']; // Default to USD
  const btcAmount = amount * rate;
  
  return btcAmount.toFixed(8); // Return with 8 decimal places
};

import { getBitcoinFees as getMempoolFees } from '@/lib/integrations/mempool';

/**
 * Get current Bitcoin network fees from Mempool.space API
 * @returns Object with fee rates in satoshis per byte
 */
export const getBitcoinFees = getMempoolFees;

/**
 * Calculate withdrawal fees for ckBTC to BTC conversion
 * @param amount - Amount in BTC
 * @returns Object with fee breakdown
 */
export const calculateWithdrawalFees = async (amount: number): Promise<{
  conversionFee: number;
  networkFee: number;
  totalFees: number;
  networkFeeSats: number;
  conversionFeePercentage: number;
}> => {
  const btcFees = await getBitcoinFees();
  
  // No conversion fee - ckBTC to BTC is 1:1 with only network fees
  const conversionFeePercentage = 0; // 0%
  const conversionFee = 0;
  
  // Bitcoin network fee is based on transaction size, not amount
  // Typical withdrawal transaction: ~250-400 bytes
  // We'll use a more accurate estimation based on transaction type
  const estimatedTxSize = estimateTransactionSize(amount);
  const networkFeeSats = btcFees.medium * estimatedTxSize;
  const networkFee = networkFeeSats / 100000000; // Convert satoshis to BTC
  
  return {
    conversionFee,
    networkFee,
    totalFees: conversionFee + networkFee,
    networkFeeSats,
    conversionFeePercentage
  };
};

/**
 * Calculate escrow fees for Bitcoin escrow transactions
 * @param amount - Amount in BTC
 * @param recipientCount - Number of recipients
 * @param useSeiAcceleration - Whether SEI acceleration is enabled
 * @returns Object with fee breakdown
 */
export const calculateEscrowFees = async (amount: number, recipientCount: number = 1, useSeiAcceleration: boolean = false): Promise<{
  networkFee: number;
  conversionFee: number;
  seiNetworkFee: number;
  totalFees: number;
  networkFeeSats: number;
  estimatedTxSize: number;
}> => {
  const btcFees = await getBitcoinFees();
  
  if (useSeiAcceleration) {
    // SEI acceleration: ckBTC → SEI → SEI Network → BTC
    // Two conversions: ckBTC to SEI, then SEI to BTC
    const conversionFeePercentage = 0.001; // 0.1% per conversion
    const conversionFee = amount * conversionFeePercentage * 2; // Two conversions
    
    // SEI network fee (very low)
    const seiNetworkFee = 0.000001; // ~$0.01 equivalent
    
    // Bitcoin network fee for final BTC transfer
    const estimatedTxSize = estimateEscrowTransactionSize(amount, recipientCount);
    const networkFeeSats = btcFees.medium * estimatedTxSize;
    const networkFee = networkFeeSats / 100000000; // Convert satoshis to BTC
    
    return {
      networkFee,
      conversionFee,
      seiNetworkFee,
      totalFees: conversionFee + seiNetworkFee + networkFee,
      networkFeeSats,
      estimatedTxSize
    };
  } else {
    // Standard: ckBTC → BTC (direct)
    const estimatedTxSize = estimateEscrowTransactionSize(amount, recipientCount);
    const networkFeeSats = btcFees.medium * estimatedTxSize;
    const networkFee = networkFeeSats / 100000000; // Convert satoshis to BTC
    
    return {
      networkFee,
      conversionFee: 0,
      seiNetworkFee: 0,
      totalFees: networkFee, // Only Bitcoin network fees
      networkFeeSats,
      estimatedTxSize
    };
  }
};

/**
 * Estimate Bitcoin transaction size based on amount and transaction type
 * @param amount - Amount in BTC
 * @returns Estimated transaction size in bytes
 */
const estimateTransactionSize = (amount: number): number => {
  // Base transaction size (inputs + outputs + overhead)
  const baseSize = 10; // Version, locktime, etc.
  
  // Input size (typical P2WPKH input: ~68 bytes)
  const inputSize = 68;
  const numInputs = Math.ceil(amount / 0.01); // Assume ~0.01 BTC per input
  const totalInputSize = Math.min(numInputs, 10) * inputSize; // Cap at 10 inputs
  
  // Output size (P2WPKH output: ~31 bytes, P2PKH: ~34 bytes)
  const outputSize = 31; // P2WPKH (most common)
  const numOutputs = 2; // Recipient + change (if needed)
  const totalOutputSize = numOutputs * outputSize;
  
  // Witness data (for P2WPKH: ~107 bytes per input)
  const witnessSize = Math.min(numInputs, 10) * 107;
  
  const totalSize = baseSize + totalInputSize + totalOutputSize + witnessSize;
  
  // Return reasonable bounds (150-1000 bytes)
  return Math.max(150, Math.min(totalSize, 1000));
};

/**
 * Estimate Bitcoin transaction size for escrow transactions
 * @param amount - Amount in BTC
 * @param recipientCount - Number of recipients
 * @returns Estimated transaction size in bytes
 */
const estimateEscrowTransactionSize = (amount: number, recipientCount: number): number => {
  // Base transaction size (inputs + outputs + overhead)
  const baseSize = 10; // Version, locktime, etc.
  
  // Input size (typical P2WPKH input: ~68 bytes)
  const inputSize = 68;
  const numInputs = Math.ceil(amount / 0.01); // Assume ~0.01 BTC per input
  const totalInputSize = Math.min(numInputs, 10) * inputSize; // Cap at 10 inputs
  
  // Output size (P2WPKH output: ~31 bytes)
  const outputSize = 31; // P2WPKH (most common)
  // Escrow has one output per recipient + potential change output
  const numOutputs = recipientCount + 1; // Recipients + change (if needed)
  const totalOutputSize = numOutputs * outputSize;
  
  // Witness data (for P2WPKH: ~107 bytes per input)
  const witnessSize = Math.min(numInputs, 10) * 107;
  
  const totalSize = baseSize + totalInputSize + totalOutputSize + witnessSize;
  
  // Return reasonable bounds (200-1500 bytes) - escrow transactions are typically larger
  return Math.max(200, Math.min(totalSize, 1500));
};

/**
 * Converts ckBTC to ICP using real-time exchange rate
 * @param ckbtcAmount - Amount in ckBTC (as number)
 * @returns Promise with ICP amount and conversion details
 */
export const convertCkBtcToIcp = async (ckbtcAmount: number): Promise<{
  icpAmount: number;
  conversionRate: number;
  fee: number;
  netIcpAmount: number;
}> => {
  // Validate input
  if (!ckbtcAmount || isNaN(ckbtcAmount) || ckbtcAmount <= 0) {
    return {
      icpAmount: 0,
      conversionRate: 0,
      fee: 0,
      netIcpAmount: 0
    };
  }

  try {
    // Get real-time exchange rates
    const btcPrice = await getBitcoinPrice();
    const icpPrice = await getIcpPrice();
    
    // Calculate conversion rate: BTC price / ICP price
    const conversionRate = btcPrice / icpPrice;
    
    // Convert ckBTC to ICP
    const grossIcpAmount = ckbtcAmount * conversionRate;
    
    // No conversion fee - direct market rate
    const fee = 0;
    
    // Net amount (same as gross since no fee)
    const netIcpAmount = grossIcpAmount;
    
    return {
      icpAmount: grossIcpAmount,
      conversionRate,
      fee,
      netIcpAmount
    };
  } catch {
    // Fallback to approximate rate if API fails
    const fallbackRate = 15000; // 1 BTC ≈ 15,000 ICP (approximate)
    const grossIcpAmount = ckbtcAmount * fallbackRate;
    
    return {
      icpAmount: grossIcpAmount,
      conversionRate: fallbackRate,
      fee: 0,
      netIcpAmount: grossIcpAmount
    };
  }
};

/**
 * Converts ICP to ckBTC using real-time exchange rate
 * @param icpAmount - Amount in ICP (as number)
 * @returns Promise with ckBTC amount and conversion details
 */
export const convertIcpToCkBtc = async (icpAmount: number): Promise<{
  ckbtcAmount: number;
  conversionRate: number;
  fee: number;
  netCkBtcAmount: number;
}> => {
  // Validate input
  if (!icpAmount || isNaN(icpAmount) || icpAmount <= 0) {
    return {
      ckbtcAmount: 0,
      conversionRate: 0,
      fee: 0,
      netCkBtcAmount: 0
    };
  }

  try {
    // Get real-time exchange rates
    const btcPrice = await getBitcoinPrice();
    const icpPrice = await getIcpPrice();
    
    // Calculate conversion rate: ICP price / BTC price
    const conversionRate = icpPrice / btcPrice;
    
    // Convert ICP to ckBTC
    const grossCkBtcAmount = icpAmount * conversionRate;
    
    // No conversion fee - direct market rate
    const fee = 0;
    
    // Net amount (same as gross since no fee)
    const netCkBtcAmount = grossCkBtcAmount;
    
    return {
      ckbtcAmount: grossCkBtcAmount,
      conversionRate,
      fee,
      netCkBtcAmount
    };
  } catch {
    // Fallback to approximate rate if API fails
    const fallbackRate = 1 / 15000; // 1 ICP ≈ 1/15,000 BTC (approximate)
    const grossCkBtcAmount = icpAmount * fallbackRate;
    
    return {
      ckbtcAmount: grossCkBtcAmount,
      conversionRate: fallbackRate,
      fee: 0,
      netCkBtcAmount: grossCkBtcAmount
    };
  }
};

/**
 * Detects currency amounts in text and returns conversion info
 * @param text - Text to search for currency amounts
 * @returns Currency info or null if not found
 */
export const detectCurrencyAmount = (text: string): { amount: string; currency: string; originalText: string } | null => {
  // Patterns for different currencies
  const currencyPatterns = [
    /\$(\d+(?:\.\d{1,2})?)/i, // $5, $5.50, $5.99
    /€(\d+(?:\.\d{1,2})?)/i, // €10, €10.50
    /£(\d+(?:\.\d{1,2})?)/i, // £20, £20.50
    /¥(\d+(?:\.\d{1,2})?)/i, // ¥1000, ¥1000.50
    /(\d+(?:\.\d{1,2})?)\s*(USD|EUR|GBP|JPY|CAD|AUD|CHF)/i, // 5 USD, 10 EUR
  ];

  for (const pattern of currencyPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = match[1];
      let currency = match[2] || match[0].charAt(0); // Use symbol if no currency code
      
      // Normalize currency symbols
      if (currency === '$') currency = 'USD';
      if (currency === '€') currency = 'EUR';
      if (currency === '£') currency = 'GBP';
      if (currency === '¥') currency = 'JPY';
      
      return {
        amount,
        currency,
        originalText: match[0]
      };
    }
  }
  
  return null;
};

// Generate a random transaction hash for display
export const generateRandomHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

interface TransactionRecipient {
  principal: string;
  amount: string | number;
}

interface Transaction {
  from: string;
  to: TransactionRecipient[];
  createdAt?: string | number;
}

export async function generateTransactionMessage(
  transaction: Transaction,
  currentUserId: string,
  includeDate: boolean = true
): Promise<string> {
  const isSender = String(transaction.from) === String(currentUserId);
  const isRecipient = transaction.to?.some((recipient: TransactionRecipient) => 
    String(recipient.principal) === String(currentUserId)
  );

  const totalAmount = transaction.to?.reduce((sum: number, recipient: TransactionRecipient) => 
    sum + (recipient.amount ? Number(recipient.amount) : 0), 0
  ) || 0;

  const btcAmount = totalAmount / 1e8;
  const usdAmount = await btcToUsd(btcAmount);

  let message = '';

  if (isSender) {
    message = `You sent ${btcAmount.toFixed(6)} BTC ($${usdAmount.toFixed(2)})`;
  } else if (isRecipient) {
    message = `You received ${btcAmount.toFixed(6)} BTC ($${usdAmount.toFixed(2)})`;
  } else {
    message = `Transaction: ${btcAmount.toFixed(6)} BTC ($${usdAmount.toFixed(2)})`;
  }

  if (includeDate && transaction.createdAt) {
    const date = new Date(Number(transaction.createdAt) / 1_000_000);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    message += ` on ${dateStr} at ${timeStr}`;
  }

  return message;
}

export function generateTransactionMessageSync(
  transaction: Transaction,
  currentUserId: string,
  includeDate: boolean = true
): string {
  const isSender = String(transaction.from) === String(currentUserId);
  const isRecipient = transaction.to?.some((recipient: TransactionRecipient) => 
    String(recipient.principal) === String(currentUserId)
  );

  const totalAmount = transaction.to?.reduce((sum: number, recipient: TransactionRecipient) => 
    sum + (recipient.amount ? Number(recipient.amount) : 0), 0
  ) || 0;

  const btcAmount = totalAmount / 1e8;
  const usdAmount = btcAmount * 114764.80; // Fallback rate for sync version

  let message = '';

  if (isSender) {
    message = `You sent ${btcAmount.toFixed(6)} BTC ($${usdAmount.toFixed(2)})`;
  } else if (isRecipient) {
    message = `You received ${btcAmount.toFixed(6)} BTC ($${usdAmount.toFixed(2)})`;
  } else {
    message = `Transaction: ${btcAmount.toFixed(6)} BTC ($${usdAmount.toFixed(2)})`;
  }

  if (includeDate && transaction.createdAt) {
    const date = new Date(Number(transaction.createdAt) / 1_000_000);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    message += ` on ${dateStr} at ${timeStr}`;
  }

  return message;
}
