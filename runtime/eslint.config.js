import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const nodeTsFiles = ['src/**/*.ts', 'test/**/*.ts'];
const browserTsFiles = ['ui/src/**/*.{ts,tsx}'];
const configFiles = ['eslint.config.js', 'vite.config.ts'];
const lintedTsFiles = [...nodeTsFiles, ...browserTsFiles, 'vite.config.ts'];

const scopeToFiles = (configs, files) =>
  configs.map((config) => ({
    ...config,
    files
  }));

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'ui/dist/**']
  },
  js.configs.recommended,
  ...scopeToFiles(tseslint.configs.recommended, lintedTsFiles),
  {
    rules: {
      'no-unused-vars': 'off',
      'preserve-caught-error': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: nodeTsFiles,
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.es2022,
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: browserTsFiles,
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.es2022,
        ...globals.browser
      }
    },
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: configFiles,
    languageOptions: {
      globals: {
        ...globals.es2022,
        ...globals.node
      }
    }
  }
);
