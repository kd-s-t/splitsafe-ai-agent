"use client"

import { useEffect, useState } from "react"

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkIsMobile = () => {
            const mediaQuery = window.matchMedia("(max-width: 768px)")
            setIsMobile(mediaQuery.matches)
        }

        // Check on mount
        checkIsMobile()

        // Add event listener for resize
        const mediaQuery = window.matchMedia("(max-width: 768px)")
        mediaQuery.addEventListener("change", checkIsMobile)

        // Cleanup
        return () => mediaQuery.removeEventListener("change", checkIsMobile)
    }, [])

    return isMobile
}
