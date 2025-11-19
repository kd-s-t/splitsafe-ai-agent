'use client'

import { Typography } from '@/components/ui/typography';
import { Step, TransactionLifecycleProps } from "@/modules/shared.types";
import { Calendar, Check, Clock } from 'lucide-react';

const milestoneSteps: Step[] = [
  { label: 'Milestone Created', description: 'Milestone escrow initialized with schedule' },
  { label: 'Recipients Approved', description: 'All recipients have approved the milestone' },
  { label: 'Milestone Active', description: 'Milestone is now active and running' },
  { label: 'Milestone 1', description: 'First milestone payment released' },
  { label: 'Milestone 2', description: 'Second milestone payment released' },
  { label: 'Milestone 3', description: 'Third milestone payment released' },
  { label: 'Milestone Completed', description: 'All milestone payments completed' },
];

export function MilestoneLifecycle({ currentStep, steps = milestoneSteps, status }: TransactionLifecycleProps) {
  return (
    <>
      {/* Topbar */}
      <div className="space-y-3">
        {/* Title */}
        <div className="flex items-center">
          <Calendar className="text-[#FEB64D] mr-2" size={20} />
          <Typography variant="base" className="text-white font-semibold">
            Milestone Lifecycle
          </Typography>
        </div>
        
        {/* Banner */}
        <div className="bg-[#48342A] border border-[#BD823D] rounded-[10px] p-4">
          <Typography variant="base" className="text-white">
            Automated Milestone Escrow — Scheduled Bitcoin Payments
          </Typography>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, idx) => {
          const isCompleted = idx <= (currentStep || 0);
          const isCancelled = status === 'cancelled' || status === 'declined';
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
              <div className="flex-1">
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

      {/* Bottom Banner */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="text-[#FEB64D]" size={16} />
          <Typography variant="small" className="text-white font-semibold">
            Automated Schedule
          </Typography>
        </div>
        <Typography variant="small" className="text-[#9F9F9F]">
          Milestones are executed automatically according to their predefined schedule. No manual intervention required.
        </Typography>
      </div>
    </>
  );
}
