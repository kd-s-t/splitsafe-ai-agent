'use client'

import { Typography } from '@/components/ui/typography';
import { Step, TransactionLifecycleProps } from "@/modules/shared.types";
import { Check, Shield } from 'lucide-react';

const basicSteps: Step[] = [
  { label: 'Locked', description: 'Signed by ICP threshold ECDSA' },
  { label: 'Trigger Met', description: 'Escrow condition fulfilled' },
  { label: 'Splitting', description: 'Payout being distributed' },
  { label: 'Released', description: 'Funds sent to Bitcoin mainnet' },
];

export function BasicLifecycle({ currentStep, steps = basicSteps, status }: TransactionLifecycleProps) {
  return (
    <>
      {/* Topbar */}
      <div className="space-y-3">
        {/* Title */}
        <div className="flex items-center">
          <Shield className="text-[#FEB64D] mr-2" size={20} />
          <Typography variant="base" className="text-white font-semibold">
            Basic Escrow Lifecycle
          </Typography>
        </div>
        
        {/* Banner */}
        <div className="bg-[#48342A] border border-[#BD823D] rounded-[10px] p-4">
          <Typography variant="base" className="text-white">
            Simple Bitcoin Escrow — One-time Payment Release
          </Typography>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, idx) => {
          const isCompleted = idx <= (currentStep || 0);
          const isCancelled = status === 'cancelled' || status === 'declined' || status === 'refunded';
          const isLast = idx === steps.length - 1;
          const isCurrentStep = idx === currentStep;

          return (
            <div key={step.label} className="flex items-start space-x-3">
              {/* Timeline Column */}
              <div className="flex flex-col items-center w-6">
                {/* Circle */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isCompleted && !isCancelled
                  ? 'bg-[#EBAF2D] border-[#FEB64D]'
                  : 'bg-[#0D0D0D] border-[#424444]'
                  } ${isCurrentStep && !isCancelled && status !== 'released' ? 'animate-pulse' : ''}`}>
                  {isCompleted && !isCancelled ? (
                    <Check size={16} className="text-[#0D0D0D]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[#5F5F5F]"></div>
                  )}
                </div>

                {/* Line */}
                {!isLast && (
                  <div className={`w-0.5 h-12 mt-0 ${isCompleted && !isCancelled ? 'bg-[#FEB64D]' : 'bg-[#424444]'
                    }`} style={{ width: '2px' }}></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <Typography
                  variant="base"
                  className={`font-semibold ${isCompleted && !isCancelled ? 'text-white' : 'text-[#9F9F9F]'
                    }`}
                >
                  {step.label}
                </Typography>
                <Typography
                  variant="small"
                  className="text-[#9F9F9F] mt-2"
                >
                  {step.description}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>

    </>
  );
}
