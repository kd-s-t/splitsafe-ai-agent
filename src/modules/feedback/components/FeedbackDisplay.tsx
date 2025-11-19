"use client"

import { Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getAllFeedbacks } from '../feedback.service'
import { AnonymousFeedback } from '../types'

interface FeedbackDisplayProps {
  className?: string
}

export default function FeedbackDisplay({ className = "" }: FeedbackDisplayProps) {
  const [feedbacks, setFeedbacks] = useState<AnonymousFeedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [, setIsInViewport] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Load feedbacks on component mount
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setIsLoading(true)
        const data = await getAllFeedbacks()
        setFeedbacks(data)
        setError(null)
      } catch {
        setError('Failed to load feedbacks')
      } finally {
        setIsLoading(false)
      }
    }

    loadFeedbacks()
  }, [])

  // Intersection Observer to detect when component is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // Fade-in and slide-up effect
  useEffect(() => {
    if (feedbacks.length === 0 || isLoading || error) {
      setIsVisible(false)
      return
    }

    const fadeInTimer: NodeJS.Timeout = setTimeout(() => {
      setIsVisible(true)
      
      startSlideUp()
    }, 2000)

    let scrollAnimationId: number
    let isAnimating = true

    const startSlideUp = () => {
      const container = scrollContainerRef.current
      if (!container) {
        return
      }
      let currentScrollPosition = 0
      const scrollSpeed = 0.3 // pixels per frame

      const slideUp = () => {
        // Check if component is still visible and should continue animating
        if (!isAnimating || !isVisible) {
          return
        }

        currentScrollPosition += scrollSpeed
        
        // Get current scroll height (may change as content loads)
        const currentScrollHeight = container.scrollHeight
        // const containerHeight = container.clientHeight // Unused variable removed
        const singleSetHeight = currentScrollHeight / 2 // Height of one set of feedbacks
        
        
        // If there's not enough content to scroll, keep checking
        if (singleSetHeight <= 0) {
          scrollAnimationId = requestAnimationFrame(slideUp)
          return
        }
        
        // When we reach the end of the first set, reset to top seamlessly
        if (currentScrollPosition >= singleSetHeight) {
          currentScrollPosition = 0
        }
        
        // Use transform instead of scrollTop for smoother animation
        setScrollPosition(currentScrollPosition)
        scrollAnimationId = requestAnimationFrame(slideUp)
      }
      
      scrollAnimationId = requestAnimationFrame(slideUp)
    }

    return () => {
      isAnimating = false
      clearTimeout(fadeInTimer)
      if (scrollAnimationId) {
        cancelAnimationFrame(scrollAnimationId)
      }
    }
  }, [feedbacks, isLoading, error, isVisible])

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(Number(timestamp) / 1000000) // Convert from nanoseconds
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
        }`}
      />
    ))
  }

  if (error || feedbacks.length === 0) {
    return null // Don't show anything if there's an error or no feedbacks
  }

  return (
    <div 
      ref={containerRef}
      className={`hidden lg:block fixed left-4 md:left-8 top-1/3 transform -translate-y-1/2 w-72 md:w-80 max-h-96 transition-all duration-2000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'
      } ${className}`}
    >
        <div 
          ref={scrollContainerRef}
          className="space-y-4 max-h-80 overflow-hidden scrollbar-hide relative"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            maskImage: 'linear-gradient(to bottom, transparent 0px, black 20px, black calc(100% - 20px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 20px, black calc(100% - 20px), transparent 100%)'
          }}
        >
          <div 
            className="space-y-4"
            style={{
              transform: `translateY(-${scrollPosition}px)`,
              transition: 'none'
            }}
          >
          {/* First set of feedbacks */}
          {feedbacks.map((feedback, index) => (
            <div 
              key={`first-${feedback.id}`}
              className="p-4 hover:bg-white/10 transition-all duration-300"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {renderStars(feedback.rating)}
                </div>
                <span className="text-gray-400 text-xs">
                  {formatTimestamp(feedback.timestamp)}
                </span>
              </div>

              {/* Message */}
              <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                {feedback.message}
              </p>
            </div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {feedbacks.map((feedback, index) => (
            <div 
              key={`second-${feedback.id}`}
              className="p-4 hover:bg-white/10 transition-all duration-300"
              style={{
                animationDelay: `${(index + feedbacks.length) * 0.1}s`
              }}
            >
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {renderStars(feedback.rating)}
                </div>
                <span className="text-gray-400 text-xs">
                  {formatTimestamp(feedback.timestamp)}
                </span>
              </div>

              {/* Message */}
              <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                {feedback.message}
              </p>
            </div>
          ))}
          </div>
        </div>
    </div>
  )
}
