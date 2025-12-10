// tests/test_setup.js
// Global test setup

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock console.log to keep test output clean
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};
