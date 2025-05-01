// Simple script to generate a proper favicon
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Favicon Generator Script');
console.log('=======================');

// Check if ImageMagick is installed
try {
  execSync('convert -version', { stdio: 'ignore' });
  console.log('✅ ImageMagick is installed');
} catch (error) {
  console.error('❌ ImageMagick is not installed. Please install it first:');
  console.error('   - macOS: brew install imagemagick');
  console.error('   - Ubuntu/Debian: sudo apt-get install imagemagick');
  console.error('   - Windows: Download from https://imagemagick.org/script/download.php');
  process.exit(1);
}

// Create favicon directory if it doesn't exist
const faviconDir = path.join(__dirname, '..', 'public', 'favicon');
if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
  console.log(`✅ Created directory: ${faviconDir}`);
}

// Generate a simple Georgian flag favicon if no source image is provided
const sourceImage = process.argv[2] || path.join(__dirname, 'georgia-flag.png');

if (!process.argv[2]) {
  console.log('No source image provided. Generating a simple Georgian flag image...');
  
  // Generate a simple Georgian flag image (red with white cross)
  const georgianFlagCommand = `convert -size 512x512 xc:white \\
    \\( -size 512x100 xc:#DA291C -gravity center \\) -composite \\
    \\( -size 100x512 xc:#DA291C -gravity center \\) -composite \\
    ${sourceImage}`;
  
  try {
    execSync(georgianFlagCommand, { stdio: 'inherit' });
    console.log(`✅ Generated Georgian flag image: ${sourceImage}`);
  } catch (error) {
    console.error('❌ Failed to generate Georgian flag image:', error.message);
    process.exit(1);
  }
}

// Generate favicon.ico with multiple sizes
console.log('Generating favicon.ico with multiple sizes...');
const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
const faviconCommand = `convert ${sourceImage} -define icon:auto-resize=16,32,48 ${faviconPath}`;

try {
  execSync(faviconCommand, { stdio: 'inherit' });
  console.log(`✅ Generated favicon.ico: ${faviconPath}`);
} catch (error) {
  console.error('❌ Failed to generate favicon.ico:', error.message);
}

// Generate various sized PNG favicons
const sizes = [16, 32, 96, 192, 512];
for (const size of sizes) {
  const outputPath = path.join(faviconDir, `favicon-${size}x${size}.png`);
  const command = `convert ${sourceImage} -resize ${size}x${size} ${outputPath}`;
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Generated ${size}x${size} favicon: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to generate ${size}x${size} favicon:`, error.message);
  }
}

// Generate apple-touch-icon.png
const appleTouchIconPath = path.join(faviconDir, 'apple-touch-icon.png');
const appleTouchIconCommand = `convert ${sourceImage} -resize 180x180 ${appleTouchIconPath}`;

try {
  execSync(appleTouchIconCommand, { stdio: 'inherit' });
  console.log(`✅ Generated apple-touch-icon.png: ${appleTouchIconPath}`);
} catch (error) {
  console.error('❌ Failed to generate apple-touch-icon.png:', error.message);
}

console.log('\nFavicon generation complete!');
console.log('To use your new favicon:');
console.log('1. Clear your browser cache');
console.log('2. Restart your Next.js development server');
console.log('3. Visit your website to see the new favicon');
