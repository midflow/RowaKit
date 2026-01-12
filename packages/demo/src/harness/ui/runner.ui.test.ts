/**
 * UI-Level Harness Runner
 *
 * Orchestrates all UI-level scenario tests.
 */

import { describe } from 'vitest';
import './scenarios.core.test';
import './scenarios.workflow.test';
import './scenarios.urlsync.test';
import './scenarios.resize.test';

describe('RowaKit UI-Level Harness', () => {
  // All scenario test suites are imported above and will run automatically
});
