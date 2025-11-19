'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { SAAS_INTEGRATION_FLOWS } from '../constants';

export function SaasIntegrationFlows() {
  return (
    <Card className="bg-[#1A1A1A] border-0">
      <CardHeader>
        <CardTitle className="text-white">
          How to Integrate SplitSafe
        </CardTitle>
        <CardDescription className="text-[#BCBCBC]">
          Simple redirect-based integration for SaaS applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {SAAS_INTEGRATION_FLOWS.map((flow, flowIndex) => (
            <div key={flowIndex} className="border border-[#2A2A2A] rounded-lg p-6">

              <div className="space-y-4">
                {flow.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex gap-4">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-[#FEB64D] text-black rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <Typography variant="base" className="text-white font-semibold mb-1">
                          {step.title}
                        </Typography>
                        <Typography variant="small" className="text-[#BCBCBC]">
                          {step.description}
                        </Typography>
                      </div>


                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
