import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Sliders,
  FileDown,
  Info,
  CheckCircle,
  AlertTriangle,
  Search,
  Sparkles,
  HelpCircle,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api, formatINR, formatNumber } from '../services/api';
import { AnomalyRecord } from '../types';
import { GlobalFilters } from '../components/GlobalFilters';

export const AnomalyAnalysis: React.FC = () => {
  const { appliedFilters, refreshTrigger } = useFilters();

  const [metric, setMetric] = useState<'amount' | 'count'>('amount');
  const [aggregation, setAggregation] = useState<'daily' | 'weekly'>('daily');
  const [method, setMethod] = useState<'mad' | 'iqr' | 'residual'>('mad');
  const [threshold, setThreshold] = useState<number>(3.0);
  const [rollingWindow, setRollingWindow] = useState<number>(14);

  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [totalObs, setTotalObs] = useState<number>(0);
  const [anomalyCount, setAnomalyCount] = useState<number>(0);
  const [normalCount, setNormalCount] = useState<number>(0);
  const [anomalyPct, setAnomalyPct] = useState<number>(0);
  const [tableSearch, setTableSearch] = useState<string>('');

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await api.detectAnomalies({
          metric,
          aggregation,
          method,
          threshold,
          rolling_window: rollingWindow,
          start_date: appliedFilters.start_date,
          end_date: appliedFilters.end_date,
          transaction_type: appliedFilters.transaction_type,
          branch: appliedFilters.branch,
        });

        setSeriesData(res.series);
        setAnomalies(res.anomalies);
        setTotalObs(res.total_observations);
        setAnomalyCount(res.anomaly_count);
        setNormalCount(res.normal_count);
        setAnomalyPct(res.anomaly_percentage);
      } catch (err) {
        console.error('Error detecting anomalies:', err);
      }
    };

    fetchAnomalies();
  }, [appliedFilters, metric, aggregation, method, threshold, rollingWindow, refreshTrigger]);

  const handleExportCsv = () => {
    const url = api.getExportAnomaliesUrl(method, threshold, metric);
    window.open(url, '_blank');
  };

  const filteredTableAnomalies = anomalies.filter(
    (a) =>
      a.date.includes(tableSearch) ||
      a.explanation.toLowerCase().includes(tableSearch.toLowerCase()) ||
      a.method.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <GlobalFilters />

      {/* Control Header & Parameters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Unusual Activity Detector (Spikes & Outliers)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automatically flags days when customer transaction counts or money totals were unusually higher or lower than normal.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 shrink-0"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Outlier Log (CSV)</span>
          </button>
        </div>

        {/* Clear Fraud Distinction Banner */}
        <div className="mt-4 p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-extrabold text-amber-900">
              Important: Statistical Outlier does NOT mean Fraud!
            </span>
            <p className="mt-0.5 text-amber-900">
              When a day is highlighted with a red dot, it simply means that the total number or money value was much bigger than usual (for example, financial year-end on March 31 or festival shopping). It is an automatic flag for bank staff to inspect, not proof of criminal fraud.
            </p>
          </div>
        </div>

        {/* Interactive Method Controls */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 pt-4 border-t border-slate-100 text-xs font-semibold">
          {/* Metric */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Look For Spikes In:</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium cursor-pointer"
            >
              <option value="amount">Total Money Handled (₹)</option>
              <option value="count">Number of Transactions</option>
            </select>
          </div>

          {/* Aggregation */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Time Grouping:</label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium cursor-pointer"
            >
              <option value="daily">Day by Day</option>
              <option value="weekly">Weekly Totals</option>
            </select>
          </div>

          {/* Method */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Detection Logic:</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium cursor-pointer"
            >
              <option value="mad">Rolling Median (Recommended)</option>
              <option value="iqr">Boxplot Range (IQR Rule)</option>
              <option value="residual">Sudden Shift from 7-Day Trend</option>
            </select>
          </div>

          {/* Threshold */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-600">Sensitivity Level</label>
              <span className="font-mono text-blue-600 font-extrabold">{threshold}x</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="4.5"
              step="0.25"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>Very Sensitive</span>
              <span>Normal</span>
              <span>Only Big Spikes</span>
            </div>
          </div>

          {/* Rolling Window */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Lookback History (Days)</label>
            <input
              type="number"
              min="5"
              max="60"
              value={rollingWindow}
              disabled={method === 'iqr'}
              onChange={(e) => setRollingWindow(parseInt(e.target.value) || 14)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium disabled:opacity-40"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Days Checked</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{totalObs.toLocaleString()} periods</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Continuous timeline analyzed</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Normal Activity Days</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">{normalCount.toLocaleString()} periods</div>
          <p className="text-[10px] text-emerald-600 mt-0.5">Within expected daily boundaries</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs border-l-4 border-l-rose-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Unusual Spikes Flagged</span>
          <div className="text-xl font-extrabold text-rose-600 mt-1">{anomalyCount} observations</div>
          <p className="text-[10px] text-rose-500 mt-0.5">Surpassed sensitivity threshold</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Spike Percentage</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1">{anomalyPct}% of days</div>
          <p className="text-[10px] text-amber-600 mt-0.5">Mathematical outlier ratio</p>
        </div>
      </div>

      {/* Chart: Time-Series with Highlighted Anomaly Dots */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            Visual Timeline with Red Dots for Flagged Spikes
          </h2>
          <p className="text-xs text-slate-500">
            Blue line: Actual observed activity &bull; Teal dashed line: Expected baseline &bull; Red dots: Flagged unusual spikes
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={seriesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => v.slice(5)} />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                tickFormatter={(v) => (metric === 'amount' ? formatINR(v) : formatNumber(v))}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                formatter={(val: any, name: any) => [
                  metric === 'amount' ? formatINR(Number(val)) : `${formatNumber(Number(val))} txns`,
                  name === 'observed' ? 'Actual Observed' : 'Expected Baseline'
                ]}
              />
              <Line
                type="monotone"
                dataKey="observed"
                name="Actual Activity"
                stroke="#3b82f6"
                strokeWidth={1.8}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.is_anomaly) {
                    return (
                      <circle
                        key={`anom-${payload.date}`}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="baseline"
                name="Expected Normal"
                stroke="#0d9488"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly Inspection Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              List of Flagged Unusual Days ({filteredTableAnomalies.length} found)
            </h2>
            <p className="text-xs text-slate-500">
              Clear explanation of why each day was flagged and how much it differed from ordinary days
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search date or reason..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl w-60 bg-slate-50/60 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">What Actually Happened</th>
                <th className="py-3 px-4 text-right">Normal Expectation</th>
                <th className="py-3 px-4 text-center">Spike Score</th>
                <th className="py-3 px-4">Method Used</th>
                <th className="py-3 px-4">Simple Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTableAnomalies.length > 0 ? (
                filteredTableAnomalies.map((anom, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/90 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {anom.date}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                      {metric === 'amount' ? formatINR(anom.observed) : formatNumber(anom.observed)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-medium">
                      {metric === 'amount' ? formatINR(anom.baseline) : formatNumber(anom.baseline)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[11px]">
                        {anom.deviation_score}x higher
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-semibold">
                      {anom.method}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs leading-relaxed max-w-md">
                      {anom.explanation}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    No unusual spikes found at the current sensitivity setting ({threshold}x).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
