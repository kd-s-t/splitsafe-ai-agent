'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function TransactionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Transactions page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-gray-600 text-center max-w-md">
        There was an error loading your transactions. This might be due to a network issue or a problem with the blockchain connection.
      </p>
      <Button onClick={reset} className="bg-[#FEB64D] hover:bg-[#FEB64D]/90">
        Try again
      </Button>
    </div>
  )
}
