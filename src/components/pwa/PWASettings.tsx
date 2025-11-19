'use client'

import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { requestNotificationPermission } from '@/lib/integrations/pusher/client'
import { Bell, BellOff, Download, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PWASettingsProps {
    className?: string
}

export default function PWASettings({ className }: PWASettingsProps) {
    const [isSupported, setIsSupported] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [isInstalled, setIsInstalled] = useState(false)
    const [canInstall, setCanInstall] = useState(false)

    useEffect(() => {
        // Check PWA support
        const supported = 'serviceWorker' in navigator && 'Notification' in window
        setIsSupported(supported)

        if (supported) {
            setPermission(Notification.permission)
        }

        // Check if app is installed
        const standalone = window.matchMedia('(display-mode: standalone)').matches
        setIsInstalled(standalone)

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setCanInstall(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleRequestNotificationPermission = async () => {
        if (!isSupported) return

        try {
            const granted = await requestNotificationPermission()
            setPermission(granted ? 'granted' : 'denied')
        } catch (error) {
            console.error('Error requesting notification permission:', error)
        }
    }

    const installApp = async () => {
        // This would be handled by the InstallPrompt component
        // You could trigger the install prompt programmatically here
        console.log('Install app requested')
    }

    if (!isSupported) {
        return (
            <div className={className}>
                <Typography variant="muted" className="text-gray-400">
                    PWA features are not supported in this browser.
                </Typography>
            </div>
        )
    }

    return (
        <div className={className}>
            <Typography variant="h4" className="mb-4">
                App Settings
            </Typography>

            <div className="space-y-4">
                {/* Installation Status */}
                <div className="flex items-center justify-between p-4 bg-[#222222] border border-[#303434] rounded-lg">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-[#FEB64D]" />
                        <div>
                            <Typography variant="p" className="font-medium">
                                App Installation
                            </Typography>
                            <Typography variant="muted" className="text-sm text-gray-400">
                                {isInstalled ? 'App is installed' : 'Install app for better experience'}
                            </Typography>
                        </div>
                    </div>
                    {!isInstalled && canInstall && (
                        <Button
                            onClick={installApp}
                            size="sm"
                            className="bg-[#FEB64D] hover:bg-[#FEA52D] text-black"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Install
                        </Button>
                    )}
                </div>

                {/* Notification Settings */}
                <div className="flex items-center justify-between p-4 bg-[#222222] border border-[#303434] rounded-lg">
                    <div className="flex items-center gap-3">
                        {permission === 'granted' ? (
                            <Bell className="w-5 h-5 text-green-500" />
                        ) : (
                            <BellOff className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                            <Typography variant="p" className="font-medium">
                                Push Notifications
                            </Typography>
                            <Typography variant="muted" className="text-sm text-gray-400">
                                {permission === 'granted'
                                    ? 'Notifications are enabled'
                                    : permission === 'denied'
                                        ? 'Notifications are blocked'
                                        : 'Enable notifications for updates'
                                }
                            </Typography>
                        </div>
                    </div>
                    {permission !== 'granted' && (
                        <Button
                            onClick={handleRequestNotificationPermission}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                            Enable
                        </Button>
                    )}
                </div>

                {/* PWA Info */}
                <div className="p-4 bg-[#222222] border border-[#303434] rounded-lg">
                    <Typography variant="p" className="font-medium mb-2">
                        Progressive Web App Features
                    </Typography>
                    <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Offline access to your dashboard</li>
                        <li>• Push notifications for transaction updates</li>
                        <li>• Install on your device for quick access</li>
                        <li>• Works like a native app</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
