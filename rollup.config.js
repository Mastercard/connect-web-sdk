import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

const typescriptPlugin = typescript({
  declaration: false, // Disable declaration file generation in Rollup
  declarationDir: null, // Ensure no declaration directory is set
});

export default [
  // ESM Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/mastercard-connect-esm.min.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescriptPlugin,
      terser(),
      replace({
        'process.env.SDK_BUILD_TYPE': JSON.stringify('ESM'),
        preventAssignment: true,
      }),
    ],
  },
  // CommonJS Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/mastercard-connect-cjs.min.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescriptPlugin,
      terser(),
      replace({
        'process.env.SDK_BUILD_TYPE': JSON.stringify('CJS'),
        preventAssignment: true,
      }),
    ],
  },
  // UMD Build
  {
    input: 'default_export.ts',
    output: {
      file: 'dist/mastercard-connect-umd.min.js',
      format: 'umd',
      name: 'Connect', // Global variable name for UMD
      exports: 'default',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescriptPlugin,
      terser(),
      replace({
        'process.env.SDK_BUILD_TYPE': JSON.stringify('UMD'),
        preventAssignment: true,
      }),
    ],
  },
  // IIFE Build for CDN
  {
    input: 'default_export.ts',
    output: {
      file: 'dist/mastercard-connect-iife.min.js',
      format: 'iife',
      name: 'Connect', // Global variable name for IIFE
      exports: 'default',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescriptPlugin,
      terser(),
      replace({
        'process.env.SDK_BUILD_TYPE': JSON.stringify('IIFE'),
        preventAssignment: true,
      }),
    ],
  },
];
