// @flow weak
import 'source-map-support/register';
import pick from 'lodash/pick';
import { get } from 'axios-es6';
import { validateRequest } from '../shared/request-validator';
import { ok, notFound, badRequest } from '../shared/lambda-utils/responses';
import { searchUser } from './providers/actionkit/user';
import {
  LIST_MEMBERS_SCHEMA,
  SHOW_MEMBER_SCHEMA,
  UNSUBSCRIBE_MEMBER_SCHEMA,
  UPDATE_MEMBER_SCHEMA,
} from './request-schemas';

export function index(event, context, callback) {
  validateRequest(LIST_MEMBERS_SCHEMA, event.queryStringParameters).then(
    params => {
      searchUser(pick(params, ...Object.keys(LIST_MEMBERS_SCHEMA.properties)))
        .then(result => callback(null, result))
        .catch(failure => callback(null, { cors: true, body: failure.data }));
    },
    errors => callback(null, badRequest({ cors: true, body: errors }))
  );
}

export function show(event, context, callback) {
  const parameters = {
    ...event.pathParameters,
    ...event.queryStringParameters,
  };
  return validateRequest(SHOW_MEMBER_SCHEMA, parameters).then(
    params => {
      callback(
        null,
        ok({
          body: {
            message: 'Go Serverless Webpack (Ecma Script) v1.0! First module!',
            event,
          },
        })
      );
    },
    errors => {
      callback(null, badRequest({ cors: true, body: errors }));
    }
  );
}

export function update(event, context, callback) {
  validateRequest(UPDATE_MEMBER_SCHEMA, event.queryStringParameters).then(
    params => {
      callback(null, {
        message: 'Go Serverless Webpack (Ecma Script) v1.0! First module!',
        event,
      });
    },
    errors => callback(null, badRequest({ cors: true, body: errors }))
  );
}

export function unsubscribe(event, context, callback) {
  const parameters = {
    ...event.pathParameters,
    ...event.queryStringParameters,
  };
  validateRequest(UNSUBSCRIBE_MEMBER_SCHEMA, parameters).then(
    params => {
      console.log(alo);
      callback(null, {
        message: 'Go Serverless Webpack (Ecma Script) v1.0! First module!',
        event,
      });
    },
    errors => callback(null, badRequest({ cors: true, body: errors }))
  );
}