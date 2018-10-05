// @flow weak
import fs from 'fs';

export function subjectAccessQueryParser() {
  console.log('DIRECTORY: ', __dirname);
  console.log('process directory', process.cwd());

  fs.readdir('./sqlQueries', function(err, files) {
    console.log('QUERY PARSER WOO WOO Queries: ', files);
    // construct hash where key is file names without extension and value is fs.readFileSync(file).toString();
  });
}

//const query = fs.readFileSync('actions.sql').toString();

export const subjectAccessQueries = subjectAccessQueryParser();
