"use client"

import { useEffect } from 'react'

export default function DocumentTitle() {
  useEffect(() => {
    // Set the document title based on environment
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      document.title = 'SplitSafe - Development'
    } else {
      document.title = 'SplitSafe'
    }
  }, [])

  return null
} 