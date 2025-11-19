"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog-new";
import type { NormalizedTransaction } from "@/modules/shared.types";
// img component removed - use <img> tags instead;
import { useEffect, useState } from "react";

export function ConstellationHashes({ escrow }: { escrow: NormalizedTransaction }) {
  const [isReachable, setIsReachable] = useState<Record<string, boolean>>({});
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  const hashes = Array.isArray(escrow.constellationHashes) ? escrow.constellationHashes : [];
  const hasHashes = hashes.length > 0;
  const explorerBase = process.env.VITE_CONSTELLATION_EXPLORER_URL || 'https://digitalevidence.constellationnetwork.io/fingerprint';

  // Check reachability for all hashes
  useEffect(() => {
    const checkAll = async () => {
      for (const hashEntry of hashes) {
        const hash = hashEntry.hash;
        if (!hash) continue;
        
        const explorerUrl = `${explorerBase.replace(/\/$/, '')}/${encodeURIComponent(hash)}`;
        try {
          const res = await fetch(explorerUrl, { method: 'HEAD', mode: 'no-cors' });
          setIsReachable(prev => ({
            ...prev,
            [hash]: res.type === 'opaque' || res.ok
          }));
        } catch {
          setIsReachable(prev => ({
            ...prev,
            [hash]: false
          }));
        }
      }
    };
    if (hasHashes) {
      checkAll();
    }
  }, [hashes, explorerBase, hasHashes]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const getExplorerUrl = (hash: string) => {
    return explorerBase ? `${explorerBase.replace(/\/$/, '')}/${encodeURIComponent(hash)}` : null;
  };

  const setDialogOpen = (hash: string, open: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [hash]: open }));
  };

  if (!hasHashes) return null;

  // Reverse hashes to show latest first
  const sortedHashes = [...hashes].reverse();

  return (
    <div className="mt-6 bg-[#212121] border border-[#303434] rounded-[16px] p-4">
      <div className="flex items-center gap-2 text-sm text-[#BBBBBB] mb-3">
        <img
          src="/constellation.png"
          alt="Constellation Network"
          width={16}
          height={16}
          className="w-4 h-4"
        />
        <span>Constellation</span>
        {hashes.length > 1 && (
          <span className="text-xs text-[#888]">({hashes.length} hashes)</span>
        )}
      </div>
      
      <Accordion type="single" collapsible className="w-full" defaultValue={hashes.length === 1 ? "hash-0" : undefined}>
        {sortedHashes.map((hashEntry, index) => {
          const hash = hashEntry.hash;
          const action = hashEntry.action || 'hash';
          const explorerUrl = getExplorerUrl(hash);
          const isHashReachable = isReachable[hash] ?? true;
          const isDialogOpen = openDialogs[hash] ?? false;

          return (
            <AccordionItem key={`hash-${index}`} value={`hash-${index}`} className="border-none">
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="px-1.5 py-0.5 rounded bg-[#2d2e2e] text-[10px] text-[#BBBBBB] flex-shrink-0">{action}</span>
                  <code className="text-xs break-all text-white flex-1 min-w-0">{hash}</code>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {explorerUrl && isHashReachable && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs px-2 py-1 rounded bg-[#2d2e2e] hover:bg-[#3a3b3b] text-white"
                    >
                      View
                    </a>
                  )}
                  {explorerUrl && isHashReachable && (
                    <button
                      onClick={() => setDialogOpen(hash, true)}
                      className="text-xs px-2 py-1 rounded bg-[#2d2e2e] hover:bg-[#3a3b3b] text-white"
                      aria-label="Open explorer"
                    >
                      Open
                    </button>
                  )}
                  <button
                    className="text-xs px-2 py-1 rounded bg-[#2d2e2e] hover:bg-[#3a3b3b] text-white"
                    onClick={() => copy(hash)}
                    aria-label="Copy constellation hash"
                  >
                    Copy
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Dialogs for each hash */}
      {sortedHashes.map((hashEntry, index) => {
        const hash = hashEntry.hash;
        const explorerUrl = getExplorerUrl(hash);
        const isDialogOpen = openDialogs[hash] ?? false;

        return (
          <Dialog key={`dialog-${index}`} open={isDialogOpen} onOpenChange={(open) => setDialogOpen(hash, open)}>
            <DialogContent className="!bg-[#1f1f1f] border border-[#303434] !w-[90vw] !h-[85vh] !max-w-[1200px] p-0 overflow-hidden">
              <DialogHeader className="p-4 border-b border-[#303434]">
                <DialogTitle className="text-white text-sm">Constellation Explorer - {hashEntry.action || 'hash'}</DialogTitle>
              </DialogHeader>
              {explorerUrl && (
                <iframe
                  src={explorerUrl}
                  title="Constellation Explorer"
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


