'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ProcessingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#FEB64D]" />
          <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </CardContent>
      </Card>
    </div>
  );
}
