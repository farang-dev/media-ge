// Script to verify favicon files
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Favicon Verification Script');
console.log('==========================');

// Check if the public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  console.error('❌ Public directory does not exist!');
  process.exit(1);
}

// Check if favicon.ico exists
const faviconPath = path.join(publicDir, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  console.error('❌ favicon.ico does not exist in the public directory!');
  console.error('   Please create a favicon.ico file and place it in the public directory.');
  process.exit(1);
}

// Check favicon.ico format
try {
  const fileInfo = execSync(`file "${faviconPath}"`).toString();
  console.log(`File info: ${fileInfo.trim()}`);
  
  if (!fileInfo.includes('MS Windows icon resource')) {
    console.warn('⚠️ favicon.ico may not be in the correct ICO format!');
    console.warn('   It should be an MS Windows icon resource with multiple sizes.');
    console.warn('   Current format: ' + fileInfo.trim());
  } else {
    console.log('✅ favicon.ico is in the correct ICO format.');
  }
} catch (error) {
  console.error('❌ Error checking favicon.ico format:', error.message);
}

// Check for additional favicon files
const additionalFiles = [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png'
];

additionalFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists.`);
  } else {
    console.warn(`⚠️ ${file} does not exist. This is not critical but recommended.`);
  }
});

// Check if the favicon directory exists
const faviconDir = path.join(publicDir, 'favicon');
if (fs.existsSync(faviconDir)) {
  console.log('✅ favicon directory exists.');
  
  // Check for files in the favicon directory
  const faviconDirFiles = fs.readdirSync(faviconDir);
  console.log(`   Found ${faviconDirFiles.length} files in the favicon directory:`);
  faviconDirFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
} else {
  console.log('ℹ️ favicon directory does not exist. This is optional.');
}

// Check for favicon references in layout.tsx
const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes('favicon.ico')) {
    console.log('✅ favicon.ico is referenced in layout.tsx.');
  } else {
    console.warn('⚠️ favicon.ico is not referenced in layout.tsx!');
  }
  
  if (layoutContent.includes('<Favicon')) {
    console.log('✅ Favicon component is used in layout.tsx.');
  } else {
    console.warn('⚠️ Favicon component is not used in layout.tsx.');
  }
} else {
  console.error('❌ layout.tsx does not exist!');
}

// Check for favicon references in head.tsx
const headPath = path.join(__dirname, '..', 'app', 'head.tsx');
if (fs.existsSync(headPath)) {
  const headContent = fs.readFileSync(headPath, 'utf8');
  
  if (headContent.includes('favicon.ico')) {
    console.log('✅ favicon.ico is referenced in head.tsx.');
  } else {
    console.warn('⚠️ favicon.ico is not referenced in head.tsx!');
  }
} else {
  console.log('ℹ️ head.tsx does not exist. This is optional.');
}

console.log('\nFavicon verification complete!');
console.log('If all checks passed, your favicon should be working correctly.');
console.log('If you still have issues, try the following:');
console.log('1. Clear your browser cache completely');
console.log('2. Try a different browser');
console.log('3. Check if the favicon is being served correctly using the browser developer tools');
console.log('4. Visit the standalone test page: /standalone-favicon-test.html');
