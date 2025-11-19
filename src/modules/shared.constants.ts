// Shared constants across all modules

// Bitcoin explorer URL
export const BLOCKSTREAM_URL = process.env.VITE_BLOCKSTREAM_URL || 'https://blockstream.info';

// Activity categories for transactions
export const ACTIVITY_CATEGORIES = {
  SENT: "sent",
  RECEIVED: "received"
} as const;

// Escrow messages API prefix
export const ESCROW_MESSAGES_API_PREFIX = '/api/escrows';

// Random title suggestions for escrow creation
export const RANDOM_TITLES = [
  "Freelance Web Development Payment",
  "Design Project Milestone",
  "Consulting Services Escrow",
  "Content Creation Payment",
  "Software Development Phase 1",
  "Marketing Campaign Deposit",
  "Project Management Fee",
  "Technical Support Payment",
  "Creative Services Escrow",
  "Business Consulting Fee",
  "Product Development Payment",
  "Strategic Planning Deposit",
  "Client Project Escrow",
  "Professional Services Payment",
  "Digital Asset Transfer",
  "Business Partnership Payment",
  "Service Agreement Deposit",
  "Project Completion Payment",
  "Work Milestone Escrow",
  "Professional Fee Payment"
];

// Available profile pictures
export const PROFILE_PICTURES = [
  '10790790.png',
  '10790797.png', 
  '10790803.png',
  '10790804.png',
  '10790809.png',
  '10790811.png',
  '10790812.png',
  '10790814.png',
  '10790815.png',
  '10790816.png'
];

// Profile picture IDs (without extension)
export const PROFILE_PICTURE_IDS = [
  '10790790', '10790797', '10790803', '10790804', '10790809', 
  '10790811', '10790812', '10790814', '10790815', '10790816'
];

// Animal names for generating consistent names based on principal hash
export const ANIMALS = [
  'Lion', 'Tiger', 'Bear', 'Wolf', 'Eagle', 'Shark', 'Dolphin', 'Fox', 
  'Owl', 'Hawk', 'Falcon', 'Panther', 'Jaguar', 'Leopard', 'Cheetah',
  'Elephant', 'Rhino', 'Hippo', 'Giraffe', 'Zebra', 'Monkey', 'Gorilla',
  'Panda', 'Koala', 'Kangaroo', 'Penguin', 'Seal', 'Whale', 'Octopus',
  'Butterfly', 'Bee', 'Dragonfly', 'Ladybug', 'Spider', 'Ant', 'Beetle'
];

// Default values
export const DEFAULT_PAYMENT_TITLE = "Payment Split";
export const DEFAULT_CURRENCY = '$';

// API and channel prefixes
export const CHAT_CHANNEL_PREFIX = 'escrow-chat-';

// Sample data for testing
export const SAMPLE_BLOCK_HASH = "00000000000000000001bb418ff8dfff65ea0dab3d9f53923112d2b2f12f4ee7";

// ===== COMMON UI CONSTANTS =====

// UI sizing constants
export const UI_SIZES = {
  AVATAR: {
    SMALL: 32,
    MEDIUM: 40,
    LARGE: 48,
    XLARGE: 64,
  },
  TRUNCATE: {
    PRINCIPAL: 8,
    ID: 12,
    ADDRESS: 16,
  },
} as const;

// Form validation constraints
export const FORM_CONSTRAINTS = {
  NICKNAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  PRINCIPAL_ID: {
    MIN_LENGTH: 1,
  },
  AMOUNT: {
    MIN: 0.00000001,
    MAX: 1000000,
  },
} as const;

// ===== COMMON MESSAGES =====

// Success messages
export const SUCCESS_MESSAGES = {
  SAVE: 'Saved successfully',
  UPDATE: 'Updated successfully',
  DELETE: 'Deleted successfully',
  CREATE: 'Created successfully',
  SEND: 'Sent successfully',
  RECEIVE: 'Received successfully',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  SAVE: 'Failed to save',
  UPDATE: 'Failed to update',
  DELETE: 'Failed to delete',
  CREATE: 'Failed to create',
  LOAD: 'Failed to load',
  NETWORK: 'Network error occurred',
  AUTH: 'Authentication required',
  PERMISSION: 'Permission denied',
} as const;

// Placeholder text
export const PLACEHOLDERS = {
  SEARCH: 'Search...',
  AMOUNT: 'Enter amount',
  ADDRESS: 'Enter address',
  NICKNAME: 'Enter nickname',
  PRINCIPAL: 'Enter principal ID',
  TITLE: 'Enter title',
} as const;

// ===== COMMON DIALOG CONSTANTS =====

export const DIALOG_TITLES = {
  ADD: 'Add new item',
  UPDATE: 'Update item',
  DELETE: 'Delete item',
  CONFIRM: 'Confirm action',
  INFO: 'Information',
  ERROR: 'Error',
} as const;

export const DIALOG_DESCRIPTIONS = {
  DELETE_CONFIRM: 'Are you sure you want to delete this item? This action cannot be undone.',
  UPDATE_CONFIRM: 'Are you sure you want to update this item?',
  SAVE_CONFIRM: 'Are you sure you want to save these changes?',
} as const;
