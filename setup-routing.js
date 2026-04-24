const fs = require('fs-extra');
const path = require('path');

const buildVersion = process.argv[2] || 'v1';

// Define file paths
const appRoutingMain = path.join(__dirname, 'src', 'app', 'app-routing.module.ts');
const appRoutingBackup = path.join(__dirname, 'src', 'app', 'app-routing.module.ts.bkup-');
const staticPagesRoutingMain = path.join(__dirname, 'src', 'app', 'static-pages', 'static-pages-routing.ts');
const staticPagesRoutingBackup = path.join(__dirname, 'src', 'app', 'static-pages', 'static-pages-routing.ts.bkup-');

// Support files to preserve originals
const appRoutingV1 = path.join(__dirname, 'src', 'app', 'app-routing.module.ts.v1-original');
const staticPagesRoutingV1 = path.join(__dirname, 'src', 'app', 'static-pages', 'static-pages-routing.ts.v1-original');

function swapFiles(mainFile, backupFile, v1OriginalFile) {
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    return false;
  }

  // Save current main as v1 original (if not already saved)
  if (!fs.existsSync(v1OriginalFile) && fs.existsSync(mainFile)) {
    fs.copySync(mainFile, v1OriginalFile);
  }

  // Copy backup to main
  fs.copySync(backupFile, mainFile);
  return true;
}

function restoreV1(mainFile, v1OriginalFile) {
  if (fs.existsSync(v1OriginalFile)) {
    fs.copySync(v1OriginalFile, mainFile);
    return true;
  }
  return false;
}

if (buildVersion === 'v1') {
  //console.log('🔧 Setting up routing for VERSION 1 (Homepage as default)...');
  
  if (restoreV1(appRoutingMain, appRoutingV1)) {
    //console.log('✅ Restored app-routing.module.ts to v1');
  }
  if (restoreV1(staticPagesRoutingMain, staticPagesRoutingV1)) {
    //console.log('✅ Restored static-pages-routing.ts to v1');
  }
  
} else if (buildVersion === 'v2') {
  //console.log('🔧 Setting up routing for VERSION 2 (Branded Products as default)...');
  
  if (swapFiles(appRoutingMain, appRoutingBackup, appRoutingV1)) {
    //console.log('✅ Swapped app-routing.module.ts to v2 backup');
  }
  if (swapFiles(staticPagesRoutingMain, staticPagesRoutingBackup, staticPagesRoutingV1)) {
    //console.log('✅ Swapped static-pages-routing.ts to v2 backup (redirects to branded-products)');
  }
  
} else {
  console.error('❌ Invalid version. Use "v1" or "v2"');
  process.exit(1);
}

//console.log(`✅ Routing setup complete for ${buildVersion}`);
