// @flow weak
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { updateMember } from '../lib/clients/champaign/member';
import { DocumentClient, Converter } from 'aws-sdk/clients/dynamodb';
import { updateMemberEvent } from '../lib/dynamodb/eventTypeChecker';
import log from '../lib/logger';

const logger = new OperationsLogger({
  namespace: 'MEMBERS_SERVICE',
  tableName: process.env.DB_LOG_TABLE || '',
  client: new DocumentClient(),
});

async function update(item, fn = updateMember) {
  const record = Converter.unmarshall(item.dynamodb.NewImage);

  if (!updateMemberEvent(item.eventName, record)) {
    console.error('ERROR: Not a member update event');
    return;
  }

  try {
    const result = await fn(record.data.email, record.data.params);
    logger.updateStatus(record, { champaign: 'SUCCESS' });
  } catch (e) {
    logger.updateStatus(record, { champaign: 'FAILURE', champaign_error: e });
  }
}

export async function handlerFunc(e, ctx, cb, memberUpdater = updateMember) {
  e.Records.forEach(item => {
    update(item, memberUpdater);
  });

  cb(null);
}

export const handler = log(handlerFunc);
