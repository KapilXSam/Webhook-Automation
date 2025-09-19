// FIX: Declare chrome globally to avoid type errors when @types/chrome is not available.
declare const chrome: any;

export interface WebhookConfig {
  id: string;
  name: string;
  aiModel?: string;
}

export interface ExtensionStorage {
  webhookConfigs: WebhookConfig[];
  apiBaseUrl: string;
}

export const defaultStorage: ExtensionStorage = {
  webhookConfigs: [],
  apiBaseUrl: 'http://localhost:3000', // Default for development
};

export const storage = {
  get: (): Promise<ExtensionStorage> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(defaultStorage, (result) => {
        resolve(result as ExtensionStorage);
      });
    });
  },
  set: (data: Partial<ExtensionStorage>): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, () => {
        resolve();
      });
    });
  },
};