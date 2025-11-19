
export interface ConstellationResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  documentHash?: string;
}

export interface ConstellationClient {
  initialize(): Promise<void>;
  storeDocument(params: {
    escrowId: string;
    document: LegalDocument;
    metadata: DocumentMetadata;
  }): Promise<ConstellationResponse<string>>;
  updateComplianceRecord(params: ComplianceRecord): Promise<ConstellationResponse>;
  createAuditRecord(params: AuditRecord): Promise<ConstellationResponse>;
  getDocuments(params: DocumentQuery): Promise<ConstellationResponse<LegalDocument[]>>;
  createLegalAuditTrail(escrowId: string, action: string, details: Record<string, unknown>): Promise<ConstellationResponse>;
}

export interface LegalDocument {
  id?: string;
  type: string;
  content?: string | Record<string, unknown>;
  data?: string | Record<string, unknown>;
  filename?: string;
  fileType?: string;
  uploadedBy?: string;
  timestamp?: number;
  metadata?: DocumentMetadata;
  createdAt?: number;
  updatedAt?: number;
}

export interface DocumentMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  version?: string;
  author?: string;
  type?: string;
  complianceLevel?: string;
  legalRequirement?: boolean;
  recipientId?: string;
  source?: string;
  monthNumber?: number;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface AuditRecord {
  escrowId: string;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  timestamp: number;
  blockchain: string;
  complianceLevel: 'basic' | 'enterprise' | 'legal';
  legalRequirement: boolean;
}

export interface ComplianceRecord {
  escrowId: string;
  transactionData: Record<string, unknown>;
  complianceLevel: 'basic' | 'enterprise' | 'legal';
  legalRequirement: boolean;
  timestamp: number;
  complianceChecks?: Record<string, unknown>;
}

export interface DocumentQuery {
  escrowId?: string;
  type?: string;
  types?: string[];
  limit?: number;
  offset?: number;
}

export interface ContractFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  filename?: string;
  base64Data?: string;
  fileType?: string;
  uploadedBy?: string;
}

export interface SignedContract {
  contractId: string;
  signature: string;
  signer: string;
  timestamp: number;
  filename?: string;
  base64Data?: string;
  signedBy?: string;
}

export interface EscrowCreationResult {
  escrowId?: string;
  documentHash?: string;
  transactionHash?: string;
  status?: 'pending' | 'confirmed' | 'failed';
  success?: boolean;
  error?: string;
}

export interface IntegrationResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  constellationResult?: Record<string, unknown>;
}

export interface MilestoneFileResult {
  milestoneId?: string;
  fileId?: string;
  documentHash?: string;
  status?: 'pending' | 'confirmed' | 'failed';
  success?: boolean;
  filename?: string;
  error?: string;
}

export interface ProofOfWork {
  algorithm: string;
  difficulty: number;
  nonce: string;
  hash: string;
  timestamp: number;
  screenshots?: Record<string, unknown>[];
  files?: Record<string, unknown>[];
  uploadedBy?: string;
}


export interface ValidationResult {
  isValid: boolean;
  level: 'basic' | 'constellation' | 'full';
  errors: string[];
  warnings: string[];
  constellationStatus?: 'verified' | 'pending' | 'failed' | 'unknown';
  lastVerified?: number;
}

export interface EscrowValidationData {
  escrowId: string;
  title: string;
  creator: string;
  participants: Array<{
    principal: string;
    amount: string;
    percentage: number;
    nickname?: string;
  }>;
  createdAt: number;
  constellationHash?: string;
}


export interface ConstellationConfig {
  network: string;
  apiKey: string;
  environment: string;
  l0Url?: string;
  l0GlobalUrl?: string;
  l0CurrencyUrl?: string;
  dashboardUrl?: string;
}

export interface EnvironmentValidation {
  valid: boolean;
  missing: string[];
  errors: string[];
}


export interface ConstellationLogResult {
  success: boolean;
  constellationHash?: string;
  eventId?: string;
  error?: string;
}

export interface TamperProofEvent {
  type: 'CREATE' | 'APPROVE' | 'RELEASE' | 'DISPUTE' | 'RESOLVE' | 'CANCEL' | 'REFUND';
  escrowId: string;
  actor: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: number;
  blockchain: string;
  complianceLevel: 'basic' | 'enterprise' | 'legal';
  legalRequirement?: boolean;
}