import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist',
      '**/build',
      '**/.next',
      '**/.expo',
      '**/.turbo',
      '**/coverage',
      '**/node_modules',
      '**/drizzle/**',
      'pnpm-lock.yaml',
      'proto/**',
      '**/next-env.d.ts',
      '**/expo-env.d.ts',
      '**/nativewind-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Apps Expo + composants RN
  {
    files: ['apps/mobile/**/*.{ts,tsx}', 'apps/driver/**/*.{ts,tsx}', 'packages/ui-mobile/**/*.{ts,tsx}'],
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    rules: {
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: { react: { version: 'detect' } },
  },
  // Fichiers de config Metro / Babel / Tailwind qui doivent être en CommonJS
  {
    files: ['**/babel.config.js', '**/metro.config.js', '**/tailwind.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettier,
);
