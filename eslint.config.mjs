// Single ESLint config for the whole monorepo.
// Shared rules apply to both apps; React/Next rules are scoped to frontend/ only.
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import globals from 'globals';

const frontendFiles = ['frontend/**/*.{js,jsx,mjs,ts,tsx,mts,cts}'];

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    'frontend/next-env.d.ts',
  ]),

  // Shared rules (backend + frontend), including type-aware ones
  // such as no-floating-promises and no-misused-promises.
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,

  // Backend and Claude Code hook scripts run on Node
  {
    files: ['backend/**/*.ts', '.claude/hooks/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },

  // Frontend: Next.js / React / hooks / a11y rules
  ...nextVitals
    .filter((config) => Object.keys(config).some((key) => key !== 'ignores'))
    .map((config) => ({ ...config, files: frontendFiles })),
  {
    files: frontendFiles,
    languageOptions: { globals: globals.browser },
    settings: { next: { rootDir: 'frontend' } },
  },

  // Type information comes from each app's nearest tsconfig.json.
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Plain JS config files (eslint/postcss configs) aren't part of any tsconfig.
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
]);
