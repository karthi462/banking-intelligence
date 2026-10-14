import React, { useState } from 'react';
import {
  Filter,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  Building2,
  CheckCircle2,
  Wallet,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';

interface GlobalFiltersProps {
  matchingCount?: number;
}

export const GlobalFilters: React.FC<GlobalFiltersProps> = ({ matchingCount }) => {
  const { filters, setFilters, applyFilters, resetFilters, datasetSummary } = useFilters();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const categories = datasetSummary?.categories || {
    transaction_type: ['Deposit', 'Withdrawal', 'Transfer', 'Payment'],
    payment_mode: ['UPI', 'Debit Card', 'Credit Card', 'ATM', 'Bank Transfer'],
    branch: [
      'Chennai Central',
      'Mumbai Fort',
      'Bengaluru Indiranagar',
      'Delhi Connaught Place',
      'Hyderabad Banjara Hills',
      'Kolkata Park Street',
    ],
    transaction_status: ['Successful', 'Failed', 'Pending'],
    account_type: ['Savings', 'Current', 'Salary', 'Business'],
  };

  const handleInputChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs mb-6 overflow-hidden">
      {/* Filter header bar */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Filter By Date, Branch & Payment Method
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline ml-2">
              (Choose what transactions you want to see)
            </span>
          </div>

          {matchingCount !== undefined && (
            <span className="ml-2 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              {matchingCount.toLocaleString()} Matching Transactions
            </span>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Hide Filters</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Change Filters</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Filter inputs */}
      {isExpanded && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {/* Start Date */}
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>End Date</span>
              </label>
              <input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium"
              />
            </div>

            {/* Transaction Type */}
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                <span>Type</span>
              </label>
              <select
                value={filters.transaction_type || 'All'}
                onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium cursor-pointer"
              >
                <option value="All">All Types (Deposits, Transfers...)</option>
                {categories.transaction_type.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Mode</span>
              </label>
              <select
                value={filters.payment_mode || 'All'}
                onChange={(e) => handleInputChange('payment_mode', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium cursor-pointer"
              >
                <option value="All">All Modes (UPI, Cards, ATM...)</option>
                {categories.payment_mode.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Bank Branch</span>
              </label>
              <select
                value={filters.branch || 'All'}
                onChange={(e) => handleInputChange('branch', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium cursor-pointer"
              >
                <option value="All">All Cities / Branches</option>
                {categories.branch.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Status */}
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Status</span>
              </label>
              <select
                value={filters.transaction_status || 'All'}
                onChange={(e) => handleInputChange('transaction_status', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {categories.transaction_status.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Type */}
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1.5">
                <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                <span>Account Type</span>
              </label>
              <select
                value={filters.account_type || 'All'}
                onChange={(e) => handleInputChange('account_type', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium cursor-pointer"
              >
                <option value="All">All Accounts (Savings, Current...)</option>
                {categories.account_type.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
            <span className="text-[11px] text-slate-400">
              💡 Tip: Click "Apply Filters" to refresh all dashboard charts with your choices.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to All</span>
              </button>
              <button
                onClick={applyFilters}
                className="inline-flex items-center gap-1.5 px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-600/30 transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
