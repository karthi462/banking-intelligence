import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Info,
  Calendar,
  HelpCircle,
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
  Area,
  ComposedChart,
} from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api, formatINR, formatNumber } from '../services/api';
import { ForecastResponse } from '../types';
import { GlobalFilters } from '../components/GlobalFilters';

export const Forecasting: React.FC = () => {
  const { appliedFilters, refreshTrigger } = useFilters();

  const [metric, setMetric] = useState<'count' | 'amount'>('count');
  const [model, setModel] = useState<'seasonal_naive' | 'exponential_smoothing' | 'arima'>('exponential_smoothing');
  const [horizon, setHorizon] = useState<number>(14);
  const [testSplit, setTestSplit] = useState<number>(14);

  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await api.getForecast({
          metric,
          model,
          horizon,
          start_date: appliedFilters.start_date,
          end_date: appliedFilters.end_date,
          test_split_days: testSplit,
        });
        setForecastData(res);
      } catch (err) {
        console.error('Error calculating forecast:', err);
      }
    };

    fetchForecast();
  }, [appliedFilters, metric, model, horizon, testSplit, refreshTrigger]);

  const combinedChartData: any[] = [];
  if (forecastData?.available && forecastData.historical) {
    forecastData.historical.forEach((h) => {
      combinedChartData.push({
        date: h.date,
        actual: h.actual,
        split: h.split,
      });
    });

    if (forecastData.forecast) {
      forecastData.forecast.forEach((f) => {
        combinedChartData.push({
          date: f.date,
          forecast: f.forecast,
          lower_bound: f.lower_bound,
          upper_bound: f.upper_bound,
        });
      });
    }
  }

  const evalMetrics = forecastData?.evaluation;

  return (
    <div className="space-y-6">
      <GlobalFilters />

      {/* Control Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Future Forecast: What Will Next Week Look Like?
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Uses historical recurring habits (weekdays, weekends, and month-end paydays) to project transaction volume into the upcoming days.
            </p>
          </div>
        </div>

        {/* Model and Horizon Selection */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100 text-xs font-semibold">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">What to Predict?</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium cursor-pointer"
            >
              <option value="count">Daily Transaction Count</option>
              <option value="amount">Daily Total Money (₹ INR)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">AI Prediction Method</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium cursor-pointer"
            >
              <option value="exponential_smoothing">Holt-Winters (Accounts for weekly cycles)</option>
              <option value="arima">ARIMA Model (Mathematical statistical series)</option>
              <option value="seasonal_naive">Simple Repeat (Same day last week)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">How Far Ahead to Look?</label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium cursor-pointer"
            >
              <option value={7}>Next 7 Days (1 Week Ahead)</option>
              <option value={14}>Next 14 Days (2 Weeks - Recommended)</option>
              <option value={21}>Next 21 Days (3 Weeks Ahead)</option>
              <option value={30}>Next 30 Days (1 Month Ahead)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Backtest Window (Check Past Accuracy)</label>
            <select
              value={testSplit}
              onChange={(e) => setTestSplit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium cursor-pointer"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={21}>Last 21 Days</option>
            </select>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Understanding Predictions:</span> These lines are statistical projections based on past customer habits. Real numbers can vary during unexpected bank holidays, gateway downtime, or unannounced promotions.
          </div>
        </div>
      </div>

      {/* Model Performance Evaluation Cards */}
      {evalMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Average Error (MAE)</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {metric === 'amount' ? formatINR(evalMetrics.mae) : formatNumber(evalMetrics.mae)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Average difference between prediction & reality</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Root Mean Square Error</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {metric === 'amount' ? formatINR(evalMetrics.rmse) : formatNumber(evalMetrics.rmse)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Penalizes large prediction gaps</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Simple Guess Error</span>
            <div className="text-xl font-extrabold text-slate-600 mt-1">
              {metric === 'amount' ? formatINR(evalMetrics.baseline_mae) : formatNumber(evalMetrics.baseline_mae)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Error if we just copied last week's exact day</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs border-l-4 border-l-emerald-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Model Improvement</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">
              {evalMetrics.mae_improvement_pct > 0 ? `+${evalMetrics.mae_improvement_pct}%` : `${evalMetrics.mae_improvement_pct}%`}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">More accurate than simple guessing</p>
          </div>
        </div>
      )}

      {/* Main Forecast Trajectory Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Actual History and Projected Next {horizon} Days
          </h2>
          <p className="text-xs text-slate-500">
            Solid blue line: Past history &bull; Purple dashed line: Projected future &bull; Shaded zone: Likely range (95% confidence)
          </p>
        </div>

        <div className="h-80">
          {forecastData?.available ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                    name === 'actual' ? 'Actual History' : name === 'forecast' ? 'AI Forecast' : name
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  stroke="none"
                  fill="#c7d2fe"
                  fillOpacity={0.4}
                  name="Likely High Boundary"
                />
                <Area
                  type="monotone"
                  dataKey="lower_bound"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                  name="Likely Low Boundary"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="Past History"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3.5, fill: '#7c3aed' }}
                  name="Future Projection"
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              {forecastData?.reason || 'Loading forecast model...'}
            </div>
          )}
        </div>
      </div>

      {/* Test Set Validation Table */}
      {forecastData?.test_comparison && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Model Accuracy Test Check ({testSplit} Days Backtested)
            </h2>
            <p className="text-xs text-slate-500">
              We tested the model on recent days where we already knew the answer to prove how close its predictions were.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">What Actually Happened</th>
                  <th className="py-3 px-4 text-right">What the AI Predicted</th>
                  <th className="py-3 px-4 text-right">Difference (Error)</th>
                  <th className="py-3 px-4 text-right">Accuracy Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {forecastData.test_comparison.map((tc) => {
                  const err = Math.abs(tc.actual - tc.predicted);
                  const pctErr = tc.actual > 0 ? (err / tc.actual * 100.0).toFixed(1) : 'N/A';
                  return (
                    <tr key={tc.date} className="hover:bg-slate-50/90">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-700">{tc.date}</td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-slate-800">
                        {metric === 'amount' ? formatINR(tc.actual) : formatNumber(tc.actual)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-purple-700">
                        {metric === 'amount' ? formatINR(tc.predicted) : formatNumber(tc.predicted)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-600">
                        {metric === 'amount' ? formatINR(err) : formatNumber(err)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="font-bold bg-slate-100 px-2 py-0.5 rounded-full text-[11px] text-slate-700">
                          {pctErr}% off
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
