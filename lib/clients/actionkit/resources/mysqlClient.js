// @flow weak
import mysql from 'mysql';

const AKConfig = {
  host: process.env.AK_MYSQL_HOST,
  user: process.env.AK_MYSQL_USER,
  password: process.env.AK_MYSQL_PWD,
};

// when using, call:
// AkMysqlClient.connect();
// AkMysqlClient.query(queryString, callback);
// AKMysqlClient.end();
export const AKMysqlClient = mysql.createConnection(AKConfig);
