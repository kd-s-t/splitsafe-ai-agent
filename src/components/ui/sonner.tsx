'use client'

import { LucideCircleCheckBig, LucideCircleAlert, LucideInfo } from 'lucide-react'
import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      className='toast-container'
      position="top-right"
      richColors
      // closeButton is NOT included
      icons={{
        success: <LucideCircleCheckBig color='#00C287' size={18} />,
        error: <LucideCircleAlert color='#FF5768' size={18} />,
        info: <LucideInfo color='#71B5FF' size={18} />,
      }}
      toastOptions={{
        duration: 3000,
      }}
    />
  )
}
