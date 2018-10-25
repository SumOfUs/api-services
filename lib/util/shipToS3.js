// @flow weak
import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';

// Sends a file to a specified bucket on S3. Returns a promise that resolves with a temporary signed URL to the object
// that is valid for 10 minutes.
export function shipToS3(file, bucket) {
  return new Promise(function(resolve, reject) {
    const readStream = fs.createReadStream(file);
    const key = path.parse(file).base;
    resolve({ Body: readStream, Key: key, Bucket: bucket });
  }).then(function(params) {
    const signedUrlExpireSeconds = 60 * 10; // 10 minutes
    const s3 = new AWS.S3();
    return s3
      .upload(params)
      .promise()
      .then(function(_) {
        return s3.getSignedUrl('getObject', {
          Bucket: params.Bucket,
          Key: params.Key,
          Expires: signedUrlExpireSeconds,
        });
      });
  });
}
