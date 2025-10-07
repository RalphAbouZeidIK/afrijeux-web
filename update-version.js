const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, 'dist', 'version.json');
console.error(versionFile)

if (!fs.existsSync(versionFile)) {
    console.error('❌ version.json not found in dist folder');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));

// Split version into parts
const [major, minor, patch] = data.version.split('.').map(Number);

// Increment patch version automatically
const newVersion = `${major}.${minor}.${patch + 1}`;

data.version = newVersion;

// Write back
fs.writeFileSync(versionFile, JSON.stringify(data, null, 2));

//console.log(`✅ Updated version to ${newVersion}`);
