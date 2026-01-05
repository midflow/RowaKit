import { describe, it, expect } from 'vitest';
import { APP_VERSION } from './version';

describe('app branding', () => {
  it('should not contain "Stage" in version string', () => {
    expect(APP_VERSION).not.toMatch(/stage/i);
  });

  it('should have a version number', () => {
    // Version should be in format like "0.1.0"
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should display version correctly', () => {
    // Version should be readable
    expect(APP_VERSION.length).toBeGreaterThan(0);
  });
});
