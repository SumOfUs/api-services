// @flow
import type { Context, Callback } from 'flow-aws-lambda';

interface DynamoDBEvent {
  NextShardIterator?: string;
  Records: DynamoDBEventRecord[];
}
interface DynamoDBEventRecord {
  awsRegion?: string;
  dynamodb: StreamRecord;
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE';
  eventSource: 'aws:dynamodb';
  eventVersion?: string;
}
type StreamRecord = {
  ApproximateCreationDateTime: string, // timestamp
  Keys: AttributeValueMap,
  NewImage: AttributeValueMap,
  OldImage: AttributeValueMap,
  SequenceNumber: string,
  SizeBytes: number,
  StreamViewType:
    | 'NEW_IMAGE'
    | 'OLD_IMAGE'
    | 'NEW_AND_OLD_IMAGES'
    | 'KEYS_ONLY',
};
type AttributeValueMap = { [key: string]: AttributeValue };
type AttributeValue =
  | { B: string }
  | { BOOL: boolean }
  | { BS: string }
  | { L: AttributeValue[] }
  | { M: AttributeValueMap }
  | { N: string }
  | { NS: string[] }
  | { NULL: boolean }
  | { S: string }
  | { SS: string[] };
type DynamoDBKeys = {};

export function handler(e: DynamoDBEvent, ctx: Context, cb: Callback) {
  console.log('[ updating member on champaign ]', JSON.stringify(e, null, 2));
  return cb(undefined, e.Records);
}
