'use client';

import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty-state';
import { Voucher } from '@/lib/internal/icp/vouchers';
import { Ticket } from 'lucide-react';
import { useState } from 'react';

interface VoucherListProps {
  vouchers: Voucher[];
  vouchersLoading: boolean;
  cancelVoucher: (voucher: Voucher) => Promise<boolean>;
  openEditDialog: (voucher: Voucher) => void;
}

const VoucherList = ({
  vouchers,
  vouchersLoading,
  cancelVoucher,
  openEditDialog,
}: VoucherListProps) => {
  const [cancelingVouchers, setCancelingVouchers] = useState<Set<string>>(new Set());

  const getVoucherStatus = (voucher: Voucher): 'unused' | 'expired' | 'redeemed' => {
    if (voucher.redeemAt > 0) return 'redeemed';
    if (Number(voucher.expiredAt) / 1000000 < Date.now()) return 'expired';
    return 'unused';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unused': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'redeemed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelVoucher = async (voucher: Voucher) => {
    setCancelingVouchers(prev => new Set(prev).add(voucher.id));
    try {
      await cancelVoucher(voucher);
    } finally {
      setCancelingVouchers(prev => {
        const newSet = new Set(prev);
        newSet.delete(voucher.id);
        return newSet;
      });
    }
  };

  if (vouchersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading vouchers...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto">
        {/* Voucher List */}
        {vouchers.length === 0 ? (
          <Empty className='!bg-[#191A1A] !border border-[#424747] !rounded-[10px]' style={{ height: 'calc(100vh - 200px)' }}>
            <EmptyHeader className='!max-w-full !text-white'>
              <Ticket color="#feb64d" size={50} />
              <EmptyTitle className="!font-semibold mt-4">Create Your First Voucher</EmptyTitle>
              <EmptyDescription>
                You don&apos;t have any voucher yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {vouchers.map((voucher) => {
              const status = getVoucherStatus(voucher);
              return (
                <div key={voucher.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-white">{voucher.code}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{voucher.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>Amount: {(Number(voucher.amount) / 100000000).toFixed(8)} BTC</span>
                        <span>Created: {new Date(Number(voucher.createdAt) / 1000000).toLocaleDateString()}</span>
                        <span>Expires: {new Date(Number(voucher.expiredAt) / 1000000).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {status === 'unused' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(voucher)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelVoucher(voucher)}
                          disabled={cancelingVouchers.has(voucher.id)}
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white disabled:opacity-50"
                        >
                          {cancelingVouchers.has(voucher.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400 mr-2"></div>
                              Canceling...
                            </>
                          ) : (
                            'Cancel'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherList;
