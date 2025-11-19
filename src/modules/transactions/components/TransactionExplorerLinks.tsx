"use client";

import { BLOCKSTREAM_URL } from "@/modules/shared.constants";
import { EscrowTransaction, NormalizedTransaction } from "@/modules/shared.types";

interface TransactionExplorerLinksProps {
  transaction: EscrowTransaction | NormalizedTransaction;
  depositAddress?: string;
}

export default function TransactionExplorerLinks({ depositAddress }: TransactionExplorerLinksProps) {
  return (
    <>
      {/* Bitcoin Address Block Explorer Links */}
      {depositAddress && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => window.open(`${BLOCKSTREAM_URL}/address/${depositAddress}`, '_blank')}
            className="text-[#4F3F27] hover:text-[#FEB64D] text-sm underline"
          >
            View on Blockstream
          </button>
        </div>
      )}


    </>
  );
} 