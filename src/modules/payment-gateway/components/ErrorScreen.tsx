'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import SplitSafeFooter from './SplitSafeFooter';

interface ErrorScreenProps {
  error: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

export default function ErrorScreen({ error, onRetry, onCancel }: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4">
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button 
                onClick={onRetry}
                className="w-full bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-semibold"
              >
                Try Again
              </Button>
              <Button 
                onClick={onCancel}
                variant="outline"
                className="w-full"
              >
                Cancel Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer outside of card */}
      <div className="text-center pb-4">
        <SplitSafeFooter />
      </div>
    </div>
  );
}
