const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const distFolder = path.join(__dirname, 'dist', 'afrijeux-web');
const zipPath = path.join(__dirname, 'dist', `afrijeux-web.zip`);

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
    //console.log(`✅ Zipped ${archive.pointer()} total bytes to afrijeux-web.zip`);
});

archive.on('error', (err) => {
    throw err;
});

archive.pipe(output);
archive.directory(distFolder, false); // include only contents of afrijeux-web folder
archive.finalize();
