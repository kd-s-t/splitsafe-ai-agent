import { getAllFeedbacksAnonymous as getFeedbacksFromICP, submitFeedback as submitToICP } from '@/lib/internal/icp/feedback'
import type {
    AnonymousFeedback,
    FeedbackModalStatus,
    FeedbackStats,
    FeedbackSubmissionData,
    FeedbackSubmissionResult
} from './types'

// Re-export types for external use
export type { AnonymousFeedback, FeedbackModalStatus, FeedbackStats, FeedbackSubmissionData, FeedbackSubmissionResult }

/**
 * Submit feedback directly to the ICP canister
 */
export async function submitFeedback(data: FeedbackSubmissionData): Promise<FeedbackSubmissionResult> {
  try {
    // const { AuthClient } = await import('@dfinity/auth-client')
    // const authClient = await AuthClient.create()
    // const identity = authClient.getIdentity() // Not used in current implementation
    
    const result = await submitToICP({
      name: data.name,
      email: data.email,
      rating: data.rating,
      message: data.message,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      ipAddress: undefined, // Will be handled by the canister
      principal: undefined // Anonymous submission
    })

    if ('ok' in result) {
      return {
        success: true,
        feedbackId: result.ok
      }
    } else {
      return {
        success: false,
        error: result.err
      }
    }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get all anonymous feedbacks directly from ICP canister
 */
export async function getAllFeedbacks(): Promise<AnonymousFeedback[]> {
  try {
    return await getFeedbacksFromICP()
  } catch (error) {
    console.error('Error fetching feedbacks:', error)
    return []
  }
}

/**
 * Get feedback statistics directly from ICP canister
 */
export async function getFeedbackStats(): Promise<FeedbackStats> {
  try {
    const feedbacks = await getFeedbacksFromICP()
    
    if (feedbacks.length === 0) {
      return {
        totalCount: 0,
        averageRating: 0,
        ratingDistribution: {}
      }
    }

    const totalCount = feedbacks.length
    const averageRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalCount
    const ratingDistribution = feedbacks.reduce((dist, feedback) => {
      dist[feedback.rating] = (dist[feedback.rating] || 0) + 1
      return dist
    }, {} as Record<number, number>)

    return {
      totalCount,
      averageRating,
      ratingDistribution
    }
  } catch (error) {
    console.error('Error fetching feedback stats:', error)
    return {
      totalCount: 0,
      averageRating: 0,
      ratingDistribution: {}
    }
  }
}

/**
 * Check if user should see feedback modal (smart frequency)
 * For now, always return true for simplicity
 */
export async function shouldShowFeedbackModal(principal?: string, transactionCount?: number): Promise<FeedbackModalStatus> {
  try {
    // Simple logic: show modal if user has made transactions but hasn't submitted feedback recently
    // This can be enhanced later with more sophisticated logic
    return {
      shouldShow: true,
      hasSubmitted: false,
      principal,
      transactionCount
    }
  } catch (error) {
    console.error('Error checking feedback modal status:', error)
    return {
      shouldShow: false,
      hasSubmitted: false
    }
  }
}

/**
 * Get feedbacks by minimum rating
 */
export async function getFeedbacksByRating(minRating: number): Promise<AnonymousFeedback[]> {
  try {
    const allFeedbacks = await getAllFeedbacks()
    return allFeedbacks.filter(feedback => feedback.rating >= minRating)
  } catch (error) {
    console.error('Error filtering feedbacks by rating:', error)
    return []
  }
}

/**
 * Get recent feedbacks (last N days)
 */
export async function getRecentFeedbacks(days: number = 30): Promise<AnonymousFeedback[]> {
  try {
    const allFeedbacks = await getAllFeedbacks()
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)
    
    return allFeedbacks.filter(feedback => {
      const feedbackDate = Number(feedback.timestamp) / 1000000 // Convert from nanoseconds
      return feedbackDate >= cutoffDate
    })
  } catch (error) {
    console.error('Error filtering recent feedbacks:', error)
    return []
  }
}
