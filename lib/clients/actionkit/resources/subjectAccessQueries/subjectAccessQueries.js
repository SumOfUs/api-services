// @flow weak
import fs from 'fs';
import query from './sqlQueries/actions.sql';
import path from 'path';
const queryFiles = require.context('./sqlQueries', true, /\.sql$/);

export function subjectAccessQueryParser() {
  var queryMap = new Map();
  queryFiles.keys().forEach(function(filename) {
    // set file name (e.g. 'action') to a string made out of the corresponding query
    queryMap.set(
      path.parse(filename).name,
      fs.readFileSync(queryFiles(filename)).toString()
    );
  });
  return queryMap;
}
