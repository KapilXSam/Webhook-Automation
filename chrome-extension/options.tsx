// FIX: Declare chrome globally to avoid type errors when @types/chrome is not available.
declare const chrome: any;

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { storage, WebhookConfig, defaultStorage } from './storage';

const Options = () => {
  const [configs, setConfigs] = useState<WebhookConfig[]>([]);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    storage.get().then(({ webhookConfigs, apiBaseUrl }) => {
      setConfigs(webhookConfigs || defaultStorage.webhookConfigs);
      setApiBaseUrl(apiBaseUrl || defaultStorage.apiBaseUrl);
    });
  }, []);

  const showStatus = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(''), 3000);
  };

  const handleSaveSettings = () => {
    storage.set({ apiBaseUrl }).then(() => {
      showStatus('Settings saved successfully!');
    });
  };
  
  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookName.trim()) {
      showStatus('Webhook name cannot be empty.');
      return;
    }

    const newWebhook: WebhookConfig = {
      id: `wh_ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newWebhookName.trim(),
    };
    
    const updatedConfigs = [...configs, newWebhook];
    setConfigs(updatedConfigs);
    storage.set({ webhookConfigs: updatedConfigs }).then(() => {
      setNewWebhookName('');
      showStatus(`Webhook "${newWebhook.name}" added.`);
    });
  };

  const handleDeleteWebhook = (idToDelete: string) => {
    const updatedConfigs = configs.filter(wh => wh.id !== idToDelete);
    setConfigs(updatedConfigs);
    storage.set({ webhookConfigs: updatedConfigs }).then(() => {
      showStatus('Webhook deleted.');
    });
  };

  const handleTestWebhook = async (webhookId: string, webhookName: string) => {
    if (!apiBaseUrl) {
      showStatus('Error: API Server URL is not configured.');
      return;
    }

    const webhookUrl = `${apiBaseUrl}/api/webhook/${webhookId}`;
    showStatus(`Sending test to "${webhookName}"...`);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://example.com/test-from-extension' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }

      showStatus(`Test for "${webhookName}" sent successfully!`);
    } catch (error) {
      console.error('Failed to send test webhook:', error);
      showStatus(`Test failed. Check extension console for details.`);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2em' }}>AI Webhook Settings</h1>
        <p style={{ color: '#555' }}>Configure the extension to connect to your AI Webhook instance.</p>
      </header>
      
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Connection</h2>
        <div style={{ marginTop: '20px' }}>
          <label htmlFor="api-url" style={{ display: 'block', marginBottom: '5px' }}>API Server URL</label>
          <input
            id="api-url"
            type="url"
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrl(e.target.value)}
            onBlur={handleSaveSettings}
            placeholder="e.g., https://my-ai-webhook.com"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
           <small style={{ display: 'block', marginTop: '5px', color: '#777' }}>
             The extension sends requests to <code>{apiBaseUrl || '[URL]'}/api/webhook/[ID]</code>.
           </small>
        </div>
      </section>

      <section>
        <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Manage Webhooks</h2>
        <form onSubmit={handleAddWebhook} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <input
            type="text"
            value={newWebhookName}
            onChange={(e) => setNewWebhookName(e.target.value)}
            placeholder="New webhook name"
            style={{ flexGrow: 1, padding: '10px' }}
          />
          <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>Add Webhook</button>
        </form>
        
        <div style={{ marginTop: '20px' }}>
          {configs.length > 0 ? configs.map((config) => (
            <div key={config.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '10px' }}>
              <div>
                <strong>{config.name}</strong>
                <div style={{ fontSize: '12px', color: '#888' }}>ID: {config.id}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleTestWebhook(config.id, config.name)}
                  disabled={!apiBaseUrl}
                  title={!apiBaseUrl ? "Please set the API Server URL first" : "Send a test event"}
                  style={{
                    padding: '5px 10px',
                    cursor: !apiBaseUrl ? 'not-allowed' : 'pointer',
                    color: '#007bff',
                    background: 'none',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    opacity: !apiBaseUrl ? 0.5 : 1
                  }}
                >
                  Test
                </button>
                <button 
                  onClick={() => handleDeleteWebhook(config.id)}
                  style={{ 
                    padding: '5px 10px',
                    cursor: 'pointer',
                    color: 'red',
                    background: 'none',
                    border: '1px solid red',
                    borderRadius: '4px'
                }}>
                  Delete
                </button>
              </div>
            </div>
          )) : (
            <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No webhooks configured yet.</p>
          )}
        </div>
      </section>
      
      {status && <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '10px 20px', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{status}</div>}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
);