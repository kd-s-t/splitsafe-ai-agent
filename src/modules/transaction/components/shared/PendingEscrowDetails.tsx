"use client";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Typography } from "@/components/ui/typography";
import { EscrowTransaction, NormalizedTransaction, PendingEscrowDetailsProps, isMilestoneTransaction } from "@/modules/shared.types";
import { Principal } from '@dfinity/principal';
import { motion } from "framer-motion";
import { Bitcoin, CircleAlert, CircleCheckBig, CircleX, Shield, Users, Zap } from "lucide-react";
import { calculateTotalBTC, countUniqueRecipients, isCurrentUserSender } from "../../utils/transactionDetailsHelpers";

// Helper function to check if first milestone has any approvals
  const hasFirstMilestoneApprovals = (transaction: EscrowTransaction | NormalizedTransaction): boolean => {
    if (!isMilestoneTransaction(transaction) || !transaction.milestoneData?.milestones || transaction.milestoneData.milestones.length === 0) {
      return false;
    }

    const firstMilestone = transaction.milestoneData.milestones[0];
  if (!firstMilestone.recipients || firstMilestone.recipients.length === 0) {
    return false;
  }

  // Check if any recipient in the first milestone has approved
  return firstMilestone.recipients.some((recipient) => 
    recipient.approvedAt && recipient.approvedAt.length > 0
  );
};

