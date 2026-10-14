import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Server,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Shield,
  Lightbulb,
  MousePointerClick,
  Filter,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        setHealth(res);
      } catch (err) {
        setHealth({ status: 'offline', error: 'Backend unreachable' });
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Dashboard Guide, System Health & Help
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step instructions for using the dashboard, system diagnostics, and academic project information.
        </p>
      </div>

      {/* Beginner's Guide */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Quick Guide: How to Use This Dashboard in 4 Simple Steps
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold">
              1
            </div>
            <div className="font-bold text-slate-900 text-[13px]">Check the Top Numbers</div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              The 6 cards at the top show Total Transactions, Total Money, Average Amount, and Success Rate at a glance.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold">
              2
            </div>
            <div className="font-bold text-slate-900 text-[13px]">Filter What You Want</div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Use the top filter bar to pick specific dates, a single city branch, or payment modes like UPI or ATM cash.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold">
              3
            </div>
            <div className="font-bold text-slate-900 text-[13px]">Explore Pages</div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Click the sidebar menu to see Peak Hours, Payment Methods, Unusual Spikes, AI Forecasts, and Branch Comparisons.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold">
              4
            </div>
            <div className="font-bold text-slate-900 text-[13px]">Export & Save</div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Click "Download PDF Report" or export a CSV spreadsheet to open directly in Microsoft Excel or print.
            </p>
          </div>
        </div>
      </div>

      {/* Backend Status & Health Diagnostic */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-600" />
          Backend Server Health & Connection Diagnostic
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Connection Status</span>
            <div className="mt-1 flex items-center gap-1.5 font-bold">
              {health?.status === 'healthy' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700">Online & Calculating Fast</span>
                </>
              ) : (
                <span className="text-amber-600">Connecting to Python Server...</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase">FastAPI Analytics Engine</span>
            <div className="mt-1 font-mono font-bold text-slate-800">FastAPI v0.115+ (Python 3.14)</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase">API Endpoints Documentation</span>
            <div className="mt-1 font-bold text-blue-600 flex items-center gap-1">
              <a href="/docs" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                <span>OpenAPI Interactive Swagger</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Project Specifications */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Course Information: Advanced Data Visualization (ADVT)
        </h2>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
          <div>
            <span className="font-bold text-slate-900">Academic Subject:</span> Advanced Data Visualization (ADVT)
          </div>
          <div>
            <span className="font-bold text-slate-900">Project Focus:</span> Time-series visualizations, moving averages, statistical anomaly detection (MAD & IQR), chronological forecasting (Holt-Winters & ARIMA), and multi-channel banking intelligence.
          </div>
          <div>
            <span className="font-bold text-slate-900">Core Technologies:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600 ml-2">
              <li><b>Frontend:</b> React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts.</li>
              <li><b>Backend:</b> Python 3.14, FastAPI, Pandas, NumPy, SciPy, Statsmodels, ReportLab.</li>
              <li><b>R Programming Suite:</b> Standalone R scripts located in <code className="font-mono bg-slate-200 px-1 rounded">r-analysis/</code> using ggplot2, dplyr, lubridate, zoo, and forecast.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security and Ethics Governance */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          Data Privacy & Ethical Safeguards
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          This system is an academic analytical platform. No live banking credentials, personal customer identifiers, or proprietary banking accounts are ingested. All synthetic benchmarks are mathematically calibrated simulations generated using reproducible random seeds.
        </p>
      </div>
    </div>
  );
};
