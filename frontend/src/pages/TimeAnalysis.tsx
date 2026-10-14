import React, { useEffect, useState } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Sun,
  Activity,
  Layers,
  AlertCircle,
  HelpCircle,
  Flame,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api, formatINR, formatNumber } from '../services/api';
import { GlobalFilters } from '../components/GlobalFilters';

export const TimeAnalysis: React.FC = () => {
  const { appliedFilters, refreshTrigger } = useFilters();

  const [heatmapMetric, setHeatmapMetric] = useState<'count' | 'amount' | 'avg_amount'>('count');
  const [heatmapData, setHeatmapData] = useState<{ days: string[]; hours: number[]; matrix: any[]; max_value: number }>({
    days: [],
    hours: [],
    matrix: [],
    max_value: 1,
  });

  const [calYear, setCalYear] = useState(2025);
  const [calMonth, setCalMonth] = useState(5);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);

  const [weekdayData, setWeekdayData] = useState<any[]>([]);
  const [monthEndSegments, setMonthEndSegments] = useState<any[]>([]);
  const [decomposition, setDecomposition] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hmRes, calRes, wdRes, meRes, decompRes] = await Promise.all([
          api.getTimeHeatmap(heatmapMetric, appliedFilters),
          api.getCalendarHeatmap(calYear, calMonth, 'count', appliedFilters),
          api.getWeekdayComparison(appliedFilters),
          api.getMonthEndAnalysis(appliedFilters),
          api.getSeasonality('count', appliedFilters),
        ]);

        setHeatmapData(hmRes);
        setCalendarDays(calRes.days);
        setWeekdayData(wdRes.weekdays);
        setMonthEndSegments(meRes.segments);
        setDecomposition(decompRes);
      } catch (err) {
        console.error('Error fetching time analysis data:', err);
      }
    };

    fetchData();
  }, [appliedFilters, heatmapMetric, calYear, calMonth, refreshTrigger]);

  const getCellBg = (val: number, maxVal: number) => {
    if (!val || val === 0) return '#f8fafc';
    const intensity = Math.min(1, val / (maxVal || 1));
    if (intensity < 0.25) return '#e0f2fe';
    if (intensity < 0.5) return '#7dd3fc';
    if (intensity < 0.75) return '#38bdf8';
    return '#0284c7';
  };

  return (
    <div className="space-y-6">
      <GlobalFilters />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          When Do Customers Bank the Most? (Time Analysis)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Find out what hours of the day are super busy, which days of the week have the most traffic, and how month-end paydays impact volume.
        </p>
      </div>

      {/* Section A: Hour of Day x Day of Week Heatmap */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Busy Hours Heatmap (24 Hours &times; 7 Days of the Week)
            </h2>
            <p className="text-xs text-slate-500">
              Darker blue boxes mean heavier customer rush (Hover over any square to see details)
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setHeatmapMetric('count')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                heatmapMetric === 'count' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Number of Transactions
            </button>
            <button
              onClick={() => setHeatmapMetric('amount')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                heatmapMetric === 'amount' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Total Money (₹)
            </button>
            <button
              onClick={() => setHeatmapMetric('avg_amount')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                heatmapMetric === 'avg_amount' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Average Amount
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px]">
            {/* Hour header */}
            <div className="grid grid-cols-[90px_repeat(24,1fr)] gap-1 text-[10px] font-bold text-slate-500 mb-1.5 text-center">
              <div className="text-left pl-2">Day \ Hour</div>
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h}>{h}:00</div>
              ))}
            </div>

            {/* Matrix rows */}
            {heatmapData.matrix.map((row) => (
              <div key={row.day} className="grid grid-cols-[90px_repeat(24,1fr)] gap-1 mb-1 items-center">
                <div className="text-xs font-bold text-slate-700 pl-2 truncate">{row.day}</div>
                {row.values.map((v: number, h: number) => {
                  const bg = getCellBg(v, heatmapData.max_value);
                  const isDark = v / (heatmapData.max_value || 1) > 0.6;
                  return (
                    <div
                      key={h}
                      title={`${row.day} at ${h}:00: ${heatmapMetric === 'count' ? `${v} transactions` : formatINR(v)}`}
                      style={{ backgroundColor: bg }}
                      className={`h-8 rounded-lg flex items-center justify-center text-[9px] font-mono transition-transform hover:scale-110 hover:shadow-md cursor-pointer ${
                        isDark ? 'text-white font-bold' : 'text-slate-700'
                      }`}
                    >
                      {v > 0 ? (heatmapMetric === 'count' ? v : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v) : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1 text-slate-400">
            <Info className="w-3.5 h-3.5" /> Notice how traffic surges around lunch (12–2 PM) and after work (6–8 PM).
          </span>
          <div className="flex items-center gap-1.5">
            <span>Quiet (Few)</span>
            <div className="flex gap-1">
              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#f8fafc' }} />
              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#e0f2fe' }} />
              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#7dd3fc' }} />
              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#38bdf8' }} />
              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#0284c7' }} />
            </div>
            <span className="font-semibold text-slate-700">Super Busy (Peak)</span>
          </div>
        </div>
      </div>

      {/* Section B & C: Calendar Heatmap & Weekday Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Heatmap */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-teal-600" />
                Monthly Calendar Activity
              </h2>
              <p className="text-xs text-slate-500">Pick any month to see which days had the most activity</p>
            </div>

            <div className="flex items-center gap-2 font-semibold">
              <select
                value={calMonth}
                onChange={(e) => setCalMonth(Number(e.target.value))}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2025, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={calYear}
                onChange={(e) => setCalYear(Number(e.target.value))}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-[10px] font-bold text-slate-400 uppercase py-1">
                {d}
              </div>
            ))}
            {calendarDays.map((cd) => (
              <div
                key={cd.date}
                title={`${cd.date}: ${cd.count} transactions, Total: ${formatINR(cd.amount)}`}
                className={`p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between h-14 transition-all hover:scale-105 cursor-pointer ${
                  cd.count > 0
                    ? 'bg-blue-50/80 border-blue-200 hover:border-blue-400 hover:shadow-xs'
                    : 'bg-slate-50 border-slate-100 opacity-50'
                }`}
              >
                <span className="text-[10px] font-extrabold text-slate-700">{cd.day_number}</span>
                <span className="text-[10px] font-bold text-blue-700 truncate">
                  {cd.count > 0 ? `${cd.count} txns` : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekday Aggregated Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Which Day of the Week Is Busiest?
            </h2>
            <p className="text-xs text-slate-500">Total customer transaction count from Monday to Sunday</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => v.slice(0, 3)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any, name: any) => [
                    name === 'count' ? `${formatNumber(Number(val))} transactions` : formatINR(Number(val)),
                    name === 'count' ? 'Total Transactions' : 'Total Money',
                  ]}
                />
                <Bar dataKey="count" name="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section D: Month-End Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Salary & Bill Payment Rush (Month-End vs. Mid-Month vs. Beginning)
          </h2>
          <p className="text-xs text-slate-500">
            Does the bank experience a surge when salaries are deposited at month-end?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {monthEndSegments.map((seg) => (
            <div key={seg.segment} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-xs font-extrabold text-slate-800">{seg.segment}</span>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {formatINR(seg.total_amount)}
              </div>
              <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
                <span>{formatNumber(seg.count)} transactions</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {seg.pct_of_total_count}% of all volume
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-xs text-slate-500">
                Average spent per transaction:{' '}
                <span className="font-bold text-slate-800">{formatINR(seg.avg_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section E: Seasonal Decomposition */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            Pattern Breakdown: Long-Term Trend vs. Weekly Habits
          </h2>
          <p className="text-xs text-slate-500">
            Separates the numbers into the underlying trend line and the recurring 7-day weekly habit cycle
          </p>
        </div>

        {decomposition?.available ? (
          <div className="space-y-5">
            <div className="h-56">
              <p className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                1. Underlying Trend (Smoothed Long-Term Growth Direction)
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={decomposition.components} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                  <Line type="monotone" dataKey="observed" stroke="#cbd5e1" strokeWidth={1} dot={false} name="Actual Daily" />
                  <Line type="monotone" dataKey="trend" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Trend" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="h-44">
              <p className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                2. Weekly Habits (Repeats Every 7 Days)
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={decomposition.components} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                  <Line type="monotone" dataKey="seasonal" stroke="#0d9488" strokeWidth={2} dot={false} name="Weekly Habit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>{decomposition?.reason || 'Select at least 14 days of data to see the pattern breakdown.'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