export default function PendingEscrowDetails({
  transaction,
  currentUserPrincipal,
  onCancel,
  onApprove,
  onDecline,
  isLoading = false,
  hideOverview = false
}: PendingEscrowDetailsProps) {
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

  // CRITICAL: Check if current user is the sender - if so, NEVER show approve/decline buttons
  const principal = currentUserPrincipal ? Principal.fromText(currentUserPrincipal) : null;
  const isSender = isCurrentUserSender(transaction as NormalizedTransaction, principal);
  
  console.log('[PendingEscrowDetails] Props and checks:', {
    currentUserPrincipal,
    transactionId: transaction.id,
    transactionFrom: transaction.from,
    isSender,
    onApprove: !!onApprove,
    onDecline: !!onDecline,
    hideOverview,
  });
  
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
  
  console.log('[PendingEscrowDetails] Action status:', {
    foundEntry: !!currentUserEntry,
    entryPrincipal: currentUserEntry ? String(currentUserEntry.principal) : null,
    hasUserApproved,
    hasUserDeclined,
    entryApprovedAt: currentUserEntry?.approvedAt,
    entryDeclinedAt: currentUserEntry?.declinedAt,
    entryStatus: currentUserEntry?.status,
  });
  
  // NEVER show approve/decline if user is the sender (double-check safety)
  const canShowApproveDecline = !isSender && (onApprove || onDecline);
  
  console.log('[PendingEscrowDetails] Final render decision:', {
    canShowApproveDecline,
    willRenderApprove: canShowApproveDecline && !isSender && !hasUserApproved && !!onApprove,
    willRenderDecline: canShowApproveDecline && !isSender && !hasUserDeclined && !!onDecline,
  });


  return (
    <div className="space-y-4">
      <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">
        {!hideOverview && (
          <>
            <Typography variant="large" className="mb-4">Escrow overview</Typography>
            {/* Stats Information (without cards) */}
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
          </>
        )}

        {/* Divider */}
        {!hideOverview && <hr className="border-[#424444] h-[1px]" />}

        {/* Approval Section */}
        <div>
          <Typography variant="large" className="text-white mb-4">
            {hasUserApproved ? 'Approval Status' : 
             hasUserDeclined ? 'Decline Status' : 
             'Approval required'}
          </Typography>

          {/* Status Banner */}
          <div className={`rounded-[10px] p-4 mb-4 ${
            hasUserApproved ? 'bg-green-900/20 border border-green-500' :
            hasUserDeclined ? 'bg-red-900/20 border border-red-500' :
            'bg-[#48342A] border border-[#BD823D]'
          }`}>
            <div className="flex items-start gap-3">
              {hasUserApproved ? (
                <CircleCheckBig size={20} className="text-green-500 mt-0.5" />
              ) : hasUserDeclined ? (
                <CircleX size={20} className="text-red-500 mt-0.5" />
              ) : (
                <CircleAlert size={20} className="text-[#FEB64D] mt-0.5" />
              )}
              <div className="space-y-2">
                <Typography variant="base" className={`font-semibold ${
                  hasUserApproved ? 'text-green-500' :
                  hasUserDeclined ? 'text-red-500' :
                  'text-[#FEB64D]'
                }`}>
                  {hasUserApproved ? 'You have approved this escrow' :
                   hasUserDeclined ? 'You have declined this escrow' :
                   'Review the escrow details and choose your action'}
                </Typography>
                <Typography variant="small" className="text-white">
                  {hasUserApproved ? 'Waiting for other recipients to approve before the escrow can be activated' :
                   hasUserDeclined ? 'This escrow has been declined and will not proceed' :
                   'Once approved, the escrow will be activated and funds will be distributed according to the split'}
                </Typography>
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show if user is NOT the sender */}
          {canShowApproveDecline && (
            <div className="flex flex-col sm:flex-row gap-3">
              {onApprove && !isSender && !hasUserApproved && (
                <Button
                  className="flex-1 bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-semibold h-10"
                  onClick={async () => {
                    if (onApprove) {
                      await onApprove();
                    }
                  }}
                  disabled={isLoading === "approve"}
                >
                  {isLoading === "approve" ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CircleCheckBig size={16} className="mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              )}
              {onDecline && !isSender && !hasUserDeclined && (
                <Button
                  variant="outline"
                  className="flex-1 border-[#7A7A7A] text-[#F64C4C] hover:bg-[#F64C4C]/10 h-10"
                  onClick={async () => {
                    if (onDecline) {
                      await onDecline();
                    }
                  }}
                  disabled={isLoading === "decline"}
                >
                  {isLoading === "decline" ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Declining...
                    </>
                  ) : (
                    <>
                      <CircleX size={16} className="mr-2" />
                      Decline
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Warning Text - Only show when action is still needed */}
          {!hasUserApproved && !hasUserDeclined && (
            <div className="flex items-center gap-3 mt-3">
              <CircleAlert size={20} className="text-[#FEB64D]" />
              <Typography variant="small" className="text-white">
                This action cannot be undone.
              </Typography>
            </div>
          )}
        </div>

        {/* Trustless Banner */}
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
              <Shield size={24} className="text-[#FEB64D]" />
            </div>
            <div className="space-y-2">
              <Typography variant="base" className="text-white font-semibold">
                Escrow powered by Internet Computer
              </Typography>
              <Typography variant="small" className="text-[#9F9F9F]">
                No bridge. No wrap. Fully trustless Bitcoin escrow with threshold ECDSA.
              </Typography>
            </div>
          </div>
        </div>

        {/* Cancel Button for Senders - Only show if no approvals on first milestone */}
        {transaction.status === "pending" && !transaction.releasedAt && onCancel && !hasFirstMilestoneApprovals(transaction) && (
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                variant="outline"
                className="text-[#F64C4C] !border-[#303434] !bg-transparent hover:!border-[#F64C4C] hover:!bg-[#F64C4C]/10"
                onClick={onCancel}
                disabled={isLoading === "cancel"}
              >
                {isLoading === "cancel" ? (
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                ) : (
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <CircleX size={16} />
                  </motion.div>
                )}
                {isLoading === "cancel" ? "Cancelling..." : "Cancel escrow"}
              </Button>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CircleAlert size={16} color="#FEB64D" />
              </motion.div>
              <Typography variant="small" className="text-white font-normal">
                This action cannot be undone. Only available while pending.
              </Typography>
            </motion.div>
          </motion.div>
        )}

        {/* Message when cancel is not available due to approvals */}
        {transaction.status === "pending" && !transaction.releasedAt && onCancel && hasFirstMilestoneApprovals(transaction) && (
          <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
            <div className="flex items-start gap-3">
              <CircleAlert size={20} className="text-[#FEB64D] mt-0.5" />
              <div>
                <Typography variant="base" className="text-[#FEB64D] font-semibold">
                  Cannot Cancel Milestone
                </Typography>
                <Typography variant="small" className="text-white">
                  This milestone cannot be cancelled because recipients have already approved the first milestone. Once approvals are received, the milestone must proceed according to the contract terms.
                </Typography>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
