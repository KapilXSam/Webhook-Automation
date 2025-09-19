// FIX: Declare chrome globally to avoid type errors when @types/chrome is not available.
declare const chrome: any;

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { storage, WebhookConfig } from './storage';

const Popup = () => {
  const [configs, setConfigs] = useState<WebhookConfig[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    storage.get().then(({ webhookConfigs, apiBaseUrl }) => {
      const storedConfigs = webhookConfigs || [];
      setConfigs(storedConfigs);
      setApiBaseUrl(apiBaseUrl || '');
      if (storedConfigs.length > 0) {
        setSelectedWebhook(storedConfigs[0].id);
      }
    });
  }, []);

  const handleSummarize = async () => {
    if (!selectedWebhook || !apiBaseUrl) {
      setError('Please configure the extension in the options page.');
      setStatus('error');
      return;
    }

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url) {
        setError('Cannot get URL from the current tab.');
        setStatus('error');
        return;
    }

    setStatus('loading');
    setError('');

    try {
      const webhookUrl = `${apiBaseUrl}/api/webhook/${selectedWebhook}`;
      // This assumes a backend endpoint exists that accepts a POST request
      // with a JSON body like { "url": "..." }.
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
      
      setStatus('success');
      setTimeout(() => window.close(), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setStatus('error');
    }
  };

  const handleCopyUrl = () => {
    if (!selectedWebhook || !apiBaseUrl) return;

    const webhookUrl = `${apiBaseUrl}/api/webhook/${selectedWebhook}`;
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }).catch(err => {
      console.error('Failed to copy URL:', err);
      setError('Failed to copy URL.');
      setStatus('error');
    });
  };


  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  const isConfigured = configs.length > 0 && apiBaseUrl;

  return (
    <div style={{ width: '300px', padding: '15px', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>AI Webhook</h2>
      </div>
      
      {!isConfigured ? (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Please set up your webhooks in the settings page.</p>
            <button onClick={openOptionsPage} style={{ padding: '8px 12px', cursor: 'pointer' }}>Open Settings</button>
        </div>
      ) : (
        <div>
          <label htmlFor="webhook-select" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Select Webhook:</label>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            <select
              id="webhook-select"
              value={selectedWebhook}
              onChange={(e) => setSelectedWebhook(e.target.value)}
              style={{ flexGrow: 1, padding: '8px', boxSizing: 'border-box' }}
            >
              {configs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCopyUrl}
              title="Copy Webhook URL"
              style={{ padding: '8px 12px', cursor: 'pointer', minWidth: '70px' }}
            >
              {copyStatus === 'copied' ? 'Copied!' : 'Copy URL'}
            </button>
          </div>

          <button
            onClick={handleSummarize}
            disabled={status === 'loading'}
            style={{ width: '100%', padding: '10px', fontSize: '16px', cursor: 'pointer' }}
          >
            {status === 'loading' ? 'Summarizing...' : 'Summarize Page'}
          </button>

          {status === 'success' && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>Webhook triggered successfully!</p>}
          {status === 'error' && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }} title={error}>Error: {error.length > 50 ? error.substring(0, 50) + '...' : error}</p>}
        </div>
      )}
       <div style={{ marginTop: '15px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <button onClick={openOptionsPage} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Settings</button>
       </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);