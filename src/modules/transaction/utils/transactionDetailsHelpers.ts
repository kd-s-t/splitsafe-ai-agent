import { Principal } from '@dfinity/principal';
import type { EscrowTransaction, Milestone, MilestoneEscrowRecipient, NormalizedTransaction } from '../../shared.types';

// Types for debug logging
// interface MilestoneDebugInfo {
//   index: number;
//   id: string;
//   hasRecipients: boolean;
//   recipientsLength?: number;
//   recipients?: Array<{
//     name: string;
//     proofOfWorkSubmittedAt?: string;
//   }>;
// }

// interface RecipientDebugInfo {
//   id: string;
//   name: string;
//   signedContractAt: unknown;
//   signedContractAtType: string;
//   signedContractAtIsArray: boolean;
//   clientApprovedSignedContractAt: unknown;
// }

interface PrincipalLike {
  toText?: () => string;
}

/**
 * Serializes an escrow for Redux compatibility by converting BigInt values to strings
 */
export function serializeEscrowForRedux(escrow: unknown): NormalizedTransaction {
  const e = escrow as Record<string, unknown>;
  return {
    id: String(e.id),
    status: String(e.status),
    title: String(e.title || ''),
    from: (() => {
      if (typeof e.from === "string") {
        return e.from.trim();
      }
      if (e.from && typeof e.from === "object" && typeof (e.from as { toText?: () => string }).toText === "function") {
        return (e.from as { toText: () => string }).toText().trim();
      }
      if (e.from && typeof e.from === "object") {
        // Try to reconstruct Principal from object properties
        const obj = e.from as Record<string, unknown>;
        if (obj._arr && obj._isPrincipal) {
          try {
            // Method 1: Try fromUint8Array
            const reconstructedPrincipal = Principal.fromUint8Array(new Uint8Array(obj._arr as number[]));
            return reconstructedPrincipal.toText().trim();
          } catch {
            try {
              // Method 2: Try fromHex
              const hexString = Array.from(obj._arr as number[]).map((b: number) => b.toString(16).padStart(2, '0')).join('');
              const reconstructedPrincipal = Principal.fromHex(hexString);
              return reconstructedPrincipal.toText().trim();
            } catch {
              try {
                // Method 3: Try fromText
                const arrAsString = String.fromCharCode(...(obj._arr as number[]));
                const reconstructedPrincipal = Principal.fromText(arrAsString);
                return reconstructedPrincipal.toText().trim();
              } catch {
                return String(e.from).trim();
              }
            }
          }
        }
      }
      return String(e.from).trim();
    })(),
    amount: String(e.amount || '0'),
    createdAt: String(e.createdAt),
    confirmedAt: e.confirmedAt ? String(e.confirmedAt) : undefined,
    cancelledAt: e.cancelledAt ? String(e.cancelledAt) : undefined,
    refundedAt: e.refundedAt ? String(e.refundedAt) : undefined,
    releasedAt: e.releasedAt ? String(e.releasedAt) : undefined,
    readAt: e.readAt ? String(e.readAt) : undefined,
    to: (() => {
      // For basic escrows, use basicData[0].to if available, otherwise use top-level to
      let toArray = e.to || [];
      
      
      // Check if this is a basic escrow with basicData
      if (e.basicData && Array.isArray(e.basicData) && e.basicData.length > 0) {
        const basicDataEntry = e.basicData[0] as { to?: unknown[] };
        if (basicDataEntry.to && Array.isArray(basicDataEntry.to)) {
          toArray = basicDataEntry.to;
        }
      }
      
      return Array.isArray(toArray) ? toArray.map((toEntry) => ({
        ...toEntry,
        principal: String(toEntry.principal),
        amount: String(toEntry.amount),
        percentage: String(toEntry.percentage),
        status: toEntry.status || null,
        name: String(toEntry.name || ''),
        approvedAt: toEntry.approvedAt ? String(toEntry.approvedAt) : undefined,
        declinedAt: toEntry.declinedAt ? String(toEntry.declinedAt) : undefined,
        readAt: toEntry.readAt ? String(toEntry.readAt) : undefined,
      })) : [];
    })()
  };
}

/**
 * Serializes an escrow with proper type handling for API responses
 */
