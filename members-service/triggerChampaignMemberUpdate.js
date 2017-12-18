// @flow weak
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { updateMember } from '../lib/clients/champaign/member';
import { DocumentClient, Converter } from 'aws-sdk/clients/dynamodb';

const logger = new OperationsLogger({
  namespace: 'MEMBERS',
  tableName: process.env.DB_LOG_TABLE || '',
  client: new DocumentClient(),
});

export async function handler(e, ctx, cb) {
  console.log('[ updating member in champaign ]', JSON.stringify(e, null, 2));
  const [item] = e.Records;
  const record = Converter.unmarshall(item.dynamodb.NewImage);

  try {
    const result = await updateMember(record.data);
    logger.updateStatus(record, { champaign: 'SUCCESS' });
    console.log('[ updated member in champaign ]', JSON.stringify(e, null, 2));
    return cb(null, result);
  } catch (e) {
    logger.updateStatus(record, { champaign: 'FAILURE' });
    console.log('[ failed updating member in champaign ]', JSON.stringify(e));
    cb(e);
  }
}
