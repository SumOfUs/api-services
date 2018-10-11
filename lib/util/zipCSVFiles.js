// @flow weak

import fs from 'fs';
import archiver from 'archiver';
import { moveSync } from 'fs-extra';

// Takes a directory and a name of a zip file, zips the directory into filename.zip, moves the resulting zipfile into
// the directory, and returns a promise that resolves to the complete path of the resulting zipfile.
export function zipCSVFiles(dir, filename) {
  return new Promise(function(resolve, reject) {
    var output = fs.createWriteStream(filename);
    var archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('error', function(err) {
      reject(err);
    });

    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.log('Archiver warning: ', err);
      } else {
        reject(err);
      }
    });

    archive.pipe(output);
    archive.directory(dir, false);
    archive.finalize();

    output.on('close', function() {
      const destPath = `${dir}/${filename}`;
      moveSync(filename, destPath, { overwrite: true });
      resolve(destPath);
    });
  });
}
