import React, { useState, useEffect, useCallback } from 'react';
import DashboardView from './DashboardView';
import SettingsView from './SettingsView';
import { WebhookConfig, WebhookResult } from '../../types';
import Icon, { IconName } from '../ui/Icon';
import { listenForWebhookResults } from '../../services/apiService';

// Storage helpers to persist webhook configurations in localStorage
const getWebhookConfigs = (): WebhookConfig[] => {
    try {
        const item = window.localStorage.getItem('webhookConfigs');
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error("Error reading webhook configs from localStorage", error);
        return [];
    }
};

const saveWebhookConfigs = (configs: WebhookConfig[]) => {
    try {
        window.localStorage.setItem('webhookConfigs', JSON.stringify(configs));
    } catch (error) {
        console.error("Error saving webhook configs to localStorage", error);
    }
};

// Sidebar component for navigation within the dashboard
interface SidebarProps {
    activeView: 'dashboard' | 'settings';
    setActiveView: (view: 'dashboard' | 'settings') => void;
    onNavigateHome: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onNavigateHome }) => {
    const NavItem = ({ icon, label, isActive, onClick }: { icon: IconName, label: string, isActive: boolean, onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'bg-surface text-text-primary' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
            }`}
        >
            <Icon name={icon} className="w-5 h-5 mr-3" />
            <span>{label}</span>
        </button>
    );

    return (
        <aside className="w-64 flex-shrink-0 bg-background border-r border-border-color p-4 flex flex-col">
            <div className="flex items-center space-x-2 px-2 mb-8">
                <Icon name="brain-circuit" className="w-8 h-8 text-primary"/>
                <span className="text-xl font-bold text-text-primary">AI Webhook</span>
            </div>
            <nav className="flex-1 space-y-2">
                <NavItem icon="layout-dashboard" label="Dashboard" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                <NavItem icon="settings" label="Settings" isActive={activeView === 'settings'} onClick={() => setActiveView('settings')} />
            </nav>
            <div className="mt-auto">
                 <NavItem icon="home" label="Back to Home" isActive={false} onClick={onNavigateHome} />
            </div>
        </aside>
    );
};

// Main Dashboard component
interface DashboardProps {
  onNavigateHome: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateHome }) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'settings'>('dashboard');
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>(getWebhookConfigs);
  const [results, setResults] = useState<WebhookResult[]>([]);
  
  useEffect(() => {
    saveWebhookConfigs(webhookConfigs);
  }, [webhookConfigs]);

  const handleNewEvent = useCallback((event: any) => {
    const { id, tempId, status, summary, url, fileName, inputType, webhookId, sources } = event;
    const config = webhookConfigs.find(c => c.id === webhookId);

    setResults(prev => {
        // Use tempId for in-progress UI-initiated actions, otherwise use the final ID
        const searchId = tempId || id;
        const existingIndex = prev.findIndex(r => r.id === searchId);

        if (existingIndex !== -1) {
            // Update an existing item (e.g., a test that was in a 'loading' state)
            const updatedResults = [...prev];
            updatedResults[existingIndex] = {
                ...updatedResults[existingIndex],
                id: id, // Solidify the ID from the backend
                status,
                summary,
                sources: sources || [],
            };
            return updatedResults.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            // Add a brand new item (from an external webhook trigger)
            const newResult: WebhookResult = {
                id,
                url,
                fileName,
                inputType,
                summary,
                sources: sources || [],
                timestamp: Date.now(),
                status,
                webhookName: config?.name || webhookId || 'Unknown Webhook',
            };
            return [newResult, ...prev].sort((a, b) => b.timestamp - a.timestamp);
        }
    });
  }, [webhookConfigs]);

  useEffect(() => {
    const cleanup = listenForWebhookResults(handleNewEvent);
    return cleanup;
  }, [handleNewEvent]);

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onNavigateHome={onNavigateHome} />
      <main className="flex-1 overflow-y-auto">
        {activeView === 'dashboard' ? (
          <DashboardView webhookConfigs={webhookConfigs} results={results} setResults={setResults} />
        ) : (
          <SettingsView 
            webhookConfigs={webhookConfigs} 
            setWebhookConfigs={setWebhookConfigs}
            setResults={setResults}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
