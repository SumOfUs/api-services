import { post } from 'axios-es6';
import AWS from 'aws-sdk';
import updateOperationsLog from './updateOperationsLog';

const documentClient = new AWS.DynamoDB.DocumentClient();
const CANCEL_PAYMENT_EVENT = 'PAYMENT_SERVICE:SUBSCRIPTION:CANCEL';

const validEventType = record => {
  if (record.eventName !== 'INSERT') return false;
  if (record.dynamodb.NewImage.eventType.S !== CANCEL_PAYMENT_EVENT)
    return false;

  return true;
};

export const handler = (event, context, callback) => {
  if (!validEventType(event.Records[0])) {
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
