// @flow weak
import { validateRequest } from '../lib/request-validator';
import { ok, badRequest, serverError } from '../lib/lambda-utils/responses';
import { searchGCSubscriptions } from '../lib/services/gocardless';
import log from '../lib/logger';

export const indexFunc = (event, context, callback) => {
  return searchGCSubscriptions(event.pathParameters.id)
    .then(data => callback(null, ok({ cors: true, body: data })))
    .catch(errors => {
      callback(null, serverError({ cors: true, body: errors }));
    });
};

export const index = log(indexFunc);
