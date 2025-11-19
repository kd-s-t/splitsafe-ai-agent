"use client";

import { Typography } from "@/components/ui/typography";
import { ToEntry } from "@/modules/shared.types";

interface RecipientsListProps {
  recipients: ToEntry[];
  showTimestamps?: boolean;
}

export default function RecipientsList({ recipients, showTimestamps = true }: RecipientsListProps) {
  if (!recipients || recipients.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="large" className="text-[#FEB64D] mb-4">Recipients</Typography>
      <div className="space-y-3 mb-6">
        {recipients.map((recipient, index) => {
          const statusKey = recipient.status ? Object.keys(recipient.status)[0] : 'unknown';
          const statusColor = statusKey === 'approved' ? 'text-green-400' : 
                             statusKey === 'pending' ? 'text-yellow-400' : 
                             statusKey === 'declined' ? 'text-red-400' : 'text-gray-400';
          
          return (
            <div key={index} className="bg-[#2a2a2a] rounded-lg p-4 border border-[#303434]">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Typography variant="base" className="text-white font-semibold">
                    {recipient.name || `Recipient ${index + 1}`}
                  </Typography>
                  <Typography variant="small" className="text-[#FEB64D] mt-1">
                    {(Number(recipient.amount) / 1e8).toFixed(8)} BTC
                  </Typography>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor}`}>
                    {statusKey}
                  </span>
                  {showTimestamps && (
                    <>
                      {recipient.approvedAt && (
                        <Typography variant="small" className="text-gray-500 mt-1">
                          {(() => {
                            try {
                              const timestamp = Number(recipient.approvedAt);
                              // Check if it's already in milliseconds or nanoseconds
                              const date = timestamp > 1e12 ? new Date(timestamp / 1_000_000) : new Date(timestamp);
                              return date.toLocaleString();
                            } catch (error) {
                              console.error('Error parsing approvedAt:', recipient.approvedAt, error);
                              return 'Invalid date';
                            }
                          })()}
                        </Typography>
                      )}
                      {recipient.declinedAt && (
                        <Typography variant="small" className="text-gray-500 mt-1">
                          {(() => {
                            try {
                              const timestamp = Number(recipient.declinedAt);
                              // Check if it's already in milliseconds or nanoseconds
                              const date = timestamp > 1e12 ? new Date(timestamp / 1_000_000) : new Date(timestamp);
                              return date.toLocaleString();
                            } catch (error) {
                              console.error('Error parsing declinedAt:', recipient.declinedAt, error);
                              return 'Invalid date';
                            }
                          })()}
                        </Typography>
                      )}
                      {statusKey === 'pending' && !recipient.approvedAt && !recipient.declinedAt && (
                        <Typography variant="small" className="text-gray-500 mt-1">
                          No action taken yet
                        </Typography>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
} 