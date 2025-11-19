import type { NormalizedTransaction } from '../shared.types';

// Interface for recipient with proof of work data
interface RecipientWithProofOfWork {
  proofOfWorkScreenshotIds?: unknown[];
  proofOfWorkFileIds?: unknown[];
  monthlyProofOfWork?: Array<{
    monthNumber?: unknown;
    description?: unknown;
    screenshotIds?: unknown[];
    fileIds?: unknown[];
    submittedAt?: unknown;
    approvedAt?: unknown;
  }>;
}

/**
 * Converts API response transactions to NormalizedTransaction format
 * @param transactions - Raw transactions from the API
 * @returns Array of normalized transactions
 */
export const convertToNormalizedTransactions = (transactions: unknown[]): NormalizedTransaction[] => {

  const normalizedTxs = transactions.map((tx: unknown) => {
    const txObj = tx as Record<string, unknown>;
    return {
      id: txObj.id as string,
      status: txObj.status as string,
      title: (() => {
        const originalTitle = txObj.title as string;
        const kind = txObj.kind;
        
        // Override title for basic escrows if it's showing milestone title
        if (kind) {
          let kindStr = '';
          if (typeof kind === 'object' && kind !== null) {
            kindStr = JSON.stringify(kind);
          } else if (typeof kind === 'string') {
            kindStr = kind;
          }
          
          if (kindStr.includes('basic') && originalTitle.includes('Milestone')) {
            return 'Basic Escrow';
          }
        }
        
        return originalTitle;
      })(),
      kind: txObj.kind as string | object | undefined,
      from: (() => {
        if (typeof txObj.from === "string") return txObj.from;
        if (txObj.from && typeof txObj.from === "object" && typeof (txObj.from as { toText?: () => string }).toText === "function") {
          return (txObj.from as { toText: () => string }).toText();
        }
        // Handle Principal objects that might not have toText method
        if (txObj.from && typeof txObj.from === "object" && txObj.from !== null) {
          // Try to extract principal text from the object structure
          if ('_arr' in txObj.from || '_isPrincipal' in txObj.from) {
            // This is a Principal object, try to convert it
            try {
              if (typeof (txObj.from as unknown as { toText?: () => string }).toText === "function") {
                return (txObj.from as unknown as { toText: () => string }).toText();
              }
            } catch {
              // Silently handle error
            }
          }
        }
        return String(txObj.from);
      })(),
      amount: typeof txObj.funds_allocated === "bigint" ? txObj.funds_allocated.toString() : String(txObj.funds_allocated || "0"),
      createdAt: typeof txObj.createdAt === "bigint" ? txObj.createdAt.toString() : String(txObj.createdAt),
      confirmedAt: Array.isArray(txObj.confirmedAt) && txObj.confirmedAt.length > 0 ? txObj.confirmedAt[0].toString() : undefined,
      cancelledAt: Array.isArray(txObj.cancelledAt) && txObj.cancelledAt.length > 0 ? txObj.cancelledAt[0].toString() : undefined,
      refundedAt: Array.isArray(txObj.refundedAt) && txObj.refundedAt.length > 0 ? txObj.refundedAt[0].toString() : undefined,
      releasedAt: Array.isArray(txObj.releasedAt) && txObj.releasedAt.length > 0 ? txObj.releasedAt[0].toString() : undefined,
      readAt: Array.isArray(txObj.readAt) && txObj.readAt.length > 0 ? txObj.readAt[0].toString() : undefined,
      chatId: Array.isArray(txObj.chatId) && txObj.chatId.length > 0 ? String(txObj.chatId[0]) : txObj.chatId ? String(txObj.chatId) : undefined,
      constellationHashes: (() => {
        if (Array.isArray(txObj.constellationHashes)) {
          return (txObj.constellationHashes as unknown[]).map((h: unknown) => {
            const ho = h as Record<string, unknown>;
            return {
              action: String(ho.action ?? ''),
              hash: String(ho.hash ?? ''),
              timestamp: String(ho.timestamp ?? ''),
            };
          });
        }
        return undefined;
      })(),
      // Story Protocol metadata
      storyIpAssetId: (() => {
        const raw = (txObj as any).storyIpAssetId; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (Array.isArray(raw) && raw.length > 0) return [String(raw[0])];
        if (typeof raw === 'string') return [raw];
        return undefined;
      })(),
      storyTxs: (() => {
        const raw = (txObj as any).storyTxs as unknown[] | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!Array.isArray(raw)) return undefined;
        return raw.map((t: unknown) => {
          const to = t as Record<string, unknown>;
          return {
            action: String(to.action ?? ''),
            txHash: String(to.txHash ?? ''),
            timestamp: String(to.timestamp ?? ''),
          };
        });
      })(),
      milestoneData: (() => {
        // Handle milestoneData from the API response
        if (txObj.milestoneData && typeof txObj.milestoneData === 'object' && !Array.isArray(txObj.milestoneData)) {
          const milestoneDataObj = txObj.milestoneData as Record<string, unknown>;
          return {
            milestones: Array.isArray(milestoneDataObj.milestones) ? milestoneDataObj.milestones.map((milestone: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              ...milestone,
              createdAt: typeof milestone.createdAt === 'bigint' ? milestone.createdAt.toString() : String(milestone.createdAt),
              allocation: typeof milestone.allocation === 'bigint' ? milestone.allocation.toString() : String(milestone.allocation),
              startDate: typeof milestone.startDate === 'bigint' ? milestone.startDate.toString() : String(milestone.startDate),
              endDate: typeof milestone.endDate === 'bigint' ? milestone.endDate.toString() : String(milestone.endDate),
              duration: typeof milestone.duration === 'bigint' ? milestone.duration.toString() : String(milestone.duration),
              contractFile: (() => {
                if (Array.isArray(milestone.contractFile) && milestone.contractFile.length > 0) {
                  return String(milestone.contractFile[0]);
                }
                return milestone.contractFile ? String(milestone.contractFile) : undefined;
              })(),
              recipients: Array.isArray(milestone.recipients) ? milestone.recipients.map((recipient: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                ...recipient,
                principal: recipient.principal && typeof recipient.principal === "object" && typeof (recipient.principal as { toText: () => string }).toText === "function"
                  ? (recipient.principal as { toText: () => string }).toText()
                  : String(recipient.principal),
                share: typeof recipient.share === 'bigint' ? recipient.share.toString() : String(recipient.share),
                approvedAt: Array.isArray(recipient.approvedAt) && recipient.approvedAt.length > 0 ? recipient.approvedAt[0].toString() : undefined,
                declinedAt: Array.isArray(recipient.declinedAt) && recipient.declinedAt.length > 0 ? recipient.declinedAt[0].toString() : undefined,
                recipientSignedAt: Array.isArray(recipient.recipientSignedAt) && recipient.recipientSignedAt.length > 0 ? recipient.recipientSignedAt[0].toString() : undefined,
                signedContractFile: Array.isArray(recipient.signedContractFile) && recipient.signedContractFile.length > 0 ? String(recipient.signedContractFile[0]) : undefined,
                signedContractAt: (Array.isArray(recipient.signedContractAt) && recipient.signedContractAt.length > 0) ? recipient.signedContractAt[0].toString() : undefined,
                proofOfWorkScreenshotIds: Array.isArray((recipient as RecipientWithProofOfWork).proofOfWorkScreenshotIds) ? (recipient as RecipientWithProofOfWork).proofOfWorkScreenshotIds!.map((id) => String(id)) : [],
                proofOfWorkFileIds: Array.isArray((recipient as RecipientWithProofOfWork).proofOfWorkFileIds) ? (recipient as RecipientWithProofOfWork).proofOfWorkFileIds!.map((id) => String(id)) : [],
                proofOfWorkDescription: recipient.proofOfWorkDescription ? String(recipient.proofOfWorkDescription) : undefined,
                proofOfWorkSubmittedAt: recipient.proofOfWorkSubmittedAt ? String(recipient.proofOfWorkSubmittedAt) : undefined,
                monthlyProofOfWork: Array.isArray((recipient as RecipientWithProofOfWork).monthlyProofOfWork) ? (recipient as RecipientWithProofOfWork).monthlyProofOfWork!.map((proof) => ({
                  monthNumber: proof.monthNumber ? String(proof.monthNumber) : undefined,
                  description: proof.description ? String(proof.description) : undefined,
                  screenshotIds: Array.isArray(proof.screenshotIds) ? proof.screenshotIds.map((id) => String(id)) : [],
                  fileIds: Array.isArray(proof.fileIds) ? proof.fileIds.map((id) => String(id)) : [],
                  submittedAt: proof.submittedAt ? String(proof.submittedAt) : undefined,
                  approvedAt: proof.approvedAt ? String(proof.approvedAt) : undefined,
                })) : [],
              })) : [],
              releasePayments: Array.isArray(milestone.releasePayments) ? milestone.releasePayments.map((payment: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                id: Number(payment.id),
                monthNumber: Number(payment.monthNumber),
                total: typeof payment.total === 'bigint' ? payment.total.toString() : String(payment.total),
                releasedAt: payment.releasedAt ? String(payment.releasedAt) : undefined,
                recipientPayments: Array.isArray(payment.recipientPayments) ? payment.recipientPayments.map((rp: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                  recipientId: String(rp.recipientId),
                  recipientName: String(rp.recipientName),
                  amount: typeof rp.amount === 'bigint' ? rp.amount.toString() : String(rp.amount),
                })) : [],
              })) : [],
            })) : [],
            recipients: (() => {
              // Extract unique recipients from all milestones for contract signing
              if (milestoneDataObj.recipients && Array.isArray(milestoneDataObj.recipients)) {
                return milestoneDataObj.recipients.map((recipient: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                  id: String(recipient.id),
                  name: String(recipient.name),
                  principal: recipient.principal && typeof recipient.principal === "object" && typeof (recipient.principal as { toText: () => string }).toText === "function"
                    ? (recipient.principal as { toText: () => string }).toText()
                    : String(recipient.principal),
                  signedContractFileId: recipient.signedContractFileId ? String(recipient.signedContractFileId) : undefined,
                  signedContractAt: recipient.signedContractAt ? String(recipient.signedContractAt) : undefined,
                  clientApprovedSignedContractAt: recipient.clientApprovedSignedContractAt ? String(recipient.clientApprovedSignedContractAt) : undefined,
                }));
              }
              return [];
            })(),
            contractSigningDateBefore: milestoneDataObj.contractSigningDateBefore ? String(milestoneDataObj.contractSigningDateBefore) : undefined,
            contractFileId: (() => {
              if (Array.isArray(milestoneDataObj.contractFileId) && milestoneDataObj.contractFileId.length > 0) {
                return [String(milestoneDataObj.contractFileId[0])];
              }
              return milestoneDataObj.contractFileId ? [String(milestoneDataObj.contractFileId)] : undefined;
            })(),
            // contractFile removed - will be fetched on-demand
            clientApprovedSignedAt: (() => {
              if (Array.isArray(milestoneDataObj.clientApprovedSignedAt) && milestoneDataObj.clientApprovedSignedAt.length > 0) {
                return String(milestoneDataObj.clientApprovedSignedAt[0]);
              }
              return milestoneDataObj.clientApprovedSignedAt ? String(milestoneDataObj.clientApprovedSignedAt) : undefined;
            })(),
          };
        }
        // Fallback to direct milestones array (legacy support)
        else if (Array.isArray(txObj.milestones)) {
          return {
            milestones: txObj.milestones.map((milestone: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              ...milestone,
              createdAt: typeof milestone.createdAt === 'bigint' ? milestone.createdAt.toString() : String(milestone.createdAt),
              allocation: typeof milestone.allocation === 'bigint' ? milestone.allocation.toString() : String(milestone.allocation),
              startDate: typeof milestone.startDate === 'bigint' ? milestone.startDate.toString() : String(milestone.startDate),
              endDate: typeof milestone.endDate === 'bigint' ? milestone.endDate.toString() : String(milestone.endDate),
              duration: typeof milestone.duration === 'bigint' ? milestone.duration.toString() : String(milestone.duration),
              contractFile: (() => {
                if (Array.isArray(milestone.contractFile) && milestone.contractFile.length > 0) {
                  return String(milestone.contractFile[0]);
                }
                return milestone.contractFile ? String(milestone.contractFile) : undefined;
              })(),
              recipients: Array.isArray(milestone.recipients) ? milestone.recipients.map((recipient: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                ...recipient,
                principal: recipient.principal && typeof recipient.principal === "object" && typeof (recipient.principal as { toText: () => string }).toText === "function"
                  ? (recipient.principal as { toText: () => string }).toText()
                  : String(recipient.principal),
                share: typeof recipient.share === 'bigint' ? recipient.share.toString() : String(recipient.share),
                approvedAt: Array.isArray(recipient.approvedAt) && recipient.approvedAt.length > 0 ? recipient.approvedAt[0].toString() : undefined,
                declinedAt: Array.isArray(recipient.declinedAt) && recipient.declinedAt.length > 0 ? recipient.declinedAt[0].toString() : undefined,
                recipientSignedAt: Array.isArray(recipient.recipientSignedAt) && recipient.recipientSignedAt.length > 0 ? recipient.recipientSignedAt[0].toString() : undefined,
                signedContractFile: Array.isArray(recipient.signedContractFile) && recipient.signedContractFile.length > 0 ? String(recipient.signedContractFile[0]) : undefined,
                signedContractAt: (Array.isArray(recipient.signedContractAt) && recipient.signedContractAt.length > 0) ? recipient.signedContractAt[0].toString() : undefined,
              })) : [],
            })),
            contractSigningDateBefore: undefined,
            contractFile: undefined,
            clientApprovedSignedAt: undefined,
          };
        }
        return undefined;
      })(),
          basicData: txObj.basicData ? {
            ...(Array.isArray(txObj.basicData) && txObj.basicData.length > 0 ? txObj.basicData[0] : txObj.basicData as Record<string, unknown>),
            to: (() => {
              if (Array.isArray(txObj.basicData) && txObj.basicData.length > 0) {
                const firstBasicData = txObj.basicData[0] as Record<string, unknown>;
                return Array.isArray(firstBasicData.to) ? firstBasicData.to.map((toEntry: unknown) => {
                  const entry = toEntry as Record<string, unknown>;
                  return {
                    ...entry,
                    principal: entry.principal && typeof entry.principal === "object" && typeof (entry.principal as { toText?: () => string }).toText === "function"
                      ? (entry.principal as { toText: () => string }).toText()
                      : String(entry.principal),
                    amount: typeof entry.amount === "bigint" ? entry.amount.toString() :
                           typeof entry.funds_allocated === "bigint" ? entry.funds_allocated.toString() :
                           String(entry.amount || entry.funds_allocated || "0"),
                    percentage: typeof entry.percentage === "bigint" ? entry.percentage.toString() : String(entry.percentage),
                  };
                }) : [];
              }
              return [];
            })()
          } : undefined,
      to: (() => {
        // For basic escrows, use basicData[0].to if available
        let toArray: unknown[] = [];
        
        // Check if this is a basic escrow with basicData
        if (txObj.basicData && Array.isArray(txObj.basicData) && txObj.basicData.length > 0) {
          const basicDataArray = txObj.basicData as unknown[];
          const firstBasicData = basicDataArray[0] as Record<string, unknown>;
          if (firstBasicData.to && Array.isArray(firstBasicData.to)) {
            toArray = firstBasicData.to;
          }
        }
        // Check if this is a milestone escrow with milestoneData
        else if (txObj.milestoneData && typeof txObj.milestoneData === 'object' && !Array.isArray(txObj.milestoneData)) {
          const milestoneDataObj = txObj.milestoneData as Record<string, unknown>;
          if (milestoneDataObj.milestones && Array.isArray(milestoneDataObj.milestones)) {
            // Extract all recipients from all milestones
            toArray = [];
            (milestoneDataObj.milestones as unknown[]).forEach((milestone: unknown) => {
              const milestoneObj = milestone as Record<string, unknown>;
              if (milestoneObj.recipients && Array.isArray(milestoneObj.recipients)) {
                toArray = toArray.concat(milestoneObj.recipients);
              }
            });
          }
        }
        
        
        return (toArray as unknown[]).map((toEntry: unknown) => {
          const entry = toEntry as Record<string, unknown>;
          return {
            principal: entry.principal && typeof entry.principal === "object" && typeof (entry.principal as { toText: () => string }).toText === "function"
              ? (entry.principal as { toText: () => string }).toText()
              : String(entry.principal),
            amount: typeof entry.amount === "bigint" ? entry.amount.toString() : 
                   typeof entry.funds_allocated === "bigint" ? entry.funds_allocated.toString() : 
                   typeof entry.share === "bigint" ? entry.share.toString() : // For milestone recipients
                   String(entry.amount || entry.funds_allocated || entry.share || "0"),
            percentage: typeof entry.percentage === "bigint" ? entry.percentage.toString() : String(entry.percentage || "0"),
            status: entry.status as { pending?: null } | { approved?: null } | { declined?: null } | { noaction?: null },
            name: (entry.name || entry.nickname) as string, // milestone recipients use 'nickname'
            approvedAt: Array.isArray(entry.approvedAt) && entry.approvedAt.length > 0 ? entry.approvedAt[0].toString() : undefined,
            declinedAt: Array.isArray(entry.declinedAt) && entry.declinedAt.length > 0 ? entry.declinedAt[0].toString() : undefined,
            readAt: Array.isArray(entry.readAt) && entry.readAt.length > 0 ? entry.readAt[0].toString() : undefined,
          };
        });
      })(),
    };
  });

  // Deduplicate transactions by ID, keeping the latest one
  const uniqueTxs = new Map<string, NormalizedTransaction>();
  normalizedTxs.forEach(tx => {
    const existing = uniqueTxs.get(tx.id);
    if (!existing || Number(tx.createdAt) > Number(existing.createdAt)) {
      uniqueTxs.set(tx.id, tx);
    }
  });

  const finalTxs = Array.from(uniqueTxs.values());
  

  return finalTxs;
};
