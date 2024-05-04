/** @type {import('eslint').Linter.Config} */ // https://github.com/typescript-eslint/typescript-eslint/issues/2153
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'], // 'plugin:react-hooks/recommended'], // , 'next/core-web-vitals', 'plugin:@next/next/recommended' , 'react-app', 'react-app/jest'
  ignorePatterns: ['dist', '.eslintrc.cjs', '**/node_modules/**/*', 'webpack.config.cjs'], // '/coverage', 'config/jest/*.cjs'], // 'vite.config.ts', 'next.config.js', 'jest.config.ts', 'jest.setup.ts', 'Globals.d.ts'
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'], // 'H:/Using/TLightChat/tlightchat-main/tsconfig.json',
    // ecmaFeatures: {
    //   jsx: true,
    // },
    // ecmaVersion: 12,
    // sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    // 'react',
    // 'react-refresh',
  ],
  rules: {
    // 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    // 'react-hooks/exhaustive-deps': 'warn',

    // Note: you must disable the base rule as it can report incorrect errors
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    // Note: you must disable the base rule as it can report incorrect errors
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn', // error -> then force type cast -- actually no much safer ...
    '@typescript-eslint/no-unsafe-argument': 'error',
    'prefer-const': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    'no-empty': 'warn', // dk ... so many , before didnt install ext / the npm .. dk
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    'no-inner-declarations': 'off',
    'no-constant-condition': 'warn',
    'no-useless-escape': 'warn',
  },
};


// // eslint.config.mjs
// 
// 
// // pnpm add --save-dev eslint @eslint/js typescript-eslint
// // https://typescript-eslint.io/getting-started/
// // // eslint v9 is too new ...
// // 
// //     "tsx": "^4.9.0",
// //     "typescript": "^5.4.5",
// //     "eslint": "^8.53.0",
// //     "@typescript-eslint/eslint-plugin": "^6.10.0",
// //     "@typescript-eslint/parser": "^6.10.0",
// //     "@eslint/create-config": "^0.4.6"
// 
// 
// // @ts-check
// 
// import pluginJs from '@eslint/js';
// import tseslint from 'typescript-eslint';
// import * as parser from '@typescript-eslint/parser';
// 
// // https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file
// // https://typescript-eslint.io/getting-started/typed-linting
// // export default [
// export default tseslint.config(
//   pluginJs.configs.recommended,
//   ...tseslint.configs.recommended,
//   // ...tseslint.configs.recommendedTypeChecked,
//   {
//     // files: ['**/*.{ts,tsx,js,jsx}'],
//     ignores: ['eslint.config.mjs', 'dist', '**/node_modules/**/*'], // '/coverage', 'config/jest/*.cjs'], // 'vite.config.ts', 'next.config.js', 'jest.config.ts', 'jest.setup.ts', 'Globals.d.ts'
//     languageOptions: {
//       parser: parser,
//       // https://typescript-eslint.io/packages/parser/#configuration
//       parserOptions: {
//         project: true,
//         // tsconfigRootDir: './', // import.meta.dirname,
//       },
//       // ecmaFeatures: {
//       //   jsx: true,
//       // },
//       // ecmaVersion: 12,
//       // sourceType: 'module',
//     },
//     // plugins: [
//     //   '@typescript-eslint',
//     //   // 'react', 
//     //   // 'react-refresh',
//     // ],
//     rules: {
//       // 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
//       // 'react-hooks/exhaustive-deps': 'warn',
// 
//       // Note: you must disable the base rule as it can report incorrect errors
//       'no-unused-vars': 'off',
//       '@typescript-eslint/no-unused-vars': 'warn',
//       // Note: you must disable the base rule as it can report incorrect errors
//       'no-unused-expressions': 'off',
//       '@typescript-eslint/no-unused-expressions': 'error',
//       '@typescript-eslint/no-explicit-any': 'warn',
//       '@typescript-eslint/no-unsafe-assignment': 'warn', // error -> then force type cast -- actually no much safer ...
//       '@typescript-eslint/no-unsafe-argument': 'error',
//       'prefer-const': 'warn',
//       '@typescript-eslint/no-var-requires': 'warn',
//       'no-empty': 'warn', // dk ... so many , before didnt install ext / the npm .. dk
//       '@typescript-eslint/ban-ts-comment': 'warn',
//       '@typescript-eslint/no-floating-promises': 'error',
//       '@typescript-eslint/await-thenable': 'error',
//       'no-inner-declarations': 'off',
//       'no-constant-condition': 'warn',
//       'no-useless-escape': 'warn',
//     },
//   }
//   // https://typescript-eslint.io/getting-started/typed-linting#how-can-i-disable-type-aware-linting-for-a-subset-of-files
// );
