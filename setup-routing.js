const fs = require('fs-extra');
const path = require('path');

const buildVersion = process.argv[2] || 'v1';

// Define file paths
const appRoutingMain = path.join(__dirname, 'src', 'app', 'app-routing.module.ts');
const appRoutingBackup = path.join(__dirname, 'src', 'app', 'app-routing.module.ts.bkup-');
const staticPagesRoutingMain = path.join(__dirname, 'src', 'app', 'static-pages', 'static-pages-routing.ts');
const staticPagesRoutingBackup = path.join(__dirname, 'src', 'app', 'static-pages', 'static-pages-routing.ts.bkup-');

// Temporary files to avoid conflicts during swap
const appRoutingTemp = path.join(__dirname, 'src', 'app', 'app-routing.module.ts.temp');
const staticPagesRoutingTemp = path.join(__dirname, 'src', 'app', 'static-pages', 'static-pages-routing.ts.temp');

if (buildVersion === 'v1') {
  console.log('🔧 Setting up routing for VERSION 1 (main files)...');
  
  // If backup exists and main doesn't, restore from backup
  if (fs.existsSync(appRoutingBackup) && !fs.existsSync(appRoutingMain)) {
    fs.copySync(appRoutingBackup, appRoutingMain);
    console.log('✅ Restored app-routing.module.ts');
  }
  if (fs.existsSync(staticPagesRoutingBackup) && !fs.existsSync(staticPagesRoutingMain)) {
    fs.copySync(staticPagesRoutingBackup, staticPagesRoutingMain);
    console.log('✅ Restored static-pages-routing.ts');
  }
  
} else if (buildVersion === 'v2') {
  console.log('🔧 Setting up routing for VERSION 2 (backup files)...');
  
  // Swap files using temp files to avoid conflicts
  if (fs.existsSync(appRoutingMain)) {
    fs.moveSync(appRoutingMain, appRoutingTemp, { overwrite: true });
    fs.copySync(appRoutingBackup, appRoutingMain);
    fs.moveSync(appRoutingTemp, appRoutingMain + '.tmp', { overwrite: true });
    fs.removeSync(appRoutingMain + '.tmp');
    console.log('✅ Swapped app-routing.module.ts with backup');
  }
  
  if (fs.existsSync(staticPagesRoutingMain)) {
    fs.moveSync(staticPagesRoutingMain, staticPagesRoutingTemp, { overwrite: true });
    fs.copySync(staticPagesRoutingBackup, staticPagesRoutingMain);
    fs.moveSync(staticPagesRoutingTemp, staticPagesRoutingMain + '.tmp', { overwrite: true });
    fs.removeSync(staticPagesRoutingMain + '.tmp');
    console.log('✅ Swapped static-pages-routing.ts with backup');
  }
  
} else {
  console.error('❌ Invalid version. Use "v1" or "v2"');
  process.exit(1);
}

console.log(`✅ Routing setup complete for ${buildVersion}`);
