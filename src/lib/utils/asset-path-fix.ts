/**
 * Asset Path Fix for IC Deployment
 * 
 * Ensures that all asset paths are absolute from root, preventing
 * chunk loading errors when navigating to deep routes on IC asset canister.
 * 
 * This script runs early in the app lifecycle to set __webpack_public_path__
 * which ensures all dynamically loaded chunks use absolute paths.
 */

if (typeof window !== 'undefined') {
  // Set webpack public path to root - ensures all chunks load from root
  // This is critical for static export on IC where deep routes might
  // cause relative path resolution issues
  if ((window as any).__webpack_public_path__ !== undefined) {
    (window as any).__webpack_public_path__ = '/';
  }

  // Ensure asset path is correct
  if ((window as any).__next_set_public_path) {
    (window as any).__next_set_public_path('/');
  }

  // Fix for chunk loading on deep routes
  // Intercept fetch requests for chunks and ensure they use absolute paths with _next prefix
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Convert input to URL if it's a string
    if (typeof input === 'string') {
      // Fix paths that are missing _next prefix (e.g., /static/chunks/ -> /_next/static/chunks/)
      if (input.includes('/static/chunks/') && !input.includes('/_next/static/chunks/')) {
        input = input.replace('/static/chunks/', '/_next/static/chunks/');
      }
      // Fix paths starting with static/ (relative paths)
      if (input.startsWith('static/') || input.startsWith('./static/')) {
        input = '/' + input.replace(/^\.?\//, '');
        if (!input.startsWith('/_next/')) {
          input = '/_next/' + input.replace(/^\//, '');
        }
      }
      // Ensure all _next paths are absolute from root
      if (input.includes('/_next/')) {
        const path = input.startsWith('./') ? input.slice(1) : input;
        input = path.startsWith('/') ? path : '/' + path;
      }
    }
    return originalFetch.call(this, input, init);
  };

  // Also intercept chunk loader to fix paths
  if ((window as any).__next_chunk_load__) {
    const originalChunkLoad = (window as any).__next_chunk_load__;
    (window as any).__next_chunk_load__ = function(chunk: string) {
      // Fix chunk paths missing _next prefix
      if (chunk.includes('/static/chunks/') && !chunk.includes('/_next/static/chunks/')) {
        chunk = chunk.replace('/static/chunks/', '/_next/static/chunks/');
      }
      if (chunk.startsWith('static/')) {
        chunk = '/_next/' + chunk;
      }
      return originalChunkLoad.call(this, chunk);
    };
  }
}

