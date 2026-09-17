// jest-logger-mock.js

// This global mock file will replace Logger in all tests to avoid async logging issues

jest.mock('./src/util/logger', () => {
  return {
    Logger: {
      core: jest.fn((..._args) => {}),
      trace: jest.fn((..._args) => {}),
      info: jest.fn((..._args) => {}),
      error: jest.fn((..._args) => {}),
      warn: jest.fn((..._args) => {}),
      debug: jest.fn((..._args) => {}),
    }
  };
});
