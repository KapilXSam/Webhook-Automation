import React, { useState, useEffect } from 'react';
import type { WebhookConfig, WebhookResult } from '../../types';
import { summarizeContentFromUrl } from '../../services/geminiService';
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
  const [filter, setFilter] = useState<string>('all'); // State for the results filter
  const { addNotification } = useNotification();

  useEffect(() => {
    // Check if the currently selected webhook is still valid.
    const isSelectedWebhookValid = webhookConfigs.some(wh => wh.id === selectedWebhook);
    
    // If the selected webhook is not valid (e.g., it was deleted) or none is selected,
    // update the selection.
    if (!isSelectedWebhookValid) {
      if (webhookConfigs.length > 0) {
        // Default to the first available webhook.
        setSelectedWebhook(webhookConfigs[0].id);
      } else {
        // If no webhooks are available, clear the selection.
        setSelectedWebhook('');
      }
    }
  }, [webhookConfigs, selectedWebhook]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !selectedWebhook) {
      addNotification('Please enter a valid URL and select a webhook.', 'error');
      return;
    }
    
    try {
        new URL(url);
    } catch (_) {
        addNotification('Please enter a valid URL.', 'error');
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
      summary: 'Processing...',
      status: 'loading',
      timestamp: new Date().toISOString(),
    };

    setResults(prev => [newResult, ...prev]);
    setUrl('');

    try {
      // FIX: Handle the new return object from summarizeContentFromUrl, which includes sources.
      const { summary, sources } = await summarizeContentFromUrl(url, selectedWebhookConfig?.aiModel);
      setResults(prev => 
        // FIX: Update the result with summary and sources upon success.
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

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    return result.webhookId === filter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
      <p className="mt-2 text-text-secondary">
        Trigger a webhook with a URL to get an AI-powered summary.
      </p>

      <div className="mt-8 p-6 bg-surface border border-border-color rounded-lg">
        <h2 className="text-lg font-semibold text-text-primary">Trigger New Webhook</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
          <select
            value={selectedWebhook}
            onChange={(e) => setSelectedWebhook(e.target.value)}
            className="px-4 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={webhookConfigs.length === 0}
          >
            {webhookConfigs.length > 0 ? (
                webhookConfigs.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))
            ) : (
                <option>Please create a webhook in Settings</option>
            )}
          </select>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-grow w-full px-4 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSubmitting || webhookConfigs.length === 0}
          />
          <Button type="submit" variant="primary" disabled={isSubmitting || webhookConfigs.length === 0}>
            {isSubmitting ? (
              <>
                <Icon name="loader" className="w-5 h-5 mr-2 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Icon name="sparkles" className="w-5 h-5 mr-2" />
                Summarize
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Results</h2>
            <div className="flex items-center gap-2">
                <label htmlFor="filter" className="text-sm text-text-secondary flex-shrink-0">Filter by:</label>
                <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                disabled={webhookConfigs.length === 0}
                >
                <option value="all">All Webhooks</option>
                {webhookConfigs.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
                </select>
            </div>
        </div>
        <div className="space-y-4">
          {filteredResults.length > 0 ? (
            filteredResults.map(result => (
              <WebhookResultCard key={result.id} result={result} onDelete={handleDeleteResult} />
            ))
          ) : (
            <div className="text-center py-10 bg-surface border border-border-color rounded-lg">
              <Icon name="layout-dashboard" className="mx-auto w-12 h-12 text-text-secondary" />
              <h3 className="mt-4 text-lg font-medium text-text-primary">
                {results.length > 0 ? 'No results for this filter' : 'No results yet'}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {results.length > 0
                  ? 'Try selecting another webhook or "All Webhooks".'
                  : 'Trigger a webhook above to see the AI summary here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
