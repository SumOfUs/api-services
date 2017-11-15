import { validateRequest } from '../shared/request-validator';
import { ok } from '../shared/lambda-utils/responses';
import {
  LIST_SUBSCRIPTIONS_SCHEMA,
  DELETE_SUBSCRIPTIONS_SCHEMA,
} from './request-schemas';

export const index = (event, context, callback) => {
  callback(
    null,
    ok({
      body: {
        message: 'Go Serverless Webpack (Ecma Script) v1.0! First module!',
        event,
      },
    })
  );
};
