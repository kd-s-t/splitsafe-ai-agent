'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_ENDPOINTS } from '../constants';

export function ApiReference() {
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          API Reference
        </CardTitle>
        <CardDescription className="text-[#BCBCBC]">
          Complete reference for SplitSafe API endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {API_ENDPOINTS.map((endpoint, index) => (
            <div key={index} className="border border-[#2A2A2A] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 ${
                    endpoint.method === 'POST' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {endpoint.method}
                </Badge>
                <code className="text-white font-mono text-lg">{endpoint.path}</code>
              </div>
              
              <p className="text-[#BCBCBC] mb-4">{endpoint.description}</p>

              {endpoint.parameters && (
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-3">Parameters</h4>
                  <div className="space-y-2">
                    {endpoint.parameters.map((param) => (
                      <div key={param.name} className="flex items-start gap-3 p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded">
                        <div className="flex-shrink-0">
                          <Badge 
                            variant={param.required ? "default" : "secondary"}
                            className={param.required ? "bg-[#FEB64D] text-black" : "bg-[#2A2A2A] text-[#BCBCBC]"}
                          >
                            {param.required ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-white font-mono">{param.name}</code>
                            <span className="text-[#BCBCBC] text-sm">({param.type})</span>
                          </div>
                          <p className="text-[#BCBCBC] text-sm">{param.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {endpoint.response && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Response</h4>
                  <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        {endpoint.response.status}
                      </Badge>
                      <span className="text-[#BCBCBC] text-sm">{endpoint.response.description}</span>
                    </div>
                    <pre className="text-sm text-[#BCBCBC] overflow-x-auto">
                      {JSON.stringify(endpoint.response.example, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
