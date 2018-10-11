// @flow weak

import { json2csv } from 'json-2-csv';
import { forOwn as _forOwn, forEach as _forEach } from 'lodash';
import fs from 'fs';
import { ensureDirSync } from 'fs-extra';
import { zipCSVFiles } from './zipCSVFiles';
import { shipToS3 } from './shipToS3';

import AWS from 'aws-sdk';

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
  _forEach(JSONBCOLUMNS[processor][tableName], function(column) {
    _forEach(rows, function(row) {
      row[column] = JSON.stringify(row[column]);
    });
  });
  return rows;
}

function sendEmail(url, recipient, email) {
  const ses = new AWS.SES({ region: 'us-west-2' });

  const params = {
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Html: {
          Data: `<p>Click the link below to download the subject access data for ${
            email
          } (link will expire in 10 minutes):</p><p><a href="${
            url
          }">Click here to download</a></p>`,
          Charset: 'UTF-8',
        },
      },
      Subject: {
        Data: 'File ready for download',
        Charset: 'UTF-8',
      },
    },
    Source: 'no-reply@sumofus.awsapps.com',
  };
  return ses.sendEmail(params).promise();
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

  const zipFileName = `${email}-${processor}.zip`;
  zipCSVFiles(tmpDir, zipFileName)
    .then(function(zipPath) {
      return shipToS3(zipPath, 'subject-access-requests', processor);
    })
    .then(function(tempURL) {
      console.log('TEMP URL: ', tempURL);
      return sendEmail(tempURL, 'tuuli@sumofus.org', email);
    })
    .then(function(sesResult) {
      // remember to return
      console.log('Voila, email sent! ', sesResult);
    })
    .catch(function(err) {
      // remember to return
      console.log('Uh oh, in the catch block - issues: ', err);
    });
  //send zipFile to S3
  //rmdir /tmp
}
