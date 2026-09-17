const { defineConfig, globalIgnores } = require('eslint/config');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

// Adapted from the sibling `plants` repo's eslint.config.mjs quality bar, trimmed to what
// this plain-JS-migrating-to-TS Node service actually needs (no Next.js/React rules).
module.exports = defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/reports/**',
    'persistent/**',
  ]),
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
    },
    linterOptions: {
      // A disable comment that no longer suppresses anything is a stale claim about the
      // code — failing on it keeps every remaining disable meaningful.
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-duplicate-imports': 'error',
      // This service logs to console as its primary, intentional output (via `Logger`,
      // src/util/logger.js) — unlike a web app, console *is* the product here.
      'no-console': 'off',
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      eqeqeq: ['error', 'smart'],
      curly: 'error',
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'object-shorthand': ['error', 'always'],
      'no-useless-rename': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
    },
  },
  {
    // Type-aware TS rules, applied as source files migrate from .js to .ts (Phase 2).
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      // High-value here: the retry/backoff and WS-reconnect bugs found in the architecture
      // review are exactly the class of bug these catch (a promise nobody awaits, an async
      // handler passed where a sync one is expected).
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    },
  },
  {
    // Layering: db/model/* are plain data + value-comparison logic and must not reach into
    // the churchtools domain layer or perform their own I/O by requiring a *.db.js class.
    // This was a real smell found in room-config.js (a model instantiating EventRoomConfigDB
    // and importing churchtools/model/event.js internally) — enforce it structurally so it
    // can't come back.
    //
    // `no-restricted-imports` only inspects ES-module `import` statements; this codebase is
    // CommonJS (`require(...)`), so that rule silently never fires here. `no-restricted-syntax`
    // with an ESQuery selector on `require('...')` call literals is what actually catches it.
    files: ['src/db/model/**/*.js', 'src/db/model/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='require'] > Literal[value=/churchtools/]",
          message: 'src/db/model/ is the persistence-model layer and must not import from churchtools/. Pass required data in from the caller instead.',
        },
        {
          selector: "CallExpression[callee.name='require'] > Literal[value=/\\.db(\\.js)?$/]",
          message: 'src/db/model/ must not perform its own I/O by requiring a *.db.js class. Pass the looked-up value in from the caller instead.',
        },
      ],
    },
  },
  {
    files: ['test/**/*.js', 'test/**/*.ts'],
    languageOptions: {
      globals: { describe: 'readonly', it: 'readonly', test: 'readonly', expect: 'readonly', jest: 'readonly', beforeEach: 'readonly', afterEach: 'readonly', beforeAll: 'readonly', afterAll: 'readonly' },
    },
  },
]);