export function serializeApiEscrow(escrow: unknown): unknown {
  const e = escrow as Record<string, unknown>;
  return {
    ...e,
    timestamp: e.createdAt?.toString() || "0",
    createdAt: e.createdAt?.toString() || "0",
    // Fix the from field to be a string
    from: (() => {
      if (typeof e.from === "string") {
        return e.from.trim();
      }
      if (e.from && typeof e.from === "object" && typeof (e.from as { toText?: () => string }).toText === "function") {
        return (e.from as { toText: () => string }).toText().trim();
      }
      if (e.from && typeof e.from === "object") {
        // Try to reconstruct Principal from object properties
        const obj = e.from as Record<string, unknown>;
        if (obj._arr && obj._isPrincipal) {
          try {
            // Method 1: Try fromUint8Array
            const reconstructedPrincipal = Principal.fromUint8Array(new Uint8Array(obj._arr as number[]));
            return reconstructedPrincipal.toText().trim();
          } catch {
            try {
              // Method 2: Try fromHex
              const hexString = Array.from(obj._arr as number[]).map((b: number) => b.toString(16).padStart(2, '0')).join('');
              const reconstructedPrincipal = Principal.fromHex(hexString);
              return reconstructedPrincipal.toText().trim();
            } catch {
              try {
                // Method 3: Try fromText
                const arrAsString = String.fromCharCode(...(obj._arr as number[]));
                const reconstructedPrincipal = Principal.fromText(arrAsString);
                return reconstructedPrincipal.toText().trim();
              } catch {
                return String(e.from).trim();
              }
            }
          }
        }
      }
      return String(e.from).trim();
    })(),
    confirmedAt: e.confirmedAt ? e.confirmedAt.toString() : undefined,
    cancelledAt: e.cancelledAt ? e.cancelledAt.toString() : undefined,
    refundedAt: e.refundedAt ? e.refundedAt.toString() : undefined,
    releasedAt: e.releasedAt ? e.releasedAt.toString() : undefined,
    readAt: e.readAt ? e.readAt.toString() : undefined,
    to: (() => {
      
      // For basic escrows, use basicData[0].to if available, otherwise use top-level to
      let toArray = e.to || [];
      
      // Check if this is a basic escrow with basicData
      if (e.basicData && Array.isArray(e.basicData) && e.basicData.length > 0) {
        const basicDataEntry = e.basicData[0] as { to?: unknown[] };
        if (basicDataEntry.to && Array.isArray(basicDataEntry.to)) {
          toArray = basicDataEntry.to;
        }
      }
      
      return Array.isArray(toArray) ? toArray.map((toEntry) => ({
        ...toEntry,
        principal: String(toEntry.principal),
        amount: String(toEntry.amount),
        percentage: String(toEntry.percentage),
        status: toEntry.status || null,
        name: String(toEntry.name || ''),
        approvedAt: toEntry.approvedAt ? toEntry.approvedAt.toString() : undefined,
        declinedAt: toEntry.declinedAt ? toEntry.declinedAt.toString() : undefined,
        readAt: toEntry.readAt ? toEntry.readAt.toString() : undefined,
      })) : []
    })()
  };
}

/**
 * Gets the initiator principal as a string
 */
export function getInitiatorPrincipal(escrow: NormalizedTransaction): string {
  if (typeof escrow.from === 'string') {
    // Validate that it's a proper principal string (no invalid characters)
    if (escrow.from.includes('[') || escrow.from.includes(']') || 
        escrow.from.includes('{') || escrow.from.includes('}') ||
        escrow.from.includes('[object Object]')) {
      return '';
    }
    return escrow.from;
  }
  
  // Handle Principal-like objects
  if (escrow.from && typeof escrow.from === 'object' && 'toText' in escrow.from) {
    return (escrow.from as PrincipalLike).toText?.() || '';
  }
  
  return '';
}

/**
 * Gets a principal as a string, handling both string and Principal types
 */
export function getPrincipalAsString(principal: string | Principal | null): string {
  if (!principal) return '';
  return typeof principal === 'string' ? principal : principal.toText();
}

/**
 * Extracts principal text from various principal formats
 * Handles Principal objects, strings, and other formats
 */
