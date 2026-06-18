const fs = require('fs');
const path = require('path');

// version.json path
const versionFile = path.join(__dirname, 'dist', 'version.json');

// Angular environment file
const environmentFile = path.join(
    __dirname,
    'src',
    'environments',
    'environment.prod.ts'
);

if (!fs.existsSync(versionFile)) {
    console.error('❌ version.json not found');
    process.exit(1);
}

if (!fs.existsSync(environmentFile)) {
    console.error('❌ environment.prod.ts not found');
    process.exit(1);
}

// Read version.json
const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));

// Increment version
const [major, minor, patch] = data.version.split('.').map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

data.version = newVersion;

// Read environment file
const envContent = fs.readFileSync(environmentFile, 'utf8');

// Remove commented lines
const cleanedContent = envContent
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n');

// Extract active FrontURL
const match = cleanedContent.match(/FrontURL:\s*['"`](.*?)['"`]/);

if (!match) {
    console.error('❌ Active FrontURL not found');
    process.exit(1);
}

const baseUrl = match[1];

// Get domain only
const domain = new URL(baseUrl).origin;

// Update download_url
data.download_url = `${domain}/winbig-web.zip`;

// Save file
fs.writeFileSync(versionFile, JSON.stringify(data, null, 2));

console.log(`✅ Updated version to ${newVersion}`);
console.log(`✅ Updated download_url to ${data.download_url}`);