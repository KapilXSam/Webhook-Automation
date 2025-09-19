// FIX: Declare chrome globally to avoid type errors when @types/chrome is not available.
declare const chrome: any;

import { storage, WebhookConfig } from './storage';

const CONTEXT_MENU_ID = 'ai_webhook_summarize';

const createOrUpdateContextMenu = (configs: WebhookConfig[]) => {
  chrome.contextMenus.removeAll(() => {
    if (!configs || configs.length === 0) return;

    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Summarize with AI Webhook',
      contexts: ['page'],
    });

    configs.forEach(config => {
      chrome.contextMenus.create({
        id: config.id,
        parentId: CONTEXT_MENU_ID,
        title: config.name,
        contexts: ['page'],
      });
    });
  });
};

const updateContextMenu = async () => {
    const { webhookConfigs } = await storage.get();
    createOrUpdateContextMenu(webhookConfigs || []);
};

// Initial setup on install and startup
chrome.runtime.onInstalled.addListener(updateContextMenu);
chrome.runtime.onStartup.addListener(updateContextMenu);


// Listen for storage changes to update context menu
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && (changes.webhookConfigs || changes.apiBaseUrl)) {
        updateContextMenu();
    }
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.url || !info.parentMenuItemId || info.parentMenuItemId !== CONTEXT_MENU_ID) return;
  
  const webhookId = info.menuItemId.toString();
  const { apiBaseUrl, webhookConfigs } = await storage.get();

  if (!apiBaseUrl || !webhookConfigs || webhookConfigs.length === 0) {
    console.error('AI Webhook extension is not configured.');
    chrome.runtime.openOptionsPage();
    return;
  }
  
  const webhookUrl = `${apiBaseUrl}/api/webhook/${webhookId}`;
  const webhookName = webhookConfigs.find(c => c.id === webhookId)?.name || 'Unknown Webhook';

  try {
    // Note: The web app itself doesn't expose a public API endpoint for this.
    // This assumes a backend endpoint exists at the specified URL
    // that accepts a POST request with a JSON body like { "url": "..." }.
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: tab.url }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.statusText} - ${errorText}`);
    }

    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'AI Webhook',
        message: `Webhook for "${webhookName}" triggered successfully!`,
    });

  } catch (error) {
    console.error('Failed to trigger webhook:', error);
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'AI Webhook Error',
        message: `Failed to trigger webhook. ${error instanceof Error ? error.message : 'See extension console.'}`,
    });
  }
});