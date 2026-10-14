import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileDown,
  Download,
  CheckCircle,
  Database,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Info,
  Printer,
  Table,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { api, formatINR, formatNumber } from '../services/api';
import { KPISummary } from '../types';
import { GlobalFilters } from '../components/GlobalFilters';

export const Reports: React.FC = () => {
  const { appliedFilters, datasetSummary, refreshTrigger } = useFilters();
  const [kpiData, setKpiData] = useState<KPISummary | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await api.getKPIs(appliedFilters);
        setKpiData(res);
      } catch (err) {
        console.error('Error fetching KPI summary for reports:', err);
      }
    };
    fetchKpis();
  }, [appliedFilters, refreshTrigger]);

  const handleDownloadPdf = () => {
    const url = api.getExportPdfUrl(appliedFilters);
    window.open(url, '_blank');
  };

  const handleDownloadTxnsCsv = () => {
    const url = api.getExportTransactionsUrl(appliedFilters);
    window.open(url, '_blank');
  };

  const handleDownloadAnomaliesCsv = () => {
    const url = api.getExportAnomaliesUrl('mad', 3.0, 'amount');
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <GlobalFilters />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileDown className="w-5 h-5 text-blue-600" />
            Download Reports & Export Spreadsheets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Save publication-ready PDF reports, or export clean CSV files to open in Microsoft Excel or Google Sheets.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-600/30 transition-all active:scale-95 shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Save PDF Report Now</span>
        </button>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* PDF Option */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Official Executive PDF Report</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete academic & executive PDF dossier including KPI summaries, method descriptions, and scientific limitations.
            </p>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="mt-5 w-full py-2.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Dossier</span>
          </button>
        </div>

        {/* Filtered Transactions CSV */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Table className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Filtered Transactions (Excel / CSV)</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Download the current filtered transactions list. Ready to open directly in Microsoft Excel, Power BI, or Python.
            </p>
          </div>
          <button
            onClick={handleDownloadTxnsCsv}
            className="mt-5 w-full py-2.5 px-3 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-300"
          >
            <Download className="w-4 h-4" />
            <span>Export Transactions (CSV)</span>
          </button>
        </div>

        {/* Anomaly Log CSV */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Unusual Spikes Log (Excel / CSV)</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export every flagged outlier day with its deviation score, baseline expectation, and detailed analytical reasoning.
            </p>
          </div>
          <button
            onClick={handleDownloadAnomaliesCsv}
            className="mt-5 w-full py-2.5 px-3 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-amber-300"
          >
            <Download className="w-4 h-4" />
            <span>Export Outliers (CSV)</span>
          </button>
        </div>
      </div>

      {/* Report Preview Document */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            📄 Document Preview
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-2">
            Banking Transaction Intelligence Analytical Dossier
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Subject: Advanced Data Visualization &bull; Dataset:{' '}
            <span className="font-semibold text-slate-700">{datasetSummary?.name}</span>
          </p>
        </div>

        {/* Report Section 1: Executive KPI Overview */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            1. Current Scope & Empirical Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px]">Volume:</span>
              <div className="font-bold text-slate-900">{kpiData ? formatNumber(kpiData.total_transactions) : '...'} txns</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px]">Total Value:</span>
              <div className="font-bold text-slate-900">{kpiData ? formatINR(kpiData.total_transaction_value) : '...'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px]">Average Ticket:</span>
              <div className="font-bold text-slate-900">{kpiData ? formatINR(kpiData.average_transaction_value) : '...'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px]">Success Rate:</span>
              <div className="font-bold text-emerald-600">{kpiData ? `${kpiData.successful_transaction_rate.toFixed(1)}%` : '...'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px]">Failures:</span>
              <div className="font-bold text-rose-600">{kpiData ? formatNumber(kpiData.failed_transaction_count) : '...'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px]">Unusual Spikes:</span>
              <div className="font-bold text-amber-600">{kpiData ? formatNumber(kpiData.flagged_anomalies_count) : '...'}</div>
            </div>
          </div>
        </div>

        {/* Report Section 2: Methodological Synopsis */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            2. Methodological & Algorithmic Summary
          </h3>
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <p>
              &bull; <b>Time-Series Smoothing:</b> A two-tiered rolling average framework (7-day and 30-day windows) is applied to continuous daily series. The 7-day window isolates weekly diurnal fluctuations, while the 30-day window extracts underlying macro liquidity shifts without temporal phase distortion.
            </p>
            <p>
              &bull; <b>Diurnal & Weekly Seasonality:</b> Timestamps are cross-classified across a 24-hour &times; 7-day matrix to identify server peak load intervals (10:00–14:00, 17:00–21:00) and off-peak liquidity windows.
            </p>
            <p>
              &bull; <b>Statistical Anomaly Detection:</b> Outlier identification uses non-parametric Median Absolute Deviation (MAD) robust Z-scores alongside Interquartile Range (IQR) outer fences. Zero-MAD conditions are guarded using local standard deviation dampening.
            </p>
            <p>
              &bull; <b>Forecasting:</b> Chronological train/test split evaluates Seasonal Naive, Holt-Winters Exponential Smoothing, and SARIMAX models against held-out observations to ensure zero forward-looking data leakage.
            </p>
          </div>
        </div>

        {/* Report Section 3: Limitations & Disclaimers */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Scientific Disclaimers & Operational Limitations
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900">
            1. Statistical anomalies indicate unusual mathematical variance from historical expectations and must never be interpreted as confirmed fraud.<br/>
            2. The sample dataset is simulated with calibrated diurnal and monthly cycles for academic demonstration.<br/>
            3. Future forecasts represent aggregate probabilistic estimations, not contractual outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};
