'use client';

import { Loader2 } from 'lucide-react';
// img component removed - use <img> tags instead;
import SplitSafeFooter from './SplitSafeFooter';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 mb-4">
          <img 
            src="/splitsafe-logo.svg" 
            alt="SplitSafe Logo" 
            width={288}
            height={128}
            className="w-72 h-32 animate-fade-in-top"
            onError={(e) => {
              e.currentTarget.src = '/logo.svg';
            }}
          />
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FEB64D]" />
        <h2 className="text-xl font-semibold text-white mb-2">SplitSafe Payment Gateway</h2>
        <p className="text-gray-300">Checking authentication status...</p>
        
        {/* Footer */}
        <div className="mt-8">
          <SplitSafeFooter />
        </div>
      </div>
    </div>
  );
}
