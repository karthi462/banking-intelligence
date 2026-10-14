import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Info,
  Calendar,
  Layers,
  ArrowRightLeft,
  Wallet,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api, formatINR, formatNumber } from '../services/api';
import { DailyTrendPoint } from '../types';
import { GlobalFilters } from '../components/GlobalFilters';

export const TransactionTrends: React.FC = () => {
  const { appliedFilters, refreshTrigger } = useFilters();

  const [metric, setMetric] = useState<'count' | 'amount'>('amount');
  const [aggregation, setAggregation] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [show7dMA, setShow7dMA] = useState(true);
  const [show30dMA, setShow30dMA] = useState(true);

  const [dailyData, setDailyData] = useState<DailyTrendPoint[]>([]);
  const [has30dMA, setHas30dMA] = useState(false);
  const [aggData, setAggData] = useState<any[]>([]);
  const [typeComparison, setTypeComparison] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const [dailyRes, aggRes] = await Promise.all([
          api.getDailyTrends(appliedFilters),
          api.getTrendAggregations(aggregation, appliedFilters),
        ]);

        setDailyData(dailyRes.daily_data);
        setHas30dMA(dailyRes.summary.has_30d_ma);
        setAggData(aggRes.aggregations);
        setTypeComparison(aggRes.type_comparison);
      } catch (err) {
        console.error('Error fetching trend analytics:', err);
      }
    };

    fetchTrends();
  }, [appliedFilters, aggregation, refreshTrigger]);

  return (
    <div className="space-y-6">
      <GlobalFilters />

      {/* Control Header & Friendly Explanation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Trends & Customer Habits Over Time
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              See whether transaction volumes are climbing or dropping, and spot monthly and weekly habits.
            </p>
          </div>

          {/* Interactive Controls with friendly labels */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Metric Switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setMetric('amount')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  metric === 'amount'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-teal-600" />
                <span>Show Money (₹)</span>
              </button>
              <button
                onClick={() => setMetric('count')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  metric === 'count'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                <span>Show Count</span>
              </button>
            </div>

            {/* Aggregation Switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['daily', 'weekly', 'monthly'] as const).map((agg) => (
                <button
                  key={agg}
                  onClick={() => setAggregation(agg)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    aggregation === agg
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {agg === 'daily' ? 'Day by Day' : agg === 'weekly' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Friendly explanation card */}
        <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Why use 7-Day & 30-Day Lines?</span> Daily numbers always bounce around (fewer people bank on Sundays, and many transact on Friday evenings). The smooth 7-day line washes out this weekend noise, while the 30-day line shows the overarching monthly direction.
          </div>
        </div>
      </div>

      {/* Chart 1: Temporal Progression with Moving Averages */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              {aggregation === 'daily'
                ? `Daily Movement & Smooth Trend Lines (${metric === 'amount' ? 'Money in ₹' : 'Transaction Count'})`
                : `${aggregation === 'weekly' ? 'Weekly Totals' : 'Monthly Totals'} Overview`}
            </h2>
            <p className="text-xs text-slate-500">
              {aggregation === 'daily'
                ? 'Actual daily points alongside smooth trend lines'
                : `Combined total across each ${aggregation === 'weekly' ? 'week' : 'month'}`}
            </p>
          </div>

          {aggregation === 'daily' && (
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={show7dMA}
                  onChange={(e) => setShow7dMA(e.target.checked)}
                  className="rounded text-blue-600 cursor-pointer"
                />
                <span>7-Day Line</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={show30dMA}
                  disabled={!has30dMA}
                  onChange={(e) => setShow30dMA(e.target.checked)}
                  className="rounded text-teal-600 cursor-pointer disabled:opacity-40"
                />
                <span className={!has30dMA ? 'text-slate-400' : ''}>
                  30-Day Line {!has30dMA && '(Needs 30+ days)'}
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="h-72">
          {aggregation === 'daily' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  tickFormatter={(v) => (metric === 'amount' ? formatINR(v) : formatNumber(v))}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [metric === 'amount' ? formatINR(Number(val)) : `${formatNumber(Number(val))} txns`, '']}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  name="Daily Actual"
                  stroke="#94a3b8"
                  strokeWidth={1.2}
                  dot={false}
                  opacity={show7dMA || show30dMA ? 0.35 : 0.9}
                />
                {show7dMA && (
                  <Line
                    type="monotone"
                    dataKey={metric === 'amount' ? 'ma_7_amount' : 'ma_7_count'}
                    name="7-Day Smooth Line"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                  />
                )}
                {show30dMA && has30dMA && (
                  <Line
                    type="monotone"
                    dataKey={metric === 'amount' ? 'ma_30_amount' : 'ma_30_count'}
                    name="30-Day Smooth Line"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                )}
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  tickFormatter={(v) => (metric === 'amount' ? formatINR(v) : formatNumber(v))}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [metric === 'amount' ? formatINR(Number(val)) : `${formatNumber(Number(val))} txns`, 'Total']}
                />
                <Bar
                  dataKey={metric === 'amount' ? 'total_amount' : 'count'}
                  name={metric === 'amount' ? 'Total Money (₹)' : 'Total Transactions'}
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2: Cumulative Curve & Deposit vs Withdrawal Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Transaction Value Area Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Total Money Accumulated Over Time (Running Total)
            </h2>
            <p className="text-xs text-slate-500">
              Shows how total transaction volume grows day by day like a piggy bank
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumAmountGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => formatINR(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [formatINR(Number(val)), 'Total Handled Up to This Date']}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative_amount"
                  stroke="#1d4ed8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cumAmountGrad)"
                  name="Cumulative Value (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deposit vs Withdrawal Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-purple-600" />
              Deposit vs. Withdrawal vs. Transfer Lines
            </h2>
            <p className="text-xs text-slate-500">
              Are customers depositing more cash, withdrawing, or sending transfers?
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={typeComparison} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => formatINR(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                />
                <Line type="monotone" dataKey="Deposit_amount" name="Deposits (Cash In)" stroke="#16a34a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Withdrawal_amount" name="Withdrawals (Cash Out)" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Transfer_amount" name="Bank Transfers" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Payment_amount" name="Bill Payments" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
