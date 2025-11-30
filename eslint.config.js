// Basic ESLint configuration for modern JavaScript (Node.js)
export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"],
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      "no-unused-vars": "warn",
      "no-duplicate-imports": "error",
      "no-console": "off",
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "eqeqeq": ["error", "always"],
      "curly": "error",
      "no-var": "error",
      "prefer-const": "warn"
    },
    
    plugins: {}, // add plugins here if needed
  },
];
