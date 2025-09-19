import React, { useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  const handleNavigateToDashboard = () => {
    setShowDashboard(true);
  };
  
  const handleNavigateHome = () => {
    setShowDashboard(false);
  };

  return (
    <NotificationProvider>
      {showDashboard ? (
        <Dashboard onNavigateHome={handleNavigateHome} />
      ) : (
        <LandingPage onNavigateToDashboard={handleNavigateToDashboard} />
      )}
    </NotificationProvider>
  );
}

export default App;