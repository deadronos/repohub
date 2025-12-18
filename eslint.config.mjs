import { defineConfig } from 'eslint/config';

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,

  // Type-aware linting for TS/TSX.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // React event handlers/props often legitimately accept async functions.
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],

      // Prefer strict typing: warn when `any` is used.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Useful sometimes, but too noisy in UI codebases.
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },

  // Avoid type-aware linting on JS/config files.
  {
    files: ['**/*.{js,cjs,mjs}', '**/*.config.*', 'eslint.config.*'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Disable formatting-related rules that conflict with Prettier.
  prettier,
]);
