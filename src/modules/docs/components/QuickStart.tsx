'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QUICK_START_STEPS } from '../constants';

export function QuickStart() {
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          Quick Start
        </CardTitle>
        <CardDescription className="text-[#BCBCBC]">
          Get up and running with SplitSafe API in minutes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {QUICK_START_STEPS.map((step) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <Badge 
                  variant="outline" 
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FEB64D] text-black border-[#FEB64D]"
                >
                  {step.step}
                </Badge>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-[#BCBCBC] text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
