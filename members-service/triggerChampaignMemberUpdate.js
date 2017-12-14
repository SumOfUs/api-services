// @flow weak
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { updateMember } from '../lib/clients/champaign/member';
import { DynamoDBStreams } from 'aws-sdk';

const logger = new OperationsLogger({
  namespace: 'MEMBERS',
  tableName: process.env.DB_LOG_TABLE || '',
});

export function handler(e, ctx, cb) {
  console.log('[ updating member on champaign ]', JSON.stringify(e, null, 2));

  e.Records;

  return cb(undefined, e.Records);
}
