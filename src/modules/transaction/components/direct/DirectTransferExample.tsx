"use client";

import { DirectTransfer } from "./DirectTransfer";

/**
 * Example usage of DirectTransfer component
 * This shows how to use the direct transfer functionality
 */
export function DirectTransferExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Direct Transfer</h1>
        <p className="text-[#BCBCBC]">
          Send Bitcoin directly to another SplitSafe account. No approval needed - instant transfers!
        </p>
      </div>

      <DirectTransfer 
        defaultRecipient="cebu_pacific_principal_id" // Pre-fill for Cebu Pacific
        defaultMerchantId="cebu_pacific" // Pre-fill merchant ID
      />
    </div>
  );
}

/**
 * Example with custom merchant setup
 */
export function CebuPacificDirectTransfer() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cebu Pacific Payment</h1>
        <p className="text-[#BCBCBC]">
          Pay for your flight booking directly to Cebu Pacific&apos;s SplitSafe account
        </p>
      </div>

      <DirectTransfer 
        defaultRecipient="cebu_pacific_principal_id"
        defaultMerchantId="cebu_pacific"
      />
    </div>
  );
}
