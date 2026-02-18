const fs = require('fs');
const path = require('path');

console.log('Starting cleanup...');
console.log('-'.repeat(50));

const filesToDelete = [
  'E:\\Carbon-tracker\\src\\pages\\History.tsx',
  'E:\\Carbon-tracker\\src\\App.tsx',
  'E:\\Carbon-tracker\\src\\App.tsx.new',
  'E:\\Carbon-tracker\\src\\App_FINAL.tsx'
];

// Delete files
filesToDelete.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✓ Deleted: ${path.basename(filePath)}`);
    } else {
      console.log(`⊘ Not found: ${path.basename(filePath)}`);
    }
  } catch (e) {
    console.log(`✗ Error deleting ${path.basename(filePath)}: ${e.message}`);
  }
});

console.log('-'.repeat(50));

// Copy and rename
const srcFile = 'E:\\Carbon-tracker\\src\\App_CORRECT.tsx';
const dstFile = 'E:\\Carbon-tracker\\src\\App.tsx';

try {
  if (fs.existsSync(srcFile)) {
    const content = fs.readFileSync(srcFile);
    fs.writeFileSync(dstFile, content);
    fs.unlinkSync(srcFile);
    console.log(`✓ Renamed: App_CORRECT.tsx → App.tsx`);
  } else {
    console.log(`✗ Source file not found: App_CORRECT.tsx`);
  }
} catch (e) {
  console.log(`✗ Error renaming file: ${e.message}`);
}

console.log('-'.repeat(50));
console.log('Cleanup complete!');

// Verification
console.log('\nVerification:');
const srcDir = 'E:\\Carbon-tracker\\src';
const pagesDir = path.join(srcDir, 'pages');

if (fs.existsSync(path.join(srcDir, 'App.tsx'))) {
  console.log('✓ App.tsx exists');
} else {
  console.log('✗ App.tsx missing');
}

if (fs.existsSync(pagesDir) && !fs.existsSync(path.join(pagesDir, 'History.tsx'))) {
  console.log('✓ History.tsx deleted');
} else {
  console.log('✗ History.tsx still exists');
}

if (!fs.existsSync(path.join(srcDir, 'App_CORRECT.tsx'))) {
  console.log('✓ App_CORRECT.tsx cleaned up');
} else {
  console.log('✗ App_CORRECT.tsx still exists');
}

if (!fs.existsSync(path.join(srcDir, 'App.tsx.new'))) {
  console.log('✓ App.tsx.new cleaned up');
} else {
  console.log('✗ App.tsx.new still exists');
}

if (!fs.existsSync(path.join(srcDir, 'App_FINAL.tsx'))) {
  console.log('✓ App_FINAL.tsx cleaned up');
} else {
  console.log('✗ App_FINAL.tsx still exists');
}
