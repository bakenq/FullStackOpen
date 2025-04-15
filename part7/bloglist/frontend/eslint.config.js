import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js'
//import pluginReactJSXRuntimeConfig from 'eslint-plugin-react/configs/jsx-runtime.js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'eslint.config.js'] },
  {
    files: ['**/*.{js,jsx}'],
    ...pluginReactConfig,
    languageOptions: {
      ...pluginReactConfig.languageOptions,
      parserOptions: pluginReactConfig.languageOptions.parserOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      }
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...pluginReactConfig.rules,
      ...reactHooks.configs.recommended.rules,

      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "single"],
      "semi": ["error", "never"],
      "eqeqeq": "error",
      "no-trailing-spaces": "error",
      "object-curly-spacing": ["error", "always"],
      "arrow-spacing": ["error", { "before": true, "after": true }],

      "react/prop-types": "warn",

      "no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],

      "react/react-in-jsx-scope": "off",
    },
  },
];