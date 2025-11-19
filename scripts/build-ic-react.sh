#!/bin/bash
set -e

echo "🚀 Building React app for Internet Computer deployment..."

# Build with Vite (production mode to use jsx instead of jsxDEV)
# Use production environment variables
echo "📦 Building with Vite (production mode)..."
# Copy .env.prod to .env.production for Vite to pick it up
if [ -f ".env.prod" ]; then
  echo "📋 Using .env.prod for production build..."
  cp .env.prod .env.production 2>/dev/null || true
fi
NODE_ENV=production npm run build -- --mode production
# Clean up
rm -f .env.production 2>/dev/null || true

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed: 'dist' directory not found"
    exit 1
fi

# For ICP, we need to copy dist to out (IC expects 'out' directory)
echo "📁 Preparing output for ICP..."
rm -rf out
cp -r dist out

# Copy .ic-assets.json5 to out directory (CRITICAL for proper MIME types and routing)
if [ -f ".ic-assets.json5" ]; then
    echo "📋 Copying .ic-assets.json5 configuration..."
    cp .ic-assets.json5 out/.ic-assets.json5
fi

# Fix any path issues for ICP deployment
# (IC asset canister serves from root, so ensure all paths are absolute)
echo "🔧 Fixing asset paths for ICP..."
find out -name "*.html" -type f | while read -r file; do
    # Ensure all script and link paths start with /
    sed -i '' 's|href="/|href="/|g' "$file" 2>/dev/null || sed -i 's|href="/|href="/|g' "$file"
    sed -i '' 's|src="/|src="/|g' "$file" 2>/dev/null || sed -i 's|src="/|src="/|g' "$file"
done

# For SPA routing on ICP: Copy index.html to common routes
# This allows direct access to routes like /login, /dashboard, etc.
echo "🔧 Setting up SPA routing for ICP..."
if [ -f "out/index.html" ]; then
    # Create directories and copy index.html for common routes
    mkdir -p out/login out/dashboard out/escrow out/transactions out/basic-escrow out/milestone-escrow
    cp out/index.html out/login/index.html 2>/dev/null || true
    cp out/index.html out/dashboard/index.html 2>/dev/null || true
    cp out/index.html out/escrow/index.html 2>/dev/null || true
    cp out/index.html out/transactions/index.html 2>/dev/null || true
    cp out/index.html out/basic-escrow/index.html 2>/dev/null || true
    cp out/index.html out/milestone-escrow/index.html 2>/dev/null || true
fi

echo "✅ React build completed successfully!"
echo "📁 Build output: $(du -sh out | cut -f1)"
echo "🌐 Ready for deployment to IC asset canister"
echo ""
echo "To deploy:"
echo "  dfx deploy frontend --network ic"

