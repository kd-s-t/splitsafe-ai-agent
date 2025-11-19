
import { ConstellationApiClient } from './api';
import { EscrowValidationData, ValidationResult } from './types';

/**
 * Validate tamper-proof integrity of a transaction
 */
export async function validateTamperProof(
  transaction: EscrowValidationData,
  apiClient: ConstellationApiClient
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isValid = true;
  let level: 'basic' | 'constellation' | 'full' = 'basic';
  let constellationStatus: 'verified' | 'pending' | 'failed' | 'unknown' = 'unknown';

  if (!transaction.constellationHash) {
    errors.push('No Constellation hash found in transaction');
    isValid = false;
    return { isValid, level, errors, warnings, constellationStatus };
  }

  try {
    const constellationValid = await apiClient.validateConstellationHash(transaction.constellationHash);
    if (constellationValid) {
      level = 'constellation';
      constellationStatus = 'verified';
    } else {
      errors.push('Constellation hash not found or invalid');
      isValid = false;
      constellationStatus = 'failed';
    }
  } catch (error) {
    warnings.push('Could not verify with Constellation Network: ' + error);
    constellationStatus = 'unknown';
  }

  if (isValid && constellationStatus === 'verified') {
    try {
      const dataValid = await validateTransactionDataIntegrity(transaction, apiClient);
      if (dataValid) {
        level = 'full';
      } else {
        errors.push('Transaction data integrity validation failed');
        isValid = false;
      }
    } catch (error) {
      warnings.push('Data integrity validation failed: ' + error);
    }
  }

  return {
    isValid,
    level,
    errors,
    warnings,
    constellationStatus,
    lastVerified: Date.now()
  };
}

/**
 * Validate transaction data integrity by comparing with logged data
 */
async function validateTransactionDataIntegrity(
  transaction: EscrowValidationData,
  apiClient: ConstellationApiClient
): Promise<boolean> {
  try {
    const loggedData = await apiClient.getLoggedDataFromConstellation(transaction.constellationHash!);
    
    if (!loggedData) {
      return false;
    }

    const loggedParticipants = loggedData.participants as Array<{
      principal: string;
      amount: string;
      percentage: number;
      nickname?: string;
    }>;

    const dataMatches = (
      loggedData.escrowId === transaction.escrowId &&
      loggedData.title === transaction.title &&
      loggedData.creator === transaction.creator &&
      loggedParticipants.length === transaction.participants.length
    );

    if (!dataMatches) {
      return false;
    }

    for (let i = 0; i < transaction.participants.length; i++) {
      const logged = loggedParticipants[i];
      const current = transaction.participants[i];
      
      if (
        logged.principal !== current.principal ||
        logged.amount !== current.amount ||
        logged.percentage !== current.percentage
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

