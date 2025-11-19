"use client"

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Bitcoin, Coins } from 'lucide-react';

interface CurrencySelectorProps {
  selectedCurrency: 'BTC' | 'ICP';
  onCurrencyChange: (currency: 'BTC' | 'ICP') => void;
}

export default function CurrencySelector({
  selectedCurrency,
  onCurrencyChange
}: CurrencySelectorProps) {
  return (
    <div className="relative">
      <div className='w-full flex items-center bg-[#212121] rounded-xl p-1'>
        <Button
          type="button"
          variant={selectedCurrency === 'BTC' ? 'outline' : 'ghost'}
          onClick={() => onCurrencyChange('BTC')}
          className={`flex-1 h-10 ${selectedCurrency === 'BTC'
            ? 'text-[#FEB64D] border-[#FEB64D] !border !bg-[#2F2F2F] shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#2A2A2A]'
              }`}
        >
          <div className="flex items-center gap-2">
            <Bitcoin size={16} />
            <Typography variant="small" className="font-medium">BTC</Typography>
          </div>
        </Button>
        <Button
          type="button"
          variant={selectedCurrency === 'ICP' ? 'outline' : 'ghost'}
          onClick={() => onCurrencyChange('ICP')}
          className={`flex-1 h-10 ${selectedCurrency === 'ICP'
            ? 'text-[#FEB64D] border-[#FEB64D] !border !bg-[#2F2F2F] shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#2A2A2A]'
              }`}
        >
          <div className="flex items-center gap-2">
            <Coins size={16} />
            <Typography variant="small" className="font-medium">ICP</Typography>
          </div>
        </Button>
      </div>
    </div>
  );
}
