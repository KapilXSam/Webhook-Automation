import React, { useState } from 'react';
import type { WebhookConfig, WebhookResult } from '../../types';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useNotification } from '../../contexts/NotificationContext';
import { summarizeUrlOnBackend } from '../../services/apiService';

interface SettingsViewProps {
  webhookConfigs: WebhookConfig[];
  setWebhookConfigs: React.Dispatch<React.SetStateAction<WebhookConfig[]>>;
  setResults: React.Dispatch<React.SetStateAction<WebhookResult[]>>;
}

const AI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
];

const SettingsView: React.FC<SettingsViewProps> = ({ webhookConfigs, setWebhookConfigs, setResults }) => {
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookModel, setNewWebhookModel] = useState(AI_MODELS[0].id);
  const [testingId, setTestingId] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookName.trim()) {
      addNotification('Webhook name cannot be empty.', 'error');
      return;
    }

    const newWebhook: WebhookConfig = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: newWebhookName.trim(),
      aiModel: newWebhookModel,
    };

    setWebhookConfigs(prev => [...prev, newWebhook]);
    setNewWebhookName('');
    addNotification(`Webhook "${newWebhook.name}" created successfully!`, 'success');
  };

  const handleDeleteWebhook = (id: string) => {
    const configToDelete = webhookConfigs.find(wh => wh.id === id);
    if(configToDelete) {
        setWebhookConfigs(prev => prev.filter(wh => wh.id !== id));
        addNotification(`Webhook "${configToDelete.name}" has been deleted.`, 'success');
    }
  };

  const handleCopyToClipboard = (id: string) => {
    const webhookUrl = `${window.location.origin}/api/webhook/${id}`;
    navigator.clipboard.writeText(webhookUrl);
    addNotification('Webhook URL copied to clipboard!', 'success');
  };
  
  const handleTestWebhook = async (webhookConfig: WebhookConfig) => {
    setTestingId(webhookConfig.id);
    addNotification(`Sending test for "${webhookConfig.name}"...`, 'success');
    
    const testUrl = 'https://en.wikipedia.org/wiki/Webhook';
    const tempId = `res_test_${Date.now()}`;
    const newResult: WebhookResult = {
      id: tempId,
      webhookId: webhookConfig.id,
      webhookName: webhookConfig.name,
      url: testUrl,
      summary: '',
      status: 'loading',
      timestamp: new Date().toISOString(),
    };

    setResults(prev => [newResult, ...prev]);

    try {
      const { summary, sources } = await summarizeUrlOnBackend(testUrl, webhookConfig.aiModel);
      setResults(prev => 
        prev.map(r => r.id === tempId ? { ...r, summary, sources, status: 'success' } : r)
      );
      addNotification('Test summary generated successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setResults(prev => 
        prev.map(r => r.id === tempId ? { ...r, summary: `Test failed: ${errorMessage}`, status: 'error' } : r)
      );
      addNotification('Test failed.', 'error');
    } finally {
      setTestingId(null);
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Settings</h1>
        <p className="mt-2 text-text-secondary max-w-2xl">
          Create, manage, and test your webhook configurations. Each webhook gets a unique URL to receive data.
        </p>
      </header>

      <div className="p-6 bg-surface border border-border-color rounded-lg">
        <h2 className="text-lg font-semibold text-text-primary">Add New Webhook</h2>
        <form onSubmit={handleAddWebhook} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
                type="text"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                placeholder="Webhook Name"
                className="flex-grow w-full px-4 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary sm:col-span-2"
            />
            <select
                value={newWebhookModel}
                onChange={(e) => setNewWebhookModel(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
                {AI_MODELS.map(model => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                ))}
            </select>
            <Button type="submit" variant="primary" className="w-full sm:col-span-3">
                <Icon name="webhook" className="w-5 h-5 mr-2"/>
                Add Webhook
            </Button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Your Webhooks</h2>
        <div className="space-y-4">
            {webhookConfigs.length > 0 ? webhookConfigs.map(config => (
                <div key={config.id} className="p-4 bg-surface border border-border-color rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                           <h3 className="font-semibold text-text-primary">{config.name}</h3>
                           <span className="text-xs bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full">
                             {AI_MODELS.find(m => m.id === config.aiModel)?.name || 'Default Model'}
                           </span>
                        </div>
                        <div className="mt-2 flex items-center bg-background border border-border-color rounded-md transition-colors focus-within:ring-2 focus-within:ring-primary">
                            <input type="text" readOnly value={`${window.location.origin}/api/webhook/${config.id}`} className="flex-grow bg-transparent text-text-secondary text-sm focus:outline-none p-2"/>
                            <Button variant="subtle" size="sm" onClick={() => handleCopyToClipboard(config.id)} className="flex-shrink-0"><Icon name="copy" className="w-4 h-4 mr-1" />Copy</Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <Button variant="secondary" size="sm" onClick={() => handleTestWebhook(config)} disabled={testingId === config.id}>
                            {testingId === config.id ? <><Icon name="loader" className="w-4 h-4 mr-2 animate-spin" />Testing...</> : <><Icon name="sparkles" className="w-4 h-4 mr-2"/>Test</>}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleDeleteWebhook(config.id)} className="hover:!bg-red-500/20 hover:!text-red-400">
                            <Icon name="trash" className="w-4 h-4 mr-1"/>
                        </Button>
                    </div>
                </div>
            )) : (
                <p className="text-text-secondary text-center py-4">You haven't created any webhooks yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;