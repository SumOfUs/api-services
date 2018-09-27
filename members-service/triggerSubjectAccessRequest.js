// @flow weak
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { subjectAccessRequestEvent } from '../lib/dynamodb/eventTypeChecker';
import log from '../lib/logger';

const logger = new OperationsLogger({
  namespace: 'MEMBERS',
  tableName: process.env.DB_LOG_TABLE || '',
  client: new DocumentClient(),
});

export const handlerFunc = (event: any, context: any, callback: any) => {
  const payload = event.body ? JSON.parse(event.body) : {};
  const parameters = {
    ...event.pathParameters,
    ...payload,
  };

  return validateRequest(DATA_ACCESS_REQUEST_SCHEMA, parameters).then(
    params => {
      return logger.log({
        event: 'MEMBER:SUBJECT_ACCESS_REQUEST',
        data: {
          email: parameters.email,
        },
        status: { actionkit: 'PENDING', champaign: 'PENDING' },
      });
    },
    errors => {
      callback(null, badRequest({ cors: true, body: errors }));
    }
  );
};

export const handler = log(handlerFunc);
