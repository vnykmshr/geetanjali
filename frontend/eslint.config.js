import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/test/**'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Prevent raw error.message usage - use errorMessages helper instead
      // This catches common patterns like: err.message, error.message, e.message
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CatchClause MemberExpression[property.name="message"][object.name=/^(err|error|e)$/]',
          message: 'Avoid using raw err.message. Use errorMessages helper from lib/errorMessages.ts for user-friendly messages.',
        },
      ],
    },
  },
  // Test files - disable react-refresh rules
  {
    files: ['**/*.test.{ts,tsx}', '**/test/**'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
