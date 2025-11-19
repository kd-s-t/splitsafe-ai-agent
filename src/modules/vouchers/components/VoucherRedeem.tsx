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
import { useVouchers, useUserPrincipal } from '../hooks';
import { voucherRedemptionSchema, type VoucherRedemptionData } from '@/validation/voucher';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

// Voucher redeem constants
const VOUCHER_REDEEM = {
    TITLE: 'Redeem Voucher',
    DESCRIPTION: 'Enter your voucher code to redeem Bitcoin to your account',
} as const;

interface VoucherRedeemProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function VoucherRedeem({ open, onOpenChange }: VoucherRedeemProps) {
    const [redeemResult, setRedeemResult] = useState<{ 
        success: boolean; 
        message: string;
        amount?: bigint;
        newBalance?: bigint;
        redeemAt?: bigint;
    } | null>(null);
    const [success, setSuccess] = useState('');

    const { redeemVoucher, isInitialized } = useVouchers();
    const { principal } = useUserPrincipal();

    const form = useForm<VoucherRedemptionData>({
        resolver: zodResolver(voucherRedemptionSchema),
        defaultValues: {
            code: '',
        },
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
        reset,
        control,
        setError: setFormError,
        clearErrors
    } = form;

    const handleFormSubmit = async (data: VoucherRedemptionData) => {
        if (!principal) {
            setFormError('code', { message: 'User not authenticated' });
            return;
        }

        if (!isInitialized) {
            setFormError('code', { message: 'ICP network not connected' });
            return;
        }

        clearErrors();
        setSuccess('');
        setRedeemResult(null);

        try {
            const success = await redeemVoucher(data.code);

            if (success) {
                setSuccess('Voucher redeemed successfully! Bitcoin has been added to your account.');
                reset();

                // Close modal after success
                setTimeout(() => {
                    onOpenChange(false);
                    setSuccess('');
                }, 3000);
            } else {
                setFormError('code', { message: 'Failed to redeem voucher' });
            }
        } catch (error) {
            console.error('Error redeeming voucher:', error);
            setFormError('code', { message: 'An unexpected error occurred' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!bg-[#212121] border border-[#303333] !w-[456px] !max-w-[90vw] max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                        {VOUCHER_REDEEM.TITLE}
                    </DialogTitle>
                    <DialogDescription className="text-[#A1A1AA]">
                        {VOUCHER_REDEEM.DESCRIPTION}
                    </DialogDescription>
                </DialogHeader>

                <Separator className="my-1 bg-[#424444] h-0.25" />

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
                                            placeholder="Enter voucher code received from User 1"
                                            {...field}
                                        />
                                    </FormControl>
                                    {fieldState?.error && (
                                        <FormMessage>{fieldState.error?.message}</FormMessage>
                                    )}
                                </FormItem>
                            )}
                        />

                        {/* Bitcoin Display */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-blue-800">
                                    <strong>Bitcoin will be credited</strong> to your wallet upon successful redemption
                                </span>
                            </div>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <p className="text-green-800 text-sm">{success}</p>
                                {redeemResult && (
                                    <div className="mt-2 text-sm">
                                        <p>Bitcoin credited: {redeemResult.amount ? (Number(redeemResult.amount) / 100000000).toFixed(8) : '0'} BTC</p>
                                        {redeemResult.newBalance && (
                                            <p>New balance: {Number(redeemResult.newBalance) / 100000000} BTC</p>
                                        )}
                                        {redeemResult.redeemAt && (
                                            <p>Redeemed at: {new Date(Number(redeemResult.redeemAt) * 1000).toLocaleString()}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="flex space-x-3 pt-4">
                            <motion.div className="relative overflow-hidden w-full">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full text-sm bg-green-600 text-white font-medium hover:bg-green-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Redeeming Voucher...
                                        </>
                                    ) : (
                                        'Redeem Voucher'
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
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}