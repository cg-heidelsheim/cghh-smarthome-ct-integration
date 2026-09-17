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
    'index.ts',
    'uptime.ts',
  ],
  coverageThreshold: {
    // Raised once characterization tests + the TypeScript migration landed real coverage
    // in the low-90s; set a few points below actual so routine work has some headroom
    // without silently regressing. Raising the floor is a deliberate, tracked step (see
    // AGENTS.md) — never lower it to make a failing build pass.
    global: {
      statements: 85,
      branches: 75,
      functions: 80,
      lines: 85,
    },
  },
};
