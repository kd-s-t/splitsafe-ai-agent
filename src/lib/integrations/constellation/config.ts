
import { ConstellationConfig, EnvironmentValidation } from './types';

export type { EnvironmentValidation } from './types';

// Digital Evidence API URLs
export const DE_API_BASE_URL_TESTNET = 'https://de-api-intnet.constellationnetwork.io/v1';
export const DE_API_BASE_URL_MAINNET = 'https://de-api.constellationnetwork.io/v1';
export const DE_EXPLORER_BASE_URL = 'https://digitalevidence.constellationnetwork.io';
export const DE_EXPLORER_FINGERPRINT_URL = `${DE_EXPLORER_BASE_URL}/fingerprint`;

// Legacy L0 endpoints (for transaction-based API)
const getDefaultL0Urls = (network: string) => {
  if (network === 'mainnet') {
    return {
      l0Url: 'https://l0-lb-mainnet.constellationnetwork.io',
      l0GlobalUrl: 'https://l0-global-lb-mainnet.constellationnetwork.io',
      l0CurrencyUrl: 'https://l0-currency-lb-mainnet.constellationnetwork.io'
    };
  }
  if (network === 'integrationnet') {
    return {
      l0Url: 'https://l0-lb-integrationnet.constellationnetwork.io',
      l0GlobalUrl: 'https://l0-currency-lb-integrationnet.constellationnetwork.io',
      l0CurrencyUrl: 'https://l1-currency-lb-integrationnet.constellationnetwork.io'
    };
  }
  // testnet defaults
  return {
    l0Url: 'https://l0-lb-testnet.constellationnetwork.io',
    l0GlobalUrl: 'https://l0-global-lb-testnet.constellationnetwork.io',
    l0CurrencyUrl: 'https://l0-currency-lb-testnet.constellationnetwork.io'
  };
};

export const constellationConfig: ConstellationConfig = {
  network: process.env.CONSTELLATION_NETWORK || 'testnet',
  apiKey: process.env.CONSTELLATION_API_KEY || '',
  environment: process.env.NODE_ENV || 'development',
  l0Url: process.env.CONSTELLATION_L0_URL || getDefaultL0Urls(process.env.CONSTELLATION_NETWORK || 'testnet').l0Url,
  l0GlobalUrl: process.env.CONSTELLATION_L0_GLOBAL_URL || getDefaultL0Urls(process.env.CONSTELLATION_NETWORK || 'testnet').l0GlobalUrl,
  l0CurrencyUrl: process.env.CONSTELLATION_L0_CURRENCY_URL || getDefaultL0Urls(process.env.CONSTELLATION_NETWORK || 'testnet').l0CurrencyUrl
};

/**
 * Get Digital Evidence API base URL based on network
 */
export function getDeApiBaseUrl(network?: string): string {
  const networkValue = network || constellationConfig.network;
  return networkValue === 'mainnet' ? DE_API_BASE_URL_MAINNET : DE_API_BASE_URL_TESTNET;
}

/**
 * Validate required environment variables for Constellation Network
 */
export function validateEnvironmentVariables(): EnvironmentValidation {
  const missing: string[] = [];
  const errors: string[] = [];

  if (!process.env.CONSTELLATION_API_KEY) {
    missing.push('CONSTELLATION_API_KEY');
  }

  if (!process.env.CONSTELLATION_NETWORK) {
    missing.push('CONSTELLATION_NETWORK');
  }

  const validNetworks = ['mainnet', 'testnet', 'integrationnet'];
  if (process.env.CONSTELLATION_NETWORK && !validNetworks.includes(process.env.CONSTELLATION_NETWORK)) {
    errors.push(`Invalid CONSTELLATION_NETWORK: ${process.env.CONSTELLATION_NETWORK}. Must be one of: ${validNetworks.join(', ')}`);
  }

  const validEnvironments = ['development', 'staging', 'production'];
  if (process.env.NODE_ENV && !validEnvironments.includes(process.env.NODE_ENV)) {
    errors.push(`Invalid NODE_ENV: ${process.env.NODE_ENV}. Must be one of: ${validEnvironments.join(', ')}`);
  }

  return {
    valid: missing.length === 0 && errors.length === 0,
    missing,
    errors
  };
}

