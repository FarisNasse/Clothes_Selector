import reactNativeConfig from '@react-native/eslint-config/flat';

export default [
  { ignores: ['.expo/**', 'dist*/**', 'node_modules/**', 'supabase/functions/**'] },
  ...reactNativeConfig,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'off',
      'no-void': ['warn', { allowAsStatement: true }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
];