export function extractPrincipalText(principal: unknown): string {
  if (!principal) return 'N/A';
  
  if (typeof principal === 'string') {
    return principal;
  }
  
  if (typeof principal === 'object' && principal !== null) {
    // Check if it's a Principal object with toText method
    if ('toText' in principal && typeof principal.toText === 'function') {
      try {
        return principal.toText();
      } catch {
        // Error calling toText()
      }
    }
    
    // Check if it has a _arr property (Principal object structure)
    if ('_arr' in principal && '_isPrincipal' in principal) {
      // This is a Principal object, try to extract the text
      try {
        if ('toText' in principal && typeof principal.toText === 'function') {
          return principal.toText();
        }
      } catch {
        // Error extracting principal text
      }
    }
    
    // Try to extract from the object structure for unique identification
    // Use a combination of properties to create a unique identifier
    const objStr = JSON.stringify(principal);
    return objStr; // This will be unique for each principal object
  }
  
  return String(principal);
}

/**
 * Calculates the total BTC amount for an escrow
 * For milestone escrows, uses the sum of milestone allocations
 * For basic escrows, uses the transaction amount
 */
export function calculateTotalBTC(escrow: NormalizedTransaction | EscrowTransaction): number {
  // For both basic and milestone escrows, use the transaction's total amount
  // This comes from funds_allocated in the backend
  const fundsAllocated = escrow.funds_allocated;
  const amount = escrow.amount;
  
  // Handle both string (NormalizedTransaction) and bigint (EscrowTransaction) types
  const fundsValue = fundsAllocated ? 
    (typeof fundsAllocated === 'string' ? Number(fundsAllocated) : Number(fundsAllocated)) : 
    (typeof amount === 'string' ? Number(amount) : Number(amount));
    
  return (fundsValue || 0) / 1e8;
}

/**
 * Calculates the user's share from an escrow
 */
export function calculateUserShare(escrow: NormalizedTransaction, principal: Principal | null): { amount: number; percentage: number } {
  if (!escrow || !principal) {
    return { amount: 0, percentage: 0 };
  }
  
  const currentUserEntry = escrow.to?.find((entry) =>
    String(entry.principal) === String(principal)
  );
  
  if (!currentUserEntry) {
    return { amount: 0, percentage: 0 };
  }
  
  return {
    amount: Number(currentUserEntry.amount) / 1e8,
    percentage: Number(currentUserEntry.percentage)
  };
}

/**
 * Counts unique recipients across all milestones in a milestone escrow
 * For basic escrows, returns the count from transaction.to
 */
export function countUniqueRecipients(escrow: NormalizedTransaction | EscrowTransaction): number {
  // Check if this is a milestone transaction
  if (escrow.milestoneData && escrow.milestoneData.milestones?.length > 0) {
    // For milestone escrows, collect all unique principals from all milestones
    const uniquePrincipals = new Set<string>();
    
    escrow.milestoneData.milestones.forEach((milestone) => {
      if (milestone.recipients && Array.isArray(milestone.recipients)) {
        milestone.recipients.forEach((recipient) => {
          
            if (recipient.principal) {
              const principalStr = extractPrincipalText(recipient.principal);
              uniquePrincipals.add(principalStr);
            }
        });
      }
    });
    
    return uniquePrincipals.size;
  }
  
  const basicCount = escrow.to?.length || 0;
  return basicCount;
}

/**
 * Determines the current step for the escrow lifecycle
 */
