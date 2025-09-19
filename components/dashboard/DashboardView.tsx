import React, { useState, useEffect } from 'react';
import type { WebhookConfig, WebhookResult } from '../../types';
import { summarizeUrlOnBackend } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import WebhookResultCard from './WebhookResultCard';

interface DashboardViewProps {
  webhookConfigs: WebhookConfig[];
  results: WebhookResult[];
  setResults: React.Dispatch<React.SetStateAction<WebhookResult[]>>;
}

const DashboardView: React.FC<DashboardViewProps> = ({ webhookConfigs, results, setResults }) => {
  const [url, setUrl] = useState('');
  const [selectedWebhook, setSelectedWebhook] = useState<string>(webhookConfigs[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const { addNotification } = useNotification();

  useEffect(() => {
    const isSelectedWebhookValid = webhookConfigs.some(wh => wh.id === selectedWebhook);
    if (!isSelectedWebhookValid) {
      setSelectedWebhook(webhookConfigs.length > 0 ? webhookConfigs[0].id : '');
    }
  }, [webhookConfigs, selectedWebhook]);

  const validateUrl = (input: string): boolean => {
    try {
      new URL(input);
      setUrlError('');
      return true;
    } catch (_) {
      setUrlError('Please enter a valid URL format.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(url) || !selectedWebhook) {
      if(url && !selectedWebhook) addNotification('Please select a webhook.', 'error');
      return;
    }

    setIsSubmitting(true);
    const tempId = `res_${Date.now()}`;
    const selectedWebhookConfig = webhookConfigs.find(wh => wh.id === selectedWebhook);
    
    const newResult: WebhookResult = {
      id: tempId,
      webhookId: selectedWebhook,
      webhookName: selectedWebhookConfig?.name || 'Unknown Webhook',
      url,
      summary: '',
      status: 'loading',
      timestamp: new Date().toISOString(),
    };

    setResults(prev => [newResult, ...prev]);
    setUrl('');

    try {
      const { summary, sources } = await summarizeUrlOnBackend(url, selectedWebhookConfig?.aiModel);
      setResults(prev => 
        prev.map(r => r.id === tempId ? { ...r, summary, sources, status: 'success' } : r)
      );
      addNotification('Content summarized successfully!', 'success');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setResults(prev => 
        prev.map(r => r.id === tempId ? { ...r, summary: `Failed to summarize: ${errorMessage}`, status: 'error' } : r)
      );
      addNotification('Failed to summarize content.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
    addNotification('Result deleted.', 'success');
  };
  
  const filteredResults = results.filter(result => filter === 'all' || result.webhookId === filter);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard</h1>
        <p className="mt-2 text-text-secondary max-w-2xl">
          Manually trigger a webhook with a URL to get an AI-powered summary, and view the history of all your webhook events.
        </p>
      </header>

      <div className="p-6 bg-surface border border-border-color rounded-lg">
        <h2 className="text-lg font-semibold text-text-primary">Trigger New Webhook</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
          <select
            value={selectedWebhook}
            onChange={(e) => setSelectedWebhook(e.target.value)}
            className="px-4 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
            disabled={webhookConfigs.length === 0}
          >
            {webhookConfigs.length > 0 ? (
                webhookConfigs.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)
            ) : (
                <option>Create a webhook in Settings</option>
            )}
          </select>
          <div className="flex-grow">
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); if (urlError) validateUrl(e.target.value); }}
              placeholder="https://example.com/article"
              className={`w-full px-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 ${urlError ? 'border-red-500 ring-red-500' : 'border-border-color focus:ring-primary'}`}
              disabled={isSubmitting || webhookConfigs.length === 0}
            />
            {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
          </div>
          <Button type="submit" variant="primary" disabled={isSubmitting || webhookConfigs.length === 0} className="w-full sm:w-auto">
            {isSubmitting ? (
              <><Icon name="loader" className="w-5 h-5 mr-2 animate-spin" /> Summarizing...</>
            ) : (
              <><Icon name="sparkles" className="w-5 h-5 mr-2" /> Summarize</>
            )}
          </Button>
        </form>
      </div>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Recent Events</h2>
            <div className="flex items-center gap-2">
                <label htmlFor="filter" className="text-sm text-text-secondary flex-shrink-0">Filter by:</label>
                <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-1.5 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm" disabled={webhookConfigs.length === 0}>
                  <option value="all">All Webhooks</option>
                  {webhookConfigs.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                </select>
            </div>
        </div>
        <div className="space-y-4">
          {filteredResults.length > 0 ? (
            filteredResults.map(result => <WebhookResultCard key={result.id} result={result} onDelete={handleDeleteResult} />)
          ) : (
            <div className="text-center py-10 bg-surface border border-border-color rounded-lg">
              <Icon name="layout-dashboard" className="mx-auto w-12 h-12 text-text-secondary" />
              <h3 className="mt-4 text-lg font-medium text-text-primary">{results.length > 0 ? 'No results for this filter' : 'No results yet'}</h3>
              <p className="mt-1 text-sm text-text-secondary">{results.length > 0 ? 'Try selecting another webhook or "All Webhooks".' : 'Trigger a webhook above to see the AI summary here.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;