"use client"

// Feedback Module Hooks

import { useCallback, useEffect, useRef, useState } from 'react'
import { getAllFeedbacks } from './feedback.service'
import { AnonymousFeedback } from './types'

/**
 * Hook for managing feedback display animation
 */
export function useFeedbackAnimation(feedbacks: AnonymousFeedback[]) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isInViewport, setIsInViewport] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (feedbacks.length === 0) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [feedbacks.length])

  useEffect(() => {
    if (isInViewport && feedbacks.length > 0) {
      setIsAnimating(true)
    } else {
      setIsAnimating(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isInViewport, feedbacks.length])

  const startAnimation = useCallback(() => {
    if (!isAnimating || feedbacks.length === 0) return

    const animate = () => {
      setScrollPosition(prev => {
        const container = containerRef.current
        if (!container) return prev

        // const containerHeight = container.clientHeight // Unused variable removed
        const scrollHeight = container.scrollHeight
        // const maxScroll = scrollHeight - containerHeight // Unused variable removed
        const singleSetHeight = scrollHeight / 2

        if (prev >= singleSetHeight) {
          return 0
        }

        return prev + 1
      })

      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, feedbacks.length])

  useEffect(() => {
    if (isAnimating) {
      startAnimation()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, startAnimation])

  return {
    containerRef,
    scrollPosition,
    isAnimating,
    isInViewport
  }
}

/**
 * Hook for managing feedback form state
 */
export function useFeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const resetForm = () => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(false)
  }

  return {
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    success,
    setSuccess,
    resetForm
  }
}

/**
 * Hook for loading feedbacks with error handling
 */
export function useFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<AnonymousFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getAllFeedbacks()
        setFeedbacks(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feedbacks')
        setFeedbacks([])
      } finally {
        setLoading(false)
      }
    }

    loadFeedbacks()
  }, [])

  return {
    feedbacks,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      setError(null)
      getAllFeedbacks()
        .then(setFeedbacks)
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to load feedbacks')
          setFeedbacks([])
        })
        .finally(() => setLoading(false))
    }
  }
}
