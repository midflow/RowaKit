/**
 * Network Simulation Layer
 *
 * Wraps fetcher with production-like network conditions:
 * - Latency (with jitter)
 * - Error rate
 * - Timeout handling
 */

import type { Fetcher, FetcherQuery, FetcherResult } from '@rowakit/table';
import type { HarnessConfig } from './config';

export class NetworkSimulator<T> {
  private errorCount = 0;
  private requestCount = 0;

  constructor(
    private baseFetcher: Fetcher<T>,
    private config: HarnessConfig['network']
  ) {}

  /**
   * Simulate network delay with jitter
   */
  private async simulateLatency(): Promise<void> {
    const { latency, jitter } = this.config;
    const baseDelay = Math.random() * (latency.max - latency.min) + latency.min;
    const jitterAmount = (Math.random() - 0.5) * 2 * jitter;
    const totalDelay = Math.max(0, baseDelay + jitterAmount);

    await new Promise((resolve) => setTimeout(resolve, totalDelay));
  }

  /**
   * Simulate network errors (deterministic based on error rate)
   */
  private shouldSimulateError(): boolean {
    this.requestCount++;
    
    // Deterministic error: every Nth request based on error rate
    // E.g., 0.005 = error on 1/200 requests
    if (this.config.errorRate > 0) {
      const errorInterval = Math.floor(1 / this.config.errorRate);
      if (this.requestCount % errorInterval === 0) {
        this.errorCount++;
        return true;
      }
    }
    
    return false;
  }

  /**
   * Create network-simulated fetcher
   */
  createFetcher(): Fetcher<T> {
    return async (query: FetcherQuery): Promise<FetcherResult<T>> => {
      // Simulate network latency
      await this.simulateLatency();

      // Simulate network errors
      if (this.shouldSimulateError()) {
        throw new Error('Simulated network error (503 Service Unavailable)');
      }

      // Execute real fetcher
      const result = await this.baseFetcher(query);

      return result;
    };
  }

  /**
   * Get simulation stats
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
    };
  }

  /**
   * Reset simulation stats
   */
  reset() {
    this.requestCount = 0;
    this.errorCount = 0;
  }
}
