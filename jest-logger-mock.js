// jest-logger-mock.js

// This global mock file will replace Logger in all tests to avoid async logging issues

jest.mock('./src/util/logger', () => {
  return {
    Logger: {
      info: jest.fn((...args) => {}),
      error: jest.fn((...args) => {}),
      warn: jest.fn((...args) => {}),
      debug: jest.fn((...args) =>  {}),
    }
  };
});
