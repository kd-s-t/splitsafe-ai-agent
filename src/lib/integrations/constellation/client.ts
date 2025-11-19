
import { ConstellationApiClient } from './api';
import { constellationConfig, validateEnvironmentVariables } from './config';
import {
  AuditRecord,
  ComplianceRecord,
  ConstellationClient,
  ConstellationConfig,
  ConstellationResponse,
  DocumentMetadata,
  DocumentQuery,
  LegalDocument
} from './types';

export class ConstellationNetworkClient implements ConstellationClient {
  private config: ConstellationConfig;
  private isInitialized: boolean = false;
  private apiClient: ConstellationApiClient;

  constructor(config?: Partial<ConstellationConfig>) {
    this.config = {
      ...constellationConfig,
      ...config
    };
    this.apiClient = new ConstellationApiClient(this.config);
  }

  /**
   * Initialize the Constellation Network client
   */
  async initialize(): Promise<void> {
    const validation = validateEnvironmentVariables();
    if (!validation.valid) {
      const errorMessage = [
        'Constellation Network environment validation failed:',
        ...validation.missing.map(missing => `  - Missing required variable: ${missing}`),
        ...validation.errors.map(error => `  - ${error}`)
      ].join('\n');
      throw new Error(errorMessage);
    }

    if (!this.config.apiKey) {
      throw new Error('Constellation Network API key is required');
    }
    
    this.isInitialized = true;
  }


  async storeDocument(params: {
    escrowId: string;
    document: LegalDocument;
    metadata: DocumentMetadata;
  }): Promise<ConstellationResponse<string>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const constellationPayload = {
        type: 'Document',
        escrowId: params.escrowId,
        documentType: params.document.type,
        content: params.document.data,
        metadata: params.metadata,
        timestamp: Date.now(),
        source: 'splitsafe-escrow'
      };

      const response = await this.apiClient.publishToConstellation(constellationPayload);
      
      if (response.success) {
        return {
          success: true,
          documentHash: response.data,
          data: response.data
        };
      } else {
        throw new Error(response.error || 'Failed to store document');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateComplianceRecord(params: ComplianceRecord): Promise<ConstellationResponse> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Publish compliance record to Constellation Network
      const constellationPayload = {
        type: 'ComplianceRecord',
        escrowId: params.escrowId,
        transactionData: params.transactionData,
        complianceLevel: params.complianceLevel,
        legalRequirement: params.legalRequirement,
        timestamp: params.timestamp,
        complianceChecks: params.complianceChecks,
        source: 'splitsafe-escrow'
      };

      const response = await this.apiClient.publishToConstellation(constellationPayload);
      
      if (response.success) {
        return {
          success: true,
          data: { 
            escrowId: params.escrowId, 
            timestamp: params.timestamp,
            documentHash: response.data
          }
        };
      } else {
        throw new Error(response.error || 'Failed to update compliance record');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createAuditRecord(params: AuditRecord): Promise<ConstellationResponse> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Publish audit record to Constellation Network
      const constellationPayload = {
        type: 'AuditRecord',
        escrowId: params.escrowId,
        action: params.action,
        actor: params.actor,
        details: params.details,
        timestamp: params.timestamp,
        blockchain: params.blockchain,
        complianceLevel: params.complianceLevel,
        legalRequirement: params.legalRequirement,
        source: 'splitsafe-escrow'
      };

      const response = await this.apiClient.publishToConstellation(constellationPayload);
      
      if (response.success) {
        return {
          success: true,
          data: { 
            escrowId: params.escrowId, 
            action: params.action, 
            timestamp: params.timestamp,
            documentHash: response.data
          }
        };
      } else {
        throw new Error(response.error || 'Failed to create audit record');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getDocuments(params?: DocumentQuery): Promise<ConstellationResponse<LegalDocument[]>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Note: Document retrieval from Constellation Network requires additional API endpoints
      // This is a placeholder implementation. Full implementation would query Constellation
      // Network for stored documents matching the query parameters.
      // 
      // For now, this returns an empty array as Constellation's transaction-based API
      // doesn't provide document querying. Consider using the Digital Evidence API
      // (digital-evidence module) for document retrieval with fingerprint hashes.
      
      return {
        success: true,
        data: [],
        message: params 
          ? 'Document querying not yet implemented for transaction-based API. Use Digital Evidence API for document retrieval.'
          : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }


  async createLegalAuditTrail(escrowId: string, action: string, details: Record<string, unknown>): Promise<ConstellationResponse> {
    const auditResult = await this.createAuditRecord({
      escrowId,
      action,
      actor: (details.actor as string) || 'system',
      details,
      timestamp: Date.now(),
      blockchain: 'ICP',
      complianceLevel: 'enterprise',
      legalRequirement: true
    });

    try {
      const eventData = {
        type: 'EscrowEvent',
        eventType: this.mapActionToEventType(action),
        escrowId,
        actor: details.actor || 'system',
        action,
        details: JSON.stringify(details),
        timestamp: Date.now(),
        blockchain: 'ICP',
        source: 'splitsafe-escrow'
      };

      const constellationResult = await this.apiClient.publishToConstellation(eventData);
      
      if (constellationResult.success) {
        // Audit trail successfully published to Constellation Network
        console.log('[ConstellationClient] Audit trail published:', constellationResult.data);
      } else {
        // Log error but don't fail the operation
        console.warn('[ConstellationClient] Failed to publish audit trail to Constellation:', constellationResult.error);
      }
    } catch (error) {
      // Log error but don't fail the operation
      console.warn('[ConstellationClient] Error publishing audit trail to Constellation:', error);
    }

    return auditResult;
  }

  private mapActionToEventType(action: string): 'CREATE' | 'APPROVE' | 'RELEASE' | 'DISPUTE' | 'RESOLVE' | 'CANCEL' {
    const actionMap: Record<string, 'CREATE' | 'APPROVE' | 'RELEASE' | 'DISPUTE' | 'RESOLVE' | 'CANCEL'> = {
      'escrow_created': 'CREATE',
      'milestone_approved': 'APPROVE',
      'funds_released': 'RELEASE',
      'dispute_created': 'DISPUTE',
      'dispute_resolved': 'RESOLVE',
      'escrow_cancelled': 'CANCEL'
    };

    return actionMap[action] || 'CREATE';
  }


  getConfig(): ConstellationConfig {
    return { ...this.config };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getApiClient(): ConstellationApiClient {
    return this.apiClient;
  }
}

export const constellationClient = new ConstellationNetworkClient();

