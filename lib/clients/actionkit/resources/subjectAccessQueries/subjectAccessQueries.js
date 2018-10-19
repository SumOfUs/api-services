// @flow weak
import fs from 'fs';
import path from 'path';

//Require sql files with AK SAR queries
//$FlowFixMe
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
