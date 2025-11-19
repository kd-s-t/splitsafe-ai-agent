"use client";

import { Typography } from "@/components/ui/typography";
import { Calendar, Clock, Timer } from "lucide-react";
import { useEffect, useState } from "react";

interface MilestoneTimeRemainingProps {
  createdAt: string;
  status?: string;
  milestones?: Array<{
    startDate: string;
    frequency: string;
    duration: string;
    completedAt?: string;
  }>;
}

export default function MilestoneTimeRemaining({ 
  createdAt, 
  status, 
  milestones = [] 
}: MilestoneTimeRemainingProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [nextMilestone, setNextMilestone] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Validate createdAt is a valid timestamp string
      if (!createdAt || createdAt === "undefined" || createdAt === "null") {
        setTimeRemaining("Loading...");
        setNextMilestone("Loading...");
        setIsExpired(false);
        return;
      }

      // Convert nanosecond timestamp to milliseconds for JavaScript Date
      const timestampNs = parseInt(createdAt);
      if (isNaN(timestampNs)) {
        setTimeRemaining("Invalid timestamp");
        setNextMilestone("Invalid timestamp");
        setIsExpired(false);
        return;
      }

      // Convert nanoseconds to milliseconds (1 second = 1,000,000,000 nanoseconds)
      const timestampMs = timestampNs / 1_000_000;
      const createdTime = new Date(timestampMs).getTime();
      
      // Check if the date is valid (not NaN)
      if (isNaN(createdTime)) {
        setTimeRemaining("Invalid timestamp");
        setNextMilestone("Invalid timestamp");
        setIsExpired(false);
        return;
      }

      const now = new Date().getTime();
      const difference = now - createdTime; // Time elapsed since creation

      // If more than 24 hours have passed, consider it expired
      const maxAgeHours = 24;
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      
      // Only mark as expired if both time has passed AND status is still pending
      if (difference >= maxAgeMs && status === "pending") {
        setTimeRemaining("Expired");
        setNextMilestone("Expired");
        setIsExpired(true);
        return;
      } else if (difference >= maxAgeMs && status !== "pending") {
        setTimeRemaining("Expired");
        setNextMilestone("Expired");
        setIsExpired(false);
        return;
      }

      // Calculate remaining time for escrow approval
      const remainingMs = maxAgeMs - difference;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);

      // Calculate next milestone timing
      if (milestones.length > 0) {
        const nextMilestoneInfo = calculateNextMilestone(milestones);
        setNextMilestone(nextMilestoneInfo);
      } else {
        setNextMilestone("No milestones scheduled");
      }

      setIsExpired(false);
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [createdAt, status, milestones]);

  const calculateNextMilestone = (milestones: Array<{
    startDate: string;
    frequency: string;
    duration: string;
    completedAt?: string;
  }>) => {
    const now = new Date();
    
    // Find the next uncompleted milestone (first milestone)
    const nextMilestone = milestones.find(milestone => 
      !milestone.completedAt || milestone.completedAt.length === 0
    );

    if (!nextMilestone) {
      return "All milestones completed";
    }

    // Calculate when the next milestone should start
    const startDateNs = parseInt(nextMilestone.startDate);
    const startDateMs = startDateNs / 1_000_000;
    const startDate = new Date(startDateMs);

    if (startDate > now) {
      const timeUntilStart = startDate.getTime() - now.getTime();
      const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeUntilStart % (1000 * 60)) / 1000);
      
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else {
        return `${minutes}m ${seconds}s`;
      }
    } else {
      return "Ready to start";
    }
  };

  if (isExpired) {
    return (
      <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#F64C4C] mb-6">
        <div className="flex items-center gap-3">
          <Clock className="text-[#F64C4C]" size={20} />
          <div>
            <Typography variant="base" className="text-[#F64C4C] font-semibold">
              Milestone Escrow Expired
            </Typography>
            <Typography variant="small" className="text-gray-400">
              This milestone escrow has expired and can no longer be completed
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Primary: Milestone Start Timer */}
      {milestones.length > 0 && (
        <div className="flex items-center gap-2">
          <Calendar className="text-[#17a2b8]" size={20} />
          <span className="text-[#17a2b8] font-semibold">Milestone 1 starts in:</span>
          <span className="text-white font-mono">{nextMilestone}</span>
        </div>
      )}

      {/* Secondary: Escrow Approval Timer */}
      <div className="flex items-center gap-2">
        <Clock className="text-[#FEB64D]" size={20} />
        <span className="text-[#FEB64D] font-semibold">Approval time:</span>
        <span className="text-white">{timeRemaining} until escrow expires</span>
      </div>

      {/* Milestone Schedule Info */}
      {milestones.length > 0 && (
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-3">
          <div className="flex items-center space-x-2">
            <Timer className="text-[#FEB64D]" size={16} />
            <Typography variant="small" className="text-white font-semibold">
              Milestone Schedule
            </Typography>
          </div>
          <Typography variant="small" className="text-[#9F9F9F] mt-1">
            {milestones.length} milestone{milestones.length > 1 ? 's' : ''} scheduled for automatic execution
          </Typography>
        </div>
      )}
    </div>
  );
}
