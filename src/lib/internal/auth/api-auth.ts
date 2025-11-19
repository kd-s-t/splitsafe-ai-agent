// Type for API request
interface ApiRequest {
  url: string;
  headers: {
    get: (name: string) => string | null;
  };
}

type NextRequest = ApiRequest;

const API_KEY = process.env.INTERNAL_API_KEY;

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === API_KEY;
}

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Only allow specific domains for security
  const allowedOrigins = [
    'http://localhost:3000',
    'https://thesplitsafe.com',
    'https://ecyax-oiaaa-aaaai-q323q-cai.icp0.io',
    process.env.VITE_APP_URL
  ].filter(Boolean) as string[];

  // 1) Trust the actual URL origin first (covers same-origin fetches where
  //    browsers omit the Origin/Referer headers)
  try {
    const urlOrigin = new URL(request.url).origin;
    if (allowedOrigins.includes(urlOrigin)) {
      return true;
    }
  } catch {
    // ignore URL parse issues and fall back to header checks
  }
  
  if (origin && allowedOrigins.includes(origin)) {
    return true;
  }

  if (referer) {
    const refererUrl = new URL(referer);
    const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
    if (allowedOrigins.includes(refererOrigin)) {
      return true;
    }
  }

  return false;
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ 
      error: 'Unauthorized',
      message: 'This API can only be accessed by the SplitSafe application'
    }),
    { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

export function createForbiddenResponse() {
  return new Response(
    JSON.stringify({ 
      error: 'Forbidden',
      message: 'Access denied'
    }),
    { 
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * Get CORS headers for API responses
 * Allows cross-origin requests from specific allowed domains only
 */
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only allow specific domains for security
  const allowedOrigins = [
    'http://localhost:3000',
    'https://thesplitsafe.com',
    'https://ecyax-oiaaa-aaaai-q323q-cai.icp0.io',
    process.env.VITE_APP_URL
  ].filter(Boolean) as string[];

  // Allow requests only from whitelisted domains
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-API-Key';
  }

  return headers;
}

