import { idlFactory, canisterId as generatedCanisterId } from '@/declarations/split_dapp';
import { Actor, HttpAgent } from '@dfinity/agent';

// Check if we're on localhost (development) or ICP mainnet (production)
const IS_LOCAL = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  : false

const isHttpsPage = () => typeof window !== 'undefined' && window.location.protocol === 'https:'
const isLocalReplicaHost = (host: string) => host.includes('127.0.0.1') || host.includes('localhost')

const getHost = () => {
  // CRITICAL: Check runtime location first (most reliable)
  if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.endsWith('.icp0.io') || hostname.endsWith('.ic0.app') || hostname === 'icp0.io' || hostname === 'ic0.app') {
        return 'https://icp0.io'
      }
  }

  const dfxHost = process.env.VITE_DFX_HOST
  if (dfxHost) {
    try {
      const url = new URL(dfxHost)
      if (url.hostname === 'localhost') url.hostname = '127.0.0.1'
      if (url.hostname === '127.0.0.1' && url.protocol !== 'http:') url.protocol = 'http:'
      return url.toString().replace(/\/$/, '')
    } catch {
      return dfxHost
    }
  }

  if (IS_LOCAL) {
    return 'http://127.0.0.1:4943'
  }

  return 'https://icp0.io'
}

const getCanisterId = () => {
  // CRITICAL: Always check runtime location first (most reliable)
  if (!IS_LOCAL) {
    const productionCanisterId = 'efzgd-dqaaa-aaaai-q323a-cai'
    return productionCanisterId
  }
  
  const canisterId = process.env.VITE_CANISTER_ID_SPLIT_DAPP
  if (canisterId && canisterId.trim() !== '') {
    return canisterId
  }
  
  if (generatedCanisterId) {
    return generatedCanisterId as unknown as string
  }
  
  return undefined
}

/**
 * Create an authenticated SplitDapp actor (uses runtime detection for host/canister ID)
 */
export async function createSplitDappActor() {
  const host = getHost()
  const canisterId = getCanisterId()

  if (!canisterId) {
    throw new Error('Canister ID is required for split_dapp actor')
  }

  const { AuthClient } = await import('@dfinity/auth-client')
  const authClient = await AuthClient.create()
  const identity = authClient.getIdentity()
  
  const agent = new HttpAgent({
    host,
    identity
  })

  if (isLocalReplicaHost(host)) {
    const isHttps = isHttpsPage()
    console.log('[splitDapp] Local replica detected:', { host, isHttps, protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A' })
    
    if (isHttps) {
      console.warn('[splitDapp] ⚠️ Skipping fetchRootKey on HTTPS page for local replica host; ensure you run the app over http://localhost during local development.')
      console.warn('[splitDapp] Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A')
    } else {
      console.log('[splitDapp] Fetching root key from local replica...')
      let lastError: unknown = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`[splitDapp] Root key fetch attempt ${attempt}/3...`)
          await agent.fetchRootKey()
          console.log('[splitDapp] ✅ Root key fetched successfully!')
          lastError = null
          break
        } catch (err) {
          lastError = err
          console.warn(`[splitDapp] ⚠️ Root key fetch attempt ${attempt}/3 failed:`, err)
          if (attempt < 3) {
            const delay = 1000 * attempt
            console.log(`[splitDapp] Retrying in ${delay}ms...`)
            await new Promise((r) => setTimeout(r, delay))
          }
        }
      }
      if (lastError) {
        console.error('[splitDapp] ❌ Failed to fetch root key from local replica after 3 attempts. Error:', lastError)
        console.error('[splitDapp] This will cause "Invalid canister signature" errors.')
        console.error('[splitDapp] Solutions:')
        console.error('[splitDapp]   1. Make sure DFX is running: dfx ping local')
        console.error('[splitDapp]   2. Make sure you are accessing the app via http://localhost (not https://)')
        console.error('[splitDapp]   3. Try restarting DFX: dfx stop && dfx start')
        console.error('[splitDapp]   4. Try hard refreshing your browser (Cmd+Shift+R)')
        // Don't throw - let it fail gracefully with a clear error message
      }
    }
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}

/**
 * Create an anonymous SplitDapp actor (uses runtime detection for host/canister ID)
 */
export async function createAnonymousActor() {
  const host = getHost()
  const canisterId = getCanisterId()

  if (!canisterId) {
    throw new Error('Canister ID is required for split_dapp actor')
  }

  const agent = new HttpAgent({
    host
  })

  if (isLocalReplicaHost(host)) {
    if (isHttpsPage()) {
      console.warn('Skipping fetchRootKey on HTTPS page for local replica host')
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

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}
