import 'source-map-support/register';
import { pick } from 'lodash';
import { validateRequest } from '../lib/request-validator';
import {
  badRequest,
  notFound,
  ok,
  response,
} from '../lib/lambda-utils/responses';
import {
  search as searchMember,
  find,
  update as updateMember,
  unsubscribe as unsubscribeMember,
} from '../lib/clients/actionkit/resources/users';
import {
  LIST_MEMBERS_SCHEMA,
  SHOW_MEMBER_SCHEMA,
  UNSUBSCRIBE_MEMBER_SCHEMA,
  UPDATE_MEMBER_SCHEMA,
} from './request-schemas';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export function index(event, context, callback, search = searchMember) {
  const permittedParams = Object.keys(LIST_MEMBERS_SCHEMA.properties);
  return validateRequest(LIST_MEMBERS_SCHEMA, event.queryStringParameters).then(
    params =>
      search(pick(params, permittedParams)).then(
        result => callback(null, response(result)),
        error => callback(null, response(error))
      ),
    error => callback(null, badRequest({ cors: true, body: error }))
  );
}

export function show(event, context, callback, _find = find) {
  const parameters = {
    ...event.pathParameters,
    ...event.queryStringParameters,
  };
  return validateRequest(SHOW_MEMBER_SCHEMA, parameters).then(
    params =>
      _find(params.id).then(
        result => callback(null, response(result)),
        error => callback(null, response(error))
      ),
    errors => callback(null, badRequest({ cors: true, body: errors }))
  );
}

export function update(event, context, callback) {
  const parameters = {
    ...event.pathParameters,
    ...JSON.parse(event.body),
  };
  const { id, ...data } = parameters;
  return validateRequest(UPDATE_MEMBER_SCHEMA, parameters).then(
    params => {
      updateMember(id, data).then(
        result => callback(null, response(result)),
        error => callback(null, response(error))
      );
    },
    errors => callback(null, badRequest({ cors: true, body: errors }))
  );
}

export function unsubscribe(event, context, callback) {
  const { email, page } = JSON.parse(event.body);

  const data = {
    page: page,
    email: email,
  };

  return validateRequest(UNSUBSCRIBE_MEMBER_SCHEMA, data)
    .then(result => unsubscribeMember(data.email, data.page))
    .then(actionkitResult => {
      logUnsubscribeEvent(data);
      return callback(null, response({ cors: true }));
    })
    .catch(err => {
      return callback(null, badRequest({ cors: true, body: err }));
    });
}

export function logUnsubscribeEvent(data) {
  const logger = new OperationsLogger({
    namespace: 'MEMBERS',
    tableName: process.env.DB_LOG_TABLE,
    client: new DocumentClient(),
  });
  return logger.log({
    event: 'EMAIL_UNSUBSCRIBE',
    data: { email: data.email },
  });
}
