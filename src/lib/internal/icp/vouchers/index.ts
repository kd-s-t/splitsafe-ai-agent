/**
 * Centralized Voucher Methods for ICP Integration
 * 
 * All voucher-related canister calls should go through these methods
 * to ensure consistency, error handling, and maintainability.
 */

import { Principal } from '@dfinity/principal';
import { createSplitDappActor } from '../splitDapp';
import {
    CreateVoucherResult,
    PrincipalObject,
    RedeemVoucherResult,
    Voucher,
    VoucherFormData,
    VoucherResult
} from '../types';

// Re-export types for convenience
export type {
    CreateVoucherResult,
    PrincipalObject,
    RedeemVoucherResult,
    Voucher,
    VoucherFormData,
    VoucherResult
} from '../types';

/**
 * Create a new voucher
 * @param formData - Voucher form data
 * @param userPrincipal - Principal of the user creating the voucher
 * @returns Promise<CreateVoucherResult> - Result of the create operation
 */
export const createVoucher = async (
    formData: VoucherFormData,
    _userPrincipal: Principal
): Promise<{ "ok": string } | { "err": string }> => {
    try {
        const canister = await createSplitDappActor();

        const amountBigInt = BigInt(Math.round(formData.amount * 100000000)); // Convert BTC to satoshis
        const expiredAtBigInt = BigInt(formData.expiredAt.getTime() * 1000000); // Convert to nanoseconds


        const result = await canister.createVoucher(
            _userPrincipal,
            formData.code,
            amountBigInt,
            formData.description,
            expiredAtBigInt
        );


        return result as { "ok": string } | { "err": string };
    } catch {
        return {
            err: 'Error creating voucher',
        };
    }
};

/**
 * Create a voucher with rate limiting
 * @param formData - Voucher form data
 * @param userPrincipal - Principal of the user creating the voucher
 * @returns Promise<CreateVoucherResult> - Result of the create operation
 */
export const createVoucherWithRateLimit = async (
    formData: VoucherFormData,
    userPrincipal: Principal
): Promise<CreateVoucherResult> => {
    try {
        const canister = await createSplitDappActor();
        const amountBigInt = BigInt(Math.round(formData.amount * 100000000));
        const expiredAtBigInt = BigInt(formData.expiredAt.getTime() * 1000000); // Convert to nanoseconds

        const result = await canister.createVoucherWithRateLimit(
            formData.code,
            amountBigInt,
            formData.description,
            expiredAtBigInt,
            userPrincipal
        );

        return result as CreateVoucherResult;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create voucher'
        };
    }
};

/**
 * Redeem a voucher
 * @param voucherCode - Code of the voucher to redeem
 * @param userPrincipal - Principal of the user redeeming the voucher
 * @returns Promise<RedeemVoucherResult> - Result of the redeem operation
 */
export const redeemVoucher = async (
    voucherCode: string,
    userPrincipal: Principal
): Promise<RedeemVoucherResult> => {
    try {
        const canister = await createSplitDappActor();


        const result = await canister.redeemVoucher(voucherCode, userPrincipal);
        return result as RedeemVoucherResult;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to redeem voucher'
        };
    }
};

/**
 * Cancel a voucher
 * @param voucherId - ID of the voucher to cancel
 * @param userPrincipal - Principal of the user canceling the voucher
 * @returns Promise<VoucherResult> - Result of the cancel operation
 */
export const cancelVoucher = async (
    voucherId: string
): Promise<VoucherResult> => {
    try {
        const canister = await createSplitDappActor();


        const result = await canister.cancelVoucher(voucherId);
        return result as VoucherResult;
    } catch (error) {
        return {
            err: error instanceof Error ? error.message : 'Failed to cancel voucher'
        };
    }
};

/**
 * Get all vouchers for a user
 * @returns Promise<Voucher[]> - Array of user's vouchers
 */
export const getUserVouchers = async (ownerId: Principal): Promise<Voucher[]> => {
    try {
        const canister = await createSplitDappActor();

        const result = await canister.getUserVouchers(ownerId);

        const converted = (result as unknown[]).map((voucher: unknown) => {
            const voucherObj = voucher as Record<string, unknown>;

            let createdByPrincipal = voucherObj.createdBy;

            if (voucherObj.createdBy && typeof voucherObj.createdBy === 'object' && (voucherObj.createdBy as PrincipalObject)._isPrincipal) {
                try {
                    createdByPrincipal = voucherObj.createdBy;
                } catch {
                }
            }

            const convertedVoucher = {
                ...voucherObj,
                createdBy: createdByPrincipal,
            };

            return convertedVoucher;
        }) as Voucher[];

        return converted;
    } catch {
        throw new Error('Failed to fetch user vouchers');
    }
};

/**
 * Update an existing voucher
 * @param voucherId - ID of the voucher to update
 * @param description - New description for the voucher
 * @param expiredAt - New expiration date
 * @returns Promise<VoucherResult> - Result of the update operation
 */
export const updateVoucher = async (
    voucherId: string,
    description: string,
    expiredAt: Date
): Promise<VoucherResult> => {
    try {
        const canister = await createSplitDappActor();
        const expiredAtBigInt = BigInt(expiredAt.getTime() * 1000000); // Convert to nanoseconds
        const result = await canister.updateVoucher(voucherId, description, expiredAtBigInt);
        return result as VoucherResult;
    } catch {
        throw new Error('Failed to update voucher');
    }
};

/**
 * Get a specific voucher by ID
 * @param voucherId - ID of the voucher to fetch
 * @returns Promise<Voucher | null> - The voucher or null if not found
 */
export const getVoucher = async (voucherId: string): Promise<Voucher | null> => {
    try {
        const canister = await createSplitDappActor();
        const result = await canister.getVoucher(voucherId);
        return result as Voucher | null;
    } catch {
        return null;
    }
};

export const convertSatoshiToBTC = (satoshi: bigint): number => {
    return Number(satoshi) / 100000000;
};

export const convertBTCToSatoshi = (btc: number): bigint => {
    return BigInt(Math.floor(btc * 100000000));
};

export const formatTimestamp = (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
};
