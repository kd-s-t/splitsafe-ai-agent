"use client";

import { useEffect } from 'react';
// ChunkLoadErrorHandler - No longer needs router, uses window.location directly

/**
 * ChunkLoadErrorHandler
 * 
 * Handles chunk loading errors that can occur with static exports on IC asset canister.
 * When chunks fail to load (often due to 404 HTML responses), this component
 * attempts to recover by reloading the page or retrying the chunk load.
 */
export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      const errorString = error?.toString() || '';
      
      // Check for chunk loading errors
      const isChunkLoadError = 
        errorString.includes('ChunkLoadError') ||
        errorString.includes('Loading chunk') ||
        errorString.includes('Unexpected token') ||
        (errorString.includes('fetch') && errorString.includes('chunk'));

      if (isChunkLoadError) {
        console.warn('[ChunkLoadErrorHandler] Detected chunk loading error, attempting recovery...', error);
        
        // First, try to fix the path and reload the chunk
        // Sometimes chunks fail because of path resolution issues
        const errorUrl = errorString.match(/https?:\/\/[^\s'"]+/) || 
                        errorString.match(/['"`]([^'"`]+\.js)/);
        
        if (errorUrl) {
          const chunkUrl = typeof errorUrl === 'string' ? errorUrl : errorUrl[0];
          console.log('[ChunkLoadErrorHandler] Attempting to reload chunk:', chunkUrl);
          
          // Try to ensure absolute path from root
          let fixedUrl = chunkUrl;
          if (chunkUrl.includes('/_next/') && !chunkUrl.startsWith('http')) {
            fixedUrl = chunkUrl.startsWith('/') ? chunkUrl : '/' + chunkUrl.replace(/^\.\//, '');
            console.log('[ChunkLoadErrorHandler] Fixed chunk URL:', fixedUrl);
          }
        }
        
        // Attempt to reload the page to retry chunk loading
        // This is particularly useful for IC asset canister where chunks might
        // not be properly served on first request
        const shouldReload = confirm(
          'Failed to load some resources. Would you like to reload the page to try again?'
        );
        
        if (shouldReload) {
          // Reload the page directly (no router.refresh() needed in React)
          window.location.reload();
        }
      }
    };

    // Listen for unhandled errors
    window.addEventListener('error', handleChunkError);

    // Also listen for unhandled promise rejections (common with dynamic imports)
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      if (
        reason.includes('ChunkLoadError') ||
        reason.includes('Loading chunk') ||
        reason.includes('Failed to fetch')
      ) {
        console.warn('[ChunkLoadErrorHandler] Detected chunk loading promise rejection, attempting recovery...', event.reason);
        event.preventDefault(); // Prevent default error logging
        
        // Attempt recovery
        const shouldReload = confirm(
          'Failed to load some resources. Would you like to reload the page to try again?'
        );
        
        if (shouldReload) {
          try {
            router.refresh();
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } catch {
            window.location.reload();
          }
        }
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
