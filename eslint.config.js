import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        requestAnimationFrame: 'readonly',
        localStorage: 'readonly',
        AudioContext: 'readonly',
        matchMedia: 'readonly',
        MediaRecorder: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        DOMException: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },
];
