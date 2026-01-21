// Suppress React act() warnings in tests that are noisy but non-fatal.
// This filters messages that include the specific guidance from React about wrapping
// updates in `act(...)`. Keep the original console.error for other messages.
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    try {
      const msg = args[0];
      if (typeof msg === 'string' && msg.includes('not wrapped in act(')) {
        // swallow this specific React testing warning
        return;
      }
    } catch (e) {
      // fall through to original
    }
    return originalConsoleError.apply(console, args as any);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
