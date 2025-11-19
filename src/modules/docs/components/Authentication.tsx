'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Authentication() {
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          Authentication
        </CardTitle>
        <CardDescription className="text-[#BCBCBC]">
          Session-based authentication for secure access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-3">Step 1: Get Session Token</h3>
            <p className="text-[#BCBCBC] text-sm mb-4">
              First, use your API key to get a session token:
            </p>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 mb-4">
              <pre className="text-green-400 text-sm">
{`curl -X POST https://api.thesplitsafe.com/v1/auth/session \\
  -H "Authorization: Bearer sk_live_pal_abc123..." \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Response:</h4>
              <pre className="text-green-400 text-sm">
{`{
  "success": true,
  "data": {
    "sessionToken": "session_token_pal_abc_1703123456",
    "expiresAt": "2024-12-16T10:00:00Z",
    "clientId": "client_pal_abc"
  }
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Step 2: Use Session Token</h3>
            <p className="text-[#BCBCBC] text-sm mb-4">
              Then use the session token for all API requests:
            </p>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 mb-4">
              <pre className="text-green-400 text-sm">
{`curl -X POST https://api.thesplitsafe.com/v1/escrow/create \\
  -H "Authorization: Bearer session_token_xyz789..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Flight Payment - Manila to Cebu",
    "totalAmount": 8500000000,
    "participants": [
      { "principal": "rdmx6-jaaaa-aaaah-qcaiq-cai", "amount": 8500000000, "percentage": 100 }
    ],
    "milestones": [
      { "title": "Flight Completion", "amount": 8500000000, "schedule": "2024-12-15" }
    ]
  }'`}
              </pre>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Response:</h4>
              <pre className="text-green-400 text-sm">
{`{
  "success": true,
  "data": {
    "escrowId": "escrow_abc123_1703123456",
    "title": "Flight Payment - Manila to Cebu",
    "totalAmount": 8500000000,
    "status": "pending",
    "createdAt": "2024-12-15T10:00:00Z"
  }
}`}
              </pre>
            </div>
          </div>


        </div>
      </CardContent>
    </Card>
  );
}