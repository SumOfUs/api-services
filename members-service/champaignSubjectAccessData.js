// @flow weak
// get Champaign data through the subject access request endpoint
// then break down the JSON into csv
// then zip the csv
// then upload the csv to an s3 bucket
// then update the operations log table
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { DocumentClient, Converter } from 'aws-sdk/clients/dynamodb';
import { subjectAccessRequestEvent } from '../lib/dynamodb/eventTypeChecker';
import { subjectAccessData } from '../lib/clients/champaign/subjectAccessData';
import { json2csv } from 'json-2-csv';
import { forOwn as _forOwn, forEach as _forEach } from 'lodash';

import log from '../lib/logger';

// JSON to CSV converters deal unpredictably with nested JSON. We want to dump values from our JSONB fields into
// a single CSV column instead making every key in them into a new column - that would break CSV conversion because
// custom keys in jsonb fields don't match between different rows.
// We can take care of this by converting the JSON value from the nested field into a string.
const JSONBCOLUMNS = {
  actions: ['form_data'],
  calls: ['target_call_info'],
  form_elements: ['choices'],
  pending_actions: ['data'],
};

function jsonbToString(rows, tableName) {
  _forEach(JSONBCOLUMNS[tableName], function(column) {
    _forEach(rows, function(row) {
      row[column] = JSON.stringify(row[column]);
    });
  });
  return rows;
}

const logger = new OperationsLogger({
  namespace: 'MEMBERS_SERVICE',
  tableName: process.env.DB_LOG_TABLE || '',
  client: new DocumentClient(),
});

export const handlerFunc = (
  event: any,
  context: any,
  callback: any,
  getData = subjectAccessData
) => {
  // Get first item
  const [item] = event.Records;
  const record = Converter.unmarshall(item.dynamodb.NewImage);

  if (!subjectAccessRequestEvent(item.eventName, record)) {
    return;
  }

  getData(record.data.email)
    .then(
      resp => {
        _forOwn(resp.data, function(val, key) {
          val = jsonbToString(val, key);
          // check if 'key' is in jsonb tables hash - early return if not
          // map over val - call to.string on columns that are listed on JSONB tables hash

          json2csv(val, function(error, csv) {
            console.log('Filename: ', key);
            console.log('ERROR: ', error);
            if (error)
              throw new Error(
                'Error converting Champaign subject access data to CSV format'
              );
            console.log('CSV: ', csv);
          });
        });
      },
      err => {
        throw new Error('Failed fetching Champaign subject access data');
      }
    )
    .catch(err => {
      console.log('In the catch block');
      console.log(err);
    });
};

export const handler = log(handlerFunc);
