import React, { useState } from 'react';
import type { WebhookConfig } from '../../types';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useNotification } from '../../contexts/NotificationContext';

interface SettingsViewProps {
  webhookConfigs: WebhookConfig[];
  setWebhookConfigs: React.Dispatch<React.SetStateAction<WebhookConfig[]>>;
}

const AI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    // Other models can be added here in the future
];

const SettingsView: React.FC<SettingsViewProps> = ({ webhookConfigs, setWebhookConfigs }) => {
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookModel, setNewWebhookModel] = useState(AI_MODELS[0].id);
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


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
      <p className="mt-2 text-text-secondary">
        Manage your webhook configurations here.
      </p>

      <div className="mt-8 p-6 bg-surface border border-border-color rounded-lg">
        <h2 className="text-lg font-semibold text-text-primary">Add New Webhook</h2>
        <form onSubmit={handleAddWebhook} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
                type="text"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                placeholder="Enter a name for your webhook..."
                className="flex-grow w-full px-4 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
                value={newWebhookModel}
                onChange={(e) => setNewWebhookModel(e.target.value)}
                className="px-4 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
                {AI_MODELS.map(model => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                ))}
            </select>
            <Button type="submit" variant="primary">
                <Icon name="webhook" className="w-5 h-5 mr-2"/>
                Add Webhook
            </Button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Your Webhooks</h2>
        <div className="space-y-4">
            {webhookConfigs.length > 0 ? webhookConfigs.map(config => (
                <div key={config.id} className="p-4 bg-surface border border-border-color rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                           <h3 className="font-semibold text-text-primary">{config.name}</h3>
                           <span className="text-xs bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full">
                             {AI_MODELS.find(m => m.id === config.aiModel)?.name || 'Default Model'}
                           </span>
                        </div>

                        <div className="mt-2 flex items-center bg-background border border-border-color rounded-md p-2 transition-colors focus-within:ring-2 focus-within:ring-primary">
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/api/webhook/${config.id}`}
                                className="flex-grow bg-transparent text-text-secondary text-sm focus:outline-none"
                            />
                            <Button variant="subtle" size="sm" onClick={() => handleCopyToClipboard(config.id)}>
                                <Icon name="copy" className="w-4 h-4 mr-2" />
                                Copy
                            </Button>
                        </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => handleDeleteWebhook(config.id)}>
                        <Icon name="trash" className="w-4 h-4 mr-2"/>
                        Delete
                    </Button>
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