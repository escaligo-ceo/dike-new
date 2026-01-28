// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,

        sourceType: 'module',
        tsConfigRootDir: __dirname,
        project: '../../../tsconfig.base.json',
      },
    },
  },
  {
    rules: {
      "indent": ["warn", 2, { "SwitchCase": 1 }],
      "max-len": ["warn", { "code": 200 }],
      "@typescript-eslint/no-empty-function": ["warn", { "allow": [
        "constructors",
        "methods",
        "asyncMethods"
      ] }],
      "prefer-rest-params": "warn",
      "import/no-extraneous-dependencies": [ "error" , {
        devDependencies: [
          '**/__mocks__/**',
          '**/*+(.|-)+(spec|test).?(ts|js)?(x)',
          'scripts/**',
          'babel.config.js',
          '.eslintrc.js',
        ]
      }],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': 'warn',
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
          "warn", // or "error"
          {
              "argsIgnorePattern": "^_",
              "varsIgnorePattern": "^_",
              "caughtErrorsIgnorePattern": "^_"
          }
      ],
      "prefer-const": "warn",
    },
  },
);