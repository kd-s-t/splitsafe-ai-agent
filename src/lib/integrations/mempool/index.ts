/**
 * Mempool.space API Integration
 * Provides Bitcoin network fee data and blockchain information
 */

export interface BitcoinFees {
  fast: number;    // Fastest fee in satoshis per byte
  medium: number;  // Half hour fee in satoshis per byte
  slow: number;    // Economy fee in satoshis per byte
}

export interface MempoolResponse {
  fastestFee: number;
  halfHourFee: number;
  economyFee: number;
  minimumFee: number;
}

/**
 * Get current Bitcoin network fees from Mempool.space API
 * @returns Object with fee rates in satoshis per byte
 */
export const getBitcoinFees = async (): Promise<BitcoinFees> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('https://mempool.space/api/v1/fees/recommended', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const fees: MempoolResponse = await response.json();
    return {
      fast: fees.fastestFee || 20,      // 10-20 sats/vB
      medium: fees.halfHourFee || 10,   // 5-10 sats/vB  
      slow: fees.economyFee || 3        // 1-5 sats/vB
    };
  } catch (error) {
    console.warn('Failed to fetch Bitcoin fees from mempool.space, using fallback:', error);
    // Fallback to estimated fees
    return { fast: 20, medium: 10, slow: 3 };
  }
};

/**
 * Get Bitcoin network statistics
 * @returns Network stats including hash rate, difficulty, etc.
 */
export const getNetworkStats = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://mempool.space/api/v1/mining/hashrate/1y', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch network stats from mempool.space:', error);
    return null;
  }
};

/**
 * Get transaction information by hash
 * @param txHash - Bitcoin transaction hash
 * @returns Transaction details
 */
export const getTransaction = async (txHash: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`https://mempool.space/api/tx/${txHash}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch transaction ${txHash} from mempool.space:`, error);
    return null;
  }
};

/**
 * Get address information
 * @param address - Bitcoin address
 * @returns Address details including balance and transactions
 */
export const getAddress = async (address: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`https://mempool.space/api/address/${address}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch address ${address} from mempool.space:`, error);
    return null;
  }
};
