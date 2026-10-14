import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Smartphone,
  Landmark,
  Banknote,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api, formatINR, formatNumber } from '../services/api';
import { GlobalFilters } from '../components/GlobalFilters';

const MODE_COLORS: Record<string, string> = {
  UPI: '#2563eb',
  'Debit Card': '#0d9488',
  'Credit Card': '#8b5cf6',
  ATM: '#f59e0b',
  'Bank Transfer': '#ec4899',
};

const MODE_DESCRIPTIONS: Record<string, string> = {
  UPI: 'Google Pay, PhonePe, Paytm (Fast mobile payments)',
  'Debit Card': 'Swiped in stores or online purchases',
  'Credit Card': 'Credit card swipes & monthly bill payments',
  ATM: 'Physical cash withdrawals from ATM kiosks',
  'Bank Transfer': 'NEFT / RTGS / IMPS (Large business or account transfers)',
};

export const PaymentAnalytics: React.FC = () => {
  const { appliedFilters, refreshTrigger } = useFilters();

  const [modesSummary, setModesSummary] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [statusTimeline, setStatusTimeline] = useState<any[]>([]);
  const [availableModes, setAvailableModes] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'count' | 'amount'>('count');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getPaymentAnalytics(appliedFilters);
        setModesSummary(res.modes_summary);
        setTimeline(res.timeline);
        setStatusTimeline(res.status_timeline);
        setAvailableModes(res.available_modes);
      } catch (err) {
        console.error('Error fetching payment analytics:', err);
      }
    };

    fetchData();
  }, [appliedFilters, refreshTrigger]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'UPI':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'ATM':
        return <Banknote className="w-4 h-4 text-amber-600" />;
      case 'Bank Transfer':
        return <Landmark className="w-4 h-4 text-pink-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <GlobalFilters />

      {/* Header & Metric Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Payment Methods: How Customers Transact & Failure Rates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare UPI apps, Debit/Credit Cards, ATM cash, and Bank Transfers. Track which payment rail is most reliable.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSelectedMetric('count')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMetric === 'count' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            By Transaction Count
          </button>
          <button
            onClick={() => setSelectedMetric('amount')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMetric === 'amount' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            By Money (₹ INR)
          </button>
        </div>
      </div>

      {/* Payment Modes Cards with plain English descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {modesSummary.map((m) => (
          <div
            key={m.mode}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs border-t-4 flex flex-col justify-between"
            style={{ borderTopColor: MODE_COLORS[m.mode] || '#2563eb' }}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  {getModeIcon(m.mode)}
                  <span>{m.mode}</span>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                  {m.pct_of_volume}% volume
                </span>
              </div>

              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatINR(m.total_amount)}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                {formatNumber(m.count)} transactions
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                {MODE_DESCRIPTIONS[m.mode] || 'Digital clearing method'}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Success Rate:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  m.success_rate >= 90
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {m.success_rate}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart 1: Stacked Area Chart of Payment Activity */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Which Payment Methods Are Growing the Fastest? (Area Over Time)
          </h2>
          <p className="text-xs text-slate-500">
            Stacked view showing the share of UPI, Cards, ATM, and Bank Transfers over continuous time
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                tickFormatter={(v) => (selectedMetric === 'amount' ? formatINR(v) : formatNumber(v))}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                formatter={(val: any, name: any) => [
                  selectedMetric === 'amount' ? formatINR(Number(val)) : `${formatNumber(Number(val))} txns`,
                  name.replace('_count', '').replace('_amount', '')
                ]}
              />
              {availableModes.map((mode) => (
                <Area
                  key={mode}
                  type="monotone"
                  dataKey={`${mode}_${selectedMetric}`}
                  stackId="1"
                  stroke={MODE_COLORS[mode] || '#2563eb'}
                  fill={MODE_COLORS[mode] || '#2563eb'}
                  fillOpacity={0.65}
                  name={mode}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Success vs. Failed Timeline & Average Transaction Value Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success vs Failure Trends */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Did Payments Succeed or Fail? (Gateway Health Tracking)
            </h2>
            <p className="text-xs text-slate-500">
              Red line spikes indicate bank server downtime or gateway network timeout events
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statusTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="Successful" stroke="#16a34a" strokeWidth={2.2} dot={false} name="Successful" />
                <Line type="monotone" dataKey="Failed" stroke="#dc2626" strokeWidth={2.5} dot={false} name="Failed (Errors)" />
                <Line type="monotone" dataKey="Pending" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Pending (Processing)" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Transaction Value by Mode */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600" />
              Typical Amount Spent per Transaction
            </h2>
            <p className="text-xs text-slate-500">
              UPI has small frequent amounts (groceries/tea), while Bank Transfers handle large business sums
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modesSummary} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mode" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => formatINR(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [formatINR(Number(val)), 'Average Ticket Size']}
                />
                <Bar dataKey="avg_amount" name="Average Amount (₹)" radius={[6, 6, 0, 0]}>
                  {modesSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MODE_COLORS[entry.mode] || '#2563eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
