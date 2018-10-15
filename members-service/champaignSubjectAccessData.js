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
  getData = subjectAccessData
) => {
  // Get first item
  const [item] = event.Records;
  const record = Converter.unmarshall(item.dynamodb.NewImage);

  if (
    !subjectAccessRequestEvent(item.eventName, record) ||
    record.status.champaign == 'SUCCESS'
  ) {
    return callback(null, 'Not a pending subject access request event.');
  }

  return getData(record.data.email)
    .then(resp => {
      const ProcessSubjectAccessRequest = SARconstructor();
      return ProcessSubjectAccessRequest(
        resp.data,
        'champaign',
        record.data.email
      );
    })
    .then(success => {
      return logger
        .updateStatus(record, { champaign: 'SUCCESS' })
        .then(dynamodbSuccess => {
          console.log(
            'SUCCESSFUL SUBJECT ACCESS REQUEST EVENT - call callback with: ',
            success,
            ' callback: ',
            callback
          );
          return callback(null, success);
        })
        .catch(dynamodbError => {
          return callback(dynamodbError);
        });
    })
    .catch(err => {
      console.log('FAILURE!', err);
      return logger
        .updateStatus(record, { champaign: 'FAILURE' })
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