export function getCurrentStep(status: string, escrow?: NormalizedTransaction | EscrowTransaction): number {
  
  // For milestone escrows, we need to check recipient approval status
  if (escrow && escrow.milestoneData && escrow.milestoneData.milestones?.length > 0) {
    
    // Use the same logic as the Contract Signing Status section to get unique recipients
    let uniqueRecipients = escrow.milestoneData?.recipients || [];
    
    // TEMPORARY WORKAROUND: If milestoneData.recipients is empty, extract from milestones
    if (uniqueRecipients.length === 0 && escrow.milestoneData?.milestones) {
      const seenPrincipals = new Set<string>();
      uniqueRecipients = [];
      
      for (const milestone of escrow.milestoneData.milestones) {
        for (const recipient of milestone.recipients) {
          if (!seenPrincipals.has(recipient.principal)) {
            seenPrincipals.add(recipient.principal);
            
            // Try to find contract signing data from milestoneData.recipients if it exists
            const contractData = escrow.milestoneData?.recipients?.find((r: MilestoneEscrowRecipient) => r.principal === recipient.principal);
            
            // Handle array-wrapped values from Candid interface
            const getArrayValue = (value: unknown) => {
              if (Array.isArray(value) && value.length > 0) {
                return value[0];
              }
              return null;
            };
            
            const processedRecipient = {
              id: recipient.id,
              name: recipient.name,
              principal: recipient.principal,
              signedContractFile: getArrayValue(contractData?.signedContractFile),
              signedContractAt: getArrayValue(contractData?.signedContractAt),
              clientApprovedSignedContractAt: getArrayValue(contractData?.clientApprovedSignedContractAt)
            };
            
            uniqueRecipients.push(processedRecipient);
          }
        }
      }
    }
    
    // Debug: Log the uniqueRecipients to see what data we're working with
    console.log("🔍 [DEBUG] getCurrentStep - uniqueRecipients:", uniqueRecipients.map((r: MilestoneEscrowRecipient) => ({
      name: r.name,
      signedContractAt: r.signedContractAt,
      signedContractAtType: typeof r.signedContractAt,
      isArray: Array.isArray(r.signedContractAt),
      length: Array.isArray(r.signedContractAt) ? r.signedContractAt.length : 'N/A'
    })));
    
    console.log("🔍 [DEBUG] getCurrentStep - uniqueRecipients count:", uniqueRecipients.length);
    
    // Check if all recipients have signed the contract - handle array-wrapped values from Candid
    const allRecipientsSigned = uniqueRecipients.every((recipient: MilestoneEscrowRecipient) => {
      const signedContractAt = recipient.signedContractAt;
      
      // Handle array-wrapped values from Candid interface
      let actualSignedAt = signedContractAt;
      if (Array.isArray(signedContractAt)) {
        actualSignedAt = signedContractAt.length > 0 ? signedContractAt[0] : null;
      }
      
      // Check if they've actually signed (not null/undefined/empty/0)
      const isSigned = actualSignedAt !== null && 
                       actualSignedAt !== undefined && 
                       actualSignedAt !== '' &&
                       actualSignedAt !== '0';
      
      return isSigned;
    });
    
    console.log("🔍 [DEBUG] getCurrentStep - allRecipientsSigned:", allRecipientsSigned);
    
    // Check if client has approved all signed contracts - handle array-wrapped values from Candid
    const clientApprovedSigned = uniqueRecipients.every((r: MilestoneEscrowRecipient) => {
      const clientApproved = r.clientApprovedSignedContractAt;
      
      // Handle array-wrapped values from Candid interface
      let actualClientApproved = clientApproved;
      if (Array.isArray(clientApproved)) {
        actualClientApproved = clientApproved.length > 0 ? clientApproved[0] : null;
      }
      
      // Check if client has actually approved (not null/undefined/empty/0)
      const isApproved = actualClientApproved !== null && 
                         actualClientApproved !== undefined && 
                         actualClientApproved !== '' &&
                         actualClientApproved !== '0';
      
      console.log(`🔍 [DEBUG] Client approval for ${r.name}:`, { 
        clientApproved, 
        actualClientApproved,
        isApproved
      });
      return isApproved;
    });
    
    // Milestone-specific step logic
    let finalStep = 0;
    
    // Check if any milestone has been released (completed) - using releasePayments instead
    const hasReleasedMilestone = escrow.milestoneData?.milestones?.some((milestone: Milestone) => {
      // Check if any release payments have been made
      return milestone.releasePayments && milestone.releasePayments.length > 0 && 
             milestone.releasePayments.some(payment => payment.releasedAt !== null && payment.releasedAt !== undefined);
    }) || false;
    
    // Check if current time has reached the first milestone's start date
    const currentTime = Date.now() * 1000; // Convert to nanoseconds (ICP time format)
    const firstMilestone = escrow.milestoneData?.milestones?.[0];
    const hasReachedStartDate = firstMilestone ? 
      currentTime >= Number(firstMilestone.startDate) : false;
    
    // Calculate how many milestone payments have been released
    const releasedMilestoneCount = escrow.milestoneData?.milestones?.[0]?.releasePayments?.filter(payment => 
      payment.releasedAt !== null && payment.releasedAt !== undefined
    ).length || 0;

    switch (status) {
      case 'released': 
        finalStep = 6; // Milestone Completed (step 6 in new lifecycle)
        break;
      case 'confirmed': 
        if (clientApprovedSigned && hasReachedStartDate) {
          // Show current milestone step based on released payments
          finalStep = Math.min(3 + releasedMilestoneCount, 6); // Step 3 + released count, max 6
        } else if (clientApprovedSigned) {
          finalStep = 2; // Milestone Active (approved but start date not reached)
        } else if (allRecipientsSigned) {
          finalStep = 1; // Recipients Approved (all signed, waiting for client approval)
        } else {
          finalStep = 0; // Milestone Created
        }
        break;
      case 'pending': 
        if (clientApprovedSigned && hasReachedStartDate) {
          // Show current milestone step based on released payments
          finalStep = Math.min(3 + releasedMilestoneCount, 6); // Step 3 + released count, max 6
        } else if (clientApprovedSigned) {
          finalStep = 2; // Milestone Active (approved but start date not reached)
        } else if (allRecipientsSigned) {
          finalStep = 1; // Recipients Approved (all signed, waiting for client approval)
        } else {
          finalStep = 0; // Milestone Created
        }
        console.log("kendan", finalStep)
        break;
      case 'cancelled': 
        finalStep = 0;
        break;
      case 'refund': 
        finalStep = 0;
        break;
      default: 
        finalStep = 0;
        break;
    }
    
    console.log("🔍 [DEBUG] getCurrentStep - Final calculation:", {
      status,
      allRecipientsSigned,
      clientApprovedSigned,
      hasReleasedMilestone,
      hasReachedStartDate,
      currentTime,
      firstMilestoneStartDate: firstMilestone?.startDate,
      finalStep,
      stepLogic: {
        isConfirmed: status === 'confirmed',
        isPending: status === 'pending',
        shouldBeStep1: (status === 'confirmed' && allRecipientsSigned && !clientApprovedSigned) || (status === 'pending' && allRecipientsSigned && !clientApprovedSigned),
        shouldBeStep2: (status === 'confirmed' && clientApprovedSigned && !hasReachedStartDate) || (status === 'pending' && clientApprovedSigned && !hasReachedStartDate),
        shouldBeStep3: (status === 'confirmed' && clientApprovedSigned && hasReachedStartDate && !hasReleasedMilestone) || (status === 'pending' && clientApprovedSigned && hasReachedStartDate && !hasReleasedMilestone),
        shouldBeStep4: hasReleasedMilestone
      }
    });
    
    return finalStep;
  }
  
  // For basic escrows, use the original logic
  switch (status) {
    case 'released': return 3;
    case 'confirmed': return 2;
    case 'pending': return 0;
    case 'cancelled': return 0;
    case 'refund': return 0;
    default: return 0;
  }
}

