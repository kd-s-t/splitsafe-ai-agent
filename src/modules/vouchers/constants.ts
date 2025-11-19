
export const ERROR_MESSAGES = {
    INSUFFICIENT_BALANCE: 'Insufficient balance to create voucher',
    VOUCHER_NOT_FOUND: 'Voucher not found',
    VOUCHER_ALREADY_REDEEMED: 'Voucher has already been redeemed',
    VOUCHER_EXPIRED: 'Voucher has expired',
    INVALID_VOUCHER_CODE: 'Invalid voucher code format',
    UNAUTHORIZED_ACCESS: 'Not authorized to perform this action',
    NETWORK_ERROR: 'Network connection error',
    CANISTER_ERROR: 'ICP canister error',
    VALIDATION_ERROR: 'Input validation failed',
    UNKNOWN_ERROR: 'An unexpected error occurred'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
    VOUCHER_CREATED: 'Voucher created successfully',
    VOUCHER_REDEEMED: 'Voucher redeemed successfully',
    VOUCHER_UPDATED: 'Voucher updated successfully',
    VOUCHER_CANCELLED: 'Voucher cancelled successfully',
    FUNDS_CREDITED: 'Funds have been credited to your account'
} as const

