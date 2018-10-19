// @flow weak

import fs from 'fs';
import archiver from 'archiver';
import { moveSync } from 'fs-extra';

// Takes a directory and a name of a zip file, zips the directory into filename.zip, moves the resulting zipfile into
// the directory, and returns a promise that resolves to the complete path of the resulting zipfile.
export function zipCSVFiles(dir, filename) {
  return new Promise(function(resolve, reject) {
    // PROBLEM: On Lambda, I can only create files in /tmp. Archiver can only deal with a single level path passed to
    // the directory argument when zipping a directory. I have to create a zipfile in /tmp and then I have to zip the
    // contents of /tmp, which leads to an archive that includes both the /csv subdirectory, and the zipfile itself.
    // I resolved this earlier by creating the zip file elsewhere and moving it to /tmp, but that throws an error on
    // Lambda since you can only write to /tmp. This current solution includes the .zip in the archive.
    const zipPath = `${dir}/${filename}`;
    var output = fs.createWriteStream(zipPath);
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
    archive.glob('**/*.csv', { cwd: `${dir}` });
    archive.finalize();

    output.on('close', function() {
      resolve(zipPath);
    });
  });
}
