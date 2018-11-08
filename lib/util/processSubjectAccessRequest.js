// @flow weak
import { json2csv } from 'json-2-csv';
import { forOwn as _forOwn, forEach as _forEach } from 'lodash';
import fs from 'fs-extra';
import { zipCSVFiles } from './zipCSVFiles';
import { shipToS3 } from './shipToS3';
import { sendEmail } from './sendSAREmail';

// Which columns in which tables are JSONB fields:
const JSONBCOLUMNS = {
  champaign: {
    actions: ['form_data'],
    calls: ['target_call_info'],
    form_elements: ['choices'],
    pending_actions: ['data'],
  },
  actionkit: {},
};

// JSON to CSV converters deal unpredictably with nested JSON. We want to dump values from our JSONB fields into
// a single CSV column instead making every key in them into a new column - that would break CSV conversion because
// custom keys in jsonb fields don't match between different rows.
// We can take care of this by converting the JSON value from the nested field into a string.
function jsonbToString(processor, rows, tableName) {
  // TODO: merge PR and remove this line
  // Catch the case where null is sent instead of empty array for authentications for members who don't have auth on
  // champaign. There's a PR open with a fix but we aren't ready to cut a release so adding a fix here instead.
  if (rows == null) return [];
  _forEach(JSONBCOLUMNS[processor][tableName], function(column) {
    _forEach(rows, function(row) {
      row[column] = JSON.stringify(row[column]);
    });
  });
  return rows;
}

// Exports a constructor for a function that performs subject access request tasks from data, processor (champaign/AK)
// and email. This is necessary in order to be able to inject mocked services that perform the sub tasks in testing.
// Calling the constructor without args will use the real dependencies so you don't need to inject them from calling
// the constructor unless you want to.
export function SARconstructor(
  zipCSVFiles = zipCSVFiles,
  shipToS3 = shipToS3,
  sendEmail = sendEmail
) {
  return function(data, processor, email) {
    return new Promise(function(resolve, reject) {
      // Lambda only allows you to write to /tmp. On your local environment you probably don't want to write to /tmp.
      const tmpDir = process.env.LOCAL_TMP ? `${__dirname}/tmp` : '/tmp';
      fs.ensureDirSync(`${tmpDir}/csv`);

      _forOwn(data, function(val, key) {
        json2csv(jsonbToString(processor, val, key), function(error, csv) {
          if (error) reject(error);
          fs.writeFile(`${tmpDir}/csv/${key}.csv`, csv, function(err) {
            if (err) reject(err);
          });
        });
      });

      const zipFileName = `${email}-${processor}.zip`;
      zipCSVFiles(tmpDir, zipFileName)
        .then(function(zipPath) {
          return shipToS3(zipPath, 'subject-access-requests');
        })
        .then(function(tempURL) {
          return sendEmail(
            tempURL,
            process.env.MEMBER_SERVICES_EMAIL,
            email,
            processor
          );
        })
        .then(function(_) {
          // Makes sense to do cleanup in case the lambda environment gets reused for multiple invocations:
          return fs.emptyDir(tmpDir);
        })
        .then(function(_) {
          resolve(
            `Subject Access Data for ${processor} successfully sent for ${
              email
            }`
          );
        })
        .catch(reject);
    });
  };
}
