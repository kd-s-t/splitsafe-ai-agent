"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog-new";
import type { NormalizedTransaction } from "@/modules/shared.types";
// img component removed - use <img> tags instead;
import { useState } from "react";

const AENEID_EXPLORER = "https://aeneid.storyscan.io"; // blockscout

export function StoryLinks({ escrow }: { escrow: NormalizedTransaction }) {
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const txs = escrow.storyTxs || [];
  const hasTxs = txs.length > 0;
  
  if (!hasTxs) return null;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const getExplorerUrl = (txHash: string) => {
    return txHash ? `${AENEID_EXPLORER}/tx/${txHash}` : null;
  };

  const setDialogOpen = (txHash: string, open: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [txHash]: open }));
  };

  // Reverse txs to show latest first
  const sortedTxs = [...txs].reverse();

  return (
    <div className="mt-6 bg-[#212121] border border-[#303434] rounded-[16px] p-4">
      <div className="flex items-center gap-2 text-sm text-[#BBBBBB] mb-3">
        {/* Story Protocol logo */}
        <img
          src="/story.jpeg"
          alt="Story Protocol"
          width={16}
          height={16}
          className="w-4 h-4"
        />
        <span>Story</span>
        {txs.length > 1 && (
          <span className="text-xs text-[#888]">({txs.length} transactions)</span>
        )}
      </div>
      
      <Accordion type="single" collapsible className="w-full" defaultValue={txs.length === 1 ? "tx-0" : undefined}>
        {sortedTxs.map((tx, index) => {
          const txHash = tx.txHash || '';
          const action = tx.action || 'transaction';
          const explorerUrl = getExplorerUrl(txHash);
          const isDialogOpen = openDialogs[txHash] ?? false;

          return (
            <AccordionItem key={`tx-${index}`} value={`tx-${index}`} className="border-none">
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="px-1.5 py-0.5 rounded bg-[#2d2e2e] text-[10px] text-[#BBBBBB] flex-shrink-0">{action}</span>
                  <code className="text-xs break-all text-white flex-1 min-w-0">{txHash}</code>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs px-2 py-1 rounded bg-[#2d2e2e] hover:bg-[#3a3b3b] text-white"
                    >
                      View
                    </a>
                  )}
                  {explorerUrl && (
                    <button
                      onClick={() => setDialogOpen(txHash, true)}
                      className="text-xs px-2 py-1 rounded bg-[#2d2e2e] hover:bg-[#3a3b3b] text-white"
                      aria-label="Open explorer"
                    >
                      Open
                    </button>
                  )}
                  <button
                    className="text-xs px-2 py-1 rounded bg-[#2d2e2e] hover:bg-[#3a3b3b] text-white"
                    onClick={() => copy(txHash)}
                    aria-label="Copy transaction hash"
                  >
                    Copy
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Dialogs for each transaction */}
      {sortedTxs.map((tx, index) => {
        const txHash = tx.txHash || '';
        const explorerUrl = getExplorerUrl(txHash);
        const isDialogOpen = openDialogs[txHash] ?? false;

        return (
          <Dialog key={`dialog-${index}`} open={isDialogOpen} onOpenChange={(open) => setDialogOpen(txHash, open)}>
            <DialogContent className="!bg-[#1f1f1f] border border-[#303434] !w-[90vw] !h-[85vh] !max-w-[1200px] p-0 overflow-hidden">
              <DialogHeader className="p-4 border-b border-[#303434]">
                <DialogTitle className="text-white text-sm">Story Protocol Explorer - {tx.action || 'transaction'}</DialogTitle>
              </DialogHeader>
              {explorerUrl && (
                <iframe
                  src={explorerUrl}
                  title="Story Protocol Explorer"
                  className="w-full h-full"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              )}
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
