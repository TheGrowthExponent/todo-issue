import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import typescriptParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig([
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'import/no-unresolved': ['error'],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'warn',
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {},
      env: {
        node: true,
      },
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
    ignores: [
      'dist/',
      'node_modules/',
      '*.js',
      '*.d.ts',
      'tests/__mocks__/',
      'docs/',
      'coverage/',
      'build/',
    ],
    excludedFiles: ['tests/__mocks__/**/*.js'],
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.js'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        describe: true,
        beforeAll: true,
        afterAll: true,
        test: true,
        expect: true,
        vitest: true,
        it: true,
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'warn',
    },
  },
]);
