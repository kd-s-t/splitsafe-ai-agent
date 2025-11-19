"use client"

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface WithdrawFooterProps {
  isLoading: boolean;
  onClose: () => void;
}

export default function WithdrawFooter({
  isLoading,
  onClose
}: WithdrawFooterProps) {
  return (
    <div className="flex-shrink-0 border-t border-[#404040] pt-3">
      <div className="flex gap-3">
        <Button
          type="submit"
          form="withdraw-form"
          variant="default"
          disabled={isLoading}
          className="bg-[#FEB64D] text-black font-medium hover:bg-[#FEB64D]/90 flex-1"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          ) : (
            'Withdraw'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="bg-transparent text-white border-[#7A7A7A] hover:bg-[#2A2A2A] flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
