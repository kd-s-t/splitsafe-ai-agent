"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  User
} from "lucide-react";
import { useState } from "react";
import { Milestone, ReleasePayment } from "@/modules/shared.types";

interface ReleasePaymentsListProps {
  releasePayments: ReleasePayment[];
  milestone: Milestone;
  isLoading?: boolean;
  isCurrentUserClient?: boolean;
  onViewProofOfWork?: (recipientId: string, monthNumber: number) => void;
}

export function ReleasePaymentsList({
  releasePayments,
  milestone,
  // isLoading = false,
  isCurrentUserClient = false,
  onViewProofOfWork
}: ReleasePaymentsListProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMonthExpansion = (monthNumber: number) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthNumber)) {
      newExpanded.delete(monthNumber);
    } else {
      newExpanded.add(monthNumber);
    }
    setExpandedMonths(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-400" />;
      case 'partial':
        return <AlertCircle size={16} className="text-orange-400" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-400" />;
      case 'skipped':
        return <Clock size={16} className="text-gray-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'partial':
        return 'text-orange-400';
      case 'failed':
        return 'text-red-400';
      case 'skipped':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  // const getPaymentStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'paid':
  //       return <CheckCircle size={14} className="text-green-400" />;
  //     case 'approved':
  //       return <CheckCircle size={14} className="text-blue-400" />;
  //     case 'proof_submitted':
  //       return <Clock size={14} className="text-yellow-400" />;
  //     case 'pending':
  //       return <Clock size={14} className="text-gray-400" />;
  //     case 'failed':
  //       return <AlertCircle size={14} className="text-red-400" />;
  //     default:
  //       return <Clock size={14} className="text-gray-400" />;
  //   }
  // };

  const formatAmount = (amount: string) => {
    const satoshis = BigInt(amount);
    const btc = Number(satoshis) / 100_000_000; // Convert satoshis to BTC
    return btc.toFixed(8);
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'Not released';
    const date = new Date(Number(timestamp) / 1_000_000); // Convert from nanoseconds
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Generate all months for the milestone duration
  const allMonths = Array.from({ length: milestone.duration }, (_, i) => i + 1);


  return (
    <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
          <DollarSign size={24} className="text-[#FEB64D]" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Typography variant="base" className="text-white font-semibold">
              Monthly Payment History
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-6 px-2 text-[#9F9F9F] hover:text-white"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
          <Typography variant="small" className="text-[#9F9F9F]">
            Track all monthly payments for this milestone
          </Typography>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="space-y-3">
            {allMonths.map((monthNumber) => {
            const releasePayment = releasePayments.find(p => p.monthNumber === monthNumber);
            const isExpanded = expandedMonths.has(monthNumber);
            // const canRelease = !releasePayment && isCurrentUserClient;

            return (
              <motion.div
                key={monthNumber}
                className="bg-[#1A1A1A] rounded-lg border border-[#303434]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: monthNumber * 0.1 }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {releasePayment ? getStatusIcon(releasePayment.releasedAt ? 'completed' : 'pending') : <Clock size={16} className="text-gray-400" />}
                      <div>
                        <Typography variant="base" className="text-white font-medium">
                          Month {monthNumber}
                        </Typography>
                        <Typography variant="small" className="text-[#9F9F9F]">
                          {releasePayment ? (
                            <>
                              {formatAmount(releasePayment.total)} BTC released on {formatDate(releasePayment.releasedAt)}
                            </>
                          ) : (
                            'Not yet released'
                          )}
                        </Typography>
                        
                        {/* Show proof of work status for this month */}
                        <div className="mt-1">
                          {(() => {
                            // Check if all recipients have submitted proof for this month
                            const allRecipientsHaveProof = milestone.recipients?.every((recipient) => {
                              const monthlyProof = recipient.monthlyProofOfWork?.find(p => Number(p.monthNumber) === monthNumber);
                              return monthlyProof && monthlyProof.submittedAt && 
                                     (Array.isArray(monthlyProof.submittedAt) ? monthlyProof.submittedAt.length > 0 : monthlyProof.submittedAt);
                            }) || false;
                            
                            if (allRecipientsHaveProof) {
                              return (
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                  <Typography variant="small" className="text-purple-400">
                                    Proof of work submitted
                                  </Typography>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                  <Typography variant="small" className="text-gray-500">
                                    Proof of work pending
                                  </Typography>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Typography variant="small" className={releasePayment ? getStatusColor(releasePayment.releasedAt ? 'completed' : 'pending') : 'text-gray-400'}>
                        {releasePayment ? (releasePayment.releasedAt ? 'Completed' : 'Pending') : 'Pending'}
                      </Typography>
                      
                      {releasePayment && releasePayment.recipientPayments.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMonthExpansion(monthNumber)}
                          className="h-6 w-6 p-0 text-[#9F9F9F] hover:text-white"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </Button>
                      )}
                      
                    </div>
                  </div>

                  {/* Expanded recipient payments and proof status */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-[#303434]"
                    >
                      {/* Proof of Work Status */}
                      <Typography variant="small" className="text-[#9F9F9F] mb-3">
                        Proof of Work Status:
                      </Typography>
                      <div className="space-y-2 mb-4">
                        {milestone.recipients?.map((recipient, index) => {
                          const monthlyProof = recipient.monthlyProofOfWork?.find(p => Number(p.monthNumber) === monthNumber);
                          const hasProof = monthlyProof && monthlyProof.submittedAt && 
                                          (Array.isArray(monthlyProof.submittedAt) ? monthlyProof.submittedAt.length > 0 : monthlyProof.submittedAt);
                          
                          // Debug logging for proof status
                          console.log('🔍 [PROOF_DEBUG] Recipient:', recipient.name, 'Month:', monthNumber, {
                            monthlyProof,
                            submittedAt: monthlyProof?.submittedAt,
                            hasProof,
                            monthlyProofOfWork: recipient.monthlyProofOfWork
                          });
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-2 bg-[#2B2B2B] rounded">
                              <div className="flex items-center space-x-2">
                                {hasProof ? (
                                  <CheckCircle size={12} className="text-purple-400" />
                                ) : (
                                  <Clock size={12} className="text-gray-400" />
                                )}
                                <User size={12} className="text-[#9F9F9F]" />
                                <Typography variant="small" className="text-white">
                                  {recipient.name}
                                </Typography>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Typography variant="small" className={hasProof ? "text-purple-400" : "text-gray-400"}>
                                  {hasProof ? 'Proof Submitted' : 'Proof Pending'}
                                </Typography>
                                {hasProof && monthlyProof.submittedAt && (
                                  <Typography variant="small" className="text-[#9F9F9F]">
                                    {formatDate(Array.isArray(monthlyProof.submittedAt) ? monthlyProof.submittedAt[0] : monthlyProof.submittedAt)}
                                  </Typography>
                                )}
                                {hasProof && isCurrentUserClient && onViewProofOfWork && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onViewProofOfWork(recipient.id, monthNumber)}
                                    className="h-6 px-2 text-purple-400 hover:bg-purple-400/10 hover:text-purple-400 text-xs"
                                  >
                                    View Proof
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Payment Details (only show if payment was released) */}
                      {releasePayment && releasePayment.recipientPayments.length > 0 && (
                        <>
                          <Typography variant="small" className="text-[#9F9F9F] mb-3">
                            Individual Recipient Payments:
                          </Typography>
                          <div className="space-y-2">
                            {releasePayment.recipientPayments.map((recipientPayment, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-[#2B2B2B] rounded">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle size={12} className="text-green-400" />
                                  <User size={12} className="text-[#9F9F9F]" />
                                  <Typography variant="small" className="text-white">
                                    {recipientPayment.recipientName}
                                  </Typography>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Typography variant="small" className="text-[#FEB64D]">
                                    {formatAmount(recipientPayment.amount)} BTC
                                  </Typography>
                                  <Typography variant="small" className="text-green-400">
                                    Paid
                                  </Typography>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-[#1A1A1A] rounded-lg border border-[#303434]">
            <div className="flex items-center justify-between">
              <Typography variant="small" className="text-[#9F9F9F]">
                Total Released:
              </Typography>
              <Typography variant="small" className="text-[#FEB64D] font-medium">
                {formatAmount(
                  releasePayments
                    .filter(p => p.releasedAt !== undefined)
                    .reduce((sum, p) => sum + BigInt(p.total), BigInt(0))
                    .toString()
                )} BTC
              </Typography>
            </div>
            <div className="flex items-center justify-between mt-1">
              <Typography variant="small" className="text-[#9F9F9F]">
                Remaining:
              </Typography>
              <Typography variant="small" className="text-white font-medium">
                {formatAmount(
                  (BigInt(milestone.allocation) - 
                    releasePayments
                      .filter(p => p.releasedAt !== undefined)
                      .reduce((sum, p) => sum + BigInt(p.total), BigInt(0))
                  ).toString()
                )} BTC
              </Typography>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
