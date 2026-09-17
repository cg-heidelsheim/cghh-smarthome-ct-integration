const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  setupFilesAfterEnv: ['<rootDir>/jest-logger-mock.js'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    'index.js',
    'uptime.js',
    '!src/**/model/**', // plain DTOs, covered indirectly via their owning module's tests
  ],
  coverageThreshold: {
    // Start modest — this ratchets up as Phase 1/2 of the refactor plan lands
    // characterization tests for the currently-untested modules. Raising the floor
    // is a deliberate, tracked step, not a one-off tweak.
    global: {
      statements: 40,
      branches: 30,
      functions: 40,
      lines: 40,
    },
  },
};
