import { describe, it, expect } from 'vitest';
import { VERSION } from '../index';

describe('@rowakit/table', () => {
  it('exports VERSION', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('package is importable', () => {
    // This test verifies the package entry point works
    expect(typeof VERSION).toBe('string');
  });
});
