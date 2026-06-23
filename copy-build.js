const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, 'dist', 'winbig-web');
const targetDir = path.join(__dirname, 'dist');

// Copy all files from winbig-web into dist
fs.copySync(sourceDir, targetDir, { overwrite: true });
//console.log('✅ Copied build files to dist/');
