// @flow weak

import fs from 'fs';
import archiver from 'archiver';
import { moveSync } from 'fs-extra';

export function zipCSVFiles(dir, filename) {
  var output = fs.createWriteStream(filename);
  var archive = archiver('zip', {
    zlib: { level: 9 },
  });

  archive.on('error', function(err) {
    return new Promise(function(resolve, reject) {
      reject(err);
    });
  });

  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.log('Archiver warning: ', err);
    } else {
      return new Promise(function(resolve, reject) {
        reject(err);
      });
    }
  });

  archive.pipe(output);
  archive.directory(dir, false);
  archive.finalize();
  const destPath = `${dir}/${filename}`;
  moveSync(filename, destPath, { overwrite: true });
  return new Promise(function(resolve, reject) {
    resolve(destPath);
  });
}
