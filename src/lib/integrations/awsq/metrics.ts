import type { QEvent, QMetrics } from './types';

class MetricsCollector {
  private metrics: QMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    totalTokensUsed: 0
  };

  private responseTimes: number[] = [];
  private events: QEvent[] = [];
  private readonly MAX_EVENTS = 100;

  recordRequest(success: boolean, responseTime: number, tokensUsed: number = 0): void {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    this.metrics.totalTokensUsed += tokensUsed;
  }

  recordEvent(event: Omit<QEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: Date.now()
    });

    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }
  }

  getMetrics(): Readonly<QMetrics> {
    return { ...this.metrics };
  }

  getEvents(limit?: number): QEvent[] {
    const events = [...this.events].reverse();
    return limit ? events.slice(0, limit) : events;
  }

  getSuccessRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
  }

  getRecentResponseTimes(count: number = 10): number[] {
    return this.responseTimes.slice(-count);
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0
    };
    this.responseTimes = [];
    this.events = [];
  }

  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      successRate: this.getSuccessRate(),
      recentEvents: this.getEvents(20)
    }, null, 2);
  }
}

export const qMetrics = new MetricsCollector();
