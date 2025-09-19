
import React from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface HeaderProps {
    onNavigateToDashboard: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateToDashboard }) => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border-color">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Icon name="brain-circuit" className="w-8 h-8 text-primary"/>
            <span className="text-xl font-bold text-text-primary">AI Webhook</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
            <a href="#" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Docs</a>
          </nav>
          <div className="flex items-center">
            <Button onClick={onNavigateToDashboard} variant="primary">
              Go to Dashboard
              <Icon name="arrow-right" className="w-4 h-4 ml-2"/>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
