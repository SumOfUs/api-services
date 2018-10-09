// @flow weak
import { AKMysqlClient } from './mysqlClient';
import fs from 'fs';
import { subjectAccessQueryParser } from './subjectAccessQueries/subjectAccessQueries';
import { json2csv } from 'json-2-csv';

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
        if (error)
          throw new Error('Error fetching Subject access data from ActionKit');

        console.log(JSON.stringify(results[0]));

        json2csv(results[0], function(error, csv) {
          console.log('ERROR: ', error);
          if (error)
            throw new Error(
              'Error converting AK subject access data to CSV format'
            );
          console.log('CSV: ', csv);
        });
      }
    );
  });

  AKMysqlClient.end();
}
