/**
 * UI-Level Harness Runner
 *
 * Orchestrates all UI-level scenario tests.
 */

import { describe } from 'vitest';

describe('RowaKit UI-Level Harness', () => {
  // Import all scenario test suites
  // They will be automatically executed by vitest
  
  describe('Core Scenarios', async () => {
    await import('./scenarios.core.test');
  });

  describe('Workflow Scenarios', async () => {
    await import('./scenarios.workflow.test');
  });

  describe('URL Sync & Saved Views', async () => {
    await import('./scenarios.urlsync.test');
  });

  describe('Column Resizing', async () => {
    await import('./scenarios.resize.test');
  });
});
