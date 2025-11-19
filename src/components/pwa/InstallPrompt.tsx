'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

// TEMPORARY: Set to false to disable PWA
const PWA_ENABLED = false

export default function InstallPrompt() {
    // Temporary PWA disable
    if (!PWA_ENABLED) {
        return null
    }
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Check if running on iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        setIsIOS(iOS)

        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches
        setIsStandalone(standalone)

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowInstallPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Check if app was installed
        window.addEventListener('appinstalled', () => {
            setShowInstallPrompt(false)
            setDeferredPrompt(null)
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt')
            } else {
                console.log('User dismissed the install prompt')
            }

            setDeferredPrompt(null)
            setShowInstallPrompt(false)
        } catch (error) {
            console.error('Error showing install prompt:', error)
        }
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)
        // Store dismissal in localStorage to avoid showing again for a while
        localStorage.setItem('install-prompt-dismissed', Date.now().toString())
    }

    // Don't show if already installed or if user dismissed recently
    if (isStandalone || !showInstallPrompt) {
        return null
    }

    // Check if user dismissed recently (within 7 days)
    const dismissedTime = localStorage.getItem('install-prompt-dismissed')
    if (dismissedTime) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
        if (daysSinceDismissed < 7) {
            return null
        }
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
            <div className="bg-[#1a1a1a] border border-[#303434] rounded-lg p-4 shadow-lg">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-[#FEB64D]" />
                        <h3 className="font-semibold text-white">Install SplitSafe</h3>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-sm text-gray-300 mb-4">
                    Install SplitSafe for quick access and a better experience on your device.
                </p>

                {isIOS ? (
                    <div className="space-y-2">
                        <p className="text-xs text-gray-400">
                            To install on iOS:
                        </p>
                        <ol className="text-xs text-gray-300 space-y-1 ml-4">
                            <li>1. Tap the Share button</li>
                            <li>2. Scroll down and tap &quot;Add to Home Screen&quot;</li>
                            <li>3. Tap &quot;Add&quot; to confirm</li>
                        </ol>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            onClick={handleInstallClick}
                            size="sm"
                            className="flex-1 bg-[#FEB64D] hover:bg-[#FEA52D] text-black"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Install
                        </Button>
                        <Button
                            onClick={handleDismiss}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                            Later
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
