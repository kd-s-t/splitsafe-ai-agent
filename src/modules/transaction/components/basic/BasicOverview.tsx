'use client'

import { Typography } from '@/components/ui/typography';
import { PendingEscrowDetailsProps } from "@/modules/shared.types";
import { Bitcoin, Users, Zap } from 'lucide-react';
import { calculateTotalBTC, countUniqueRecipients } from "../../utils/transactionDetailsHelpers";

export function BasicOverview({
  transaction,
  currentUserPrincipal,
}: Pick<PendingEscrowDetailsProps, 'transaction' | 'currentUserPrincipal'>) {
  const totalBTC = calculateTotalBTC(transaction);
  const recipientCount = countUniqueRecipients(transaction);

  // Calculate user's share from the transaction (currently unused but kept for future use)
  // const userShare = useMemo(() => {
  //   if (!transaction.to || !Array.isArray(transaction.to)) return { amount: 0, percentage: 0 };

  //   // Find the current user's entry in the recipients list
  //   const userEntry = currentUserPrincipal ? transaction.to.find(entry =>
  //     String(entry.principal) === String(currentUserPrincipal)
  //   ) : null;

  //   if (userEntry) {
  //     return {
  //       amount: Number(userEntry.amount) / 1e8,
  //       percentage: Number(userEntry.percentage)
  //     };
  //   }

  //   // If user is not in recipients, show total
  //   return {
  //     amount: totalBTC,
  //     percentage: 100
  //   };
  // }, [transaction.to, currentUserPrincipal, totalBTC]);

  // Check if current user has already approved or declined
  const currentUserEntry = currentUserPrincipal ? transaction.to?.find(entry => 
    String(entry.principal) === String(currentUserPrincipal)
  ) : null;
  const hasUserApproved = currentUserEntry && (
    currentUserEntry.approvedAt || 
    (currentUserEntry.status && Object.keys(currentUserEntry.status)[0] === "approved")
  );
  const hasUserDeclined = currentUserEntry && (
    currentUserEntry.declinedAt || 
    (currentUserEntry.status && Object.keys(currentUserEntry.status)[0] === "declined")
  );

  return (
    <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">
      <div className="flex items-center space-x-2">
        <Bitcoin className="text-[#FEB64D]" size={20} />
        <Typography variant="large" className="text-white">Escrow Overview</Typography>
      </div>

      {/* Basic escrow stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Your Share Info */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Bitcoin size={24} className="text-[#FEB64D]" />
          </div>
            <div className="text-center">
              <Typography variant="small" className="text-[#9F9F9F]">Funds allocated</Typography>
              <Typography variant="base" className="text-white font-semibold mt-2">
                {totalBTC.toFixed(8)} BTC
              </Typography>
            </div>
        </div>

        {/* Total Recipients Info */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Users size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Total recipients</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {recipientCount}
            </Typography>
          </div>
        </div>

        {/* Status Info */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Zap size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Status</Typography>
            <Typography variant="base" className={`font-semibold mt-2 ${
              hasUserApproved ? 'text-green-500' : 
              hasUserDeclined ? 'text-red-500' : 
              'text-[#FEB64D]'
            }`}>
              {hasUserApproved ? 'Approved' : 
               hasUserDeclined ? 'Declined' : 
               'Pending approval'}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
