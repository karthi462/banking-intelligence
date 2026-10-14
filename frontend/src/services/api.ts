import { FilterParams, KPISummary, DatasetSummary, DailyTrendPoint, ForecastResponse } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getDatasetSummary(): Promise<DatasetSummary> {
    const res = await fetch(`${API_BASE}/datasets/summary`);
    if (!res.ok) throw new Error('Failed to fetch dataset summary');
    return res.json();
  },

  async regenerateSample(records = 15000, seed = 42) {
    const res = await fetch(`${API_BASE}/datasets/generate-sample?records=${records}&seed=${seed}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate sample dataset');
    return res.json();
  },

  async uploadDataset(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async confirmMapping(mapping: Record<string, string>) {
    const res = await fetch(`${API_BASE}/datasets/confirm-mapping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapping),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Mapping failed');
    }
    return res.json();
  },

  async getRejectedRows() {
    const res = await fetch(`${API_BASE}/datasets/rejected-rows`);
    return res.json();
  },

  buildQuery(params: FilterParams) {
    const q = new URLSearchParams();
    if (params.start_date) q.append('start_date', params.start_date);
    if (params.end_date) q.append('end_date', params.end_date);
    if (params.transaction_type && params.transaction_type !== 'All') q.append('transaction_type', params.transaction_type);
    if (params.payment_mode && params.payment_mode !== 'All') q.append('payment_mode', params.payment_mode);
    if (params.transaction_status && params.transaction_status !== 'All') q.append('transaction_status', params.transaction_status);
    if (params.branch && params.branch !== 'All') q.append('branch', params.branch);
    if (params.account_type && params.account_type !== 'All') q.append('account_type', params.account_type);
    return q.toString();
  },

  async getKPIs(filters: FilterParams): Promise<KPISummary> {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/kpis?${q}`);
    if (!res.ok) throw new Error('Failed to fetch KPIs');
    return res.json();
  },

  async getTransactions(filters: FilterParams, page = 1, pageSize = 15, search = '', sortBy = 'timestamp', sortOrder = 'desc') {
    const q = this.buildQuery(filters);
    const res = await fetch(
      `${API_BASE}/analytics/transactions?${q}&page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}&sort_by=${sortBy}&sort_order=${sortOrder}`
    );
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getDailyTrends(filters: FilterParams): Promise<{
    daily_data: DailyTrendPoint[];
    summary: { days_count: number; has_30d_ma: boolean; min_date?: string; max_date?: string };
    types_distribution: Array<{ type: string; count: number; total_amount: number; avg_amount: number }>;
    payment_distribution: Array<{ mode: string; count: number; total_amount: number; avg_amount: number }>;
  }> {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/daily-trends?${q}`);
    if (!res.ok) throw new Error('Failed to fetch daily trends');
    return res.json();
  },

  async getTrendAggregations(aggregation: 'daily' | 'weekly' | 'monthly', filters: FilterParams) {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/trend-aggregations?${q}&aggregation=${aggregation}`);
    return res.json();
  },

  async getTimeHeatmap(metric: 'count' | 'amount' | 'avg_amount', filters: FilterParams) {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/time-heatmap?${q}&metric=${metric}`);
    return res.json();
  },

  async getCalendarHeatmap(year: number, month: number, metric: 'count' | 'amount', filters: FilterParams) {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/calendar-heatmap?${q}&year=${year}&month=${month}&metric=${metric}`);
    return res.json();
  },

  async getWeekdayComparison(filters: FilterParams) {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/weekday-comparison?${q}`);
    return res.json();
  },

  async getMonthEndAnalysis(filters: FilterParams) {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/month-end-analysis?${q}`);
    return res.json();
  },

  async getSeasonality(metric: 'count' | 'amount', filters: FilterParams) {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/seasonality?${q}&metric=${metric}`);
    return res.json();
  },

  async getPaymentAnalytics(filters: FilterParams) {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/payment-modes?${q}`);
    return res.json();
  },

  async detectAnomalies(body: {
    metric: string;
    aggregation: string;
    method: string;
    threshold: number;
    rolling_window: number;
    start_date?: string;
    end_date?: string;
    transaction_type?: string;
    branch?: string;
  }) {
    const res = await fetch(`${API_BASE}/analytics/anomalies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  async getForecast(body: {
    metric: string;
    model: string;
    horizon: number;
    start_date?: string;
    end_date?: string;
    test_split_days: number;
  }): Promise<ForecastResponse> {
    const res = await fetch(`${API_BASE}/analytics/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  async getBranchComparison(filters: FilterParams, sortBy = 'total_amount') {
    const q = this.buildQuery(filters);
    const res = await fetch(`${API_BASE}/analytics/branch-comparison?${q}&sort_by=${sortBy}`);
    return res.json();
  },

  getExportTransactionsUrl(filters: FilterParams) {
    const q = this.buildQuery(filters);
    return `${API_BASE}/exports/transactions?${q}`;
  },

  getExportAnomaliesUrl(method = 'mad', threshold = 3.0, metric = 'amount') {
    return `${API_BASE}/exports/anomalies?method=${method}&threshold=${threshold}&metric=${metric}`;
  },

  getExportPdfUrl(filters: FilterParams) {
    const q = this.buildQuery(filters);
    return `${API_BASE}/exports/pdf-report?${q}`;
  },
};

// Indian Numbering Formatter for Financial Dashboard
export function formatINR(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  if (Math.abs(val) >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(val) >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatNumber(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return val.toLocaleString('en-IN');
}
