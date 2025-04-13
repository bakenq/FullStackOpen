import globals from 'globals';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    ...reactRecommended,
    languageOptions: {
      ...reactRecommended.languageOptions,
      globals: {
        ...globals.browser,
      }
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'warn',
      ...reactHooks.configs.recommended.rules,

      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      
    },
  },
];