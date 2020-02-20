#!/usr/bin/env node

'use strict';

const path = require('path');
const { promisify } = require('util');
const stringify = promisify(require('csv-stringify'));
const writeFile = promisify(require('fs').writeFile);
const xlsx = require('xlsx');

const SRC_EXT = '.xls';
const DEST_EXT = '.csv';
const IGNORED_ROWS = 11;
const COLUMNS = [
  ['Date', 'A'],
  ['Payee', 'C'],
  ['Memo', 'B'],
  ['Amount', 'D']
];

const argv = process.argv.slice(2);
const [src, dest] = argv;

Promise.resolve()
  .then(() => validateInput(src, dest))
  .then(() => readXls(src))
  .then(sheet => buildRows(sheet))
  .then(rows => writeCsv(rows, dest))
  .then(() => console.log('Success!'))
  .catch(onError);

function validateInput(src, dest) {
  if (!src && !dest) {
    throw new Error('Usage: pbz2ynab [sourceFile] [destinationFile]');
  }
  if (!src || path.extname(src) !== SRC_EXT) {
    throw new TypeError('Source file must be PBZ exported .xls file');
  }
  if (!dest || path.extname(dest) !== DEST_EXT) {
    throw new TypeError('Destination file must be .csv file');
  }
}

function readXls(file) {
  const filePath = path.resolve(process.cwd(), file);
  const workbook = xlsx.readFile(filePath);
  const [sheetName] = workbook.SheetNames;
  const sheet = workbook.Sheets[sheetName];
  return sheet;
}

function buildRows(sheet) {
  const { length } = sheet['!rows'];
  const rows = Array.from({ length })
    .slice(IGNORED_ROWS)
    .reduce((rows, _, index) => rows.concat([COLUMNS.map(([__, key]) => {
      const cellName = `${key}${index + IGNORED_ROWS}`;
      return sheet[cellName].w;
    })]), []);
  rows.unshift(COLUMNS.map(([header]) => header));
  return rows;
}

function writeCsv(rows, file) {
  const filePath = path.resolve(process.cwd(), file);
  return stringify(rows, { delimiter: ',' })
    .then(csv => writeFile(filePath, csv));
}

function onError(err) {
  console.error(err);
  process.exit(1);
}
