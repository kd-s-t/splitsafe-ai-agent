#!/usr/bin/env node

/**
 * PWA Troubleshooting Script for SplitSafe
 * 
 * This script helps diagnose why the install prompt might not appear
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PWA Install Prompt Troubleshooting');
console.log('=====================================');
console.log('');

// Check PWA requirements
const requirements = [
    {
        name: 'HTTPS',
        check: () => {
            console.log('✅ HTTPS is required for PWA install prompt');
            console.log('   Make sure you\'re accessing: https://localhost:3000');
            console.log('   Not: http://localhost:3000');
        }
    },
    {
        name: 'Valid Manifest',
        check: () => {
            const manifestPath = path.join(__dirname, '../public/manifest.json');
            if (fs.existsSync(manifestPath)) {
                try {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    console.log('✅ Manifest exists and is valid JSON');
                    console.log(`   App name: ${manifest.name}`);
                    console.log(`   Start URL: ${manifest.start_url}`);
                    console.log(`   Display: ${manifest.display}`);
                    console.log(`   Icons: ${manifest.icons?.length || 0} icons defined`);
                } catch (error) {
                    console.log('❌ Manifest is invalid JSON:', error.message);
                }
            } else {
                console.log('❌ Manifest file not found');
            }
        }
    },
    {
        name: 'Required Icons',
        check: () => {
            const requiredIcons = [
                'public/icon-192x192.png',
                'public/icon-512x512.png',
                'public/apple-touch-icon.png'
            ];

            let allExist = true;
            requiredIcons.forEach(icon => {
                const exists = fs.existsSync(path.join(__dirname, '..', icon));
                console.log(`${exists ? '✅' : '❌'} ${icon}`);
                if (!exists) allExist = false;
            });

            if (allExist) {
                console.log('✅ All required icons exist');
            } else {
                console.log('❌ Some required icons are missing');
            }
        }
    },
    {
        name: 'Service Worker',
        check: () => {
            const swPath = path.join(__dirname, '../public/sw.js');
            if (fs.existsSync(swPath)) {
                console.log('✅ Service worker file exists');
                const content = fs.readFileSync(swPath, 'utf8');
                if (content.includes('install') && content.includes('activate')) {
                    console.log('✅ Service worker has required events');
                } else {
                    console.log('❌ Service worker missing required events');
                }
            } else {
                console.log('❌ Service worker file not found');
            }
        }
    }
];

// Run all checks
requirements.forEach(req => {
    console.log(`\n📋 ${req.name}:`);
    req.check();
});

console.log('\n🔧 Troubleshooting Steps:');
console.log('========================');
console.log('');

console.log('1. Clear Browser Cache:');
console.log('   - Open Chrome DevTools (F12)');
console.log('   - Right-click refresh button → "Empty Cache and Hard Reload"');
console.log('');

console.log('2. Check Chrome DevTools:');
console.log('   - Application tab → Manifest');
console.log('   - Look for any errors in red');
console.log('   - Verify all icons load without 404 errors');
console.log('');

console.log('3. Test Installability:');
console.log('   - DevTools → Lighthouse tab');
console.log('   - Select "Progressive Web App"');
console.log('   - Click "Generate report"');
console.log('   - Look for "Installable" criteria');
console.log('');

console.log('4. Manual Install Test:');
console.log('   - Chrome menu (⋮) → "Install SplitSafe..."');
console.log('   - If this option appears, PWA is installable');
console.log('');

console.log('5. Check Console Errors:');
console.log('   - DevTools → Console tab');
console.log('   - Look for any PWA-related errors');
console.log('   - Check for service worker registration errors');
console.log('');

console.log('6. Browser Requirements:');
console.log('   - Chrome 68+ (recommended)');
console.log('   - Edge 79+');
console.log('   - Firefox 58+ (limited support)');
console.log('   - Safari 11.1+ (limited support)');
console.log('');

console.log('7. Common Issues:');
console.log('   - Not using HTTPS (required)');
console.log('   - Missing or invalid icons');
console.log('   - Service worker not registered');
console.log('   - Manifest validation errors');
console.log('   - Browser cache issues');
console.log('');

console.log('🎯 Quick Fix Commands:');
console.log('=====================');
console.log('');
console.log('# Restart dev server with HTTPS:');
console.log('npm run dev -- --experimental-https');
console.log('');
console.log('# Clear browser cache and reload');
console.log('# Check: https://localhost:3000/pwa-test');
console.log('');

console.log('📱 Alternative Testing:');
console.log('======================');
console.log('');
console.log('1. Use Chrome DevTools device emulation');
console.log('2. Test on actual mobile device');
console.log('3. Try different browser (Edge, Firefox)');
console.log('4. Check if install prompt appears after some time');
console.log('');
