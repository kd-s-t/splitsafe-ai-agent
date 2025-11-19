'use client';

import { Button } from '@/components/ui/button';
import { setSubtitle, setTitle } from '@/lib/redux/store/store';
import { Eye, EyeOff, Gift, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useVoucherDialogs, useVouchers } from '../hooks';
import AddUpdateVoucherDialog from './AddUpdateVoucherDialog';
import VoucherAnalytics from './VoucherAnalytics';
import VoucherList from './VoucherList';
import VoucherRedeem from './VoucherRedeem';

const Vouchers = () => {
    const dispatch = useDispatch();
    const [showAnalytics, setShowAnalytics] = useState(false);

    const {
        showCreateDialog,
        openCreateDialog,
        closeCreateDialog,
        showRedeemDialog,
        openRedeemDialog,
        closeRedeemDialog,
        editDialogOpen,
        openEditDialog,
        closeEditDialog,
        selectedVoucher,
    } = useVoucherDialogs();

    const {
        vouchers,
        vouchersLoading,
        loadVouchers,
        handleSaveVoucher,
        cancelVoucher
    } = useVouchers();

    useEffect(() => {
        loadVouchers();
        dispatch(setTitle('Vouchers'));
        dispatch(setSubtitle('Manage your Bitcoin vouchers for secure transactions'));
    }, [dispatch, loadVouchers]); // Include loadVouchers but it's now stable due to useRef fix

    return (
        <div className="min-h-screen text-white">
            <div className="mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="default"
                            onClick={openCreateDialog}
                        >
                            <Plus className="text-xs" /> Create Voucher
                        </Button>

                        <Button
                            variant="outline"
                            onClick={openRedeemDialog}
                        >
                            <Gift className="text-xs" /> Redeem Voucher
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="flex items-center space-x-2"
                    >
                        {showAnalytics ? (
                            <>
                                <EyeOff className="text-xs" />
                                <span>Hide Analytics</span>
                            </>
                        ) : (
                            <>
                                <Eye className="text-xs" />
                                <span>Show Analytics</span>
                            </>
                        )}
                    </Button>
                </div>

                {showAnalytics && (
                    <VoucherAnalytics
                        vouchers={vouchers}
                        isLoading={vouchersLoading}
                    />
                )}

                <VoucherList
                    vouchers={vouchers}
                    vouchersLoading={vouchersLoading}
                    cancelVoucher={cancelVoucher}
                    openEditDialog={openEditDialog}
                />

                <AddUpdateVoucherDialog
                    open={showCreateDialog}
                    onOpenChange={closeCreateDialog}
                    mode="add"
                    handleSaveVoucher={handleSaveVoucher}
                />

                <AddUpdateVoucherDialog
                    open={editDialogOpen}
                    onOpenChange={closeEditDialog}
                    mode="update"
                    voucher={selectedVoucher}
                    handleSaveVoucher={handleSaveVoucher}
                    handleCancelVoucher={cancelVoucher}
                />

                <VoucherRedeem
                    open={showRedeemDialog}
                    onOpenChange={closeRedeemDialog}
                />
            </div>
        </div>
    );
};

export default Vouchers;
