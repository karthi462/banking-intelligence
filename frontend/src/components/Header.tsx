import React from 'react';
import {
  Menu,
  RefreshCw,
  FileDown,
  Database,
  User,
  ChevronDown,
  Building2,
  Briefcase,
  ShieldAlert,
  Landmark,
  KeyRound,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { appliedFilters, datasetSummary, triggerRefresh, isLoadingSummary } = useFilters();
  const { currentUser, setIsSignInModalOpen } = useAuth();

  const handleExportPdf = () => {
    const url = api.getExportPdfUrl(appliedFilters);
    window.open(url, '_blank');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Executive':
        return <Landmark className="w-3.5 h-3.5 text-blue-600" />;
      case 'Corporate':
        return <Briefcase className="w-3.5 h-3.5 text-amber-600" />;
      case 'BranchManager':
        return <Building2 className="w-3.5 h-3.5 text-teal-600" />;
      case 'RiskCompliance':
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <User className="w-3.5 h-3.5 text-sky-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 transition-all shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile toggle & Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden border border-slate-200"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                APEX BANK Intelligence
              </h1>
              {datasetSummary && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    datasetSummary.is_synthetic
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{datasetSummary.is_synthetic ? 'Benchmark Data' : 'Custom Upload'}</span>
                  <span className="text-slate-300">|</span>
                  <span>{datasetSummary.valid_rows.toLocaleString()} Txns</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium hidden md:block">
              Institutional Financial Analytics & Multi-Channel Liquidity Governance
            </p>
          </div>
        </div>

        {/* Right side controls: Bank Account Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* User / Bank Account Profile Pill */}
          <div
            onClick={() => setIsSignInModalOpen(true)}
            className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-300 rounded-2xl transition-all shadow-xs"
            title="Click to switch bank account role or sign in"
          >
            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
            >
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentUser.accountNumber}
                </span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                {getRoleIcon(currentUser.role)}
                <span className="truncate max-w-[120px]">{currentUser.role} Account</span>
              </div>
            </div>

            <div className="flex items-center gap-1 pl-1 text-slate-400 group-hover:text-blue-600">
              <KeyRound className="w-3.5 h-3.5" />
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Refresh Action */}
          <button
            onClick={triggerRefresh}
            disabled={isLoadingSummary}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50 border border-slate-200"
            title="Reload dataset and recalculate analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSummary ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
            <span className="hidden xl:inline">Refresh</span>
          </button>

          {/* Export PDF Report */}
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-600/30 transition-all active:scale-95"
            title="Download full analytics report in PDF format"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
