import globals from "globals";
import js from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin-js'


export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node, ...globals.browser },
      ecmaVersion: 'latest',
    },
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
      '@stylistic/js/no-trailing-spaces': 'error',
      '@stylistic/js/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/js/object-curly-spacing': ['error', 'always'],
      'eqeqeq': 'error',
    }
  },
  {
    ignores: ['dist/**'],
  }
]