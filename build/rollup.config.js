import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  // ESM Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/connect-web-sdk.min.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript(), terser()],
  },
  // CommonJS Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/connect-web-sdk.min.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript(), terser()],
  },
  // UMD Build
  {
    input: 'build/default_export.ts',
    output: {
      file: 'dist/umd/connect-web-sdk.min.js',
      format: 'umd',
      name: 'Connect', // Global variable name for UMD
      exports: 'default',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript(), terser()],
  },
  // IIFE Build for CDN
  {
    input: 'build/default_export.ts',
    output: {
      file: 'dist/iife/connect-web-sdk.min.js',
      format: 'iife',
      name: 'Connect', // Global variable name for IIFE
      exports: 'default',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript(), terser()],
  },
];
