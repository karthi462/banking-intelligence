import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SignInModal } from './components/SignInModal';

import { LandingPage } from './pages/LandingPage';
import { Overview } from './pages/Overview';
import { TransactionTrends } from './pages/TransactionTrends';
import { TimeAnalysis } from './pages/TimeAnalysis';
import { PaymentAnalytics } from './pages/PaymentAnalytics';
import { AnomalyAnalysis } from './pages/AnomalyAnalysis';
import { Forecasting } from './pages/Forecasting';
import { BranchComparison } from './pages/BranchComparison';
import { DatasetExplorer } from './pages/DatasetExplorer';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isPortalPage = location.pathname === '/' || location.pathname === '/welcome';

  if (isPortalPage) {
    return (
      <div className="min-h-screen bg-[#070d1f]">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SignInModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* Dark Navy Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Layout Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Header with Bank Account Persona Switcher */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/overview" element={<Overview />} />
            <Route path="/trends" element={<TransactionTrends />} />
            <Route path="/time-analysis" element={<TimeAnalysis />} />
            <Route path="/payment-analytics" element={<PaymentAnalytics />} />
            <Route path="/anomalies" element={<AnomalyAnalysis />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/branches" element={<BranchComparison />} />
            <Route path="/dataset-explorer" element={<DatasetExplorer />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </main>

        {/* Global Academic Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
          APEX Bank Transaction Intelligence &bull; Advanced Data Visualization Project &bull; Powered by React 19, FastAPI & R
        </footer>
      </div>

      {/* Interactive Sign-In & Bank Account Switcher Modal */}
      <SignInModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <FilterProvider>
          <AppContent />
        </FilterProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
