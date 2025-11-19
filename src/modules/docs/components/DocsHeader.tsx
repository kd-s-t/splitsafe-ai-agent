'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

export function DocsHeader() {
  return (
    <div className="border-b border-[#2A2A2A] bg-[#0A0A0A]/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-[#2A2A2A]"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-[#FEB64D] rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-white text-4xl font-bold">
              API Documentation
            </h1>
            <p className="text-[#BCBCBC] text-lg mt-2">
              Create basic escrow transactions with Bitcoin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
