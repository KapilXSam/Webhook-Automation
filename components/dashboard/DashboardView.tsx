import React from 'react';
import type { WebhookConfig, WebhookResult } from '../../types';
import WebhookResultCard from './WebhookResultCard';
import Icon from '../ui/Icon';

interface DashboardViewProps {
  webhookConfigs: WebhookConfig[];
  results: WebhookResult[];
  setResults: React.Dispatch<React.SetStateAction<WebhookResult[]>>;
}

const DashboardView: React.FC<DashboardViewProps> = ({ webhookConfigs, results, setResults }) => {
  const handleDeleteResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };
    
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard</h1>
        <p className="mt-2 text-text-secondary max-w-2xl">
          View real-time summaries from your configured webhooks.
        </p>
      </header>
      
      {webhookConfigs.length > 0 ? (
        <div className="space-y-6">
          {results.length > 0 ? (
            results.map(result => (
              <WebhookResultCard key={result.id} result={result} onDelete={handleDeleteResult} />
            ))
          ) : (
            <div className="text-center py-16 px-6 bg-surface border-2 border-dashed border-border-color rounded-lg">
                <Icon name="webhook" className="mx-auto h-12 w-12 text-text-secondary" />
                <h3 className="mt-4 text-lg font-semibold text-text-primary">Waiting for webhook events...</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Trigger a webhook to see the AI-generated summary here. You can use the "Test" button in Settings.
                </p>
            </div>
          )}
        </div>
      ) : (
         <div className="text-center py-16 px-6 bg-surface border-2 border-dashed border-border-color rounded-lg">
            <Icon name="settings" className="mx-auto h-12 w-12 text-text-secondary" />
            <h3 className="mt-4 text-lg font-semibold text-text-primary">No webhooks configured</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Please go to the Settings page to create your first webhook.
            </p>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
