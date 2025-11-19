'use client'

import { useEffect } from 'react'

// Export utility function to clear PWA cache
export async function clearPWACache(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('caches' in window)) {
        console.warn('Service Worker or Cache API not supported')
        return false
    }

    try {
        // Method 1: Clear via service worker message
        const registration = await navigator.serviceWorker.ready
        if (registration.active) {
            return new Promise((resolve) => {
                const channel = new MessageChannel()
                channel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        console.log('✅ Cache cleared via service worker:', event.data.message)
                        resolve(true)
                    } else {
                        console.error('❌ Failed to clear cache:', event.data.error)
                        resolve(false)
                    }
                }
                registration.active?.postMessage({ type: 'CLEAR_CACHE' }, [channel.port2])
            })
        }

        // Method 2: Fallback - clear caches directly
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
        console.log('✅ All caches cleared directly:', cacheNames)
        
        // Unregister service worker to force fresh registration
        await registration.unregister()
        console.log('✅ Service worker unregistered')
        
        return true
    } catch (error) {
        console.error('❌ Error clearing PWA cache:', error)
        return false
    }
}

// Make it available on window for console access
if (typeof window !== 'undefined') {
    (window as any).clearPWACache = clearPWACache
}

// TEMPORARY: Set to false to disable PWA
const PWA_ENABLED = false

// Function to unregister all service workers and clear all caches
async function unregisterServiceWorkersAndClearCache() {
    if (!('serviceWorker' in navigator) && !('caches' in window)) {
        return
    }

    try {
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            for (const registration of registrations) {
                const unregistered = await registration.unregister()
                if (unregistered) {
                    console.log('✅ Service worker unregistered:', registration.scope)
                }
            }
        }

        // Clear all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(cacheNames.map(cacheName => {
                console.log('🗑️ Deleting cache:', cacheName)
                return caches.delete(cacheName)
            }))
            console.log('✅ All caches cleared:', cacheNames.length, 'cache(s)')
        }

        console.log('✅ PWA cleanup complete - all service workers unregistered and caches cleared')
    } catch (error) {
        console.error('❌ Error during PWA cleanup:', error)
    }
}

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        // Temporary PWA disable - unregister existing service workers and clear cache
        if (!PWA_ENABLED) {
            unregisterServiceWorkersAndClearCache()
            return
        }

        // Check if we're in development mode
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        
        // Service worker works on both production domains and ICP domains
        // Skip only in local development
        if (isDevelopment) {
            return
        }
        
        // PWA enabled - register service worker
        
        if ('serviceWorker' in navigator) {
            const registerSW = async () => {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        updateViaCache: 'none' // Always check for updates
                    })

                    // Registration succeeded

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available, show update notification
                                    // New content is available
                                    // You could show a toast notification here
                                }
                            })
                        }
                    })

                    // Handle service worker messages
                    navigator.serviceWorker.addEventListener('message', (event) => {
                        if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
                            const { title, body, options } = event.data
                            new Notification(title, {
                                body,
                                icon: '/icon-192x192.png',
                                badge: '/icon-192x192.png',
                                ...options
                            })
                        }
                    })

                } catch (error) {
                    console.error('Service Worker registration failed:', error)
                }
            }

            // Register service worker when page loads
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', registerSW)
            } else {
                registerSW()
            }
        }
    }, [])

    return null
}
