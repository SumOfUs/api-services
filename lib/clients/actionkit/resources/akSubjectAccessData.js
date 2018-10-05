// @flow weak
import { AKMysqlClient } from './mysqlClient';
import fs from 'fs';
import { subjectAccessQueries } from './subjectAccessQueries/subjectAccessQueries';

export function AKSubjectAccessData(email) {
  console.log('In the AK data function');

  //const query = `SELECT * FROM ak_sumofus.core_action action
  //JOIN ak_sumofus.core_user ON action.user_id = ak_sumofus.core_user.id
  //LEFT JOIN ak_sumofus.core_actionfield actionfield ON actionfield.parent_id = action.id
  //WHERE ak_sumofus.core_user.email=?`;

  //const query = fs.readFileSync('/lib/clients/actionkit/resources/subjectAccessQueries/actions.sql').toString();
  const queryHash = subjectAccessQueries();

  console.log('GOT ME HASH: ', queryHash);

  AKMysqlClient.connect();
  AKMysqlClient.query(query, [email], function(error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
    console.log('RESULTS: ', results);
  });
  AKMysqlClient.end();
}
