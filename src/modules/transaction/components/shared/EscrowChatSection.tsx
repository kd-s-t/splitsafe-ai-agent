"use client";

import { EscrowChat } from "@/modules/escrow/components";
import { Principal } from "@dfinity/principal";
import type { NormalizedTransaction } from "@/modules/shared.types";
import { getInitiatorPrincipal } from "../../utils/transactionDetailsHelpers";

export interface EscrowChatSectionProps {
  escrow: NormalizedTransaction;
  principal: Principal | null;
  initiatorNickname: string;
}

export function EscrowChatSection({ 
  escrow, 
  principal, 
  initiatorNickname 
}: EscrowChatSectionProps) {
  const initiatorPrincipal = getInitiatorPrincipal(escrow);
  const currentUserPrincipal = principal?.toText();

  const participants = [
    // Include the initiator (sender)
    {
      principal: initiatorPrincipal,
      name: (() => {
        // Check if current user is the initiator
        if (String(escrow.from) === currentUserPrincipal) {
          return 'You';
        }
        // For other users viewing, use the fetched nickname or fallback
        return initiatorNickname || 'User';
      })()
    },
    // Include all recipients
    ...(escrow.to?.map(recipient => ({
      principal: String(recipient.principal),
      name: recipient.name || 'Unknown'
    })) || [])
  ];

  return (
    <EscrowChat
      escrowId={escrow.id}
      participants={participants}
      escrowStatus={escrow.status}
    />
  );
}
