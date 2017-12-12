import { validateRequest } from '../lib/request-validator';
import { ok, badRequest } from '../lib/lambda-utils/responses';
import { searchGCSubscriptions } from '../lib/services/gocardless';

export const index = (event, context, callback) => {
  return searchGCSubscriptions(event.pathParameters.memberId)
    .then(data => callback(null, ok({ cors: true, body: data })))
    .catch(errors => {
      callback(null, serverError({ cors: true, body: errors }));
    });
};
