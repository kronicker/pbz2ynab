'use strict';

const { existsSync } = require('fs');
const path = require('path');

const {
  npm_config_prefix: prefix = '',
  npm_config_argv: argv = JSON.stringify({ original: '' })
} = process.env;

const isGit = existsSync(path.join(process.cwd(), '.git/config'));
const isNpx = prefix.includes('npx');
const isCI = JSON.parse(argv).original.includes('ci');

if (isGit || isNpx || isCI) process.exit();

// eslint-disable-next-line require-sort/require-sort
const { name } = require('./package.json');

console.error(`
  This cli is not supposed to be installed.

  Use npx instead:
  $ npx ${name}
`);

process.exit(1);
