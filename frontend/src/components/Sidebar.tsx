import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Clock,
  CreditCard,
  ShieldAlert,
  Sparkles,
  Building2,
  FolderUp,
  FileDown,
  HelpCircle,
  Landmark,
  X,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    path: '/welcome',
    label: 'Welcome Portal',
    desc: 'Bank account roles & intro',
    icon: Landmark,
    badge: 'Portal',
  },
  {
    path: '/overview',
    label: 'Dashboard Home',
    desc: 'Quick summary & main charts',
    icon: LayoutDashboard,
    badge: 'Main',
  },
  {
    path: '/trends',
    label: 'Trends & Habits',
    desc: 'Daily, weekly & monthly changes',
    icon: TrendingUp,
  },
  {
    path: '/time-analysis',
    label: 'Peak Hours & Days',
    desc: 'When people transact most',
    icon: Clock,
  },
  {
    path: '/payment-analytics',
    label: 'UPI, Cards & ATM',
    desc: 'How customers pay & failure rates',
    icon: CreditCard,
  },
  {
    path: '/anomalies',
    label: 'Unusual Activity',
    desc: 'Sudden spikes & big amounts',
    icon: ShieldAlert,
    badge: 'Smart',
  },
  {
    path: '/forecasting',
    label: 'Future Forecast',
    desc: 'Predict next 7 to 30 days',
    icon: Sparkles,
  },
  {
    path: '/branches',
    label: 'Branch Comparison',
    desc: 'City & branch performance',
    icon: Building2,
  },
  {
    path: '/dataset-explorer',
    label: 'Upload & Data Files',
    desc: 'Import CSV & check data health',
    icon: FolderUp,
  },
  {
    path: '/reports',
    label: 'Download Reports',
    desc: 'Save PDF & Excel/CSV files',
    icon: FileDown,
  },
  {
    path: '/settings',
    label: 'Help & System Info',
    desc: 'Guide & connection status',
    icon: HelpCircle,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0a1128] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/80 bg-[#070d1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-teal-400 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white tracking-tight text-base">
                  APEX<span className="text-teal-400">BANK</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Banking Intelligence Made Simple
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick helper badge */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Platform Mode:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live & Active
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-400 group-hover:text-teal-300 group-hover:bg-slate-700/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-[13px] leading-tight truncate">
                          {item.label}
                        </div>
                        <div
                          className={`text-[10px] leading-tight truncate mt-0.5 ${
                            isActive ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {item.badge ? (
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ml-1.5 ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-teal-950 text-teal-400 border border-teal-800/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-600 group-hover:translate-x-0.5 group-hover:text-slate-400'
                        }`}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-4 m-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-slate-200 font-semibold">
            <span>💡 Need Help?</span>
            <span className="text-[10px] text-teal-400 font-mono">Academic ADVT</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            All charts update instantly when you change filters at the top of any page.
          </p>
        </div>
      </aside>
    </>
  );
};
