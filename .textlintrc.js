module.exports = {
  filters: {},
  plugins: {
    '@textlint/markdown': {
      extensions: ['.mdx'],
    },
  },
  rules: {
    'preset-ja-technical-writing': {
      'sentence-length': {
        max: 200,
      },
      'ja-no-mixed-period': false,
      'ja-no-weak-phrase': false,
    },
    'preset-ja-spacing': true,
    'spellcheck-tech-word': true,
  },
};
