import { getInfo, getTransaction } from '@/lib/internal/icp';
import { getFileBase64 } from '@/lib/internal/icp/fileStorage';
import { serializeBigInts } from '@/lib/internal/icp/transactions';
import { TRANSACTION_STATUS } from '@/lib/utils';
import { markTransactionAsRead, setSubtitle, setTitle, setTransactionStatus } from '@/lib/redux';
import { Principal } from '@dfinity/principal';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { EscrowTransaction, NormalizedTransaction } from '../../shared.types';
import { convertToNormalizedTransactions } from '../../transactions/utils';
import { getEscrowSubtitle, getInitiatorPrincipal, serializeEscrowForRedux } from '../utils/transactionDetailsHelpers';

export interface UseEscrowDetailsReturn {
  escrow: NormalizedTransaction | null;
  isLoading: boolean;
  isFileLoading: boolean;
  error: string | null;
  isAuthorized: boolean;
  initiatorNickname: string;
  fetchEscrow: () => Promise<void>;
}

export function useEscrowDetails(principal: Principal | null): UseEscrowDetailsReturn {
  const [escrow, setEscrow] = useState<NormalizedTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileLoadingTimeout, setFileLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initiatorNickname, setInitiatorNickname] = useState<string>('Sender');
  const fetchingRef = useRef(false);
  // removed unused wroteHashRef
  
  const params = useParams();
  const dispatch = useDispatch();
  
  const escrowId = Array.isArray(params.id) ? params.id[0] : params.id;

  const fetchInitiatorNickname = useCallback(async (initiatorPrincipal: string) => {
    try {
      // Validate that the principal string is valid (no invalid characters)
      if (!initiatorPrincipal || typeof initiatorPrincipal !== 'string' || 
          initiatorPrincipal.includes('[') || initiatorPrincipal.includes(']') ||
          initiatorPrincipal.includes('{') || initiatorPrincipal.includes('}')) {
        return;
      }
      
      const userInfo = await getInfo(Principal.fromText(initiatorPrincipal), Principal.fromText(initiatorPrincipal));
      const nicknameValue = userInfo?.nickname?.[0] || null;
      if (nicknameValue && nicknameValue.length > 0) {
        setInitiatorNickname(nicknameValue);
      } else {
      }
    } catch {
      // Silently handle error - nickname is optional
    }
  }, []);

  const fetchFileData = useCallback(async (transaction: EscrowTransaction | NormalizedTransaction) => {
    try {
      // For basic escrows, just return the transaction data without fetching files
      if (!transaction.milestoneData || !transaction.milestoneData.milestones || transaction.milestoneData.milestones.length === 0) {
        setIsFileLoading(false);
        return transaction;
      }

      // Check if this is a milestone transaction with no contract files to fetch
      const hasContractFiles = transaction.milestoneData?.contractFileId && transaction.milestoneData.contractFileId.length > 0;
      const hasSignedContracts = transaction.milestoneData?.recipients?.some((r: unknown) => {
        const recipient = r as Record<string, unknown>;
        return recipient.signedContractFile && Array.isArray(recipient.signedContractFile) && recipient.signedContractFile.length > 0;
      });
      const hasProofOfWorkFiles = transaction.milestoneData?.recipients?.some((r: unknown) => {
        const recipient = r as Record<string, unknown>;
        return (recipient.proofOfWorkScreenshots && Array.isArray(recipient.proofOfWorkScreenshots) && recipient.proofOfWorkScreenshots.length > 0) ||
               (recipient.proofOfWorkFiles && Array.isArray(recipient.proofOfWorkFiles) && recipient.proofOfWorkFiles.length > 0);
      });

      if (!hasContractFiles && !hasSignedContracts && !hasProofOfWorkFiles) {
        setIsFileLoading(false);
        return transaction;
      }
      
      setIsFileLoading(true);

      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setIsFileLoading(false);
        setFileLoadingTimeout(null);
      }, 5000); // 5 second timeout - reduced for better UX
      setFileLoadingTimeout(timeout);
      
      // Create a deep copy to avoid mutating the original
      // Use serializeBigInts to handle BigInt values before JSON operations
      const serializedTransaction = serializeBigInts(transaction);
      const transactionWithFiles = JSON.parse(JSON.stringify(serializedTransaction));
      
            // Contract file will be fetched on-demand when user clicks View/Download

      // Fetch signed contract files for recipients
      if (transactionWithFiles.milestoneData?.recipients) {
        for (let i = 0; i < transactionWithFiles.milestoneData.recipients.length; i++) {
          const recipient = transactionWithFiles.milestoneData.recipients[i];
          if (recipient.signedContractFile && recipient.signedContractFile.length > 0) {
            const signedContractFileId = recipient.signedContractFile[0];
            const signedContractFileData = await getFileBase64(signedContractFileId);
            if (signedContractFileData) {
              transactionWithFiles.milestoneData.recipients[i].signedContractFile = [signedContractFileData];
            }
          }
        }
      }

      // Fetch proof of work files for recipients
      if (transactionWithFiles.milestoneData?.recipients) {
        for (let i = 0; i < transactionWithFiles.milestoneData.recipients.length; i++) {
          const recipient = transactionWithFiles.milestoneData.recipients[i];
          
          // Fetch proof of work screenshots
          if (recipient.proofOfWorkScreenshots && recipient.proofOfWorkScreenshots.length > 0) {
            const screenshotData = [];
            for (const screenshotId of recipient.proofOfWorkScreenshots) {
              const screenshotDataItem = await getFileBase64(screenshotId);
              if (screenshotDataItem) {
                screenshotData.push(screenshotDataItem);
              }
            }
            transactionWithFiles.milestoneData.recipients[i].proofOfWorkScreenshots = screenshotData;
          }

          // Fetch proof of work files
          if (recipient.proofOfWorkFiles && recipient.proofOfWorkFiles.length > 0) {
            const fileData = [];
            for (const fileId of recipient.proofOfWorkFiles) {
              const fileDataItem = await getFileBase64(fileId);
              if (fileDataItem) {
                fileData.push(fileDataItem);
              }
            }
            transactionWithFiles.milestoneData.recipients[i].proofOfWorkFiles = fileData;
          }
        }
      }

      setIsFileLoading(false);
      // Clear the timeout
      if (fileLoadingTimeout) {
        clearTimeout(fileLoadingTimeout);
        setFileLoadingTimeout(null);
      }
      return transactionWithFiles;
    } catch (error) {
      setIsFileLoading(false);
      // Clear the timeout
      if (fileLoadingTimeout) {
        clearTimeout(fileLoadingTimeout);
        setFileLoadingTimeout(null);
      }
      return transaction; // Return original transaction if file fetching fails
    }
  }, [fileLoadingTimeout]);

  const fetchEscrow = useCallback(async () => {
    if (!escrowId || !principal) return;
    
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      return;
    }
    
    fetchingRef.current = true;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { AuthClient } = await import('@dfinity/auth-client');
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();

      if (!isAuthenticated) {
        setError("Please log in to view escrow details");
        setIsLoading(false);
        return;
      }

      const result = await getTransaction(principal, escrowId as string);
      
      if (!result) {
        setError("Escrow not found");
        setIsLoading(false);
        return;
      }

      // Convert ICPTransaction to EscrowTransaction format first
      // Handle the case where to might be in basicData
      let recipients = result.to || [];
      let fundsAllocated = result.funds_allocated;
      
      if (result.basicData && Array.isArray(result.basicData) && result.basicData.length > 0) {
        const basicData = result.basicData[0] as Record<string, unknown>;
        
        if (basicData.to && Array.isArray(basicData.to)) {
          recipients = basicData.to;
        }
        // Extract funds_allocated from basicData if available
        if (basicData.funds_allocated !== undefined) {
          fundsAllocated = typeof basicData.funds_allocated === 'number' ? BigInt(basicData.funds_allocated) : basicData.funds_allocated as bigint | undefined;
        }
      }
      
      // DEBUG: Log the raw result.from to see what we're working with
      console.log('🔍 [useTransactionDetails] Raw result.from:', {
        type: typeof result.from,
        value: result.from,
        isPrincipal: result.from && typeof result.from === 'object' && '_isPrincipal' in result.from,
        hasToText: result.from && typeof result.from === 'object' && typeof (result.from as any).toText === 'function',
        principalText: result.from && typeof result.from === 'object' && typeof (result.from as any).toText === 'function' 
          ? (result.from as any).toText() 
          : 'N/A'
      });
      
      const escrowTransaction: EscrowTransaction = {
        id: result.id,
        from: (() => {
          if (typeof result.from === 'string') {
            console.log('🔍 [useTransactionDetails] from is string:', result.from);
            return result.from.trim();
          }
          if (result.from && typeof result.from === 'object' && typeof (result.from as { toText?: () => string }).toText === 'function') {
            const text = (result.from as { toText: () => string }).toText().trim();
            console.log('🔍 [useTransactionDetails] from is Principal with toText():', text);
            return text;
          }
          // Try to reconstruct Principal from object properties
          if (result.from && typeof result.from === 'object') {
            const obj = result.from as Record<string, unknown>;
            if (obj._arr && obj._isPrincipal) {
              try {
                const reconstructedPrincipal = Principal.fromUint8Array(new Uint8Array(obj._arr as number[]));
                const text = reconstructedPrincipal.toText().trim();
                console.log('🔍 [useTransactionDetails] Reconstructed Principal (fromUint8Array):', text);
                return text;
              } catch {
                try {
                  const hexString = Array.from(obj._arr as number[]).map((b: number) => b.toString(16).padStart(2, '0')).join('');
                  const reconstructedPrincipal = Principal.fromHex(hexString);
                  const text = reconstructedPrincipal.toText().trim();
                  console.log('🔍 [useTransactionDetails] Reconstructed Principal (fromHex):', text);
                  return text;
                } catch {
                  const fallback = String(result.from).trim();
                  console.log('🔍 [useTransactionDetails] Failed to reconstruct, using fallback:', fallback);
                  return fallback;
                }
              }
            }
          }
          const fallback = String(result.from).trim();
          console.log('🔍 [useTransactionDetails] Using final fallback:', fallback);
          return fallback;
        })(),
        to: recipients.map((entry: unknown) => {
          const typedEntry = entry as { principal: unknown; amount: unknown; percentage: unknown; name: string; status: unknown; [key: string]: unknown };
          return {
            ...typedEntry,
            principal: typeof typedEntry.principal === 'string' ? typedEntry.principal : String(typedEntry.principal),
            amount: typeof typedEntry.amount === 'bigint' ? typedEntry.amount : BigInt(String(typedEntry.amount || 0)),
            percentage: typeof typedEntry.percentage === 'number' ? typedEntry.percentage : Number(typedEntry.percentage || 0),
            name: typedEntry.name,
            status: typedEntry.status as { pending?: null } | { approved?: null } | { declined?: null } | { noaction?: null }
          };
        }),
        amount: typeof fundsAllocated === 'bigint' ? fundsAllocated : BigInt(fundsAllocated || 0),
        funds_allocated: typeof fundsAllocated === 'bigint' ? fundsAllocated : BigInt(fundsAllocated || 0),
        basicData: [{
          to: recipients.map((entry: unknown) => {
            const typedEntry = entry as { principal: unknown; amount: unknown; percentage: unknown; name: string; status: unknown; [key: string]: unknown };
            return {
              ...typedEntry,
              principal: typeof typedEntry.principal === 'string' ? typedEntry.principal : String(typedEntry.principal),
              amount: typeof typedEntry.amount === 'bigint' ? typedEntry.amount : BigInt(String(typedEntry.amount || 0)),
              percentage: typeof typedEntry.percentage === 'number' ? typedEntry.percentage : Number(typedEntry.percentage || 0),
              name: typedEntry.name,
              status: typedEntry.status as { pending?: null } | { approved?: null } | { declined?: null } | { noaction?: null }
            };
          }),
          useSeiAcceleration: true
        }],
        readAt: result.readAt ? String(result.readAt) : undefined,
        status: result.status as 'pending' | 'confirmed' | 'released' | 'cancelled' | 'refund' | 'declined',
        title: result.title,
        kind: result.kind,
        createdAt: String(result.createdAt),
        confirmedAt: result.confirmedAt ? String(result.confirmedAt) : undefined,
        cancelledAt: result.cancelledAt ? String(result.cancelledAt) : undefined,
        refundedAt: result.refundedAt ? String(result.refundedAt) : undefined,
        releasedAt: result.releasedAt ? String(result.releasedAt) : undefined,
        chatId: result.chatId ? String(result.chatId) : undefined,
        constellationHashes: Array.isArray(result.constellationHashes)
          ? result.constellationHashes.map((h: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              action: String(h.action),
              hash: String(h.hash),
              timestamp: String(h.timestamp),
            }))
          : undefined,
        // Include Story Protocol fields so UI can render links immediately
        storyIpAssetId: Array.isArray((result as any).storyIpAssetId) && (result as any).storyIpAssetId.length > 0 // eslint-disable-line @typescript-eslint/no-explicit-any
          ? [String((result as any).storyIpAssetId[0])] // eslint-disable-line @typescript-eslint/no-explicit-any
          : undefined,
        storyTxs: Array.isArray((result as any).storyTxs) // eslint-disable-line @typescript-eslint/no-explicit-any
          ? (result as any).storyTxs.map((t: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              action: String(t.action),
              txHash: String(t.txHash),
              timestamp: String(t.timestamp),
            }))
          : undefined,
        milestoneData: result.milestoneData as any // eslint-disable-line @typescript-eslint/no-explicit-any
      };
      
      // Fetch file data inline to avoid dependency issues
      const resultWithFiles = await fetchFileData(escrowTransaction);
      const normalizedTxs = convertToNormalizedTransactions([resultWithFiles]);
      const serializedEscrow = normalizedTxs[0];
      
      // DEBUG: Log the normalized escrow to see what from field looks like
      console.log('🔍 [useTransactionDetails] Normalized escrow:', {
        id: serializedEscrow.id,
        from: serializedEscrow.from,
        fromType: typeof serializedEscrow.from,
        currentPrincipal: principal?.toText(),
        isSender: serializedEscrow.from === principal?.toText(),
      });
      
      // Ensure file loading is reset after successful fetch
      setIsFileLoading(false);
      
      setEscrow(serializedEscrow);
      setIsAuthorized(true);
      setIsLoading(false);
      fetchingRef.current = false;

      // Update Redux store to reflect the escrow is now read
      if (serializedEscrow) {
        const updatedEscrow = serializeEscrowForRedux(serializedEscrow);
        // Mark current user as read
        const updatedWithReadStatus = {
          ...updatedEscrow,
          to: updatedEscrow.to.map((recipient) =>
            String(recipient.principal) === String(principal)
              ? { ...recipient, readAt: new Date().toISOString() }
              : recipient
          )
        };
        dispatch(markTransactionAsRead(updatedWithReadStatus));
      }
    } catch {
      setError("Failed to load escrow. Please try again.");
      setIsLoading(false);
      setIsFileLoading(false); // Ensure file loading is reset on error
      fetchingRef.current = false;
    }
  }, [escrowId, principal, dispatch, fetchFileData]);

  // Removed: on-load Constellation hash creation; handled during escrow initiation

  // Fetch escrow on mount
  useEffect(() => {
    fetchEscrow();
  }, [fetchEscrow]);

  // Cleanup file loading timeout on unmount
  useEffect(() => {
    return () => {
      if (fileLoadingTimeout) {
        clearTimeout(fileLoadingTimeout);
        setFileLoadingTimeout(null);
      }
    };
  }, [fileLoadingTimeout]);

  // Fetch initiator nickname when escrow loads
  useEffect(() => {
    if (escrow && escrow.from) {
      const initiatorPrincipal = getInitiatorPrincipal(escrow);
      fetchInitiatorNickname(initiatorPrincipal);
    }
  }, [escrow, fetchInitiatorNickname]);

  // Set title and subtitle when escrow loads
  useEffect(() => {
    if (escrow) {
      dispatch(setTitle(escrow.title || 'Escrow Details'));
      
      const statusKey = escrow.status || "unknown";
      const subtitle = getEscrowSubtitle(statusKey);
      
      // Set transaction status in Redux
      if (statusKey === TRANSACTION_STATUS.PENDING) {
        dispatch(setTransactionStatus(TRANSACTION_STATUS.PENDING));
      } else if (statusKey === TRANSACTION_STATUS.CONFIRMED) {
        dispatch(setTransactionStatus(TRANSACTION_STATUS.CONFIRMED));
      } else if (statusKey === TRANSACTION_STATUS.RELEASED) {
        dispatch(setTransactionStatus(TRANSACTION_STATUS.RELEASED));
      } else if (statusKey === TRANSACTION_STATUS.REFUND) {
        dispatch(setTransactionStatus(TRANSACTION_STATUS.REFUND));
      } else if (statusKey === TRANSACTION_STATUS.CANCELLED || statusKey === TRANSACTION_STATUS.DECLINED) {
        dispatch(setTransactionStatus(TRANSACTION_STATUS.CANCELLED));
      }

      dispatch(setSubtitle(subtitle));
    }
  }, [escrow, dispatch]);

  return {
    escrow,
    isLoading,
    isFileLoading,
    error,
    isAuthorized,
    initiatorNickname,
    fetchEscrow,
  };
}
