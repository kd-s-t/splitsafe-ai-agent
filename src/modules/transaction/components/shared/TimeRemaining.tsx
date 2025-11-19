"use client";

import { Typography } from "@/components/ui/typography";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TimeRemainingProps {
  createdAt: string;
  status?: string;
}

export default function TimeRemaining({ createdAt, status }: TimeRemainingProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Validate createdAt is a valid timestamp string
      if (!createdAt || createdAt === "undefined" || createdAt === "null") {
        setTimeRemaining("Loading...");
        setIsExpired(false);
        return;
      }

      // Convert nanosecond timestamp to milliseconds for JavaScript Date
      const timestampNs = parseInt(createdAt);
      if (isNaN(timestampNs)) {
        setTimeRemaining("Invalid timestamp");
        setIsExpired(false);
        return;
      }

      // Convert nanoseconds to milliseconds (1 second = 1,000,000,000 nanoseconds)
      const timestampMs = timestampNs / 1_000_000;
      const createdTime = new Date(timestampMs).getTime();
      
      // Check if the date is valid (not NaN)
      if (isNaN(createdTime)) {
        setTimeRemaining("Invalid timestamp");
        setIsExpired(false);
        return;
      }

      const now = new Date().getTime();
      const difference = now - createdTime; // Time elapsed since creation

      // If more than 24 hours have passed, consider it expired
      const maxAgeHours = 24;
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      
      // Only mark as expired if both time has passed AND status is still pending
      // If status is already cancelled/declined/released, don't show expired
      if (difference >= maxAgeMs && status === "pending") {
        setTimeRemaining("Expired");
        setIsExpired(true);
        return;
      } else if (difference >= maxAgeMs && status !== "pending") {
        // Don't show expired banner if status is already changed
        setTimeRemaining("Expired");
        setIsExpired(false); // Don't show the red banner
        return;
      }

      // Calculate remaining time
      const remainingMs = maxAgeMs - difference;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      setIsExpired(false);
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (isExpired) {
    return (
      <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#F64C4C] mb-6">
        <div className="flex items-center gap-3">
          <Clock className="text-[#F64C4C]" size={20} />
          <div>
            <Typography variant="base" className="text-[#F64C4C] font-semibold">
              Escrow Expired
            </Typography>
            <Typography variant="small" className="text-gray-400">
              This escrow has expired and can no longer be completed
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="text-[#FEB64D]" size={20} />
      <span className="text-[#FEB64D] font-semibold">Time remaining:</span>
      <span className="text-white">{timeRemaining} until escrow expires</span>
    </div>
  );
} 