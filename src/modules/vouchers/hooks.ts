'use client';

import { useUser } from '@/hooks/useUser';
import { showVoucherNotification } from '@/lib/integrations/pusher/client';
import { voucherRedemptionService } from '@/lib/integrations/resend/voucherRedemptionService';
import {
  cancelVoucher as cancelVoucherAPI,
  createVoucher,
  getUserVouchers,
  getVoucher,
  redeemVoucher,
  updateVoucher,
  Voucher
} from '@/lib/internal/icp/vouchers';
import { type VoucherFormData as VoucherFormDataType } from '@/validation/voucher';
import { Principal } from '@dfinity/principal';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Voucher dialog mode type
export type VoucherDialogMode = 'add' | 'update';

// Consolidated vouchers hook
export const useVouchers = () => {
  const { principal } = useUser();

  // State management
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadingRef = useRef<boolean>(false);

  // Initialize ICP connection
  useEffect(() => {
    const init = async () => {
      try {
        // No initialization needed for individual functions
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to connect to ICP network');
        console.error('ICP initialization error:', err);
      }
    };

    init();
  }, []);

  // Load vouchers function
  const loadVouchers = useCallback(async () => {
    if (!principal) {
      setVouchers([]);
      setVouchersLoading(false);
      return;
    }

    // Prevent multiple simultaneous calls using ref
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setVouchersLoading(true);
      setError(null);
      const result = await getUserVouchers(principal);

      console.log('result', result);
      setVouchers(result);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      setError('Failed to load vouchers');
      toast.error('Failed to load vouchers');
    } finally {
      loadingRef.current = false;
      setVouchersLoading(false);
    }
  }, [principal]);

  // Create voucher function
  const createVoucherLocal = useCallback(async (data: VoucherFormDataType) => {
    if (!principal) {
      toast.error('User not authenticated');
      return false;
    }

    if (!isInitialized) {
      toast.error('ICP network not connected');
      return false;
    }

    console.log('data', data)
    console.log('principal', principal)

    try {
      const result = await createVoucher(data, principal);

      if ('ok' in result) {
        toast.success('Voucher Created', {
          description: `Voucher ${data.code} has been created successfully`,
          duration: 3000,
        });

        // Show browser notification
        showVoucherNotification(
          'Voucher Created Successfully',
          `Your voucher ${data.code} for ${data.amount} BTC has been created and is ready to use.`,
          {
            code: data.code,
            amount: data.amount,
            type: 'created'
          }
        );

        // Voucher created successfully - reload to update the list
        await loadVouchers();
        return true;
      } else {
        toast.error('Failed to create voucher', {
          description: result.err || 'Unknown error'
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error('Failed to create voucher');
      return false;
    }
  }, [principal, isInitialized, loadVouchers]);

  // Update voucher function
  const updateVoucherLocal = useCallback(async (
    voucherId: string,
    description: string,
    expiredAt: Date
  ) => {
    if (!isInitialized) {
      toast.error('ICP network not connected');
      return false;
    }

    try {
      await updateVoucher(voucherId, description, expiredAt);

      toast.success('Voucher Updated', {
        description: 'Voucher has been updated successfully',
        duration: 3000,
      });

      // Voucher updated successfully - reload to update the list
      await loadVouchers();
      return true;
    } catch (error) {
      console.error('Error updating voucher:', error);
      toast.error('Failed to update voucher');
      return false;
    }
  }, [isInitialized, loadVouchers]);

  // Redeem voucher function
  const redeemVoucherLocal = useCallback(async (voucherCode: string) => {
    if (!principal) {
      toast.error('User not authenticated');
      return false;
    }

    if (!isInitialized) {
      toast.error('ICP network not connected');
      return false;
    }

    try {
      const result = await redeemVoucher(voucherCode, principal);

      if ('ok' in result) {
        toast.success('Voucher Redeemed', {
          description: String(result.ok),
          duration: 3000,
        });

        // Show browser notification
        showVoucherNotification(
          'Voucher Redeemed Successfully',
          `You have successfully redeemed voucher ${voucherCode}. ${String(result.ok)}`,
          {
            code: voucherCode,
            type: 'redeemed'
          }
        );

        // Trigger Pusher event for voucher redemption
        try {
          const { apiCall } = await import('@/lib/internal/auth/api-client');
          // apiCall throws on error, so if we get here, the request succeeded
          await apiCall('/api/events/voucher', {
            method: 'POST',
            body: JSON.stringify({
              eventType: 'voucher-redeemed',
              voucherId: `VOU_${principal.toText()}_${Date.now()}`, // This should match the actual voucher ID
              voucherCode: voucherCode,
              redeemerId: principal.toText(),
              creatorId: principal.toText(), // This should be the actual creator ID
              amount: '0.01', // This should be the actual amount
              timestamp: Date.now()
            }),
          });
          console.log('✅ Voucher redemption event triggered');
        } catch (error) {
          console.error('Error triggering voucher redemption event:', error);
        }

        // Send email notification for voucher redemption
        try {
          await voucherRedemptionService.sendVoucherRedemptionEmail({
            voucherCode: voucherCode,
            amount: '0.01', // This should be the actual amount
            redeemerId: principal.toText(),
            creatorId: principal.toText(), // This should be the actual creator ID
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Error sending voucher redemption email:', error);
        }

        return true;
      } else {
        toast.error('Failed to redeem voucher', {
          description: result.error || 'Unknown error'
        });
        return false;
      }
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast.error('Failed to redeem voucher');
      return false;
    }
  }, [principal, isInitialized]);

  // Get single voucher function
  const getVoucherLocal = useCallback(async (voucherId: string) => {
    if (!isInitialized) {
      return null;
    }

    try {
      const voucher = await getVoucher(voucherId);
      return voucher;
    } catch (error) {
      console.error('Error getting voucher:', error);
      return null;
    }
  }, [isInitialized]);

  // Unified save function for add/update
  const handleSaveVoucher = useCallback(async (
    data: VoucherFormDataType,
    mode: VoucherDialogMode,
    voucher?: Voucher | null
  ) => {
    let success = false;

    if (mode === 'add') {
      success = await createVoucherLocal(data);
    } else if (mode === 'update' && voucher) {
      success = await updateVoucherLocal(voucher.id, data.description, data.expiredAt);
    }

    return success;
  }, [createVoucherLocal, updateVoucherLocal]);

  // Cancel voucher function
  const cancelVoucher = useCallback(async (voucher: Voucher) => {
    if (!principal) {
      toast.error('User not authenticated');
      return false;
    }

    if (!isInitialized) {
      toast.error('ICP network not connected');
      return false;
    }

    try {
      const result = await cancelVoucherAPI(voucher.id);

      if ('ok' in result) {
        toast.success('Voucher Canceled', {
          description: `Voucher ${voucher.code} has been canceled`,
          duration: 3000,
        });

        // Show browser notification
        showVoucherNotification(
          'Voucher Canceled Successfully',
          `Your voucher ${voucher.code} has been canceled and the funds have been refunded to your account.`,
          {
            code: voucher.code,
            amount: voucher.amount,
            type: 'canceled'
          }
        );

        // Reload vouchers after successful cancellation
        await loadVouchers();
        return true;
      } else {
        toast.error('Failed to cancel voucher', {
          description: result.err || 'Unknown error'
        });
        return false;
      }
    } catch (error) {
      console.error('Error canceling voucher:', error);
      toast.error('Failed to cancel voucher');
      return false;
    }
  }, [principal, isInitialized, loadVouchers]);

  // Note: loadVouchers is called from the component's useEffect with empty dependency array

  return {
    // State
    vouchers,
    allVouchers: vouchers,
    vouchersLoading,
    error,
    isInitialized,

    // Actions
    loadVouchers,
    handleSaveVoucher,
    createVoucher: createVoucherLocal,
    updateVoucher: updateVoucherLocal,
    redeemVoucher: redeemVoucherLocal,
    getVoucher: getVoucherLocal,
    cancelVoucher,

    // Setters
    clearError: () => setError(null),
  };
};

// Dialog management hook
export const useVoucherDialogs = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | undefined>(undefined);

  const openCreateDialog = useCallback(() => {
    setShowCreateDialog(true);
  }, []);

  const closeCreateDialog = useCallback(() => {
    setShowCreateDialog(false);
  }, []);

  const openRedeemDialog = useCallback(() => {
    setShowRedeemDialog(true);
  }, []);

  const closeRedeemDialog = useCallback(() => {
    setShowRedeemDialog(false);
  }, []);

  const openEditDialog = useCallback((voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setEditDialogOpen(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setSelectedVoucher(undefined);
  }, []);

  return {
    // Create dialog
    showCreateDialog,
    openCreateDialog,
    closeCreateDialog,

    // Redeem dialog
    showRedeemDialog,
    openRedeemDialog,
    closeRedeemDialog,

    // Edit dialog
    editDialogOpen,
    openEditDialog,
    closeEditDialog,

    // Selected voucher
    selectedVoucher,
  };
};

// Formatting utilities hook
export const useVoucherFormatting = () => {
  const formatDate = useCallback((timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const formatAmount = useCallback((amount: bigint) => {
    return (Number(amount) / 100000000).toFixed(8); // Convert satoshis to BTC
  }, []);

  const getVoucherStatus = useCallback((voucher: Voucher) => {
    const now = Date.now() / 1000; // Current time in seconds
    const expiredAt = Number(voucher.expiredAt);
    const redeemAt = Number(voucher.redeemAt);

    if (redeemAt > 0) {
      return 'redeemed';
    } else if (expiredAt <= now) {
      return 'expired';
    } else {
      return 'active';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'redeemed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const truncateCode = useCallback((code: string, length: number = 12) => {
    return code.length > length ? `${code.slice(0, length)}...` : code;
  }, []);

  return {
    formatDate,
    formatAmount,
    getVoucherStatus,
    getStatusColor,
    truncateCode,
  };
};

// Hook for user principal management (keeping the existing implementation)
export const useUserPrincipal = () => {
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPrincipal = async () => {
      try {
        // TODO: Integrate with actual authentication system
        // For now, create a mock principal
        const mockPrincipal = Principal.fromText('aaaaa-aa');
        setPrincipal(mockPrincipal);
      } catch (err) {
        console.error('Error getting user principal:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getPrincipal();
  }, []);

  return { principal, isLoading };
};
