#!/usr/bin/env node

'use strict';

const csvStringify = require('csv-stringify');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const xlsx = require('xlsx');

const stringify = promisify(csvStringify);
const writeFile = promisify(fs.writeFile);

const SRC_EXT = '.xls';
const DEST_EXT = '.csv';
const IGNORED_ROWS = 11;
const COLUMNS = [
  ['Date', 'A'],
  ['Payee', 'C'],
  ['Memo', 'B'],
  ['Amount', 'D']
];

const src = process.argv[2];
const dest = process.argv[3];

validateInput(src, dest)
  .then(() => readXls(src))
  .then(buildRows)
  .then(rows => writeCsv(rows, dest))
  .then(() => {
    console.log('Success!');
    process.exit(0);
  })
  .catch(onError);

function validateInput(src, dest) {
  if (!src || !dest) {
    return Promise.reject(new Error('Usage: pbz2ynab [sourceFile] [destinationFile]'));
  }
  if (path.extname(src) !== SRC_EXT) {
    return Promise.reject(new Error('Source file must be PBZ exported .xls file'));
  }
  if (path.extname(dest) !== DEST_EXT) {
    return Promise.reject(new Error('Destination file must be .csv file'));
  }
  return Promise.resolve();
}

async function readXls(file) {
  const filePath = path.join(process.cwd(), file);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return sheet;
}

function buildRows(sheet) {
  const rowsCount = sheet['!rows'].length;
  const rows = Array(rowsCount)
    .fill()
    .slice(IGNORED_ROWS)
    .reduce((rows, _, index) => rows.concat([COLUMNS.map(([__, key]) => {
      const cellName = `${key}${index + IGNORED_ROWS}`;
      return sheet[cellName].w;
    })]), []);
  rows.unshift(COLUMNS.map(([header]) => header));
  return rows;
}

function writeCsv(rows, file) {
  const filePath = path.join(process.cwd(), file);
  return stringify(rows, { delimiter: ',' })
    .then(csv => writeFile(filePath, csv));
}

function onError(err) {
  console.error(err);
  process.exit(1);
}
