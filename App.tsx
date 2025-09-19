import React, { useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import { NotificationProvider } from './contexts/NotificationContext';
import './index.css';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  const handleNavigateToDashboard = () => {
    setShowDashboard(true);
  };

  return (
    <NotificationProvider>
      {showDashboard ? (
        <Dashboard />
      ) : (
        <LandingPage onNavigateToDashboard={handleNavigateToDashboard} />
      )}
    </NotificationProvider>
  );
}

export default App;
