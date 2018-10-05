// @flow weak
import { AKMysqlClient } from './mysqlClient';
import fs from 'fs';
import { subjectAccessQueryParser } from './subjectAccessQueries/subjectAccessQueries';
const Json2csvParser = require('json2csv').Parser;

export function AKSubjectAccessData(email) {
  AKMysqlClient.connect();

  subjectAccessQueryParser().forEach(function(query, name) {
    AKMysqlClient.query(
      {
        values: [email],
        sql: query,
        options: { sql: '...', nestTables: '_' },
      },
      function(error, results, fields) {
        if (error) throw error;
        console.log(JSON.stringify(results[0]));

        //const json2csvParser = new Json2csvParser({results[0]});
        const csv = json2csvParser.parse(results[0]);

        console.log(csv);
        //results.forEach(function(row, i) {
        //  //console.log(row.keys);
        //  //console.log(row.keys());
        //  console.log(JSON.stringify(row));
        //})
      }
    );
  });

  AKMysqlClient.end();
}
