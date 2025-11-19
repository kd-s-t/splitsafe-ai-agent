/**
 * Early Logging Utility
 * 
 * Runs immediately when this module loads, before React hydration
 * This helps debug chunk loading issues on IC deployment
 */

if (typeof window !== 'undefined') {
  // Immediate log to verify JavaScript is executing
  console.log('[EARLY_LOGGING] Script loaded at:', new Date().toISOString());
  console.log('[EARLY_LOGGING] Current URL:', window.location.href);
  console.log('[EARLY_LOGGING] Current pathname:', window.location.pathname);
  
  // Log when chunks fail to load
  const originalFetch = window.fetch;
  window.fetch = function(...args: Parameters<typeof fetch>): Promise<Response> {
    const url = typeof args[0] === 'string' 
      ? args[0] 
      : args[0] instanceof URL 
        ? args[0].href 
        : (args[0] as Request).url;
    
    // Log all chunk requests
    if (url?.includes('/_next/static/chunks/')) {
      console.log('[EARLY_LOGGING] Fetching chunk:', url);
    }
    
    return originalFetch.apply(this, args).catch(error => {
      if (url?.includes('/_next/static/chunks/')) {
        console.error('[EARLY_LOGGING] Chunk fetch failed:', url, error);
      }
      throw error;
    });
  };

  // Listen for script loading errors
  window.addEventListener('error', (event) => {
    if (event.target instanceof HTMLScriptElement && event.target.src) {
      const src = event.target.src;
      if (src.includes('/_next/static/chunks/')) {
        console.error('[EARLY_LOGGING] Script error:', src, event.error);
      }
    }
  }, true); // Use capture phase to catch early

  // Log all script tags being added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLScriptElement && node.src) {
          if (node.src.includes('/_next/static/chunks/')) {
            console.log('[EARLY_LOGGING] Script tag added:', node.src);
          }
        }
      });
    });
  });

  // Start observing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.head, { childList: true, subtree: true });
    });
  } else {
    observer.observe(document.head, { childList: true, subtree: true });
  }
}
