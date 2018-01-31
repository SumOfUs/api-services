'use strict';

/*
Script will create a stream subscription between a log group
and a lambda function (see arn, below).

ENV vars for ACCOUNT_ID and REGION are required.
*/

// ACCOUNT_ID=xxxxxxxxx STAGE=omar npm run

const AWS = require('aws-sdk');
const cloudwatchlogs = new AWS.CloudWatchLogs({ region: 'us-east-1' });
const accountId = process.env.ACCOUNT_ID;
const stage = process.env.STAGE;
const arn = `arn:aws:lambda:us-east-1:${accountId}:function:api-services-${
  stage
}-log-streamer`;

const subscribe = item => {
  let options = {
    destinationArn: arn,
    logGroupName: item.logGroupName,
    filterName: 'stream-logs',
    filterPattern: '',
  };

  setTimeout(() => {
    cloudwatchlogs
      .putSubscriptionFilter(options)
      .promise()
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  }, 1000);
};

var params = {
  logGroupNamePrefix: `/aws/lambda/api-services-${stage}`,
};

cloudwatchlogs
  .describeLogGroups(params)
  .promise()
  .then(data => {
    return data.logGroups.forEach(subscribe);
  });
