import NotificationTest from '@/components/pwa/NotificationTest'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { useEffect, useState } from 'react'
import { Bell, CheckCircle, Smartphone, Wifi, XCircle } from 'lucide-react'

export default function PWATestPage() {
    const [tests, setTests] = useState({
        manifest: false,
        serviceWorker: false,
        notifications: false,
        installable: false,
        offline: false
    })

    const [isOnline, setIsOnline] = useState(true)
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

    useEffect(() => {
        fetch('/manifest.json')
            .then(response => response.json())
            .then(() => setTests(prev => ({ ...prev, manifest: true })))
            .catch(() => setTests(prev => ({ ...prev, manifest: false })))

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then(registration => {
                    setTests(prev => ({ ...prev, serviceWorker: !!registration }))
                })
        }

        if ('Notification' in window) {
            setNotificationPermission(Notification.permission)
            setTests(prev => ({ ...prev, notifications: Notification.permission === 'granted' }))
        }

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setTests(prev => ({ ...prev, installable: true }))
        }

        setTests(prev => ({ ...prev, offline: 'serviceWorker' in navigator }))

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission()
            setNotificationPermission(permission)
            setTests(prev => ({ ...prev, notifications: permission === 'granted' }))
        }
    }

    const testNotification = () => {
        if (notificationPermission === 'granted') {
            new Notification('SplitSafe Test', {
                body: 'This is a test notification from SplitSafe PWA',
                icon: '/icon-192x192.png'
            })
        }
    }

    const testOffline = () => {
        fetch('https://httpbin.org/get')
            .then(response => {
                if (response.ok) {
                    alert('Online: Request successful')
                }
            })
            .catch(() => {
                alert('Offline: Request failed (expected)')
            })
    }

    const TestItem = ({ name, passed, description }: { name: string, passed: boolean, description: string }) => (
        <div className="flex items-center gap-3 p-3 bg-[#222222] border border-[#303434] rounded-lg">
            {passed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
                <XCircle className="w-5 h-5 text-red-500" />
            )}
            <div className="flex-1">
                <Typography variant="p" className="font-medium">
                    {name}
                </Typography>
                <Typography variant="muted" className="text-sm text-gray-400">
                    {description}
                </Typography>
            </div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Typography variant="h2" className="mb-6">
                PWA Test Dashboard
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-[#222222] border border-[#303434] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Wifi className={`w-5 h-5 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
                        <Typography variant="p" className="font-medium">
                            Network Status
                        </Typography>
                    </div>
                    <Typography variant="muted" className="text-sm">
                        {isOnline ? 'Online' : 'Offline'}
                    </Typography>
                </div>

                <div className="p-4 bg-[#222222] border border-[#303434] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className={`w-5 h-5 ${notificationPermission === 'granted' ? 'text-green-500' : 'text-yellow-500'}`} />
                        <Typography variant="p" className="font-medium">
                            Notifications
                        </Typography>
                    </div>
                    <Typography variant="muted" className="text-sm">
                        {notificationPermission}
                    </Typography>
                </div>

                <div className="p-4 bg-[#222222] border border-[#303434] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-5 h-5 text-[#FEB64D]" />
                        <Typography variant="p" className="font-medium">
                            PWA Ready
                        </Typography>
                    </div>
                    <Typography variant="muted" className="text-sm">
                        {Object.values(tests).every(Boolean) ? 'Yes' : 'Partial'}
                    </Typography>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <Typography variant="h3" className="mb-4">
                    PWA Feature Tests
                </Typography>

                <TestItem
                    name="Web App Manifest"
                    passed={tests.manifest}
                    description="App manifest is accessible and valid"
                />

                <TestItem
                    name="Service Worker"
                    passed={tests.serviceWorker}
                    description="Service worker is registered and active"
                />

                <TestItem
                    name="Push Notifications"
                    passed={tests.notifications}
                    description="Notification permission is granted"
                />

                <TestItem
                    name="Installable"
                    passed={tests.installable}
                    description="App meets PWA installability criteria"
                />

                <TestItem
                    name="Offline Support"
                    passed={tests.offline}
                    description="Service worker provides offline functionality"
                />
            </div>

            <div className="space-y-4">
                <Typography variant="h3" className="mb-4">
                    Test Actions
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={requestNotificationPermission}
                        disabled={notificationPermission === 'granted'}
                        className="w-full"
                    >
                        Request Notification Permission
                    </Button>

                    <Button
                        onClick={testNotification}
                        disabled={notificationPermission !== 'granted'}
                        variant="outline"
                        className="w-full"
                    >
                        Test Notification
                    </Button>

                    <Button
                        onClick={testOffline}
                        variant="outline"
                        className="w-full"
                    >
                        Test Offline Functionality
                    </Button>

                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="w-full"
                    >
                        Refresh Tests
                    </Button>
                </div>
            </div>

            <div className="mt-8">
                <NotificationTest />
            </div>

            <div className="mt-8 p-4 bg-[#1a1a1a] border border-[#303434] rounded-lg">
                <Typography variant="h4" className="mb-3">
                    Testing Instructions
                </Typography>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Open Chrome DevTools (F12) → Application tab to inspect PWA features</li>
                    <li>• Check Manifest section to verify app metadata</li>
                    <li>• Check Service Workers section to verify registration</li>
                    <li>• Use Lighthouse tab to run PWA audit</li>
                    <li>• Test offline by going to Network tab → Offline</li>
                    <li>• Look for install button in Chrome address bar</li>
                </ul>
            </div>
        </div>
    )
}

