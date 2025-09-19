import React, { useState } from 'react';
import Icon, { IconName } from '../ui/Icon';
import DashboardView from './DashboardView';
import SettingsView from './SettingsView';
import type { WebhookConfig, WebhookResult } from '../../types';

type View = 'dashboard' | 'settings';

interface NavItemProps {
  icon: IconName;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
    }`}
  >
    <Icon name={icon} className="w-5 h-5 mr-3" />
    <span>{label}</span>
  </button>
);


const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([
      { id: `_DEFAULT_ID_`, name: 'Default Webhook' }
  ]);
  const [results, setResults] = useState<WebhookResult[]>([]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView 
                    webhookConfigs={webhookConfigs}
                    results={results}
                    setResults={setResults}
                />;
      case 'settings':
        return <SettingsView 
                    webhookConfigs={webhookConfigs}
                    setWebhookConfigs={setWebhookConfigs}
                />;
      default:
        return <DashboardView 
                    webhookConfigs={webhookConfigs}
                    results={results}
                    setResults={setResults}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <aside className="w-64 flex-shrink-0 bg-surface border-r border-border-color p-4 flex flex-col">
        <div className="flex items-center space-x-2 px-2 mb-8">
            <Icon name="brain-circuit" className="w-8 h-8 text-primary"/>
            <span className="text-xl font-bold text-text-primary">AI Webhook</span>
        </div>
        <nav className="flex-grow space-y-2">
            <NavItem 
                icon="layout-dashboard"
                label="Dashboard"
                isActive={currentView === 'dashboard'}
                onClick={() => setCurrentView('dashboard')}
            />
             <NavItem 
                icon="settings"
                label="Settings"
                isActive={currentView === 'settings'}
                onClick={() => setCurrentView('settings')}
            />
        </nav>
        <div className="mt-auto">
            {/* User Profile Section can go here */}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default Dashboard;