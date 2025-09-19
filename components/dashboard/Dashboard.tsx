
import React, { useState, useEffect } from 'react';
import Icon, { IconName } from '../ui/Icon';
import DashboardView from './DashboardView';
import SettingsView from './SettingsView';
import type { WebhookConfig, WebhookResult } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

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

interface DashboardProps {
  onNavigateHome: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateHome }) => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([
    { id: `wh_default_123`, name: 'Default Webhook', aiModel: 'gemini-2.5-flash' }
  ]);
  const [results, setResults] = useState<WebhookResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { addNotification } = useNotification();

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
                    setResults={setResults} // Pass setResults for testing
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
       <div className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`w-64 flex-shrink-0 bg-surface border-r border-border-color p-4 flex flex-col absolute inset-y-0 left-0 z-40 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center space-x-2 px-2 mb-8">
            <Icon name="brain-circuit" className="w-8 h-8 text-primary"/>
            <span className="text-xl font-bold text-text-primary">AI Webhook</span>
        </div>
        <nav className="flex-grow space-y-2">
            <NavItem 
                icon="layout-dashboard"
                label="Dashboard"
                isActive={currentView === 'dashboard'}
                onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }}
            />
             <NavItem 
                icon="settings"
                label="Settings"
                isActive={currentView === 'settings'}
                onClick={() => { setCurrentView('settings'); setIsSidebarOpen(false); }}
            />
        </nav>
        <div className="mt-auto">
             <NavItem 
                icon="home"
                label="Back to Home"
                isActive={false}
                onClick={onNavigateHome}
            />
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border-color bg-surface">
            <button onClick={() => setIsSidebarOpen(true)} className="text-text-secondary">
                <Icon name="menu" className="w-6 h-6" />
            </button>
            <span className="text-lg font-bold capitalize">{currentView}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
            {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
