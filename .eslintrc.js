module.exports = {
  extends: 'react-app',

  rules: {
    'jsx-a11y/href-no-hash': 'off',
    'no-var': 'error',
    'spaced-comment': ['error', 'always', { exceptions: ['-', '+'] }],
  },

  overrides: [
    {
      files: 'test/**/*.js',
      env: {
        jest: true,
      },
    },
  ],
};
