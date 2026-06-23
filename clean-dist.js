const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const keepFiles = ['web.config','version.json']; // files to keep

if (!fs.existsSync(distPath)) {
    //console.log('✅ Dist folder does not exist, nothing to clean.');
    process.exit(0);
}

// Read all files/folders in dist
fs.readdirSync(distPath).forEach((file) => {
    if (!keepFiles.includes(file)) {
        const filePath = path.join(distPath, file);
        fs.rmSync(filePath, { recursive: true, force: true });
        //console.log(`🗑️ Deleted ${file}`);
    }
});

//console.log('✅ Dist folder cleaned (except web.config)');
