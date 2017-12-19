
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

export function unsubscribe_page() {
  const page = process.env.UNSUBSCRIBE_PAGE_NAME;
  if (!page) {
    return Promise.reject(new Error('Unsubscribe page needs to be set.'));
  }
  return Promise.resolve(page);
}

export function unsubscribe(event, context, callback, page = unsubscribe_page) {
  return page()
    .then(pageResult => {
      return {
        page: pageResult,
        email: JSON.parse(event.body).email,
      };
    })
    .then(data => {
      const logger = new OperationsLogger({
        namespace: 'MEMBERS',
        tableName: process.env.DB_LOG_TABLE,
        client: new DocumentClient(),
      });
      return validateRequest(UNSUBSCRIBE_MEMBER_SCHEMA, data)
        .then(result => unsubscribeMember(data))
        .then(actionkitResult => {
          logger.log({
            event: 'EMAIL_UNSUBSCRIBE',
            data: { email: data.email },
          });
        })
        .then(dynamodbResult => {
          return callback(null, response(result));
        });
    })
    .catch(err => {
      return callback(null, badRequest({ cors: true, body: err }));
    });
}
