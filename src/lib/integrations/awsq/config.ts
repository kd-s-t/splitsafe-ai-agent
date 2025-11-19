export interface AWSQConfig {
  region: string;
  agentId: string;
  agentAliasId: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retries: number;
  enableLogging: boolean;
}

const DEFAULT_CONFIG: AWSQConfig = {
  region: 'us-east-1',
  agentId: '',
  agentAliasId: 'TSTALIASID',
  maxTokens: 500,
  temperature: 0.7,
  timeout: 10000,
  retries: 3,
  enableLogging: false
};

class ConfigManager {
  private config: AWSQConfig = { ...DEFAULT_CONFIG };

  setConfig(config: Partial<AWSQConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }

  getConfig(): Readonly<AWSQConfig> {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AWSQConfig>): void {
    Object.assign(this.config, updates);
  }

  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
  }

  isConfigured(): boolean {
    return Boolean(this.config.agentId);
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.agentId) {
      errors.push('Agent ID is required');
    }

    if (!this.config.region) {
      errors.push('AWS region is required');
    }

    if (this.config.maxTokens < 1 || this.config.maxTokens > 4096) {
      errors.push('Max tokens must be between 1 and 4096');
    }

    if (this.config.temperature < 0 || this.config.temperature > 1) {
      errors.push('Temperature must be between 0 and 1');
    }

    if (this.config.timeout < 1000) {
      errors.push('Timeout must be at least 1000ms');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const qConfigManager = new ConfigManager();

export function initializeQConfig(config: Partial<AWSQConfig>): void {
  qConfigManager.setConfig(config);
}

export function getQConfig(): Readonly<AWSQConfig> {
  return qConfigManager.getConfig();
}

export function isQConfigured(): boolean {
  return qConfigManager.isConfigured();
}
