import { post } from 'axios-es6';
import AWS from 'aws-sdk';

const documentClient = new AWS.DynamoDB.DocumentClient();

export const handler = (event, context, callback) => {
  const record = event.Records[0].dynamodb.NewImage;
  const recurringId = record.data.recurringId.S;
  const id = record.id.S;
  const createdAt = record.createdAt.S;

  const url = `https://${process.env.AK_USERNAME}:${
    process.env.AK_PASSWORD
  }@act.sumofus.org/rest/v1/profilecancelpush/`;

  const data = JSON.stringify({
    recurring_id: recurringId,
    canceled_by: 'admin',
  });

  const params = {
    TableName: process.env.DB_LOG_TABLE,
    Key: {
      id: id,
      createdAt: createdAt,
    },
    UpdateExpression: 'set #s.#ak = :success',
    ExpressionAttributeNames: { '#s': 'status', '#ak': 'actionkit' },
    ExpressionAttributeValues: {
      ':success': 'PENDING',
    },
  };

  documentClient
    .update(params)
    .promise()
    .then(resp => console.log(resp))
    .catch(err => console.log(err));

  return;

  post(url, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(resp => {
      const params = {
        TableName: process.env.DB_LOG_TABLE,
        Item: {
          id: id,
          createdAt: createdAt,
          status: {
            braintree: 'SUCCESS',
            actionkit: 'PENDING',
            champaign: 'PENDING',
          },
        },
      };
    })
    .catch(function(error) {
      console.log(error);
    });
};
