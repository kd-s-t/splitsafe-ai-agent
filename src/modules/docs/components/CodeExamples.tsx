'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Image import removed - use <img> tags directly
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CODE_EXAMPLES } from '../constants';

export function CodeExamples() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          Code Examples
        </CardTitle>
        <CardDescription className="text-[#BCBCBC]">
          Examples in different programming languages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="javascript" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[#0A0A0A] border-[#2A2A2A]">
            {CODE_EXAMPLES.map((example) => (
              <TabsTrigger
                key={example.language}
                value={example.language}
                className="text-white data-[state=active]:bg-[#FEB64D] data-[state=active]:text-black flex items-center gap-2"
              >
                {example.logo ? (
                  <img 
                    src={example.logo} 
                    alt={example.label} 
                    width={16}
                    height={16}
                    className="w-4 h-4 rounded"
                  />
                ) : (
                  <span className="text-green-400 font-bold">{example.label}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {CODE_EXAMPLES.map((example) => (
            <TabsContent key={example.language} value={example.language} className="mt-4">
              <div className="rounded-lg border border-[#2A2A2A] overflow-hidden">
                <div className="flex justify-between items-center bg-[#0A0A0A] px-4 py-2 border-b border-[#2A2A2A]">
                  <span className="text-[#BCBCBC] text-sm">{example.label}</span>
                  <button
                    onClick={() => copyToClipboard(example.code)}
                    className="text-[#BCBCBC] hover:text-white text-sm transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <SyntaxHighlighter
                  language={example.language === 'curl' ? 'bash' : example.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                >
                  {example.code}
                </SyntaxHighlighter>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
