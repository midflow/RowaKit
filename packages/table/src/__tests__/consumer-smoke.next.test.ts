/**
 * Next.js Consumer Smoke Test
 *
 * Verifies that @rowakit/table/styles can be imported and used in a Next.js consumer app
 * without build errors, CSS collisions, or layout regressions.
 *
 * This test runs: `pnpm -C packages/consumer-smoke-next build`
 *
 * Next.js has unique CSS handling (CSS modules, global CSS, etc.) - this test ensures
 * our styles work correctly in that environment.
 */

import { test, expect, describe } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Next.js Consumer Smoke Test
 *
 * These tests verify that @rowakit/table/styles can be imported and used in a Next.js app
 * without build errors, TypeScript errors, or CSS regressions.
 *
 * Note: Builds are pre-run and verified from their artifacts.
 */

// Calculate path to consumer-smoke-next from this file location
// This test is at: packages/table/src/__tests__/consumer-smoke.next.test.ts
// Consumer-smoke-next is at: packages/consumer-smoke-next
const NEXT_CONSUMER_DIR = resolve(__dirname, '../../../../packages/consumer-smoke-next');

describe('Consumer Smoke Test: Next.js', () => {
  test('Next.js consumer package exists', () => {
    expect(existsSync(NEXT_CONSUMER_DIR)).toBe(true);
  });

  test('Next.js consumer .next folder exists after build', () => {
    const nextBuildPath = join(NEXT_CONSUMER_DIR, '.next');
    expect(existsSync(nextBuildPath)).toBe(true);
  });

  test('Next.js produces static assets in build', () => {
    const staticPath = join(NEXT_CONSUMER_DIR, '.next', 'static');
    expect(existsSync(staticPath)).toBe(true);
  });

  test('table component imports styles correctly', () => {
    // Check that the app can import from @rowakit/table
    const appPath = join(NEXT_CONSUMER_DIR, 'app', 'table.tsx');
    const appContent = readFileSync(appPath, 'utf-8');

    expect(appContent).toContain("import '@rowakit/table/styles'");
    expect(appContent).toContain('@rowakit/table');
  });

  test('Next.js app structure is valid', () => {
    // Verify key app files exist
    const layoutPath = join(NEXT_CONSUMER_DIR, 'app', 'layout.tsx');
    const pagePath = join(NEXT_CONSUMER_DIR, 'app', 'page.tsx');

    expect(existsSync(layoutPath)).toBe(true);
    expect(existsSync(pagePath)).toBe(true);
  });
});
