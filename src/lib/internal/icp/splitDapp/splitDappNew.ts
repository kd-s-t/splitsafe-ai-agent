import { canisterId as generatedCanisterId, idlFactory } from '@/declarations/split_dapp'
import { Actor, HttpAgent } from '@dfinity/agent'
import { AuthClient } from '@dfinity/auth-client'

if (typeof window !== 'undefined' && !window.crypto) {
  import('crypto').then(({ webcrypto }) => {
    (window as unknown as { crypto: typeof webcrypto }).crypto = webcrypto
  })
}

// Check if we're on localhost (development) or ICP mainnet (production)
const IS_LOCAL = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  : false

const isHttpsPage = () => typeof window !== 'undefined' && window.location.protocol === 'https:'

const isLocalReplicaHost = (host: string) => host.includes('127.0.0.1') || host.includes('localhost')

const getHost = () => {
  // CRITICAL: Check runtime location first (most reliable)
  // If we're on an ICP domain (.icp0.io or .ic0.app), always use mainnet
  if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      // If we're on an ICP domain, use the ICP API endpoint for canister queries
      // Note: This is the ICP API endpoint (icp0.io), NOT the frontend canister URL
      if (hostname.endsWith('.icp0.io') || hostname.endsWith('.ic0.app') || hostname === 'icp0.io' || hostname === 'ic0.app') {
        return 'https://icp0.io'
      }
  }

  // Check for explicit VITE_DFX_HOST (set at build time)
  const dfxHost = process.env.VITE_DFX_HOST
  if (dfxHost) {
    try {
      // Normalize localhost -> 127.0.0.1 to avoid IPv6/DNS quirks
      const url = new URL(dfxHost)
      if (url.hostname === 'localhost') {
        url.hostname = '127.0.0.1'
      }
      // Ensure local development uses http
      if (url.hostname === '127.0.0.1' && url.protocol !== 'http:') {
        url.protocol = 'http:'
      }
      return url.toString().replace(/\/$/, '')
    } catch {
      // Fallback to provided string if parsing fails
      return dfxHost
    }
  }

  // If we're on localhost, use local replica
  if (IS_LOCAL) {
    return 'http://127.0.0.1:4943'
  }

  // Default to production (ICP mainnet) for all other cases
  return 'https://icp0.io'
}

const getCanisterId = () => {
  // CRITICAL: Always check runtime location first (most reliable)
  // If we're on an ICP domain (not localhost), use production canister ID
  if (!IS_LOCAL) {
    const productionCanisterId = 'efzgd-dqaaa-aaaai-q323a-cai'
    return productionCanisterId
  }
  
  // For localhost, check explicit env var first
  const canisterId = process.env.VITE_CANISTER_ID_SPLIT_DAPP
  if (canisterId && canisterId.trim() !== '') {
    return canisterId
  }
  
  // Fall back to dfx-generated canisterId from declarations (for local development only)
  if (generatedCanisterId) {
    return generatedCanisterId as unknown as string
  }
  
  // Final fallback: undefined -> handled by caller with an explicit error
  return undefined
}

export const createAnonymousActorNew = async () => {
  const host = getHost()
  const canisterId = getCanisterId()

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for VITE_CANISTER_ID_SPLIT_DAPP'
    )
  }

  const agent = new HttpAgent({
    host
  })

  if (isLocalReplicaHost(host)) {
    // Avoid mixed-content/cert issues when the page is served over HTTPS
    if (isHttpsPage()) {
      console.warn('Skipping fetchRootKey on HTTPS page for local replica host; ensure you run the app over http://localhost during local development.')
    } else {
      let lastError: unknown = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await agent.fetchRootKey()
          lastError = null
          break
        } catch (err) {
          lastError = err
          await new Promise((r) => setTimeout(r, 500))
        }
      }
      if (lastError) {
        console.warn(`Failed to fetch root key from local replica. Proceeding without it. Error:`, lastError)
      }
    }
  }

  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
  
  return actor;
}

export const createAuthenticatedActorNew = async () => {
  const host = getHost()
  const canisterId = getCanisterId()

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for VITE_CANISTER_ID_SPLIT_DAPP'
    )
  }

  
  const { AuthClient } = await import('@dfinity/auth-client')
  const authClient = await AuthClient.create()
  
  const isAuthenticated = await authClient.isAuthenticated()
  
  if (!isAuthenticated) {
    throw new Error('❌ Authentication required but user is not authenticated')
  }
  
  const identity = authClient.getIdentity()
  const agent = new HttpAgent({
    host,
    identity
  })

  if (isLocalReplicaHost(host)) {
    if (isHttpsPage()) {
      console.warn('Skipping fetchRootKey on HTTPS page for local replica host; ensure you run the app over http://localhost during local development.')
    } else {
      let lastError: unknown = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await agent.fetchRootKey()
          lastError = null
          break
        } catch (err) {
          lastError = err
          await new Promise((r) => setTimeout(r, 500))
        }
      }
      if (lastError) {
        console.warn(`Failed to fetch root key from local replica. Proceeding without it. Error:`, lastError)
      }
    }
  }

  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
  
  return actor;
}

export async function getPrincipalText() {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();

  return identity.getPrincipal().toText();
}
