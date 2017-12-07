// @flow
import type { Context, Callback } from 'flow-aws-lambda';

interface DynamoDBEvent {
  NextShardIterator?: string;
  Records: DynamoDBEventRecord[];
}
interface DynamoDBEventRecord {
  awsRegion?: string;
  dynamodb: {};
}
type StreamRecord = {
  ApproximateCreationDateTime: string, // timestamp
  Keys: { [key: string]: AttributeValue },
};
type AttributeValue = any;
type DynamoDBKeys = {};

export function handler(e: DynamoDBEvent, ctx: Context, cb: Callback) {
  return cb(undefined, e.Records);
}
