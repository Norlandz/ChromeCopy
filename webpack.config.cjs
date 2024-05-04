// javascript - How to import ES6 modules in content script for Chrome Extension - Stack Overflow
// https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension
//
// TypeScript | webpack
// https://webpack.js.org/guides/typescript/#root

const path = require('path');

/** @type { import('webpack').Configuration } */ // https://stackoverflow.com/questions/40075269/is-it-possible-to-write-webpack-config-in-typescript
module.exports = {
  // entry: './src/index.ts',
  // output: {
  //   filename: 'bundle.js',
  //   path: path.resolve(__dirname, 'dist'),
  // },
  entry: {
    background: './src/background/background.ts',
    contentScript: './src/contentScript/contentScript.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  // >"
  //   devtool: 'eval-source-map',
  // <>
  // https://stackoverflow.com/questions/30870830/how-do-i-generate-sourcemaps-when-using-babel-and-webpack
  // Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' http://localhost:* http://127.0.0.1:*".
  devtool: 'source-map',
};
