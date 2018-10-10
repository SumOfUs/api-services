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
import { processSubjectAccessRequest } from '../lib/util/processSubjectAccessRequest';

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

  if (!subjectAccessRequestEvent(item.eventName, record)) {
    //TODO: OR if AK status is 'success'
    return;
  }
  getData(record.data.email)
    .then(resp => {
      processSubjectAccessRequest(resp, 'actionkit', record.data.email);
      //TODO:
      //update operations log table
    })
    .catch(err => {
      console.log('In the catch block');
      console.log(err);
    });
};

export const handler = log(handlerFunc);
