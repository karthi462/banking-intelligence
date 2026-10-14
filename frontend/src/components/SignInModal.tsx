import React, { useState } from 'react';
import {
  X,
  Lock,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Briefcase,
  User,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth, DEMO_BANK_ACCOUNTS } from '../context/AuthContext';
import { useFilters } from '../context/FilterContext';
import { UserAccount } from '../types/auth';

export const SignInModal: React.FC = () => {
  const { isSignInModalOpen, setIsSignInModalOpen, currentUser, loginAsAccount, loginWithCredentials } = useAuth();
  const { setFilters, applyFilters } = useFilters();

  const [activeTab, setActiveTab] = useState<'presets' | 'credentials'>('presets');
  const [customUsername, setCustomUsername] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [customRole, setCustomRole] = useState<'Executive' | 'BranchManager' | 'Corporate' | 'Retail' | 'RiskCompliance'>('Corporate');
  const [customAccountType, setCustomAccountType] = useState('Business');
  const [customBranch, setCustomBranch] = useState('All');

  if (!isSignInModalOpen) return null;

  const handleSelectPreset = (account: UserAccount) => {
    loginAsAccount(account);

    // Contextually sync filters to the selected account role for seamless UX
    if (account.accountType !== 'All') {
      setFilters((prev) => ({ ...prev, account_type: account.accountType }));
    }
    if (account.branch !== 'All') {
      setFilters((prev) => ({ ...prev, branch: account.branch }));
    }
    applyFilters();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithCredentials(customUsername, customRole, customAccountType, customBranch);
    if (customAccountType !== 'All') {
      setFilters((prev) => ({ ...prev, account_type: customAccountType }));
    }
    if (customBranch !== 'All') {
      setFilters((prev) => ({ ...prev, branch: customBranch }));
    }
    applyFilters();
  };

  const getAccountIcon = (role: string) => {
    switch (role) {
      case 'Executive':
        return <Landmark className="w-5 h-5 text-blue-600" />;
      case 'Corporate':
        return <Briefcase className="w-5 h-5 text-amber-600" />;
      case 'BranchManager':
        return <Building2 className="w-5 h-5 text-teal-600" />;
      case 'RiskCompliance':
        return <ShieldAlert className="w-5 h-5 text-purple-600" />;
      default:
        return <User className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0a1128] to-[#1e293b] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Sign In to APEX Bank
                </h2>
                <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  Secure Portal
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Choose a Bank Account Persona or enter custom credentials
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSignInModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-bold px-6">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>1-Click Bank Account Sign-In (Recommended)</span>
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'credentials'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Customer ID & Password</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'presets' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Select an account role below. The dashboard will instantly personalize and filter transactions according to that account's access level:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {DEMO_BANK_ACCOUNTS.map((acc) => {
                  const isCurrent = currentUser?.id === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectPreset(acc)}
                      className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/80 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                          {getAccountIcon(acc.role)}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              {acc.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 font-semibold">
                              ACC: {acc.accountNumber}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-700 mt-0.5">
                            {acc.roleLabel}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {acc.description}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-3">
                        <button
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white'
                          }`}
                        >
                          <span>{isCurrent ? 'Active' : 'Sign In'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom Login Form */
            <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs">
              <p className="text-xs text-slate-500">
                Enter your simulated banking credentials. Any test password will be accepted for academic evaluation.
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Customer / Employee Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Secure Password / MPIN
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role Type</label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="Executive">Executive / Director</option>
                    <option value="Corporate">Corporate Treasury</option>
                    <option value="BranchManager">Branch Manager</option>
                    <option value="RiskCompliance">Risk & Compliance</option>
                    <option value="Retail">Retail Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Portfolio</label>
                  <select
                    value={customAccountType}
                    onChange={(e) => setCustomAccountType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="All">All Portfolios</option>
                    <option value="Business">Business Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Current">Current Account</option>
                    <option value="Salary">Salary Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Branch Office</label>
                  <select
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="All">All Branches</option>
                    <option value="Chennai Central">Chennai Central</option>
                    <option value="Mumbai Fort">Mumbai Fort</option>
                    <option value="Bengaluru Indiranagar">Bengaluru Indiranagar</option>
                    <option value="Delhi Connaught Place">Delhi Connaught Place</option>
                    <option value="Hyderabad Banjara Hills">Hyderabad Banjara Hills</option>
                    <option value="Kolkata Park Street">Kolkata Park Street</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Open Dashboard</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted with 256-Bit SSL Banking Security Protocol</span>
          </div>
          <span className="text-slate-400">Academic Project</span>
        </div>
      </div>
    </div>
  );
};
