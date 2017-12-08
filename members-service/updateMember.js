import 'source-map-support/register';
import type { ProxyCallback } from 'flow-aws-lambda';
import uuidv4 from 'uuid/v4';
import AWS from 'aws-sdk';
import { validateRequest } from '../lib/request-validator';
import { badRequest, response } from '../lib/lambda-utils/responses';

import { update } from '../lib/actionkit/resources/users';
import { UPDATE_MEMBER_SCHEMA } from './request-schemas';

const documentClient = new AWS.DynamoDB.DocumentClient();

const logOperation = data => {
  const params = {
    TableName: process.env.DB_LOG_TABLE,
    Item: {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      eventType: 'MEMBERS:UPDATE',
      status: { actionkit: 'COMPLETE', champaign: 'PENDING' },
      data,
    },
  };

  documentClient
    .put(params)
    .promise()
    .then(resp => console.log('TABLE PUT RESPONSE:', resp))
    .catch(err => console.log('TABLE PUT ERROR', err));
};
export function handler(event, context, callback) {
  const parameters = {
    ...event.pathParameters,
    ...JSON.parse(event.body),
  };
  const { id, ...data } = parameters;
  return validateRequest(UPDATE_MEMBER_SCHEMA, parameters).then(
    params => {
      update(id, data)
        .then(result => {
          console.log('[ Writing operation to', process.env.DB_LOG_TABLE, ']', {
            id,
            data,
          });
          logOperation({ id, data });
          return result;
        })
        .then(
          result => {
            console.log('[ Responding to request ]', result);
            return callback(null, response(result));
          },
          error => callback(null, response(error))
        );
    },
    errors => callback(null, badRequest({ cors: true, body: errors }))
  );
}
