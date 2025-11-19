// Feedback Module Types

export interface FeedbackSubmissionData {
  name: string
  email: string
  rating: number
  message: string
  userAgent?: string
  ipAddress?: string
}

export interface FeedbackSubmissionResult {
  success: boolean
  feedbackId?: string
  error?: string
}

export interface FeedbackStats {
  totalCount: number
  averageRating: number
  ratingDistribution: Record<number, number>
}

export interface FeedbackModalStatus {
  shouldShow: boolean
  hasSubmitted: boolean
  principal?: string
  ipAddress?: string
  transactionCount?: number
}

// Re-export types from ICP feedback module
export type { AnonymousFeedback } from '@/lib/internal/icp/feedback'
