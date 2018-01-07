const AWS = require('aws-sdk');

const getParametersByPath = function(path, awsRegion, nextToken = null) {
  const ssm = new AWS.SSM({ region: awsRegion });
  let params = { Path: path };
  if (nextToken !== null) params.NextToken = nextToken;

  return new Promise(function(resolve, reject) {
    ssm.getParametersByPath(params, function(err, data) {
      if (err) reject(err);
      else {
        let secrets = parse(data);
        if (data.NextToken) {
          getParametersByPath(path, awsRegion, data.NextToken).then(function(
            nextSecrets
          ) {
            resolve(secrets.concat(nextSecrets));
          });
        } else {
          resolve(secrets);
        }
      }
    });
  });
};

function parse(data) {
  const secrets = [];
  data.Parameters.forEach(function(secret) {
    const name = secret.Name.replace(/^.*\//, '');
    const value = secret.Value;
    secrets.push([name, value]);
  });
  return secrets;
}

module.exports = getParametersByPath;
