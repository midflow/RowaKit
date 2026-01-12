/**
 * Production-like Demo Harness Configuration
 *
 * This harness validates RowaKit behavior under production-like conditions
 * without requiring a real production deployment.
 */

export interface HarnessConfig {
  /** Dataset size for testing */
  datasetSize: number;

  /** Network simulation config */
  network: {
    /** Base latency in milliseconds */
    latency: {
      min: number;
      max: number;
    };
    /** Jitter (random variation) in milliseconds */
    jitter: number;
    /** Error rate (0-1, e.g. 0.01 = 1%) */
    errorRate: number;
    /** Timeout threshold in milliseconds */
    timeout: number;
  };

  /** Scenario execution config */
  scenarios: {
    /** Number of rapid interactions for stress test */
    stressIterations: number;
    /** Delay between stress iterations (ms) */
    stressDelay: number;
  };
}

export const defaultConfig: HarnessConfig = {
  datasetSize: 50000,
  
  network: {
    latency: {
      min: 100,
      max: 800,
    },
    jitter: 50,
    errorRate: 0.005, // 0.5% error rate (CI-safe)
    timeout: 5000,
  },

  scenarios: {
    stressIterations: 100, // ~15-30 min equivalent
    stressDelay: 50,
  },
};
