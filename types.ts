export type WebhookResultStatus = 'loading' | 'success' | 'error';

export interface WebhookConfig {
  id: string;
  name: string;
  aiModel?: string;
}

// FIX: Add GroundingSource type to strongly type the search grounding results.
export interface GroundingSource {
  web?: {
    uri: string;
    // FIX: Made title optional to align with the Gemini API response.
    title?: string;
  };
}

export interface WebhookResult {
  id: string;
  webhookId: string;
  webhookName: string;
  url: string;
  summary: string;
  // FIX: Add sources to store grounding chunks from Google Search.
  sources?: GroundingSource[];
  status: WebhookResultStatus;
  timestamp: string;
}