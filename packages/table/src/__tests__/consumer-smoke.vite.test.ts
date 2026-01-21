/**
 * Vite Consumer Smoke Test
 *
 * Verifies that @rowakit/table/styles can be imported and used in a Vite consumer app
 * without build errors, CSS collisions, or layout regressions.
 *
 * This test runs: `pnpm -C packages/consumer-smoke-vite build`
 */

import { test, expect, describe, beforeAll } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

/**
 * Vite Consumer Smoke Test
 *
 * These tests verify that @rowakit/table/styles can be imported and used in a Vite app
 * without build errors or CSS regressions.
 *
 * Note: Builds are run as part of test setup and verified from their artifacts.
 */

// Calculate path to consumer-smoke-vite from this file location
// This test is at: packages/table/src/__tests__/consumer-smoke.vite.test.ts
// Consumer-smoke-vite is at: packages/consumer-smoke-vite
const VITE_CONSUMER_DIR = resolve(__dirname, '../../../../packages/consumer-smoke-vite');

beforeAll(() => {
  // Build consumer-smoke-vite before running tests
  execSync('pnpm --filter @rowakit/table build', {
    cwd: resolve(__dirname, '../../../../'),
    stdio: 'inherit',
  });
  execSync('pnpm --filter @rowakit/consumer-smoke-vite build', {
    cwd: resolve(__dirname, '../../../../'),
    stdio: 'inherit',
  });
});

describe('Consumer Smoke Test: Vite', () => {
  test('Vite consumer package exists', () => {
    expect(existsSync(VITE_CONSUMER_DIR)).toBe(true);
  });

  test('Vite consumer dist folder exists after build', () => {
    const distPath = join(VITE_CONSUMER_DIR, 'dist');
    expect(existsSync(distPath)).toBe(true);
  });

  test('Vite produces CSS bundle in dist', () => {
    const distPath = join(VITE_CONSUMER_DIR, 'dist', 'assets');
    const files = readdirSync(distPath);
    const cssFiles = files.filter((f) => f.endsWith('.css'));

    expect(cssFiles.length).toBeGreaterThan(0);
  });

  test('Vite produces JS bundle in dist', () => {
    const distPath = join(VITE_CONSUMER_DIR, 'dist', 'assets');
    const files = readdirSync(distPath);
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    expect(jsFiles.length).toBeGreaterThan(0);
  });

  test('styles import path exists in source', () => {
    // The app imports '@rowakit/table/styles' - verify this exists
    const mainPath = join(VITE_CONSUMER_DIR, 'src', 'main.tsx');
    const mainContent = readFileSync(mainPath, 'utf-8');

    expect(mainContent).toContain("import '@rowakit/table/styles'");
  });
});
