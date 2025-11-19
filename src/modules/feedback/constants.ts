// Feedback Module Constants

export const FEEDBACK_CONSTANTS = {
  // Rating system
  MIN_RATING: 1,
  MAX_RATING: 5,
  DEFAULT_RATING: 0,
  
  // Form validation
  MIN_MESSAGE_LENGTH: 10,
  MAX_MESSAGE_LENGTH: 1000,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  
  // Animation settings
  SCROLL_SPEED: 1,
  ANIMATION_DELAY: 100,
  
  // Display settings
  FEEDBACKS_PER_PAGE: 10,
  MAX_DISPLAY_FEEDBACKS: 50,
  
  // API settings
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

export const FEEDBACK_MESSAGES = {
  SUCCESS: 'Thank you for your feedback!',
  ERROR: 'Failed to submit feedback',
  LOADING: 'Submitting feedback...',
  VALIDATION_ERROR: 'Please fill in all required fields',
  RATING_REQUIRED: 'Please select a rating',
  MESSAGE_TOO_SHORT: 'Message must be at least 10 characters',
  MESSAGE_TOO_LONG: 'Message must be less than 1000 characters',
  NAME_TOO_SHORT: 'Name must be at least 2 characters',
  NAME_TOO_LONG: 'Name must be less than 100 characters',
} as const

export const FEEDBACK_ANIMATION = {
  SCROLL_SPEED: 1,
  RESET_THRESHOLD: 0.5,
  INTERSECTION_THRESHOLD: 0.1,
} as const
