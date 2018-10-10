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
    throw err;
  });

  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.log('Archiver warning: ', err);
    } else {
      throw err;
    }
  });
  archive.pipe(output);
  archive.directory(dir, false);
  archive.finalize();
  moveSync(filename, `${dir}/${filename}`, { overwrite: true });
}