/**
 * Checks if the current user is the sender of the escrow
 */
export function isCurrentUserSender(escrow: NormalizedTransaction, principal: Principal | null): boolean {
  if (!principal) return false;
  
  // Get the principal string from the current user
  const principalString = principal.toText();
  
  // Handle different formats of escrow.from
  let escrowFromString: string;
  
  if (typeof escrow.from === 'string') {
    escrowFromString = escrow.from.trim();
  } else if (escrow.from && typeof escrow.from === 'object' && 'toText' in escrow.from) {
    // Handle Principal object with toText method
    escrowFromString = (escrow.from as { toText: () => string }).toText().trim();
  } else if (escrow.from && typeof escrow.from === 'object') {
    // Try to extract from object properties
    const obj = escrow.from as Record<string, unknown>;
    if (obj._arr && obj._isPrincipal) {
      // This is a Principal object from ICP, try multiple reconstruction methods
      try {
        // Method 1: Try fromUint8Array
        const reconstructedPrincipal = Principal.fromUint8Array(new Uint8Array(obj._arr as number[]));
        escrowFromString = reconstructedPrincipal.toText().trim();
      } catch {
        try {
          // Method 2: Try fromHex if the _arr can be converted to hex
          const hexString = Array.from(obj._arr as number[]).map((b: number) => b.toString(16).padStart(2, '0')).join('');
          const reconstructedPrincipal = Principal.fromHex(hexString);
          escrowFromString = reconstructedPrincipal.toText().trim();
        } catch {
          try {
            // Method 3: Try fromText if the _arr can be converted to a string
            const arrAsString = String.fromCharCode(...(obj._arr as number[]));
            const reconstructedPrincipal = Principal.fromText(arrAsString);
            escrowFromString = reconstructedPrincipal.toText().trim();
          } catch {
            try {
              // Method 4: Try toText if available
              if (obj.toText && typeof obj.toText === 'function') {
                escrowFromString = obj.toText().trim();
              } else {
                // Method 5: Try to use the object directly as a Principal
                escrowFromString = String(escrow.from).trim();
              }
            } catch {
              escrowFromString = String(escrow.from).trim();
            }
          }
        }
      }
    } else {
      escrowFromString = String(escrow.from).trim();
    }
  } else {
    // Fallback to string conversion
    escrowFromString = String(escrow.from).trim();
  }
  
  // Clean up any potential formatting issues
  const cleanFromString = escrowFromString.replace(/[\[\]{}]/g, '').trim();
  const cleanPrincipalString = principalString.trim();
  
  const isSender = cleanFromString === cleanPrincipalString;
  
  // DEBUG: Log comparison details
  console.log('🔍 [isCurrentUserSender] Debug:', {
    escrowId: escrow.id,
    escrowFromType: typeof escrow.from,
    escrowFromRaw: escrow.from,
    escrowFromString,
    cleanFromString,
    principalString,
    cleanPrincipalString,
    isSender,
    areEqual: cleanFromString === cleanPrincipalString,
    fromLength: cleanFromString.length,
    principalLength: cleanPrincipalString.length,
    fromChars: cleanFromString.split(''),
    principalChars: cleanPrincipalString.split('')
  });
  
  // Use the actual comparison result
  const finalIsSender = isSender;
  
  
  // TEMPORARY FIX: If this is a BSC_ transaction and we have 0 recipients, 
  // assume the current user is the sender
  if (!finalIsSender && escrow.id?.startsWith('BSC_') && escrow.to?.length === 0) {
    console.log('✅ [isCurrentUserSender] Using BSC_ fallback - returning true');
    return true;
  }
  
  console.log(`🔍 [isCurrentUserSender] Final result: ${finalIsSender ? 'SENDER' : 'RECIPIENT'}`);
  return finalIsSender;
}

