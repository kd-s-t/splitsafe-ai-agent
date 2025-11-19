import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

export default function ForceInstallPage() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [canInstall, setCanInstall] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)
    const [swRegistered, setSwRegistered] = useState(false)
    const [manifestValid, setManifestValid] = useState(false)

    useEffect(() => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches
        setIsInstalled(standalone)

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setCanInstall(true)
            console.log('✅ Install prompt event captured!')
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then(registration => {
                    setSwRegistered(!!registration)
                    console.log('Service Worker registered:', !!registration)
                })
        }

        fetch('/manifest.json')
            .then(response => response.json())
            .then(() => setManifestValid(true))
            .catch(() => setManifestValid(false))

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert('Install prompt not available. Try refreshing the page or check browser requirements.')
            return
        }

        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === 'accepted') {
                console.log('✅ User accepted the install prompt')
                setCanInstall(false)
                setDeferredPrompt(null)
            } else {
                console.log('❌ User dismissed the install prompt')
            }
        } catch (error) {
            console.error('Error showing install prompt:', error)
        }
    }

    const triggerInstallPrompt = () => {
        console.log('Attempting to trigger install prompt...')

        if (deferredPrompt) {
            handleInstallClick()
        } else {
            alert('Install prompt not available. Try:\n1. Chrome menu (⋮) → "Install SplitSafe..."\n2. Refresh the page\n3. Wait a few minutes for the prompt to appear')
        }
    }

    const StatusItem = ({ name, status, description }: { name: string, status: boolean, description: string }) => (
        <div className="flex items-center gap-3 p-3 bg-[#222222] border border-[#303434] rounded-lg">
            {status ? (
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
                Force Install Prompt Test
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-[#222222] border border-[#303434] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Download className={`w-5 h-5 ${canInstall ? 'text-green-500' : 'text-yellow-500'}`} />
                        <Typography variant="p" className="font-medium">
                            Install Prompt Status
                        </Typography>
                    </div>
                    <Typography variant="muted" className="text-sm">
                        {canInstall ? 'Available' : 'Not Available'}
                    </Typography>
                </div>

                <div className="p-4 bg-[#222222] border border-[#303434] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        {isInstalled ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-blue-500" />
                        )}
                        <Typography variant="p" className="font-medium">
                            Installation Status
                        </Typography>
                    </div>
                    <Typography variant="muted" className="text-sm">
                        {isInstalled ? 'App is installed' : 'Not installed'}
                    </Typography>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <Typography variant="h3" className="mb-4">
                    PWA Requirements Check
                </Typography>

                <StatusItem
                    name="Service Worker"
                    status={swRegistered}
                    description="Service worker is registered and active"
                />

                <StatusItem
                    name="Web App Manifest"
                    status={manifestValid}
                    description="Manifest is valid and accessible"
                />

                <StatusItem
                    name="HTTPS"
                    status={window.location.protocol === 'https:'}
                    description="Site is served over HTTPS"
                />

                <StatusItem
                    name="Install Prompt Event"
                    status={canInstall}
                    description="beforeinstallprompt event is available"
                />
            </div>

            <div className="space-y-4">
                <Typography variant="h3" className="mb-4">
                    Install Actions
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={triggerInstallPrompt}
                        disabled={!canInstall}
                        className="w-full bg-[#FEB64D] hover:bg-[#FEA52D] text-black"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {canInstall ? 'Install App' : 'Install Not Available'}
                    </Button>

                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="w-full"
                    >
                        Refresh Page
                    </Button>
                </div>

                <div className="p-4 bg-[#1a1a1a] border border-[#303434] rounded-lg">
                    <Typography variant="h4" className="mb-3">
                        Manual Install Instructions
                    </Typography>
                    <ul className="text-sm text-gray-300 space-y-2">
                        <li>• <strong>Chrome:</strong> Click menu (⋮) → &quot;Install SplitSafe...&quot;</li>
                        <li>• <strong>Edge:</strong> Click menu (⋯) → &quot;Apps&quot; → &quot;Install this site as an app&quot;</li>
                        <li>• <strong>Mobile:</strong> Look for &quot;Add to Home Screen&quot; prompt</li>
                        <li>• <strong>iOS Safari:</strong> Share button → &quot;Add to Home Screen&quot;</li>
                    </ul>
                </div>

                <div className="p-4 bg-[#1a1a1a] border border-[#303434] rounded-lg">
                    <Typography variant="h4" className="mb-3">
                        Troubleshooting Tips
                    </Typography>
                    <ul className="text-sm text-gray-300 space-y-2">
                        <li>• Clear browser cache and reload</li>
                        <li>• Wait 2-3 minutes for install prompt to appear</li>
                        <li>• Try different browser (Chrome recommended)</li>
                        <li>• Check Chrome DevTools → Application → Manifest for errors</li>
                        <li>• Ensure you&apos;re using HTTPS (not HTTP)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

