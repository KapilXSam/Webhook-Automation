import React, { useState } from 'react';
import type { WebhookConfig, WebhookResult } from '../../types';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useNotification } from '../../contexts/NotificationContext';
import { testWebhook, analyzeFile } from '../../services/apiService';

interface SettingsViewProps {
  webhookConfigs: WebhookConfig[];
  setWebhookConfigs: React.Dispatch<React.SetStateAction<WebhookConfig[]>>;
  setResults: React.Dispatch<React.SetStateAction<WebhookResult[]>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ webhookConfigs, setWebhookConfigs, setResults }) => {
  const { addNotification } = useNotification();
  const [newWebhookName, setNewWebhookName] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  // State for file analysis
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePrompt, setFilePrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const getWebhookUrl = (id: string) => `${window.location.origin}/api/webhook/${id}`;

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookName.trim()) {
      addNotification('Webhook name cannot be empty', 'error');
      return;
    }

    const newConfig: WebhookConfig = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: newWebhookName.trim(),
      aiModel: selectedModel,
      url: '' // url is generated based on id
    };
    newConfig.url = getWebhookUrl(newConfig.id);

    setWebhookConfigs(prev => [...prev, newConfig]);
    setNewWebhookName('');
    addNotification(`Webhook "${newConfig.name}" created!`, 'success');
  };
  
  const handleDeleteWebhook = (id: string) => {
    setWebhookConfigs(prev => prev.filter(config => config.id !== id));
    addNotification('Webhook deleted', 'success');
  };
  
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    addNotification('Webhook URL copied to clipboard!', 'success');
  };

  const handleTestWebhook = async (config: WebhookConfig) => {
    const tempId = `temp_${Date.now()}`;
    // Immediately add a loading card to the dashboard
    setResults(prev => [
        {
            id: tempId,
            url: 'https://en.wikipedia.org/wiki/Webhook',
            inputType: 'url',
            summary: 'Sending test event to backend...',
            sources: [],
            timestamp: Date.now(),
            status: 'loading',
            webhookName: config.name,
        },
        ...prev,
    ]);
    
    addNotification(`Sending test to "${config.name}"...`, 'success');
    try {
      const response = await testWebhook(config.id, window.location.origin);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      // The backend will send an SSE event to update the card, no success message needed here
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       addNotification(`Failed to send test: ${errorMessage}`, 'error');
       // Update the card on the dashboard to show the error
       setResults(prev => prev.map(r => r.id === tempId ? { ...r, status: 'error', summary: errorMessage } : r));
    }
  };

  const handleFileAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
        addNotification('Please select a file.', 'error');
        return;
    }
    if (!filePrompt.trim()) {
        addNotification('Please enter a prompt.', 'error');
        return;
    }
    
    setIsAnalyzing(true);
    const tempId = `temp_${Date.now()}`;
    const webhookName = 'Manual File Analysis';

    // Add loading card to dashboard
    setResults(prev => [
        {
            id: tempId,
            fileName: selectedFile.name,
            inputType: 'file',
            summary: 'Uploading file and analyzing...',
            sources: [],
            timestamp: Date.now(),
            status: 'loading',
            webhookName,
        },
        ...prev,
    ]);

    try {
        const response = await analyzeFile(selectedFile, filePrompt, webhookName, tempId);
        if (!response.ok) {
            throw new Error(await response.text());
        }
        setSelectedFile(null);
        setFilePrompt('');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addNotification(`Analysis failed: ${errorMessage}`, 'error');
        setResults(prev => prev.map(r => r.id === tempId ? { ...r, status: 'error', summary: errorMessage } : r));
    } finally {
        setIsAnalyzing(false);
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Settings</h1>
        <p className="mt-2 text-text-secondary max-w-2xl">
          Manage and test your AI-powered webhooks and file analysis capabilities.
        </p>
      </header>
      
      <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <section className="bg-surface border border-border-color rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary">Create New Webhook</h2>
            <form onSubmit={handleAddWebhook} className="mt-4 flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow w-full">
                    <label htmlFor="webhook-name" className="block text-sm font-medium text-text-secondary mb-1">Webhook Name</label>
                    <input
                        id="webhook-name"
                        type="text"
                        value={newWebhookName}
                        onChange={(e) => setNewWebhookName(e.target.value)}
                        placeholder="e.g., 'Summarize Blog Posts'"
                        className="w-full bg-background border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label htmlFor="ai-model" className="block text-sm font-medium text-text-secondary mb-1">AI Model</label>
                    <select 
                        id="ai-model"
                        value={selectedModel}
                        onChange={e => setSelectedModel(e.target.value)}
                        className="w-full bg-background border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary"
                    >
                        <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    </select>
                </div>
                <Button type="submit" variant="primary" className="w-full sm:w-auto">Create</Button>
            </form>
            </section>

             <section className="bg-surface border border-border-color rounded-lg p-6">
                <h2 className="text-xl font-semibold text-text-primary">Test with File</h2>
                <form onSubmit={handleFileAnalysis} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-text-secondary mb-1">Upload Image</label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                            className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                    </div>
                    <div>
                        <label htmlFor="file-prompt" className="block text-sm font-medium text-text-secondary mb-1">Prompt</label>
                         <textarea
                            id="file-prompt"
                            rows={3}
                            value={filePrompt}
                            onChange={(e) => setFilePrompt(e.target.value)}
                            placeholder="e.g., 'What is in this image?'"
                            className="w-full bg-background border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <Button type="submit" variant="primary" disabled={isAnalyzing || !selectedFile}>
                        {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
                    </Button>
                </form>
            </section>
        </div>

        <section>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Existing Webhooks</h2>
            <div className="space-y-4">
                {webhookConfigs.length > 0 ? (
                    webhookConfigs.map(config => (
                        <div key={config.id} className="bg-surface border border-border-color rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-text-primary">{config.name}</p>
                                <p className="text-sm text-text-secondary truncate mt-1" title={getWebhookUrl(config.id)}>
                                    {getWebhookUrl(config.id)}
                                </p>
                                <p className="text-xs text-text-secondary mt-1">Model: {config.aiModel}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                                <Button variant="subtle" size="sm" onClick={() => handleTestWebhook(config)}>
                                    <Icon name="webhook" className="w-4 h-4 mr-1"/> Test
                                </Button>
                                <Button variant="subtle" size="sm" onClick={() => handleCopyUrl(getWebhookUrl(config.id))}>
                                    <Icon name="copy" className="w-4 h-4 mr-1"/> Copy URL
                                </Button>
                                <Button variant="subtle" size="sm" onClick={() => handleDeleteWebhook(config.id)} className="hover:!bg-red-500/20 hover:!text-red-400">
                                    <Icon name="trash" className="w-4 h-4 mr-1"/> Delete
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-text-secondary text-center py-8">No webhooks configured yet.</p>
                )}
            </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
