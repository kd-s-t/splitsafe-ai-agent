
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module?: string;
  userId?: string;
  transactionId?: string;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class LokiLogger {
  private logDir: string;
  private isDevelopment: boolean;

  constructor() {
    this.logDir = process.env.LOG_DIR || '/tmp/logs';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLogEntry(entry: LogEntry): string {
    const logLine = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      ...(entry.module && { module: entry.module }),
      ...(entry.userId && { userId: entry.userId }),
      ...(entry.transactionId && { transactionId: entry.transactionId }),
      ...(entry.metadata && { metadata: entry.metadata }),
      ...(entry.error && { error: entry.error })
    };

    return JSON.stringify(logLine);
  }

  private writeToFile(entry: LogEntry): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      
      // Ensure log directory exists
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }

      const logFile = path.join(this.logDir, `splitsafe-${new Date().toISOString().split('T')[0]}.log`);
      const logLine = this.formatLogEntry(entry) + '\n';
      
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private log(level: LogLevel, message: string, options?: {
    module?: string;
    userId?: string;
    transactionId?: string;
    metadata?: Record<string, unknown>;
    error?: Error;
  }): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...options
    };

    // Always write to file for Loki collection
    this.writeToFile(entry);

    // Also log to console in development
    if (this.isDevelopment) {
      const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                           level === LogLevel.WARN ? 'warn' : 
                           level === LogLevel.DEBUG ? 'debug' : 'log';
      
      console[consoleMethod](`[${level}] ${message}`, options?.metadata || '');
    }
  }

  debug(message: string, options?: Parameters<typeof this.log>[2]): void {
    this.log(LogLevel.DEBUG, message, options);
  }

  info(message: string, options?: Parameters<typeof this.log>[2]): void {
    this.log(LogLevel.INFO, message, options);
  }

  warn(message: string, options?: Parameters<typeof this.log>[2]): void {
    this.log(LogLevel.WARN, message, options);
  }

  error(message: string, options?: Parameters<typeof this.log>[2]): void {
    this.log(LogLevel.ERROR, message, options);
  }

  // Specialized logging methods for SplitSafe
  escrowCreated(escrowId: string, userId: string, amount: number): void {
    this.info('Escrow created', {
      module: 'escrow',
      userId,
      transactionId: escrowId,
      metadata: { amount, action: 'created' }
    });
  }

  escrowApproved(escrowId: string, userId: string): void {
    this.info('Escrow approved', {
      module: 'escrow',
      userId,
      transactionId: escrowId,
      metadata: { action: 'approved' }
    });
  }

  escrowReleased(escrowId: string, userId: string, amount: number): void {
    this.info('Escrow released', {
      module: 'escrow',
      userId,
      transactionId: escrowId,
      metadata: { amount, action: 'released' }
    });
  }

  bitcoinTransactionDetected(escrowId: string, txHash: string, amount: number): void {
    this.info('Bitcoin transaction detected', {
      module: 'bitcoin',
      transactionId: escrowId,
      metadata: { txHash, amount, action: 'detected' }
    });
  }

  apiRequest(method: string, path: string, userId?: string, statusCode?: number): void {
    this.info('API request', {
      module: 'api',
      userId,
      metadata: { method, path, statusCode, action: 'request' }
    });
  }

  apiError(method: string, path: string, error: Error, userId?: string): void {
    this.error('API error', {
      module: 'api',
      userId,
      error,
      metadata: { method, path, action: 'error' }
    });
  }
}

// Export singleton instance
export const logger = new LokiLogger();

// LogEntry is already exported from the interface declaration above