/**
 * Checks if the current user has already taken action on the escrow
 */
export function hasUserActioned(escrow: NormalizedTransaction, principal: Principal | null): boolean {
  if (!principal) {
    console.log('[hasUserActioned] No principal provided, returning false');
    return false;
  }
  
  const principalText = principal.toText();
  const currentUserEntry = escrow.to?.find((entry) =>
    String(entry.principal) === String(principal)
  );
  
  console.log('[hasUserActioned] Checking action status:', {
    principalText,
    hasToArray: !!escrow.to,
    toArrayLength: escrow.to?.length || 0,
    foundEntry: !!currentUserEntry,
    entryPrincipal: currentUserEntry ? String(currentUserEntry.principal) : null,
    entryApprovedAt: currentUserEntry?.approvedAt,
    entryDeclinedAt: currentUserEntry?.declinedAt,
    entryStatus: currentUserEntry?.status,
    statusKeys: currentUserEntry?.status ? Object.keys(currentUserEntry.status) : null,
    statusKey0: currentUserEntry?.status ? Object.keys(currentUserEntry.status)[0] : null,
    isNotPending: currentUserEntry?.status ? Object.keys(currentUserEntry.status)[0] !== "pending" : false,
  });
  
  const hasActioned = Boolean(currentUserEntry && (
    currentUserEntry.approvedAt ||
    currentUserEntry.declinedAt ||
    (currentUserEntry.status && Object.keys(currentUserEntry.status)[0] !== "pending")
  ));
  
  console.log('[hasUserActioned] Result:', hasActioned);
  
  return hasActioned;
}

/**
 * Gets the subtitle for the escrow based on its status
 */
export function getEscrowSubtitle(status: string): string {
  switch (status) {
    case 'pending': return 'Review and approve or decline this escrow';
    case 'confirmed': return 'Waiting for sender to release or refund';
    case 'released': return 'Escrow completed successfully';
    case 'refund': return 'Escrow has been refunded';
    case 'cancelled':
    case 'declined': return 'Escrow has been cancelled';
    default: return '';
  }
}
