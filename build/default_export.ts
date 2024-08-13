/**
 * Summary: This file is specifically used for umd and iife builds. Check rollup.config.js
 * Explaination: Rollup with exports = "default" throws the below error when it
 *          encounters both default and named export.
 *
 *          Error: [!] Error: "default" was specified for "output.exports", but entry module "src/index.ts" has the following exports: Connect, default
 *
 *          This is a smart technique through which only umd/iife builds would use the default export in build process
 */
import { Connect } from '../src/index';

export default Connect;
