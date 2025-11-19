
import { constellationConfig } from './config';
import { ConstellationConfig, ConstellationResponse } from './types';

export class ConstellationApiClient {
  private config: ConstellationConfig;

  constructor(config?: ConstellationConfig) {
    this.config = config || constellationConfig;
  }

  /**
   * Get validation endpoints based on network
   */
  private getValidationEndpoints(): string[] {
    const network = this.config.network;
    if (network === 'mainnet') {
      return [
        'https://l0-lb-mainnet.constellationnetwork.io',
        'https://l0-currency-lb-mainnet.constellationnetwork.io',
        'https://l1-currency-lb-mainnet.constellationnetwork.io'
      ];
    }
    if (network === 'integrationnet') {
      return [
        'https://l0-lb-integrationnet.constellationnetwork.io',
        'https://l0-currency-lb-integrationnet.constellationnetwork.io',
        'https://l1-currency-lb-integrationnet.constellationnetwork.io'
      ];
    }
    // testnet defaults
    return [
      'https://l0-lb-testnet.constellationnetwork.io',
      'https://l0-currency-lb-testnet.constellationnetwork.io',
      'https://l1-currency-lb-testnet.constellationnetwork.io'
    ];
  }

  /**
   * Publish data to Constellation Network
   */
  async publishToConstellation(payload: Record<string, unknown>): Promise<ConstellationResponse<string>> {
    const endpoints = [
      this.config.l0Url,
      this.config.l0GlobalUrl,
      this.config.l0CurrencyUrl
    ].filter(Boolean);

    if (endpoints.length === 0) {
      return {
        success: false,
        error: 'No Constellation Network endpoints configured'
      };
    }

    const errors: string[] = [];

    for (const endpoint of endpoints) {
      try {
        const clusterResponse = await fetch(`${endpoint}/cluster/info`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!clusterResponse.ok) {
          errors.push(`Cluster ${endpoint} not available: ${clusterResponse.status}`);
          continue;
        }

        const publishResponse = await fetch(`${endpoint}/transaction`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!publishResponse.ok) {
          errors.push(`Failed to publish to ${endpoint}: ${publishResponse.status}`);
          continue;
        }

        const result = await publishResponse.json();
        const hash = result.txId || result.hash;
        
        if (!hash) {
          errors.push(`No hash returned from ${endpoint}`);
          continue;
        }

        return {
          success: true,
          data: hash,
          error: undefined
        };
      } catch (error) {
        errors.push(`Error with ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        continue;
      }
    }

    return {
      success: false,
      error: `All Constellation endpoints failed: ${errors.join('; ')}`
    };
  }

  /**
   * Validate a Constellation hash by checking if it exists on the network
   */
  async validateConstellationHash(hash: string): Promise<boolean> {
    try {
      const endpoints = this.getValidationEndpoints();

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${endpoint}/transaction/${hash}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            return data.txId === hash || data.hash === hash;
          }
        } catch {
          continue;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Retrieve logged data from Constellation Network
   */
  async getLoggedDataFromConstellation(hash: string): Promise<Record<string, unknown> | null> {
    try {
      const endpoints = this.getValidationEndpoints().slice(0, 2); // Use first two endpoints for retrieval

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${endpoint}/transaction/${hash}`);
          if (response.ok) {
            const data = await response.json();
            if (data.details) {
              return JSON.parse(data.details);
            }
          }
        } catch {
          continue;
        }
      }

      return null;
    } catch {
      return null;
    }
  }
}

