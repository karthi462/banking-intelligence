export interface Transaction {
  transaction_id: string;
  timestamp: string;
  account_type: string;
  transaction_type: string;
  amount: number;
  payment_mode: string;
  branch: string;
  transaction_status: string;
  is_anomaly?: boolean;
}

export interface FilterParams {
  start_date?: string;
  end_date?: string;
  transaction_type?: string;
  payment_mode?: string;
  transaction_status?: string;
  branch?: string;
  account_type?: string;
}

export interface PeriodComparison {
  available: boolean;
  reason?: string;
  prev_period_label?: string;
  txns_change_pct?: number;
  value_change_pct?: number;
  avg_val_change_pct?: number;
  success_rate_change_pts?: number;
}

export interface KPISummary {
  total_transactions: number;
  total_transaction_value: number;
  average_transaction_value: number;
  successful_transaction_rate: number;
  failed_transaction_count: number;
  flagged_anomalies_count: number;
  matching_transactions_count: number;
  period_comparison: PeriodComparison;
  currency_symbol: string;
}

export interface DatasetSummary {
  dataset_id: string;
  name: string;
  is_synthetic: boolean;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  start_date?: string;
  end_date?: string;
  columns: string[];
  missing_values: Record<string, number>;
  duplicate_ids: number;
  invalid_timestamps: number;
  invalid_amounts: number;
  categories: {
    account_type: string[];
    transaction_type: string[];
    payment_mode: string[];
    branch: string[];
    transaction_status: string[];
  };
}

export interface DailyTrendPoint {
  date: string;
  day_of_week: string;
  count: number;
  amount: number;
  avg_amount: number;
  ma_7_count: number | null;
  ma_7_amount: number | null;
  ma_30_count: number | null;
  ma_30_amount: number | null;
  cumulative_amount: number;
  cumulative_count: number;
}

export interface AnomalyRecord {
  date: string;
  aggregated_count: number;
  aggregated_amount: number;
  baseline: number;
  observed: number;
  deviation_score: number;
  method: string;
  explanation: string;
}

export interface ForecastPoint {
  date: string;
  forecast: number;
  lower_bound: number | null;
  upper_bound: number | null;
}

export interface ForecastResponse {
  available: boolean;
  reason?: string;
  metric?: string;
  model_name?: string;
  horizon?: number;
  evaluation?: {
    test_days: number;
    mae: number;
    rmse: number;
    mape: number | string;
    baseline_mae: number;
    baseline_rmse: number;
    mae_improvement_pct: number;
  };
  historical?: Array<{ date: string; actual: number; split: string }>;
  forecast?: ForecastPoint[];
  test_comparison?: Array<{ date: string; actual: number; predicted: number }>;
  warning?: string;
}
