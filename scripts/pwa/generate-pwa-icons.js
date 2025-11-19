#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * 
 * This script creates the required PWA icons from your existing logo.
 * You'll need to manually create these icons or use an online tool.
 * 
 * Required icons:
 * - icon-192x192.png (192x192px)
 * - icon-512x512.png (512x512px) 
 * - apple-touch-icon.png (180x180px)
 * - safari-pinned-tab.svg (monochrome SVG)
 * - browserconfig.xml (for Windows tiles)
 */

const fs = require('fs');
const path = require('path');

console.log('PWA Icon Generator for SplitSafe');
console.log('================================');
console.log('');
console.log('Required PWA icons:');
console.log('1. icon-192x192.png (192x192px) - Android Chrome');
console.log('2. icon-512x512.png (512x512px) - Android Chrome');
console.log('3. apple-touch-icon.png (180x180px) - iOS Safari');
console.log('4. safari-pinned-tab.svg (monochrome SVG) - Safari pinned tab');
console.log('5. browserconfig.xml - Windows tile configuration');
console.log('');

// Create browserconfig.xml for Windows tiles
const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icon-192x192.png"/>
            <TileColor>#FEB64D</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;

fs.writeFileSync(path.join(__dirname, '../public/browserconfig.xml'), browserconfig);
console.log('✅ Created browserconfig.xml');

// Create a simple SVG for safari-pinned-tab (you should replace this with your actual logo)
const safariIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#FEB64D"/>
  <text x="90" y="100" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="black">SS</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, '../public/safari-pinned-tab.svg'), safariIcon);
console.log('✅ Created safari-pinned-tab.svg (placeholder)');

console.log('');
console.log('📝 Next steps:');
console.log('1. Create the required PNG icons (192x192, 512x512, 180x180) from your logo');
console.log('2. Place them in the /public directory');
console.log('3. Update safari-pinned-tab.svg with your actual monochrome logo');
console.log('');
console.log('💡 You can use online tools like:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://www.favicon-generator.org/');
console.log('- https://favicon.io/');
console.log('');
console.log('🎨 For the best results, use your main logo (Logo 3.png) as the source.');
