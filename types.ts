export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  aiModel: string;
}

export interface WebhookSource {
  uri: string;
  title: string;
}

export type WebhookResultStatus = 'loading' | 'success' | 'error';

export interface WebhookResult {
  id: string;
  url?: string; // URL is optional now
  fileName?: string; // New field for file uploads
  inputType: 'url' | 'file'; // New field to distinguish source
  summary: string;
  sources: WebhookSource[];
  timestamp: number;
  status: WebhookResultStatus;
  webhookName: string;
}
