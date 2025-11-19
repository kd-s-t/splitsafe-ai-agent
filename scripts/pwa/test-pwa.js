#!/usr/bin/env node

/**
 * PWA Testing Script for SplitSafe
 * 
 * This script helps you test PWA functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 SplitSafe PWA Testing Guide');
console.log('===============================');
console.log('');

// Check if required files exist
const requiredFiles = [
    'public/manifest.json',
    'public/sw.js',
    'public/browserconfig.xml',
    'public/safari-pinned-tab.svg'
];

console.log('📁 Checking PWA Files:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, '..', file));
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('');

// Check for PWA icons
const requiredIcons = [
    'public/icon-192x192.png',
    'public/icon-512x512.png',
    'public/apple-touch-icon.png'
];

console.log('🖼️  Checking PWA Icons:');
requiredIcons.forEach(icon => {
    const exists = fs.existsSync(path.join(__dirname, '..', icon));
    console.log(`${exists ? '✅' : '❌'} ${icon}`);
});

console.log('');

// Check environment variables
console.log('🔧 Environment Variables:');
const envVars = [
    'NEXT_PUBLIC_PUSHER_KEY',
    'NEXT_PUBLIC_PUSHER_CLUSTER',
    'PUSHER_APP_ID',
    'PUSHER_SECRET'
];

envVars.forEach(envVar => {
    const exists = process.env[envVar];
    console.log(`${exists ? '✅' : '❌'} ${envVar}`);
});

console.log('');
console.log('🧪 Testing Steps:');
console.log('');
console.log('1. Start the development server with HTTPS:');
console.log('   npm run dev -- --experimental-https');
console.log('');
console.log('2. Open Chrome and navigate to:');
console.log('   https://localhost:3000');
console.log('');
console.log('3. Open Chrome DevTools (F12) and go to:');
console.log('   - Application tab → Manifest (check if manifest loads)');
console.log('   - Application tab → Service Workers (check if SW is registered)');
console.log('   - Application tab → Storage → Cache Storage (check if caches are created)');
console.log('');
console.log('4. Test PWA Features:');
console.log('   - Look for install button in address bar');
console.log('   - Test offline functionality (Network tab → Offline)');
console.log('   - Check push notification permissions');
console.log('');
console.log('5. Run Lighthouse PWA Audit:');
console.log('   - DevTools → Lighthouse tab');
console.log('   - Select "Progressive Web App"');
console.log('   - Click "Generate report"');
console.log('');
console.log('6. Test on Mobile:');
console.log('   - Use Chrome DevTools device emulation');
console.log('   - Or test on actual mobile device');
console.log('');
console.log('📱 Mobile Testing:');
console.log('   - Android: Look for "Add to Home Screen" prompt');
console.log('   - iOS: Use Share button → "Add to Home Screen"');
console.log('');
console.log('🔔 Push Notification Testing:');
console.log('   - Grant notification permissions');
console.log('   - Check if Pusher connection is established');
console.log('   - Test notification display');
console.log('');
console.log('  Common Issues:');
console.log('   - HTTPS required for PWA features');
console.log('   - Service worker must be registered');
console.log('   - Manifest must be valid JSON');
console.log('   - Icons must exist and be accessible');
console.log('');
console.log('🎯 Expected Results:');
console.log('   - Lighthouse PWA score > 90');
console.log('   - Install prompt appears');
console.log('   - Offline functionality works');
console.log('   - Push notifications work');
console.log('   - App can be installed on device');
