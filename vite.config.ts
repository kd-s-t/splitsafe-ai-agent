import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  base: '/', // Use absolute paths for assets (required for ICP deployment with deep routes)
  plugins: [
    react({
      // React 19 requires automatic JSX runtime
      jsxRuntime: 'automatic',
      // Force production JSX transform in production builds
      // This ensures jsx (not jsxDEV) is used in production
      jsxImportSource: 'react',
    }),
    // Polyfills for Node.js modules (crypto, etc.)
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@icp': path.resolve(__dirname, './src/lib/internal/icp/index.ts'),
      '@constellation': path.resolve(__dirname, './src/lib/integrations/constellation/index.ts'),
      '@story': path.resolve(__dirname, './src/lib/integrations/story-protocol/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    fs: {
      // Allow access to project root for index.html and CSS files
      allow: ['.'],
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    esbuildOptions: {
      jsx: 'automatic',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        // Don't mangle function names that might be needed
        keep_fnames: /^(jsx|jsxDEV|createElement)$/,
      },
      mangle: {
        // Don't mangle React exports
        reserved: ['jsx', 'jsxDEV', 'createElement'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // CRITICAL: Keep React and React-DOM in the main bundle
          // Do NOT split React into a separate chunk - this breaks jsxDEV
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return null; // Keep in main bundle
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'router-vendor';
          }
          if (id.includes('node_modules/@dfinity')) {
            return 'dfinity-vendor';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
        },
      },
    },
  },
  define: {
    // Use env from loadEnv to ensure .env file values are loaded
    'process.env.VITE_PUSHER_KEY': JSON.stringify(env.VITE_PUSHER_KEY || ''),
    'process.env.VITE_PUSHER_CLUSTER': JSON.stringify(env.VITE_PUSHER_CLUSTER || ''),
    'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL || ''),
    // In production, don't set this - let runtime detection handle it
    // This ensures the app uses the correct canister ID based on where it's running
    'process.env.VITE_CANISTER_ID_SPLIT_DAPP': JSON.stringify(mode === 'production' ? '' : (env.VITE_CANISTER_ID_SPLIT_DAPP || '')),
    // Only set VITE_DFX_HOST if explicitly provided or in development
    // In production, runtime detection will determine the correct host
    'process.env.VITE_DFX_HOST': JSON.stringify(env.VITE_DFX_HOST || (mode === 'production' ? undefined : 'http://127.0.0.1:4943')),
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
  };
});
