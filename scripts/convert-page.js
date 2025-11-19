#!/usr/bin/env node
// Helper script to convert Next.js pages to React Router pages
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node convert-page.js <path-to-page.tsx>');
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Replace Next.js imports
content = content.replace(/from ['"]next\/navigation['"]/g, "from 'react-router-dom'");
content = content.replace(/from ['"]next\/link['"]/g, "from 'react-router-dom'");
content = content.replace(/from ['"]next\/image['"]/g, "// Removed: use <img> or custom Image component");

// Replace hooks
content = content.replace(/useRouter\(\)/g, "useNavigate()");
content = content.replace(/const router = useRouter\(\)/g, "const navigate = useNavigate()");
content = content.replace(/router\.push\(/g, "navigate(");
content = content.replace(/router\.replace\(/g, "navigate(..., { replace: true })");
content = content.replace(/router\.back\(\)/g, "navigate(-1)");

content = content.replace(/usePathname\(\)/g, "useLocation().pathname");
content = content.replace(/const pathname = usePathname\(\)/g, "const { pathname } = useLocation()");

// Replace Link component
content = content.replace(/<Link href=/g, "<Link to=");
content = content.replace(/from ['"]next\/image['"]/g, "");

// Remove "use client" directive
content = content.replace(/^"use client"\n/gm, "");

console.log(content);
