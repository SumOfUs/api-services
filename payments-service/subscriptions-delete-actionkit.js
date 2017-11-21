import AWS from 'aws-sdk';

export const handler = (event, context, callback) => {
  // /rest/v1/profilecancelpush/
  console.log(JSON.stringify(event, null, 2));
};
