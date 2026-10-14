import React, { useEffect, useState } from 'react';
import {
  Building2,
  Sliders,
  ArrowUpDown,
  Grid,
  TrendingUp,
  MapPin,
  HelpCircle,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
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

const BRANCH_COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const BranchComparison: React.FC = () => {
  const { appliedFilters, refreshTrigger } = useFilters();

  const [sortBy, setSortBy] = useState<'total_amount' | 'count' | 'avg_amount' | 'success_rate'>('total_amount');
  const [branchMetrics, setBranchMetrics] = useState<any[]>([]);
  const [monthlyHeatmap, setMonthlyHeatmap] = useState<any[]>([]);
  const [heatmapMonths, setHeatmapMonths] = useState<string[]>([]);
  const [branchTimeline, setBranchTimeline] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getBranchComparison(appliedFilters, sortBy);
        setBranchMetrics(res.branch_metrics);
        setMonthlyHeatmap(res.monthly_heatmap);
        setHeatmapMonths(res.heatmap_months);
        setBranchTimeline(res.branch_timeline);
        setScatterData(res.scatter_data);
        setAvailableBranches(res.available_branches);
      } catch (err) {
        console.error('Error fetching branch comparisons:', err);
      }
    };

    fetchData();
  }, [appliedFilters, sortBy, refreshTrigger]);

  const maxHeatmapVal = Math.max(
    ...monthlyHeatmap.flatMap((row) => row.values),
    1
  );

  const getHeatmapColor = (val: number) => {
    if (!val || val === 0) return '#f8fafc';
    const ratio = Math.min(1, val / maxHeatmapVal);
    if (ratio < 0.25) return '#dbeafe';
    if (ratio < 0.5) return '#93c5fd';
    if (ratio < 0.75) return '#3b82f6';
    return '#1d4ed8';
  };

  return (
    <div className="space-y-6">
      <GlobalFilters />

      {/* Control Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Branch Performance: Compare Cities & Offices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare transaction numbers, total money handled, average ticket size, and success reliability across branches.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Order Branches By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold cursor-pointer"
          >
            <option value="total_amount">Total Money Handled (₹)</option>
            <option value="count">Number of Transactions</option>
            <option value="avg_amount">Average Amount per Txn</option>
            <option value="success_rate">Success Rate (%)</option>
          </select>
        </div>
      </div>

      {/* Branch Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {branchMetrics.map((b, idx) => (
          <div
            key={b.branch}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-bold text-slate-800 truncate" title={b.branch}>
                  {b.branch}
                </span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRANCH_COLORS[idx % BRANCH_COLORS.length] }} />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatINR(b.total_amount)}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                {formatNumber(b.count)} transactions ({b.pct_of_total_count}%)
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Success:</span>
              <span className="font-bold text-emerald-600">{b.success_rate}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart 1: Branch Comparison Bar Chart & Branch Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Total Money Processed by Branch
            </h2>
            <p className="text-xs text-slate-500">Comparison of total funds passing through each regional office</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchMetrics} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="branch" tick={{ fontSize: 9, fill: '#64748b' }} angle={-20} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => formatINR(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [formatINR(Number(val)), 'Total Handled']}
                />
                <Bar dataKey="total_amount" name="Total Money (₹)" radius={[6, 6, 0, 0]}>
                  {branchMetrics.map((_, i) => (
                    <Cell key={`bar-${i}`} fill={BRANCH_COLORS[i % BRANCH_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Time-Series Progression */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Branch Growth Lines Over Time
            </h2>
            <p className="text-xs text-slate-500">Track how each branch is progressing week by week</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={branchTimeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => formatINR(v)} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                {availableBranches.map((bName, idx) => (
                  <Line
                    key={bName}
                    type="monotone"
                    dataKey={bName}
                    stroke={BRANCH_COLORS[idx % BRANCH_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={bName}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 2: Branch-by-Month Heatmap & Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-by-Month Heatmap */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-600" />
              Monthly Volume Calendar by Branch
            </h2>
            <p className="text-xs text-slate-500">Darker blue indicates higher money volume processed that month</p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[130px_repeat(12,1fr)] gap-1 text-[10px] font-bold text-slate-500 mb-1.5 text-center">
                <div className="text-left pl-2">Branch \ Month</div>
                {heatmapMonths.map((m) => (
                  <div key={m}>{m.slice(0, 3)}</div>
                ))}
              </div>

              {monthlyHeatmap.map((row) => (
                <div key={row.branch} className="grid grid-cols-[130px_repeat(12,1fr)] gap-1 mb-1 items-center">
                  <div className="text-xs font-bold text-slate-700 pl-2 truncate" title={row.branch}>
                    {row.branch}
                  </div>
                  {row.values.map((v: number, mIdx: number) => {
                    const bg = getHeatmapColor(v);
                    const isDark = v / maxHeatmapVal > 0.55;
                    return (
                      <div
                        key={mIdx}
                        title={`${row.branch} (${heatmapMonths[mIdx]}): ${formatINR(v)}`}
                        style={{ backgroundColor: bg }}
                        className={`h-7 rounded-lg flex items-center justify-center text-[9px] font-mono cursor-pointer transition-transform hover:scale-105 ${
                          isDark ? 'text-white font-bold' : 'text-slate-800'
                        }`}
                      >
                        {v > 0 ? (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`) : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scatter Plot: Volume vs. Average Ticket Size */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              Volume vs. Average Amount: Who Does What?
            </h2>
            <p className="text-xs text-slate-500">
              Top-Right: High volume + High value &bull; Bottom-Right: Busy with lots of small payments
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="count"
                  name="Transaction Count"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => formatNumber(v)}
                />
                <YAxis
                  type="number"
                  dataKey="avg_amount"
                  name="Avg Amount"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => formatINR(v)}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }: any) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1 shadow-xl">
                          <div className="font-extrabold text-teal-400 text-sm">{data.branch}</div>
                          <div>Total Transactions: {formatNumber(data.count)}</div>
                          <div>Average Amount per Txn: {formatINR(data.avg_amount)}</div>
                          <div>Total Money: {formatINR(data.total_amount)}</div>
                          <div>Success Rate: {data.success_rate}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Branches" data={scatterData} fill="#2563eb">
                  {scatterData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BRANCH_COLORS[index % BRANCH_COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
