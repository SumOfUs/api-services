import { ok, badRequest } from '../shared/lambda-utils/responses';
import braintree from '../shared/clients/braintree';
import guid from 'guid';
import AWS from 'aws-sdk';

export const handler = (event, context, callback) => {
  const id = event.pathParameters.id;
  const documentClient = new AWS.DynamoDB.DocumentClient();
  // braintree.subscription.cancel(id, (err, result) => {
  //   console.log(JSON.stringify(result, null, 2));
  // });
  console.log(process.env);

  const params = {
    TableName: process.env.DB_LOG_TABLE,
    Item: {
      id: guid.raw(),
      createdAt: new Date().toISOString(),
      event_type: 'PAYMENT_SERVICE:SUBSCRIPTION:CANCEL',
      payment_processor: 'braintree',
      status: {
        braintree: 'SUCCESS',
        actionkit: 'PENDING',
        champaign: 'PENDING',
      },
    },
  };

  // example of scaning a dynamodb Table
  // documentClient.scan({
  //   TableName : process.env.DB_LOG_TABLE,
  // }).promise()
  // .then((data) => {
  //   console.log(data.Items);
  // })

  documentClient
    .put(params)
    .promise()
    .then(
      data => {
        callback(
          null,
          ok({
            body: {
              message:
                'Go Serverless Webpack (Ecma Script) v1.0! First module!',
              event,
            },
          })
        );
      },
      err => console.log(err)
    )
    .catch(err => console.log(err));
};
