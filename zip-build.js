const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const rootDistFolder = path.join(__dirname, 'dist');
const buildFolder = path.join(rootDistFolder, 'winbig-web');

const zipPath = path.join(rootDistFolder, 'winbig-web.zip');

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
    console.log(`✅ Zipped ${archive.pointer()} total bytes`);
});

archive.on('error', (err) => {
    throw err;
});

archive.pipe(output);

// Add build contents
archive.directory(buildFolder, '');

// Add extra root files into zip
archive.file(path.join(rootDistFolder, 'version.json'), {
    name: 'version.json'
});

archive.file(path.join(rootDistFolder, 'web.config'), {
    name: 'web.config'
});

archive.finalize();