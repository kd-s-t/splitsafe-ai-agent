export interface CodeExample {
  language: string;
  label: string;
  code: string;
  logo?: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: ApiParameter[];
  response?: ApiResponse;
}

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiResponse {
  status: number;
  description: string;
  example: unknown;
}

export interface DocsSection {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

export interface LiveExampleProps {
  title: string;
  description: string;
}

export interface SaasIntegrationFlow {
  title: string;
  description: string;
  steps: SaasIntegrationStep[];
}

export interface SaasIntegrationStep {
  step: number;
  title: string;
  description: string;
  endpoint?: string;
  endpoints?: string[];
  example?: Record<string, unknown>;
}
