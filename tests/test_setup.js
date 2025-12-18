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

// Provide a trivial test so this setup file is not treated as an empty test suite
test('global test setup loads', () => {
  expect(true).toBe(true);
});
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
