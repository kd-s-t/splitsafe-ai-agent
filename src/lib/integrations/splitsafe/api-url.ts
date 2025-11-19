/**
 * API URL Utility
 * 
 * Gets the base URL for API calls based on deployment environment.
 * - IC Deployment: Uses external SplitSafe Backend API (Vercel)
 * - Traditional Hosting: Uses relative paths (same origin)
 */

/**
 * Get the base URL for API calls
 * 
 * @returns Base URL for API calls
 * 
 * @example
 * ```typescript
 * const apiBaseUrl = getApiBaseUrl();
 * // Production: "https://splitsafe-backend.vercel.app"
 * // Localhost: "http://localhost:3000"
 * // ICP domain (ecyax-oiaaa-aaaai-q323q-cai.icp0.io): "https://splitsafe-backend.vercel.app"
 * 
 * const response = await fetch(`${apiBaseUrl}/api/escrow/create`, {...});
 * ```
 */
export function getApiBaseUrl(): string {
  // Check if we're running locally (development)
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // If running on localhost, use local backend
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return process.env.VITE_BACKEND_URL || 'http://localhost:3001';
    }
  }
  
  // Check environment variable override first
  if (process.env.VITE_BACKEND_URL) {
    return process.env.VITE_BACKEND_URL;
  }
  
  // Default: Use Vercel backend API for production/ICP
  const BACKEND_URL = 'https://splitsafe-backend.vercel.app';
  return BACKEND_URL;
}

/**
 * Get SplitSafe API URL from an endpoint path
 * 
 * @param endpoint - API endpoint path (e.g., "/api/openai/parse" or "/auth/session")
 * @returns Full URL
 * 
 * @example
 * ```typescript
 * const url = getSplitSafeApiUrl('/api/openai/parse');
 * // Production: "https://splitsafe-backend.vercel.app/api/openai/parse"
 * // Localhost: "http://localhost:3000/api/openai/parse"
 * // ICP domain: "https://splitsafe-backend.vercel.app/api/openai/parse"
 * ```
 */
export function getSplitSafeApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Map internal route to backend route if needed
  const mappedEndpoint = mapApiRoute(normalizedEndpoint);
  
  return `${baseUrl}${mappedEndpoint}`;
}

/**
 * Map internal API route to external API endpoint
 * 
 * Maps frontend API route paths to backend API route paths
 * 
 * @param internalRoute - Internal API route (e.g., "/api/openai/parse")
 * @returns External API endpoint path
 */
export function mapApiRoute(internalRoute: string): string {
  // Map internal API routes to backend API endpoints
  const routeMap: Record<string, string> = {
    // OpenAI - already matches backend
    '/api/openai/parse': '/api/openai/parse',
    
    // Amazon Q - already matches backend
    '/api/amazonq/parse': '/api/amazonq/parse',
    
    // Email services - map to backend email routes
    '/api/send-escrow-email': '/api/emails/escrow',
    '/api/send-milestone-email': '/api/emails/milestone',
    '/api/send-voucher-email': '/api/emails/voucher',
    
    // Pusher/Real-time events - map to backend event routes
    '/api/pusher/escrow-event': '/api/events/escrow',
    '/api/pusher/milestone-event': '/api/events/milestone',
    '/api/pusher/voucher-event': '/api/events/voucher',
    
    // Constellation - already matches backend
    '/api/constellation/fingerprints': '/api/constellation/fingerprints',
    
    // Story Protocol - already matches backend
    '/api/story/attest': '/api/story/attest',
    '/api/story/setup-escrow': '/api/story/setup-escrow',
    
    // Contact - already matches backend
    '/api/contact': '/api/contact',
    
    // Escrow messages - already matches backend
    '/api/escrows/[escrowId]/messages': '/api/escrows/:escrowId/messages',
    
    // Auth - map to backend auth route
    '/api/v1/auth/session': '/api/v1/auth/session',
  };
  
  // Check if we have a direct mapping
  if (routeMap[internalRoute]) {
    return routeMap[internalRoute];
  }
  
  // Handle dynamic routes (escrow messages)
  if (internalRoute.includes('/escrows/') && internalRoute.includes('/messages')) {
    const escrowId = internalRoute.match(/\/escrows\/([^/]+)\/messages/)?.[1];
    return escrowId ? `/api/escrows/${escrowId}/messages` : '/api/escrows/messages';
  }
  
  // Default: use as-is (backend already has /api prefix)
  return internalRoute;
}

