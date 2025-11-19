'use client'

import { useUser } from '@/hooks/useUser'
import Pusher from 'pusher-js'
import { useCallback, useEffect, useState } from 'react'

interface PushNotificationManagerProps {
    children?: React.ReactNode
}

// TEMPORARY: Set to false to disable PWA
const PWA_ENABLED = false

export default function PushNotificationManager({ children }: PushNotificationManagerProps) {
    // Hooks must be called unconditionally
    const { principal } = useUser()
    const [isSupported, setIsSupported] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [, setPusher] = useState<Pusher | null>(null)

    // Temporary PWA disable - skip all PWA functionality
    useEffect(() => {
        if (!PWA_ENABLED) return
        
        // Check if notifications are supported
        if ('Notification' in window && 'serviceWorker' in navigator) {
            setIsSupported(true)
            setPermission(Notification.permission)
        }
    }, [])

    const showNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
        if (permission !== 'granted' || !isSupported) return

        // Use service worker for notifications if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title,
                body,
                options: {
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    ...options
                }
            })
        } else {
            // Fallback to direct notification
            new Notification(title, {
                body,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                ...options
            })
        }
    }, [permission, isSupported])

    const requestNotificationPermission = useCallback(async () => {
        if (!isSupported) return false

        try {
            const permission = await Notification.requestPermission()
            setPermission(permission)
            return permission === 'granted'
        } catch (error) {
            console.error('Error requesting notification permission:', error)
            return false
        }
    }, [isSupported])

    useEffect(() => {
        if (!PWA_ENABLED || !principal || !isSupported) return

        // Use centralized Pusher client instead of creating a new instance
        import('@/lib/integrations/pusher/client').then(({ pusherClient, subscribeToChannel }) => {
            if (!pusherClient) {
                console.warn('[PushNotificationManager] Pusher not configured - push notifications disabled');
                return;
            }

            // Subscribe to user-specific channel using centralized client
            const channel = subscribeToChannel(`user-${principal}`);

            if (!channel) {
                console.warn('[PushNotificationManager] Failed to subscribe to channel');
                return;
            }

            // Listen for escrow updates
            channel.bind('escrow-updated', (data: { message?: string }) => {
                showNotification('Escrow Updated', data.message || 'Your escrow has been updated')
            })

            // Listen for milestone completions
            channel.bind('milestone-completed', (data: { message?: string }) => {
                showNotification('Milestone Completed', data.message || 'A milestone has been completed')
            })

            // Listen for payment releases
            channel.bind('payment-released', (data: { message?: string }) => {
                showNotification('Payment Released', data.message || 'Payment has been released')
            })

            // Listen for transaction status changes
            channel.bind('transaction-updated', (data: { message?: string }) => {
                showNotification('Transaction Updated', data.message || 'Your transaction status has changed')
            })

            setPusher(pusherClient as unknown as Pusher)

            // Note: No cleanup needed as centralized client manages connections
        }).catch((error) => {
            console.error('[PushNotificationManager] Error initializing Pusher:', error);
        })
    }, [principal, isSupported, showNotification])



    // Auto-subscribe when user is authenticated and notifications are supported
    useEffect(() => {
        if (!PWA_ENABLED || !principal || !isSupported || permission !== 'default') return
        requestNotificationPermission()
    }, [principal, isSupported, permission, requestNotificationPermission])

    return (
        <>
            {children}
            {/* You can add notification permission UI here if needed */}
        </>
    )
}
