// @flow weak
// establish connection with AK db, run query
// then break down the query results into csv
// then zip the csv
// then upload the csv to an s3 bucket
// then update the operations log table
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { DocumentClient, Converter } from 'aws-sdk/clients/dynamodb';
import { subjectAccessRequestEvent } from '../lib/dynamodb/eventTypeChecker';
import { AKSubjectAccessData } from '../lib/clients/actionkit/resources/akSubjectAccessData';
import { SARconstructor } from '../lib/util/processSubjectAccessRequest';

import log from '../lib/logger';

const logger = new OperationsLogger({
  namespace: 'MEMBERS_SERVICE',
  tableName: process.env.DB_LOG_TABLE || '',
  client: new DocumentClient(),
});

export const handlerFunc = (
  event: any,
  context: any,
  callback: any,
  getData = AKSubjectAccessData
) => {
  // Get first item
  const [item] = event.Records;
  const record = Converter.unmarshall(item.dynamodb.NewImage);

  if (
    !subjectAccessRequestEvent(item.eventName, record) ||
    record.status.actionkit == 'SUCCESS'
  ) {
    return callback(null, 'Not a pending subject access request event.');
  }

  return getData(record.data.email)
    .then(resp => {
      const processSubjectAccessRequest = SARconstructor();
      return processSubjectAccessRequest(resp, 'actionkit', record.data.email);
    })
    .then(success => {
      return logger
        .updateStatus(record, { actionkit: 'SUCCESS' })
        .then(dynamodbSuccess => {
          return callback(null, success);
        })
        .catch(dynamodbError => {
          return callback(dynamodbError);
        });
    })
    .catch(err => {
      return logger
        .updateStatus(record, { actionkit: 'FAILURE' })
        .then(dynamodbSuccess => {
          return callback(err);
        })
        .catch(dynamodbError => {
          // Wow, nothing is going right today. The request failed AND DynamoDB didn't update the record.
          return callback(dynamodbError);
        });
    });
};

export const handler = log(handlerFunc);
