'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { AlertTriangle, Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface EnvironmentErrorProps {
  error: string
}

export default function EnvironmentError({ error }: EnvironmentErrorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    window.location.reload()
  }

  const handleCopyError = () => {
    navigator.clipboard.writeText(error)
    toast.error('Error', {
      description: 'Message copied to clipboard'
    })
  }

  // Extract missing variables from error message
  const missingVars = error.includes('Missing required environment variables:')
    ? error.split('Missing required environment variables: ')[1]?.split(', ') || []
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-white text-2xl font-bold">
            Environment Configuration Error
          </CardTitle>
          <Typography variant="muted" className="text-[#BCBCBC] mt-2">
            Required environment variables are missing
          </Typography>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-400">Configuration Required</AlertTitle>
            <AlertDescription className="text-red-300 mt-2">
              The application cannot start because required environment variables are missing.
            </AlertDescription>
          </Alert>

          {missingVars.length > 0 && (
            <div>
              <Typography variant="h4" className="text-white text-lg font-semibold mb-3">
                Missing Environment Variables:
              </Typography>
              <div className="space-y-2">
                {missingVars.map((variable, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#2A2A2A] rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <code className="text-[#FEB64D] font-mono text-sm">
                      {variable}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Typography variant="h4" className="text-white text-lg font-semibold mb-3">
              How to Fix:
            </Typography>
            <div className="space-y-3 text-[#BCBCBC]">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#FEB64D] text-black rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p>Create a <code className="text-[#FEB64D]">.env.local</code> file in your project root</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#FEB64D] text-black rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p>Add the missing environment variables with their values</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#FEB64D] text-black rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p>Restart your development server</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-semibold"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </>
              )}
            </Button>
            <Button
              onClick={handleCopyError}
              variant="outline"
              className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Error
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
