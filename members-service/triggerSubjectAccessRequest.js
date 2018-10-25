// @flow weak
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { validateRequest } from '../lib/request-validator';
import { SUBJECT_ACCESS_REQUEST_SCHEMA } from './request-schemas';
import { response, badRequest } from '../lib/lambda-utils/responses';

import log from '../lib/logger';

const logger = new OperationsLogger({
  namespace: 'MEMBERS_SERVICE',
  tableName: process.env.DB_LOG_TABLE || '',
  client: new DocumentClient(),
});

export const handlerFunc = (event: any, context: any, callback: any) => {
  const payload = event.body ? JSON.parse(event.body) : {};
  const parameters = {
    ...event.pathParameters,
    ...payload,
  };

  return validateRequest(SUBJECT_ACCESS_REQUEST_SCHEMA, parameters)
    .then(params => {
      return logger.log({
        event: 'MEMBER:SUBJECT_ACCESS_REQUEST',
        data: {
          email: parameters.email,
        },
        status: { actionkit: 'PENDING', champaign: 'PENDING' },
      });
    })
    .then(res => {
      return callback(null, response({ cors: true, body: res }));
    })
    .catch(err => {
      return callback(null, badRequest({ cors: true, body: err }));
    });
};

export const handler = log(handlerFunc);
