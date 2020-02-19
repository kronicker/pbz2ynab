'use strict';

const csvStringify = require('csv-stringify');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const xlsx = require('xlsx');

const stringify = promisify(csvStringify);
const src = path.join(process.cwd(), process.argv[2]);
const dest = path.join(process.cwd(), process.argv[3]);

const ignoredRows = 11;
const columns = [
  ['Date', 'A'],
  ['Payee', 'C'],
  ['Memo', 'B'],
  ['Amount', 'D']
];

(async () => {
  const workbook = xlsx.readFile(src);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = sheet['!rows'];
  const parsedRows = rows
    .slice(ignoredRows)
    .reduce((rows, _, index) => rows.concat([columns.map(([__, key]) => {
      const cellName = `${key}${index + ignoredRows}`;
      return sheet[cellName].w;
    })]), []);
  parsedRows.unshift(columns.map(([header]) => header));
  const csv = await stringify(parsedRows, { delimiter: ',' });
  fs.writeFileSync(dest, csv);
})();
