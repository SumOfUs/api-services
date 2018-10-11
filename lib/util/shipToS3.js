// @flow weak
import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';

// Sends a file to a specified bucket on S3. Returns a promise that resolves with a temporary signed URL to the object
// that is valid for 10 minutes.
export function shipToS3(file, bucket) {
  const s3 = new AWS.S3();

  const signedUrlExpireSeconds = 60 * 10; // 10 minutes
  const key = path.parse(file).base;
  const readStream = fs.createReadStream(file);

  const params = {
    Bucket: bucket, // 'subjectAccessRequests'
    Key: key, // e.g. tuuli@sumofus.org-champaign.zip
    Body: readStream,
  };

  return s3
    .upload(params)
    .promise()
    .then(function(_) {
      return s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: signedUrlExpireSeconds,
      });
    });
}
