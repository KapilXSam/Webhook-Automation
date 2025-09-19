
import React from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative py-20 sm:py-32 lg:py-40 bg-background overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://picsum.photos/seed/ai-hero/1920/1080" 
          alt="Abstract technology background" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"></div>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-text-primary">
          Automate Your Workflow with <span className="text-primary">AI-Powered Webhooks</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg lg:text-xl text-text-secondary">
          Connect your services, trigger events, and let our intelligent agents process your data instantly. Get started in minutes.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={onGetStarted} variant="primary" className="px-8 py-3 text-lg">
            Get Started Free
            <Icon name="arrow-right" className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="secondary" className="px-8 py-3 text-lg">
            Download Extension
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
