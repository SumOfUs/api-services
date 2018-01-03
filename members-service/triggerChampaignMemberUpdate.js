// @flow weak
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { updateMember } from '../lib/clients/champaign/member';
import { DocumentClient, Converter } from 'aws-sdk/clients/dynamodb';
import { updateMemberEvent } from '../lib/dynamodb/eventTypeChecker';

const logger = new OperationsLogger({
  namespace: 'MEMBERS',
  tableName: process.env.DB_LOG_TABLE || '',
  client: new DocumentClient(),
});

export async function handler(e, ctx, cb, fn = updateMember) {
  const [item] = e.Records;
  const record = Converter.unmarshall(item.dynamodb.NewImage);
  if (!updateMemberEvent(record)) return cb(null, 'Not a member update event');

  try {
    const result = await fn(record.data);
    logger.updateStatus(record, { champaign: 'SUCCESS' });
    return cb(null, result);
  } catch (e) {
    logger.updateStatus(record, { champaign: 'FAILURE' });
    cb(e);
  }
}
