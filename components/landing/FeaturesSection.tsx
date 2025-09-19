
import React from 'react';
import Icon from '../ui/Icon';
import type { IconProps } from '../ui/Icon';

interface FeatureCardProps {
  icon: IconProps['name'];
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-surface border border-border-color rounded-xl p-6 transform hover:-translate-y-2 transition-transform duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
      <Icon name={icon} className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
    <p className="mt-2 text-text-secondary">{description}</p>
  </div>
);

const FeaturesSection: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      icon: 'webhook',
      title: 'Simple Webhook Integration',
      description: 'Easily set up webhooks to receive data from any of your favorite services with a single, unique URL.',
    },
    {
      icon: 'brain-circuit',
      title: 'Powerful AI Processing',
      description: 'Leverage Google\'s Gemini models to analyze, summarize, or transform your incoming webhook data automatically.',
    },
    {
      icon: 'layout-dashboard',
      title: 'Real-time Dashboard',
      description: 'View all your webhook events and their AI-processed results in a clean, intuitive, and real-time dashboard.',
    },
    {
      icon: 'sparkles',
      title: 'Ultra-Smooth Experience',
      description: 'Built with a high-performance rendering engine for silky-smooth scrolling and fluid UI interactions.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">Everything you need, nothing you don't.</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
            Our platform is designed for developers and creators who need powerful automation without the complexity.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
