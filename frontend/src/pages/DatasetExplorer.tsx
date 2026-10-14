import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  Sliders,
  Check,
  Download,
  AlertCircle,
  HelpCircle,
  FolderUp,
  FileCheck2,
  FileX2,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { api, formatNumber } from '../services/api';

export const DatasetExplorer: React.FC = () => {
  const { datasetSummary, refreshDatasetSummary, triggerRefresh } = useFilters();

  const [genRecords, setGenRecords] = useState<number>(15000);
  const [genSeed, setGenSeed] = useState<number>(42);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPreview, setUploadPreview] = useState<any>(null);
  const [columnMapping, setColumnMapping] = useState({
    transaction_id: '',
    timestamp: '',
    amount: '',
    transaction_type: '',
    payment_mode: '',
    branch: '',
    transaction_status: '',
    account_type: '',
  });

  const [rejectedRows, setRejectedRows] = useState<any[]>([]);
  const [showRejected, setShowRejected] = useState<boolean>(false);

  useEffect(() => {
    const fetchRejections = async () => {
      try {
        const rows = await api.getRejectedRows();
        setRejectedRows(rows);
      } catch (err) {
        console.error('Failed to load rejected rows:', err);
      }
    };
    fetchRejections();
  }, [datasetSummary]);

  const handleGenerateSample = async () => {
    try {
      setIsGenerating(true);
      await api.regenerateSample(genRecords, genSeed);
      await refreshDatasetSummary();
      triggerRefresh();
      alert(`Benchmark sample dataset created with ${genRecords.toLocaleString()} realistic transactions!`);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    try {
      setIsUploading(true);
      const res = await api.uploadDataset(file);
      setUploadPreview(res);

      const cols = res.columns as string[];
      const findCol = (patterns: string[]) =>
        cols.find((c) => patterns.some((p) => c.toLowerCase().includes(p))) || '';

      setColumnMapping({
        transaction_id: findCol(['id', 'txn', 'transaction_id', 'reference']),
        timestamp: findCol(['time', 'date', 'timestamp', 'created_at']),
        amount: findCol(['amount', 'val', 'price', 'total', 'amt']),
        transaction_type: findCol(['type', 'txn_type', 'category']),
        payment_mode: findCol(['mode', 'channel', 'payment_mode', 'method']),
        branch: findCol(['branch', 'location', 'city', 'office']),
        transaction_status: findCol(['status', 'state']),
        account_type: findCol(['account', 'acc_type']),
      });
    } catch (err: any) {
      alert(`Failed to parse file: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmMapping = async () => {
    if (!columnMapping.transaction_id || !columnMapping.timestamp || !columnMapping.amount) {
      alert('Transaction ID, Date/Time, and Amount are required columns.');
      return;
    }

    try {
      setIsUploading(true);
      await api.confirmMapping(columnMapping);
      await refreshDatasetSummary();
      triggerRefresh();
      setUploadPreview(null);
      setUploadFile(null);
      alert('Your custom dataset is now active on the dashboard!');
    } catch (err: any) {
      alert(`Activation failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FolderUp className="w-5 h-5 text-blue-600" />
          Upload & Manage Data Files
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Load your own bank spreadsheet, verify data health, check rejected records, or regenerate a realistic test dataset.
        </p>
      </div>

      {/* Section 1: Active Dataset Quality Report */}
      {datasetSummary && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Currently Active Dataset Health Check
                </h2>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    datasetSummary.is_synthetic
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {datasetSummary.is_synthetic ? 'Sample Data' : 'Custom Upload'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{datasetSummary.name}</p>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              📅 Covers: <span className="text-slate-900">{datasetSummary.start_date?.slice(0, 10)}</span> to{' '}
              <span className="text-slate-900">{datasetSummary.end_date?.slice(0, 10)}</span>
            </div>
          </div>

          {/* Data Quality Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Rows</span>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {formatNumber(datasetSummary.total_rows)}
              </div>
              <p className="text-[10px] text-slate-400">Total in file</p>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Valid Rows</span>
              <div className="text-lg font-extrabold text-emerald-800 mt-0.5">
                {formatNumber(datasetSummary.valid_rows)}
              </div>
              <p className="text-[10px] text-emerald-600">Clean & ready</p>
            </div>

            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 uppercase">Rejected Rows</span>
              <div className="text-lg font-extrabold text-rose-800 mt-0.5">
                {formatNumber(datasetSummary.invalid_rows)}
              </div>
              <p className="text-[10px] text-rose-600">Corrupted / bad data</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Duplicate IDs</span>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {datasetSummary.duplicate_ids}
              </div>
              <p className="text-[10px] text-slate-400">Repeated receipts</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Invalid Dates</span>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {datasetSummary.invalid_timestamps}
              </div>
              <p className="text-[10px] text-slate-400">Broken timestamps</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Bad Amounts</span>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {datasetSummary.invalid_amounts}
              </div>
              <p className="text-[10px] text-slate-400">Negative or missing</p>
            </div>
          </div>

          {datasetSummary.invalid_rows > 0 && (
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {datasetSummary.invalid_rows} records were filtered out so they don't break your calculations.
              </span>
              <button
                onClick={() => setShowRejected(!showRejected)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
              >
                {showRejected ? 'Hide Rejection Table' : 'Click to Inspect Rejected Rows'}
              </button>
            </div>
          )}

          {showRejected && rejectedRows.length > 0 && (
            <div className="mt-4 border border-rose-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-900 border-b border-rose-200 flex items-center gap-2">
                <FileX2 className="w-4 h-4 text-rose-600" />
                <span>Rejected Records Log (Audit Violations)</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2 px-3">Row #</th>
                      <th className="py-2 px-3">ID</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-rose-700">Why was it rejected?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {rejectedRows.slice(0, 20).map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-mono">{r.row_index ?? idx + 1}</td>
                        <td className="py-1.5 px-3 font-mono">{r.transaction_id || '(empty)'}</td>
                        <td className="py-1.5 px-3 font-mono">{r.amount ?? '(empty)'}</td>
                        <td className="py-1.5 px-3">{r.timestamp || '(empty)'}</td>
                        <td className="py-1.5 px-3 font-semibold text-rose-600">{r.rejection_reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 2: CSV Upload & Flexible Column Mapping */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            Upload Your Own CSV Spreadsheet
          </h2>
          <p className="text-xs text-slate-500">
            Works with any bank CSV file! You will be able to pick which column has the date, amount, and ID.
          </p>
        </div>

        {!uploadPreview ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csvUploadInput"
              disabled={isUploading}
            />
            <label
              htmlFor="csvUploadInput"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                {isUploading ? 'Reading CSV File...' : 'Click or Drag Your CSV File Here'}
              </span>
              <span className="text-xs text-slate-400">
                Supports standard comma-separated files (.csv)
              </span>
            </label>
          </div>
        ) : (
          <div className="border border-blue-200 bg-blue-50/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Step 2: Tell Us What Each Column Means
                </h3>
                <p className="text-xs text-slate-600">
                  Uploaded file: <span className="font-mono font-bold text-blue-700">{uploadPreview.filename}</span> (
                  {uploadPreview.total_rows.toLocaleString()} rows found)
                </p>
              </div>
              <button
                onClick={() => setUploadPreview(null)}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Transaction ID / Receipt # <span className="text-rose-500">*</span>
                </label>
                <select
                  value={columnMapping.transaction_id}
                  onChange={(e) => setColumnMapping({ ...columnMapping, transaction_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Choose Column --</option>
                  {uploadPreview.columns.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Date / Time <span className="text-rose-500">*</span>
                </label>
                <select
                  value={columnMapping.timestamp}
                  onChange={(e) => setColumnMapping({ ...columnMapping, timestamp: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Choose Column --</option>
                  {uploadPreview.columns.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={columnMapping.amount}
                  onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Choose Column --</option>
                  {uploadPreview.columns.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Action Type (Optional)
                </label>
                <select
                  value={columnMapping.transaction_type}
                  onChange={(e) => setColumnMapping({ ...columnMapping, transaction_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Optional (e.g. Deposit) --</option>
                  {uploadPreview.columns.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Payment Mode (Optional)
                </label>
                <select
                  value={columnMapping.payment_mode}
                  onChange={(e) => setColumnMapping({ ...columnMapping, payment_mode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Optional (e.g. UPI) --</option>
                  {uploadPreview.columns.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Branch / City (Optional)
                </label>
                <select
                  value={columnMapping.branch}
                  onChange={(e) => setColumnMapping({ ...columnMapping, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Optional (e.g. City) --</option>
                  {uploadPreview.columns.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Status (Optional)
                </label>
                <select
                  value={columnMapping.transaction_status}
                  onChange={(e) => setColumnMapping({ ...columnMapping, transaction_status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Optional (e.g. Successful) --</option>
                  {uploadPreview.columns.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Account Type (Optional)
                </label>
                <select
                  value={columnMapping.account_type}
                  onChange={(e) => setColumnMapping({ ...columnMapping, account_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Optional (e.g. Savings) --</option>
                  {uploadPreview.columns.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-blue-100">
              <button
                onClick={handleConfirmMapping}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Mapping & Activate My Data</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Synthetic Benchmark Dataset Generator */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-500" />
            Need Sample Data? Regenerate Realistic Test Dataset
          </h2>
          <p className="text-xs text-slate-500">
            Creates 15,000 realistic bank transactions with weekday habits, lunch rushes, and month-end paydays.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700">How Many Records?</label>
              <span className="font-mono text-blue-600 font-extrabold">{genRecords.toLocaleString()} rows</span>
            </div>
            <input
              type="range"
              min="2000"
              max="25000"
              step="1000"
              value={genRecords}
              onChange={(e) => setGenRecords(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Random Pattern Seed</label>
            <input
              type="number"
              value={genSeed}
              onChange={(e) => setGenSeed(parseInt(e.target.value) || 42)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-medium"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateSample}
              disabled={isGenerating}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating Sample Data...' : 'Create Sample Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
