import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  Clock,
  CreditCard,
  ShieldAlert,
  Sparkles,
  Building2,
  ArrowRight,
  Lock,
  Layers,
  ChevronRight,
  Activity,
  FileText,
  CheckCircle2,
  Users,
  Briefcase,
  User,
  Zap,
} from 'lucide-react';
import { useAuth, DEMO_BANK_ACCOUNTS } from '../context/AuthContext';
import { useFilters } from '../context/FilterContext';
import { UserAccount } from '../types/auth';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsAccount, setIsSignInModalOpen } = useAuth();
  const { setFilters, applyFilters } = useFilters();

  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserAccount>(DEMO_BANK_ACCOUNTS[0]);

  const handleLaunchWithAccount = (acc: UserAccount) => {
    loginAsAccount(acc);
    if (acc.accountType !== 'All') {
      setFilters((prev) => ({ ...prev, account_type: acc.accountType }));
    }
    if (acc.branch !== 'All') {
      setFilters((prev) => ({ ...prev, branch: acc.branch }));
    }
    applyFilters();
    navigate('/overview');
  };

  const featureTabs = [
    {
      title: 'Time-Series Smoothing',
      icon: TrendingUp,
      headline: '7-Day & 30-Day Moving Average Trajectories',
      description:
        'Isolate intra-week diurnal volatility from quarterly macroeconomic liquidity shifts using dual-layer rolling average filters and cumulative curves.',
      badge: 'Analytical Trends',
      gradient: 'from-blue-600 to-indigo-600',
    },
    {
      title: '24x7 Diurnal Heatmaps',
      icon: Clock,
      headline: 'Intra-Day Rush Hour Density by Actual Timestamps',
      description:
        'Map 168 weekly hourly bins to isolate core banking switch peak loads (12–2 PM lunch, 6–8 PM evening shopping) from quiet off-hours.',
      badge: 'Peak Velocity',
      gradient: 'from-teal-600 to-emerald-600',
    },
    {
      title: 'Statistical Anomaly Detection',
      icon: ShieldAlert,
      headline: 'Rolling Median Absolute Deviation (MAD) & IQR Fences',
      description:
        'Robust non-parametric outlier scoring that detects volatility surges and gateway timeouts without confusing unusual business transactions with fraud.',
      badge: 'Risk Surveillance',
      gradient: 'from-amber-600 to-rose-600',
    },
    {
      title: 'AI Time-Series Forecasting',
      icon: Sparkles,
      headline: 'Chronological Train/Test Backtesting for Next 14 Days',
      description:
        'Holt-Winters Exponential Smoothing, SARIMAX, and Seasonal Naive baselines tested on held-out days with zero forward-looking data leakage.',
      badge: 'Predictive Intelligence',
      gradient: 'from-purple-600 to-indigo-700',
    },
    {
      title: 'Multi-Branch Comparison',
      icon: Building2,
      headline: 'Regional Hub Benchmarks Across 6 Financial Centers',
      description:
        'Compare Mumbai Fort, Chennai Central, Bengaluru Indiranagar, Delhi Connaught Place, Hyderabad, and Kolkata on volume and ticket sizes.',
      badge: 'Geographic Operations',
      gradient: 'from-sky-600 to-blue-700',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070d1f] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#070d1f]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">
                  APEX<span className="text-teal-400">BANK</span>
                </span>
                <span className="text-[10px] font-bold bg-teal-950 text-teal-400 border border-teal-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ADVT Analytics
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Advanced Financial Time-Series Intelligence Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSignInModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Select Bank Account</span>
            </button>

            <button
              onClick={() => handleLaunchWithAccount(DEMO_BANK_ACCOUNTS[0])}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-teal-500/10 to-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-300 font-medium shadow-inner">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Academic Project: Advanced Data Visualization (ADVT)</span>
            <span className="text-slate-500">•</span>
            <span className="text-teal-400 font-bold">Python &bull; R &bull; React 19</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Banking Transaction <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-sky-400">
              Intelligence & Time-Series Analytics
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, interactive financial visualization platform. Analyze daily volume trends, discover peak hour traffic, detect unusual statistical spikes, and forecast upcoming transaction velocity.
          </p>

          {/* Direct CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleLaunchWithAccount(DEMO_BANK_ACCOUNTS[0])}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Enter Portal as Global Executive</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSignInModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>Choose Another Bank Account (5 Roles)</span>
            </button>
          </div>

          {/* Live Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Total Volume
              </span>
              <div className="text-2xl font-extrabold text-white mt-1">₹248.5 Cr</div>
              <p className="text-[11px] text-teal-400 mt-0.5 font-medium">+14.2% vs previous period</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" /> Transactions
              </span>
              <div className="text-2xl font-extrabold text-white mt-1">15,004</div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">100% verified records</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Success Rate
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">93.8%</div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Gateway clearance velocity</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" /> Bank Hubs
              </span>
              <div className="text-2xl font-extrabold text-white mt-1">6 Cities</div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Metro operations centers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Account Personas Showcase */}
      <section className="py-16 px-6 bg-[#0a1128]/80 border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 border border-teal-800/60 px-3 py-1 rounded-full">
              Personalized Banking Roles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In According to Your Bank Account Type
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each banking role features specialized clearance levels, tailored metric summaries, and automated filter matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {DEMO_BANK_ACCOUNTS.map((acc) => {
              const isSelected = selectedDemoRole.id === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedDemoRole(acc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left ${
                    isSelected
                      ? 'bg-slate-900 border-teal-400 shadow-xl shadow-teal-500/10 ring-1 ring-teal-400'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${acc.avatarColor} text-white flex items-center justify-center font-extrabold text-xs shadow-md`}
                      >
                        {acc.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {acc.accountNumber}
                      </span>
                    </div>

                    <div className="font-extrabold text-sm text-white">{acc.name}</div>
                    <div className="text-[11px] font-semibold text-teal-400 mt-0.5">
                      {acc.roleLabel.split('&')[0]}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      {acc.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchWithAccount(acc);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Sign In As {acc.role}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Feature Explorer Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950 border border-blue-800/60 px-3 py-1 rounded-full">
            Core Visualization Modules
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore Powerful Time-Series Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Click any capability below to preview what is inside the analytical dashboard:
          </p>
        </div>

        {/* Feature Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {featureTabs.map((f, idx) => {
            const Icon = f.icon;
            const isActive = activeFeature === idx;
            return (
              <button
                key={f.title}
                onClick={() => setActiveFeature(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{f.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Interactive Card */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-950 text-blue-400 border border-blue-800/60">
                {featureTabs[activeFeature].badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {featureTabs[activeFeature].headline}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {featureTabs[activeFeature].description}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => handleLaunchWithAccount(selectedDemoRole)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-md"
                >
                  <span>Open {featureTabs[activeFeature].title} View</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Icon Badge */}
            <div className="w-36 h-36 rounded-3xl bg-gradient-to-tr from-blue-700/30 to-teal-500/20 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
              {React.createElement(featureTabs[activeFeature].icon, {
                className: 'w-16 h-16 text-teal-400',
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-6 bg-[#040813] text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted with 256-Bit SSL Banking Security Protocol &bull; Academic Subject: Advanced Data Visualization</span>
        </div>
        <p className="text-[11px] text-slate-600">
          APEX Bank Intelligence Dashboard &bull; React 19 &bull; Python FastAPI &bull; R Programming Suite
        </p>
      </footer>
    </div>
  );
};
