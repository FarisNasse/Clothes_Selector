import reactNativeConfig from '@react-native/eslint-config/flat';

export default [
  ...reactNativeConfig,
  {
    ignores: ['.expo/**', 'dist/**', 'node_modules/**', 'supabase/functions/**'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
