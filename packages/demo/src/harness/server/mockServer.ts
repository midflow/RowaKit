/**
 * Mock Server for UI-level Harness
 *
 * Simulates server-side data fetching with network latency and errors.
 */

import type { Fetcher, FetcherQuery, FetcherResult } from '@rowakit/table';
import type { TestUser } from '../dataset';
import { generateDataset } from '../dataset';
import { applyFilters, applySorting } from './queryApply';

export interface MockServerConfig {
  /** Dataset size */
  datasetSize: number;
  /** Random seed for reproducibility */
  seed: number;
  /** Network simulation */
  network: {
    latency: { min: number; max: number };
    jitter: number;
    errorRate: number;
  };
}

/**
 * Seeded random number generator for deterministic network simulation
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * Mock server that provides a Fetcher implementation
 */
export class MockServer {
  private dataset: TestUser[];
  private rng: SeededRandom;
  private config: MockServerConfig;
  private requestCounter = 0;

	private disposed = false;
	private pendingDelayTimers = new Map<ReturnType<typeof setTimeout>, () => void>();

  constructor(config: MockServerConfig) {
    this.config = config;
    this.dataset = generateDataset(config.datasetSize, config.seed);
    this.rng = new SeededRandom(config.seed + 1000);
  }

  /**
   * Create a Fetcher that simulates server-side data fetching
   */
  createFetcher(): Fetcher<TestUser> {
    return async (query: FetcherQuery): Promise<FetcherResult<TestUser>> => {
      const requestId = ++this.requestCounter;

			if (this.disposed) {
				return { items: [], total: 0 };
			}

      try {
        // Simulate network latency
        const latency = this.simulateLatency();
        await this.delay(latency);

			if (this.disposed) {
				return { items: [], total: 0 };
			}

        // Simulate network errors
        if (this.shouldSimulateError()) {
          throw new Error(`Network error (simulated) for request ${requestId}`);
        }

        // Apply filters
        let filtered = applyFilters(this.dataset, query.filters);

        // Apply sorting
        filtered = applySorting(filtered, query.sorts || []);

        // Apply pagination
        const start = (query.page - 1) * query.pageSize;
        const end = start + query.pageSize;
        const items = filtered.slice(start, end);

        return {
          items,
          total: filtered.length,
        };
      } catch (error) {
        console.error('MockServer fetcher error:', error);
        throw error;
      }
    };
  }

  /**
   * Calculate simulated latency with jitter
   */
  private simulateLatency(): number {
    const { min, max } = this.config.network.latency;
    const { jitter } = this.config.network;
    
    const baseLatency = this.rng.nextInt(min, max);
    const jitterAmount = this.rng.nextInt(-jitter, jitter);
    
    return Math.max(0, baseLatency + jitterAmount);
  }

  /**
   * Determine if this request should fail
   */
  private shouldSimulateError(): boolean {
    return this.rng.next() < this.config.network.errorRate;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        this.pendingDelayTimers.delete(timeoutId);
        resolve();
      }, ms);
      this.pendingDelayTimers.set(timeoutId, resolve);
    });
  }

  /**
   * Dispose any pending network timers.
   *
   * This prevents async leakage between UI harness tests (unmounted tables still
   * awaiting latency timers), making the suite deterministic in CI.
   */
  dispose(): void {
    this.disposed = true;
    for (const [timeoutId, resolve] of this.pendingDelayTimers.entries()) {
      clearTimeout(timeoutId);
      resolve();
    }
    this.pendingDelayTimers.clear();
  }

  /**
   * Reset request counter (useful for testing)
   */
  resetCounter(): void {
    this.requestCounter = 0;
  }

  /**
   * Get current dataset (for test assertions)
   */
  getDataset(): TestUser[] {
    return this.dataset;
  }
}
