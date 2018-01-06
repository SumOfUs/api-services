#!/usr/bin/env node
const AWS = require('aws-sdk');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'secrets-path', alias: 'p', type: String, defaultOption: true },
  { name: 'aws-region', alias: 'r', type: String, defaultValue: 'us-west-2' },
  { name: 'help', alias: 'h' },
];
const options = commandLineArgs(optionDefinitions);

if (options.help !== undefined || !options['secrets-path']) {
  console.warn(
    `usage: ./downloadSecrets.js secrets-path [Options]

Options:
  -p or --secrets-path PATH
    AWS Parameter Store path (Required)
  -r or --aws-region REGION
    AWS region used to fetch params from (default: us-west-2)
  -h or --help
    Help`
  );
  process.exit(1);
}

const ssm = new AWS.SSM({ region: options['aws-region'] });

ssm.getParametersByPath({ Path: options['secrets-path'] }, function(err, data) {
  if (err) console.log(err, err.stack);
  else console.log(parse(data));
});

function parse(data) {
  const secrets = [];
  data.Parameters.forEach(function(secret) {
    const name = secret.Name.replace(/^.*\//, '');
    const value = secret.Value;
    secrets.push(`${name}='${value}'`);
  });
  return secrets.join('\n');
}
