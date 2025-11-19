'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog-new';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Separator } from '@/components/ui/separator';
import { Voucher } from '@/lib/internal/icp/vouchers';
import { getDefaultExpirationDate, voucherFormSchema, type VoucherFormData } from '@/validation/voucher';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

// Voucher dialog constants
const VOUCHER_DIALOG = {
  ADD_TITLE: 'Create Voucher',
  UPDATE_TITLE: 'Update Voucher',
  ADD_DESCRIPTION: 'Create a new Bitcoin voucher for secure transactions',
  UPDATE_DESCRIPTION: 'Update voucher details and expiration date',
} as const;

interface AddUpdateVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'add' | 'update';
  voucher?: Voucher;
  handleSaveVoucher: (data: VoucherFormData, mode: 'add' | 'update', voucher?: Voucher) => Promise<boolean>;
  handleCancelVoucher?: (voucher: Voucher) => Promise<boolean>;
}

export default function AddUpdateVoucherDialog({
  open,
  onOpenChange,
  mode = 'add',
  voucher = undefined,
  handleSaveVoucher,
  handleCancelVoucher,
}: AddUpdateVoucherDialogProps) {

  const form = useForm<VoucherFormData>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: {
      code: '',
      amount: 0.00000001,
      description: '',
      expiredAt: getDefaultExpirationDate(),
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
    control
  } = form;

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);

  // Reset form when dialog opens or voucher changes
  useEffect(() => {
    if (open) {
      if (mode === 'update' && voucher) {
        setValue('code', voucher.code);
        setValue('amount', Number(voucher.amount) / 100000000); // Convert from satoshis to BTC
        setValue('description', voucher.description);
        setValue('expiredAt', new Date(Number(voucher.expiredAt) / 1000000)); // Convert from nanoseconds to milliseconds
      } else {
        reset();
      }
    }
  }, [open, mode, voucher, setValue, reset]);

  const handleFormSubmit = async (data: VoucherFormData) => {
    setError('');
    setSuccess('');

    try {
      const result = await handleSaveVoucher(data, mode, voucher);
      if (result) {
        setSuccess(mode === 'add' ? 'Voucher created successfully!' : 'Voucher updated successfully!');
        // Close dialog after success
        setTimeout(() => {
          onOpenChange(false);
          setSuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleCancelVoucherAction = async () => {
    if (!voucher || !handleCancelVoucher) return;

    setIsCanceling(true);
    setError('');
    setSuccess('');

    try {
      const result = await handleCancelVoucher(voucher);
      if (result) {
        setSuccess('Voucher canceled successfully!');
        // Close dialog after success
        setTimeout(() => {
          onOpenChange(false);
          setSuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error canceling voucher:', error);
      setError('Failed to cancel voucher. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-[#212121] border border-[#303333] !w-[456px] !max-w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {mode === 'add' ? VOUCHER_DIALOG.ADD_TITLE : VOUCHER_DIALOG.UPDATE_TITLE}
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            {mode === 'add' ? VOUCHER_DIALOG.ADD_DESCRIPTION : VOUCHER_DIALOG.UPDATE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-1 bg-[#424444] h-0.25" />

        {/* Voucher Info Display (Update Mode Only) */}
        {mode === 'update' && voucher && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-medium text-gray-900">{voucher.code}</h3>
            <p className="text-sm text-gray-600">Amount: {(Number(voucher.amount) / 100000000).toFixed(8)} BTC</p>
            <p className="text-sm text-gray-600">Cannot modify amount or currency after creation</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Voucher Code Field */}
            <FormField
              control={control}
              name="code"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Voucher Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter custom voucher code"
                      {...field}
                      disabled={mode === 'update'} // Disable code editing for updates
                    />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Amount Field */}
            <FormField
              control={control}
              name="amount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Amount (BTC)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.00000001"
                      min="0"
                      placeholder="0.00000001"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={mode === 'update'} // Disable amount editing for updates
                    />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Optional description for the voucher"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                      {...field}
                    />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Expiration Date Field */}
            <FormField
              control={control}
              name="expiredAt"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Expiration Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <DialogFooter className="flex space-x-3 pt-4">
              {mode === 'update' && handleCancelVoucher ? (
                <>
                  {/* Update Button */}
                  <motion.div className="relative overflow-hidden flex-1">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full text-sm bg-[#FEB64D] text-black font-medium hover:bg-[#FEB64D]/90"
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Voucher'
                      )}
                    </Button>
                    {isSubmitting && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 2,
                        }}
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                          transform: "skewX(-20deg)",
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Cancel Voucher Button */}
                  <motion.div className="relative overflow-hidden flex-1">
                    <Button
                      type="button"
                      onClick={handleCancelVoucherAction}
                      disabled={isCanceling}
                      className="w-full text-sm bg-red-600 text-white font-medium hover:bg-red-700"
                    >
                      {isCanceling ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Canceling...
                        </>
                      ) : (
                        'Cancel Voucher'
                      )}
                    </Button>
                    {isCanceling && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 2,
                        }}
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                          transform: "skewX(-20deg)",
                        }}
                      />
                    )}
                  </motion.div>
                </>
              ) : (
                /* Create Button (Add Mode) */
                <motion.div className="relative overflow-hidden w-full">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-sm bg-[#FEB64D] text-black font-medium hover:bg-[#FEB64D]/90"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Voucher'
                    )}
                  </Button>
                  {isSubmitting && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 2,
                      }}
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                        transform: "skewX(-20deg)",
                      }}
                    />
                  )}
                </motion.div>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}