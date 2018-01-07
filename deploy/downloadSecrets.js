#!/usr/bin/env node
const getParametersByPath = require('./parametersStoreClient');
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

getParametersByPath(options['secrets-path'], options['aws-region'])
  .then(function(secrets) {
    secrets.forEach(function(secret) {
      console.log(`export ${secret[0]}='${secret[1]}'`);
    });
  })
  .catch(function(error) {
    throw error;
  });
