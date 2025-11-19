export interface QAgentResponse {
  output: string;
  sessionId: string;
  conversationId?: string;
  citations?: QCitation[];
  metadata?: QResponseMetadata;
}

export interface QCitation {
  text: string;
  source: string;
  url?: string;
}

export interface QResponseMetadata {
  tokensUsed?: number;
  modelId?: string;
  finishReason?: 'stop' | 'length' | 'content_filter';
  latency?: number;
}

export interface QErrorResponse {
  error: string;
  code: string;
  message: string;
  statusCode?: number;
}

export interface QStreamChunk {
  type: 'start' | 'content' | 'end' | 'error';
  content?: string;
  sessionId?: string;
  error?: string;
}

export type QEventType = 
  | 'message_sent'
  | 'message_received'
  | 'session_created'
  | 'session_expired'
  | 'error_occurred'
  | 'retry_attempted';

export interface QEvent {
  type: QEventType;
  timestamp: number;
  data?: any;
}

export interface QMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
}
