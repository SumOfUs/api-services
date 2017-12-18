import AWS from 'aws-sdk';
const documentClient = new AWS.DynamoDB.DocumentClient();

export default (id, createdAt, state, platform) => {
  const params = {
    TableName: process.env.DB_LOG_TABLE,
    Key: {
      id: id,
      createdAt: createdAt,
    },
    UpdateExpression: 'set #s.#platform = :state',
    ExpressionAttributeNames: { '#s': 'status', '#platform': platform },
    ExpressionAttributeValues: {
      ':state': state,
    },
  };

  documentClient
    .update(params)
    .promise()
    .then(resp => console.log(resp))
    .catch(err => console.log(err));
};
