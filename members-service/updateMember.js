// @flow
import 'source-map-support/register';
import log from '../lib/logger';
import type { ProxyCallback } from 'flow-aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { validateRequest } from '../lib/request-validator';
import { response, badRequest, ok } from '../lib/lambda-utils/responses';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';

import { update } from '../lib/clients/actionkit/resources/users';
import { UPDATE_MEMBER_SCHEMA } from './request-schemas';

const logger = new OperationsLogger({
  namespace: 'MEMBERS_SERVICE',
  tableName: process.env.DB_LOG_TABLE || 'OperationsTable',
  client: new DocumentClient(),
});

export const handlerFunc = (event: any, context: any, callback: any) => {
  const payload = event.body ? JSON.parse(event.body) : {};
  const parameters = {
    ...event.pathParameters,
    ...payload,
  };

  return validateRequest(UPDATE_MEMBER_SCHEMA, parameters).then(
    params => {
      update(parameters.id, parameters.member)
        .then(result => {
          logger.log({
            event: 'MEMBER:UPDATE',
            data: {
              akId: parameters.id,
              email: parameters.email,
              params: parameters.member,
            },
            status: { actionkit: 'SUCCESS', champaign: 'PENDING' },
          });
          return result;
        })
        .then(
          result => callback(null, response({ cors: true, body: result })),
          error => callback(null, response({ cors: true, body: error }))
        );
    },
    errors => callback(null, badRequest({ cors: true, body: errors }))
  );
};

export const handler = log(handlerFunc);
