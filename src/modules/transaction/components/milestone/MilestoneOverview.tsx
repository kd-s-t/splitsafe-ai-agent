'use client'

import { Typography } from '@/components/ui/typography';
import { Bitcoin, Calendar, Target, Users, Zap } from 'lucide-react';
// import { useMemo } from 'react';
import { PendingEscrowDetailsProps } from "@/modules/shared.types";
import { calculateTotalBTC } from "../../utils/transactionDetailsHelpers";
import { MilestonesList } from './MilestonesList';

export function MilestoneOverview({
  transaction,
  currentUserPrincipal,
}: Pick<PendingEscrowDetailsProps, 'transaction' | 'currentUserPrincipal'>) {
  const totalBTC = calculateTotalBTC(transaction);
  // const recipientCount = countUniqueRecipients(transaction);

  // Calculate user's share from the transaction
  // const userShare = useMemo(() => {
  //   if (!currentUserPrincipal) return { amount: 0, percentage: 0 };

  //   // For milestone escrows, look in milestoneData.milestones[].recipients[]
  //   if (transaction.milestoneData && transaction.milestoneData.milestones?.length > 0) {
  //     // Find the user in any milestone's recipients
  //     for (const milestone of transaction.milestoneData.milestones) {
  //       if (milestone.recipients && Array.isArray(milestone.recipients)) {
  //         const userEntry = milestone.recipients.find(recipient =>
  //           String(recipient.principal) === String(currentUserPrincipal)
  //         );
          
  //         if (userEntry) {
  //           return {
  //             amount: Number(userEntry.share) / 1e8,
  //             percentage: 0 // Milestone recipients don't have percentage, they have share amounts
  //           };
  //         }
  //       }
  //     }
      
  //     // If user not found in milestones, return 0
  //     return { amount: 0, percentage: 0 };
  //   }

  //   // For basic escrows, look in transaction.to
  //   if (transaction.to && Array.isArray(transaction.to)) {
  //     const userEntry = transaction.to.find(entry =>
  //       String(entry.principal) === String(currentUserPrincipal)
  //     );

  //     if (userEntry) {
  //       return {
  //         amount: Number(userEntry.amount) / 1e8,
  //         percentage: Number(userEntry.percentage)
  //       };
  //     }
  //   }

  //   // If user is not in recipients, show total
  //   return {
  //     amount: totalBTC,
  //     percentage: 100
  //   };
  // }, [transaction.milestoneData, transaction.to, currentUserPrincipal, totalBTC]);

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

  // Calculate milestone-specific metrics
  const milestoneCount = transaction.milestoneData?.milestones?.length || 0;
  const totalMilestoneAmount = transaction.milestoneData?.milestones?.reduce((sum, milestone) => 
    sum + (Number(milestone.allocation) / 1e8), 0) || 0;
  const completedMilestones = transaction.milestoneData?.milestones?.filter(milestone => 
    milestone.completedAt && milestone.completedAt !== '').length || 0;

  return (
    <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">
      <div className="flex items-center space-x-2">
        <Target className="text-[#FEB64D]" size={20} />
        <Typography variant="large" className="text-white">Milestone Overview</Typography>
      </div>

      {/* Milestone-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Milestones */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Target size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Total Milestones</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {milestoneCount}
            </Typography>
          </div>
        </div>

        {/* Completed Milestones */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Calendar size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Completed</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {completedMilestones}/{milestoneCount}
            </Typography>
          </div>
        </div>

        {/* Total Milestone Amount */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Bitcoin size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Total Amount</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {totalMilestoneAmount.toFixed(8)} BTC
            </Typography>
          </div>
        </div>

        {/* Your Share */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Users size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Funds allocated</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {totalBTC.toFixed(8)} BTC
            </Typography>
          </div>
        </div>
      </div>

      {/* Milestone Status */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="text-[#FEB64D]" size={16} />
            <Typography variant="small" className="text-white font-semibold">
              Milestone Status
            </Typography>
          </div>
          <Typography variant="small" className={`font-semibold ${
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

      {/* Milestones List */}
      <MilestonesList transaction={transaction} />
    </div>
  );
}
