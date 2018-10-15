import AWS from 'aws-sdk';

export function sendEmail(url, recipient, email, processor) {
  const ses = new AWS.SES({ region: 'us-west-2' });

  const params = {
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Html: {
          Data: `<p>Click the link below to download the ${
            processor
          } subject access data for ${
            email
          } (link will expire in 10 minutes):</p><p><a href="${
            url
          }">Click here to download</a></p>`,
          Charset: 'UTF-8',
        },
      },
      Subject: {
        Data: `${processor} subject access data for ${email}`,
        Charset: 'UTF-8',
      },
    },
    Source: 'no-reply@sumofus.awsapps.com',
  };
  return ses.sendEmail(params).promise();
}
