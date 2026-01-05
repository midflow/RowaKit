import { describe, it, expect } from 'vitest';
import { VERSION } from '../index';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

describe('@rowakit/table', () => {
  it('exports VERSION', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkgPath = resolve(here, '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string };
    expect(VERSION).toBe(pkg.version);
  });

  it('package is importable', () => {
    // This test verifies the package entry point works
    expect(typeof VERSION).toBe('string');
  });
});
