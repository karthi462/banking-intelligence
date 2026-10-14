import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Receipt,
  Wallet,
  ArrowRightLeft,
  Sparkles,
  Info,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api, formatINR, formatNumber } from '../services/api';
import { KPISummary, DailyTrendPoint, Transaction } from '../types';
import { KPICard } from '../components/KPICard';
import { GlobalFilters } from '../components/GlobalFilters';

const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const Overview: React.FC = () => {
  const { appliedFilters, refreshTrigger } = useFilters();

  const [kpiData, setKpiData] = useState<KPISummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyTrendPoint[]>([]);
  const [typesDist, setTypesDist] = useState<any[]>([]);
  const [paymentDist, setPaymentDist] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [show7dMA, setShow7dMA] = useState(true);
  const [paymentMetric, setPaymentMetric] = useState<'count' | 'amount'>('count');
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTableTxns, setTotalTableTxns] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpis, trends, txns] = await Promise.all([
          api.getKPIs(appliedFilters),
          api.getDailyTrends(appliedFilters),
          api.getTransactions(appliedFilters, tablePage, 10, tableSearch),
        ]);

        setKpiData(kpis);
        setDailyData(trends.daily_data);
        setTypesDist(trends.types_distribution);
        setPaymentDist(trends.payment_distribution);
        setTransactions(txns.data);
        setTotalPages(txns.total_pages);
        setTotalTableTxns(txns.total);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, [appliedFilters, refreshTrigger, tablePage, tableSearch]);

  const pComp = kpiData?.period_comparison;

  return (
    <div className="space-y-6">
      {/* Friendly Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-teal-400 text-slate-950 px-2.5 py-0.5 rounded-full">
              Executive Summary
            </span>
            <span className="text-xs text-slate-300">Updated in real-time</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1 tracking-tight">
            How Is the Bank Performing?
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Here is a bird's-eye view of your banking activity: how much money flowed, how many people transacted, how smoothly payments processed, and where unusual spikes occurred.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center border border-white/10">
            <div className="text-lg font-bold text-teal-300">
              {kpiData ? formatNumber(kpiData.total_transactions) : '...'}
            </div>
            <div className="text-[10px] text-slate-300 font-medium">Total Actions</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center border border-white/10">
            <div className="text-lg font-bold text-teal-300">
              {kpiData ? formatINR(kpiData.total_transaction_value) : '...'}
            </div>
            <div className="text-[10px] text-slate-300 font-medium">Total Volume</div>
          </div>
        </div>
      </div>

      {/* Global Filters */}
      <GlobalFilters matchingCount={kpiData?.matching_transactions_count} />

      {/* 6 Plain-English KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Transactions"
          value={kpiData ? formatNumber(kpiData.total_transactions) : '...'}
          subtitle="Customer transactions"
          changePct={pComp?.available ? pComp.txns_change_pct : undefined}
          comparisonNote={pComp?.available ? undefined : pComp?.reason}
          tooltipText="The total number of deposits, withdrawals, transfers, and payments completed in this time period."
          icon={<Receipt className="w-4 h-4" />}
          variant="blue"
        />

        <KPICard
          title="Total Money Moved"
          value={kpiData ? formatINR(kpiData.total_transaction_value) : '...'}
          subtitle="Sum of all transaction amounts"
          changePct={pComp?.available ? pComp.value_change_pct : undefined}
          comparisonNote={pComp?.available ? undefined : pComp?.reason}
          tooltipText="The entire amount of money that passed through accounts (Deposits + Transfers + Withdrawals)."
          icon={<Wallet className="w-4 h-4" />}
          variant="blue"
        />

        <KPICard
          title="Avg Transaction"
          value={kpiData ? formatINR(kpiData.average_transaction_value) : '...'}
          subtitle="Typical amount per customer"
          changePct={pComp?.available ? pComp.avg_val_change_pct : undefined}
          comparisonNote={pComp?.available ? undefined : pComp?.reason}
          tooltipText="Average ticket size calculated as (Total Money / Total Transactions)."
          icon={<TrendingUp className="w-4 h-4" />}
          variant="blue"
        />

        <KPICard
          title="Success Rate"
          value={kpiData ? `${kpiData.successful_transaction_rate.toFixed(1)}%` : '...'}
          subtitle="Went through without issues"
          changePct={pComp?.available ? pComp.success_rate_change_pts : undefined}
          changeLabel="pts change"
          comparisonNote={pComp?.available ? undefined : pComp?.reason}
          tooltipText="The percentage of transactions that succeeded smoothly without bank or network errors."
          icon={<CheckCircle2 className="w-4 h-4" />}
          variant="emerald"
        />

        <KPICard
          title="Failed Attempts"
          value={kpiData ? formatNumber(kpiData.failed_transaction_count) : '...'}
          subtitle="Network or server timeouts"
          tooltipText="Transactions rejected because of bank server issues, incorrect details, or gateway connection drops."
          icon={<AlertTriangle className="w-4 h-4" />}
          variant="rose"
        />

        <KPICard
          title="Unusual Spikes"
          value={kpiData ? formatNumber(kpiData.flagged_anomalies_count) : '...'}
          subtitle="Unusually large amounts"
          tooltipText="Transactions that were mathematically much higher than ordinary (e.g. big business payments or festival shopping)."
          icon={<ShieldAlert className="w-4 h-4" />}
          variant="amber"
        />
      </div>

      {/* Main Charts Row 1: Daily Volume & Daily Amount */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Daily Transaction Volume */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                How Many Transactions Happened Each Day?
              </h2>
              <p className="text-xs text-slate-500">
                Shows the number of people banking daily. Check the box to smooth weekend dips.
              </p>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={show7dMA}
                onChange={(e) => setShow7dMA(e.target.checked)}
                className="rounded text-blue-600 cursor-pointer"
              />
              <span>Smooth 7-Day Trend</span>
            </label>
          </div>

          <div className="h-64">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    labelFormatter={(v) => `Date: ${v}`}
                    formatter={(val: any) => [`${formatNumber(Number(val))} transactions`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Daily Count"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    dot={false}
                    opacity={show7dMA ? 0.45 : 0.9}
                  />
                  {show7dMA && (
                    <Line
                      type="monotone"
                      dataKey="ma_7_count"
                      name="7-Day Smoothed Trend"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  )}
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No transactions in selected range
              </div>
            )}
          </div>
        </div>

        {/* Chart B: Daily Transaction Amount */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Wallet className="w-4 h-4 text-teal-600" />
                Total Money Handled Each Day
              </h2>
              <p className="text-xs text-slate-500">
                Total Indian Rupees (₹) transacted per day across all accounts
              </p>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              Rupees (₹)
            </span>
          </div>

          <div className="h-64">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    tickFormatter={(v) => formatINR(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [formatINR(Number(val)), 'Total Money']}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Daily Money"
                    stroke="#0d9488"
                    strokeWidth={1.8}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ma_7_amount"
                    name="7-Day Trend Line"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No transaction data in selected range
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Type Distribution & Payment Mode Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart C: Transaction Type Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-purple-600" />
              Where Did the Money Go? (Transaction Types)
            </h2>
            <p className="text-xs text-slate-500">
              Compares Deposits, Cash Withdrawals, Money Transfers, and Bill Payments
            </p>
          </div>

          <div className="h-60">
            {typesDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typesDist} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any, name: any) => [
                      name === 'count' ? `${formatNumber(Number(val))} times` : formatINR(Number(val)),
                      name === 'count' ? 'Times Transacted' : 'Total Value',
                    ]}
                  />
                  <Bar dataKey="count" name="Times Transacted" fill="#2563eb" radius={[6, 6, 0, 0]}>
                    {typesDist.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Chart D: Payment Mode Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-pink-600" />
                How Did People Pay? (Payment Channels)
              </h2>
              <p className="text-xs text-slate-500">
                Popularity of UPI apps, Debit/Credit Cards, ATM cash, and Bank Transfers
              </p>
            </div>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setPaymentMetric('count')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  paymentMetric === 'count' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                By Number of Times
              </button>
              <button
                onClick={() => setPaymentMetric('amount')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  paymentMetric === 'amount' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                By Total Money (₹)
              </button>
            </div>
          </div>

          <div className="h-60">
            {paymentDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentDist} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => (paymentMetric === 'amount' ? formatINR(v) : formatNumber(v))}
                  />
                  <YAxis dataKey="mode" type="category" tick={{ fontSize: 11, fill: '#334155' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [
                      paymentMetric === 'amount' ? formatINR(Number(val)) : `${formatNumber(Number(val))} times`,
                      paymentMetric === 'amount' ? 'Total Money' : 'Number of Times',
                    ]}
                  />
                  <Bar
                    dataKey={paymentMetric === 'count' ? 'count' : 'total_amount'}
                    name={paymentMetric === 'count' ? 'Times Used' : 'Total Money (₹)'}
                    radius={[0, 6, 6, 0]}
                  >
                    {paymentDist.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No payment data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table E: Recent Transaction Activity */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              Recent Banking Activity Log
            </h2>
            <p className="text-xs text-slate-500">
              Showing {transactions.length} of {totalTableTxns.toLocaleString()} matching records (Confidential account details are kept private)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search transaction ID, city, mode..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setTablePage(1);
                }}
                className="text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl w-60 sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4">How Paid</th>
                <th className="py-3 px-4">Branch Location</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4 text-center">Notable Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-slate-50/90 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {tx.transaction_id}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-medium">
                      {tx.timestamp}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{tx.transaction_type}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-sm">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-medium">{tx.payment_mode}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{tx.branch}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          tx.transaction_status.toLowerCase() === 'successful'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.transaction_status.toLowerCase() === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.transaction_status.toLowerCase() === 'successful' && '✅ '}
                        {tx.transaction_status.toLowerCase() === 'failed' && '❌ '}
                        {tx.transaction_status.toLowerCase() === 'pending' && '⏳ '}
                        {tx.transaction_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {tx.is_anomaly ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                          ⚠️ Big Amount
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">Standard</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    No transactions found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Page {tablePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTablePage((p) => Math.max(1, p - 1))}
              disabled={tablePage <= 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 font-semibold disabled:opacity-40 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
              disabled={tablePage >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 font-semibold disabled:opacity-40 flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
