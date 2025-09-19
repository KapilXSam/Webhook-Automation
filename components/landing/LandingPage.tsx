
import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import Footer from './Footer';

interface LandingPageProps {
  onNavigateToDashboard: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDashboard }) => {
  return (
    <div className="flex flex-col min-h-screen text-text-primary">
      <Header onNavigateToDashboard={onNavigateToDashboard} />
      <main className="flex-grow">
        <HeroSection onGetStarted={onNavigateToDashboard} />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
