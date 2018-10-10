// @flow weak

import { json2csv } from 'json-2-csv';
import { forOwn as _forOwn, forEach as _forEach } from 'lodash';
import fs from 'fs';
import { ensureDirSync } from 'fs-extra';
import { zipCSVFiles } from './zipCSVFiles';

const JSONBCOLUMNS = {
  champaign: {
    actions: ['form_data'],
    calls: ['target_call_info'],
    form_elements: ['choices'],
    pending_actions: ['data'],
  },
  actionkit: {},
};

function jsonbToString(processor, rows, tableName) {
  _forEach(JSONBCOLUMNS[processor][tableName], function(column) {
    _forEach(rows, function(row) {
      row[column] = JSON.stringify(row[column]);
    });
  });
  return rows;
}

export function processSubjectAccessRequest(data, processor, email) {
  const tmpDir = `${__dirname}/tmp`;
  ensureDirSync(`${tmpDir}/csv`);

  _forOwn(data, function(val, key) {
    json2csv(jsonbToString(processor, val, key), function(error, csv) {
      if (error) throw new Error(error);
      fs.writeFile(`${tmpDir}/csv/${key}.csv`, csv, function(err) {
        if (err) throw new Error(err);
      });
    });
  });
  const zipFile = `${email}-${processor}.zip`;
  zipCSVFiles(tmpDir, zipFile);
  //send zipFile to S3
  //rmdir /tmp
}
