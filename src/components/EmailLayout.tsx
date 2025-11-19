'use client'

import { generateEmailFooter } from '@/lib/integrations/resend/layout/generateEmailFooter'
import { generateEmailHeader } from '@/lib/integrations/resend/layout/generateEmailHeader'
import { ReactNode } from 'react'

interface EmailLayoutProps {
  children: ReactNode
  title: string
  className?: string
}

export default function EmailLayout({ children, title, className = '' }: EmailLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Email Container */}
      <div className="max-w-2xl mx-auto bg-white shadow-lg">
        {/* Email Header */}
        <div 
          className="email-header"
          dangerouslySetInnerHTML={{ 
            __html: generateEmailHeader(title) 
          }}
        />
        
        {/* Email Content */}
        <div className="px-6 py-4">
          {children}
        </div>
        
        {/* Email Footer */}
        <div 
          className="email-footer"
          dangerouslySetInnerHTML={{ 
            __html: generateEmailFooter() 
          }}
        />
      </div>
    </div>
  )
}
