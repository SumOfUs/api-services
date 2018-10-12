// @flow weak
import { AKMysqlClient } from './mysqlClient';
import fs from 'fs';
import { subjectAccessQueryParser } from './subjectAccessQueries/subjectAccessQueries';
import { json2csv } from 'json-2-csv';

export function AKSubjectAccessData(email) {
  console.log('UH OH, ACTUALLY CONNECTING TO MYSQL');
  AKMysqlClient.connect();

  return (
    executeQueries(AKMysqlClient, subjectAccessQueryParser(), [email])
      // there is no .finally() in AWS Lambda's version of Node, so we'll need both a then and a catch block to make sure
      // that the client is closed
      .then(function(res) {
        AKMysqlClient.end();
        return res;
      })
      .catch(function(err) {
        AKMysqlClient.end();
        throw err;
      })
  );
}

function executeQueries(client, queries, params) {
  var AKData = [];
  queries.forEach(function(query, tableName) {
    const x = singleQuery(client, query, params).then(function(res) {
      return { [tableName]: res };
    });
    AKData.push(x);
  });

  // Promise.all(AKData) resolves into a promise of an array of data objects where the key is the table name and value
  // is an array of objects that represents the rows in the query result. We then transform this into a single JSON
  // object so we can reuse code between the Champaign and AK handlers
  return Promise.all(AKData).then(function(arr) {
    const dataObject = arr.reduce(function(acc, val) {
      const key = Object.keys(val)[0];
      acc[key] = val[key];
      return acc;
    }, {});
    return dataObject;
  });
}

// We need to have a function that runs a single query and returns a promise so we can resolve them all at the same
// time. Running them all in a loop does not work because client.query returns immediately and adding data to AKData
// in the callback therefore didn't work.
function singleQuery(client, query, params) {
  return new Promise(function(resolve, reject) {
    client.query(
      {
        values: params,
        sql: query,
        options: { sql: '...', nestTables: '_' },
      },
      function(error, results, fields) {
        if (error)
          reject(
            new Error(
              'Error fetching Subject access data from ActionKit: ',
              error
            )
          );
        resolve(results);
      }
    );
  });
}
