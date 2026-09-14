const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 192, 512];
const source = path.join(process.cwd(), 'public/logo.png');
const outputDir = path.join(process.cwd(), 'public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Check if source exists
if (!fs.existsSync(source)) {
  console.error(`❌ Source file not found: ${source}`);
  console.log('📝 Please create a logo.png file in the public folder first');
  process.exit(1);
}

console.log('🔄 Generating PWA icons...');

// Generate each size
sizes.forEach(size => {
  sharp(source)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(outputDir, `icon-${size}.png`))
    .then(() => console.log(`✅ Generated icon-${size}.png`))
    .catch(err => console.error(`❌ Failed to generate ${size}px icon:`, err));
});

// Generate maskable icon (512x512 with safe zone padding)
sharp(source)
  .resize(400, 400, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  })
  .extend({
    top: 56,
    bottom: 56,
    left: 56,
    right: 56,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  })
  .png()
  .toFile(path.join(outputDir, 'icon-512-maskable.png'))
  .then(() => console.log('✅ Generated icon-512-maskable.png'))
  .catch(err => console.error('❌ Failed to generate maskable icon:', err));

console.log('📱 Don\'t forget to create screenshot images in public/screenshots/');