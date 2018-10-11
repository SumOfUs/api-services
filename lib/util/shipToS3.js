// @flow weak
import AWS from 'aws-sdk';
import path from 'path';

export function shipToS3(file, bucket, keyPrefix) {
  const s3 = new AWS.S3();

  const signedUrlExpireSeconds = 60 * 10; // 10 minutes
  const base64Data = new Buffer(file, 'Binary');
  const key = `${keyPrefix}/${path.parse(file).base}`;

  const params = {
    Bucket: bucket, // 'subjectAccessRequests'
    Key: key, // champaign/tuuli@sumofus.org-champaign.zip
    Body: base64Data,
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
