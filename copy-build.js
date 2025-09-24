const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, 'dist', 'afrijeux-web');
const targetDir = path.join(__dirname, 'dist');

// Copy all files from afrijeux-web into dist
fs.copySync(sourceDir, targetDir, { overwrite: true });
console.log('✅ Copied build files to dist/');
