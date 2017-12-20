// @flow
import 'source-map-support/register';
import type { ProxyCallback } from 'flow-aws-lambda';
import uuidv4 from 'uuid/v4';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { validateRequest } from '../lib/request-validator';
import { badRequest, response } from '../lib/lambda-utils/responses';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';

import { update } from '../lib/clients/actionkit/resources/users';
import { UPDATE_MEMBER_SCHEMA } from './request-schemas';

const logger = new OperationsLogger({
  namespace: 'MEMBERS_SERVICE',
  tableName: process.env.DB_LOG_TABLE || 'OperationsTable',
  client: new DocumentClient(),
});

export function handler(event: any, context: any, callback: any) {
  const parameters = {
    ...event.pathParameters,
    ...JSON.parse(event.body),
  };
  const { id, ...data } = parameters;
  return validateRequest(UPDATE_MEMBER_SCHEMA, parameters).then(
    params => {
      update(id, data)
        .then(result => {
          logger.log({
            event: 'MEMBER:UPDATE',
            data,
            status: { actionkit: 'SUCCESS', champaign: 'PENDING' },
          });
          return result;
        })
        .then(
          result => callback(null, response(result)),
          error => callback(null, response(error))
        );
    },
    errors => callback(null, badRequest({ cors: true, body: errors }))
  );
}
