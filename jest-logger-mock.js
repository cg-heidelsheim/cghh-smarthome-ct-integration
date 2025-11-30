// jest-logger-mock.js

// This global mock file will replace Logger in all tests to avoid async logging issues

jest.mock('./src/util/logger', () => {
  return {
    Logger: {
      info: jest.fn((...args) => console.log('[Logger info]', ...args)),
      error: jest.fn((...args) => console.error('[Logger error]', ...args)),
      warn: jest.fn((...args) => console.warn('[Logger warn]', ...args)),
      debug: jest.fn((...args) => console.debug('[Logger debug]', ...args)),
    }
  };
});
