
import React from 'react';
import Icon from '../ui/Icon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border-color">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Solutions</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Automation</a></li>
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Analytics</a></li>
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Content Creation</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Pricing</a></li>
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Documentation</a></li>
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">API Status</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">About</a></li>
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Blog</a></li>
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Claim</a></li>
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Privacy</a></li>
              <li><a href="#" className="text-base text-text-secondary hover:text-text-primary">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border-color pt-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="brain-circuit" className="w-8 h-8 text-primary"/>
            <span className="text-xl font-bold text-text-primary">AI Webhook</span>
          </div>
          <p className="text-base text-text-secondary">&copy; {new Date().getFullYear()} AI Webhook, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
