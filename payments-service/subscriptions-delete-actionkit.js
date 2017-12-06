import { post } from 'axios';
import updateOperationsLog from './updateOperationsLog';
import { cancelPaymentEvent } from '../shared/dynamodb/eventTypeChecker';

export const handler = (event, context, callback) => {
  if (!cancelPaymentEvent(event.Records[0])) {
    return;
  }

  const record = event.Records[0].dynamodb.NewImage;

  const recurringId = record.data.M.recurringId.S;
  const id = record.id.S;
  const createdAt = record.createdAt.S;

  const url = `https://${process.env.AK_USERNAME}:${
    process.env.AK_PASSWORD
  }@act.sumofus.org/rest/v1/profilecancelpush/`;

  const data = JSON.stringify({
    recurring_id: recurringId,
    canceled_by: 'admin',
  });

  post(url, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(resp => {
      updateOperationsLog(id, createdAt, 'SUCCESS', 'actionkit');
    })
    .catch(function(error) {
      updateOperationsLog(id, createdAt, 'FAILURE', 'actionkit');
    });
};
