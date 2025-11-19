"use client"

import TransactionStatusBadge from "@/components/TransactionStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formatBTC } from "@/lib/utils";
import { ActivityContentProps } from '@/modules/dashboard/types';
import { ArrowDownLeft, ArrowUpRight, Bitcoin, Calendar, CreditCard, Eye, UserRound, UsersRound, Zap } from "lucide-react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";

const ActivityContent = ({
  idx,
  activity,
  category,
  txUrl,
  principal,
}: ActivityContentProps) => {

  const navigate = useNavigate();

  // Calculate user's specific share for received transactions
  const getUserShare = () => {
    if (!principal || !activity.to || !Array.isArray(activity.to)) {
      return { amount: 0, percentage: 0 };
    }

    const userRecipient = activity.to.find(recipient =>
      String(recipient.principal) === String(principal)
    );

    if (userRecipient) {
      return {
        amount: Number(userRecipient.amount), // Keep in satoshis, formatBTC will convert
        percentage: Number(userRecipient.percentage) || 0
      };
    }

    return { amount: 0, percentage: 0 };
  };

  const userShare = getUserShare();

  return (
    <Card key={idx} className="p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Typography
              variant="large"
              className="text-white text-xl font-semibold"
            >
              {activity.title || 'Untitled Transaction'}
            </Typography>
            {activity.status && <TransactionStatusBadge status={activity.status} />}
          </div>

          <div className="flex items-center gap-2 text-[#9F9F9F] text-sm">
            {activity?.kind?.hasOwnProperty('basic_escrow') ? (
              <><Zap color="#FEB64D" size={16} /> Basic</>
            ) : activity?.kind?.hasOwnProperty('payment_gateway') ? (
              <><CreditCard color="#FEB64D" size={16} /> Payment Gateway</>
            ) : (
              <><Calendar color="#FEB64D" size={16} /> Milestone</>
            )}
            <span>
              {activity.createdAt ? new Date(Number(activity.createdAt) / 1_000_000).toLocaleString() : 'Unknown date'}
            </span>
            <span className="text-white">•</span>
            {category === "sent" ? (
              <div className="flex items-center gap-1 text-[#007AFF]">
                <ArrowUpRight size={18} />
                <span>Sent</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[#00C287]">
                <ArrowDownLeft size={18} />
                <span>Receiving</span>
              </div>
            )}
          </div>
        </div>

        {/* Action button - show for all transactions except withdrawal complete */}
        {txUrl && activity.status !== "completed" && (
          <div className="flex gap-2">
            {activity.status === "released" || activity.status === "completed" ? (
              <Button
                variant="outline"
                size="sm"
                className="border-[#7A7A7A] text-white hover:bg-[#2a2a2a] h-10"
                onClick={() => navigate(txUrl)}
              >
                <Eye className="mr-2" size={16} /> View escrow
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-[#7A7A7A] text-white hover:bg-[#2a2a2a] h-10"
                onClick={() => navigate(txUrl)}
              >
                <UserRound className="mr-2" size={16} /> Manage escrow
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Recipients Section */}
      {activity.to &&
        Array.isArray(activity.to) &&
        activity.to.length > 0 && (
          <div className="space-y-4">

            {category === "sent" && (
              <Fragment>
                {activity.status === "released" || activity.status === "completed" ? (
                  // Completed sent transaction - simplified layout
                  <Fragment>
                    {activity.status !== "completed" && (
                      <div className="flex items-center gap-3">
                        <UsersRound size={20} className="text-white" />
                        <span className="text-white font-medium">Recipients ({activity.to?.length || 0})</span>
                      </div>
                    )}
                    <div className="container-error flex justify-between items-center">
                      <span className="text-white">{activity.status === "completed" ? "Total withdrawn:" : "Total escrow:"}</span>
                      <div className="flex items-center gap-2">
                        <Bitcoin size={20} className="text-[#F9A214]" />
                        <span className="text-white font-medium">
                          {formatBTC(
                            activity.to?.reduce(
                              (sum: number, recipient) =>
                                sum + (recipient.amount ? Number(recipient.amount) : 0),
                              0
                            ) || 0
                          )}
                        </span>
                        <span className="text-[#9F9F9F] text-sm">BTC</span>
                      </div>
                    </div>
                  </Fragment>
                ) : (
                  // Active/pending sent transaction - full layout with recipients table
                  <Fragment>
                    {/* Recipients Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <UsersRound size={20} className="text-white" />
                        <span className="text-white font-medium">Recipients ({activity.to?.length || 0})</span>
                      </div>

                      {/* Recipients Table */}
                      <div className="border border-[#424444] rounded-[10px] overflow-hidden">
                        {activity.to?.map((recipient, idx: number) => (
                          <div
                            key={idx}
                            className={`flex justify-between items-center p-4 text-white ${idx % 2 === 0 ? 'bg-[#2B2B2B]' : 'bg-[#2B2B2B]'
                              } ${idx !== (activity.to?.length || 0) - 1 ? 'border-b border-[#424444]' : ''}`}
                          >
                            <span className="font-mono text-sm">
                              {String(recipient.principal).slice(0, 20)}...{String(recipient.principal).slice(-8)}
                            </span>
                            <span className="text-sm">
                              {recipient.percentage ? String(recipient.percentage) + "%" : ""} • {" "}
                              {recipient.amount ? formatBTC(Number(recipient.amount)) : "0"} BTC
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Escrow Section */}
                      <div className="bg-[#362825] border border-[#715A24] rounded-[10px] p-4 flex justify-between items-center">
                        <span className="text-white">Total escrow:</span>
                        <div className="flex items-center gap-2">
                          <Bitcoin size={20} className="text-[#F9A214]" />
                          <span className="text-white font-medium">
                            {formatBTC(
                              activity.to?.reduce(
                                (sum: number, recipient) =>
                                  sum + (recipient.amount ? Number(recipient.amount) : 0),
                                0
                              ) || 0
                            )}
                          </span>
                          <span className="text-[#9F9F9F] text-sm">BTC</span>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                )}
              </Fragment>
            )}

            {category === "received" && (
              <Fragment>
                {activity.status === "released" || activity.status === "completed" ? (
                  // Completed received transaction - simplified layout
                  <Fragment>
                    <div className="flex items-center gap-3">
                      <UserRound size={20} className="text-white" />
                      <span className="text-white font-medium">Sender: {String(activity.from).slice(0, 20)}...{String(activity.from).slice(-8)}</span>
                    </div>
                    <div className="container-success">
                      <div className="space-y-2">
                        <span className="text-white text-sm">You&apos;ll receive:</span>
                        <div className="flex items-center gap-2">
                          <Bitcoin size={20} className="text-[#F9A214]" />
                          <span className="text-white font-medium">
                            {formatBTC(userShare.amount)}
                          </span>
                          <span className="text-[#9F9F9F] text-sm">BTC</span>
                          <span className="text-white text-sm">({userShare.percentage}%)</span>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                ) : (
                  // Active/pending received transaction - standard layout
                  <Fragment>
                    <div className="flex items-center gap-3">
                      <UserRound size={20} className="text-white" />
                      <span className="text-white font-medium">Sender: {String(activity.from).slice(0, 20)}...{String(activity.from).slice(-8)}</span>
                    </div>
                    <div className="container-gray">
                      <div className="flex items-center gap-2">
                        <Bitcoin size={20} className="text-[#F9A214]" />
                        <span className="text-white font-medium">
                          {formatBTC(userShare.amount)}
                        </span>
                        <span className="text-[#9F9F9F] text-sm">BTC</span>
                        <span className="text-[#9F9F9F] text-sm">({userShare.percentage}%)</span>
                      </div>
                    </div>
                  </Fragment>
                )}
              </Fragment>
            )}
          </div>
        )
      }
    </Card>
  )
}

export default ActivityContent;