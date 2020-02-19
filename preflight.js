'use strict';

const isNpx = process.env.npm_config_prefix.includes('npx');
const isCI = JSON.parse(process.env.npm_config_argv).original.includes('ci');

if (isNpx || isCI) process.exit();

const { name } = require('./package.json');

console.error(`
  This cli is not supposed to be installed.

  Use npx instead:
  $ npx ${name}
`);

process.exit(1);
