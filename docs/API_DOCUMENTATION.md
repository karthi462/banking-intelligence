# Banking Transaction Intelligence API Documentation

## 1. Overview
The backend is built with **FastAPI** (Python 3.14). It provides RESTful endpoints for time-series aggregation, statistical outlier detection, train/test chronological forecasting, dataset management, and report streaming.

Interactive OpenAPI documentation is accessible at:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

---

## 2. API Endpoints Reference

### Health & Core
- `GET /api/health`
  - Returns `{"status": "healthy", "version": "1.0.0"}`.
  - Used for liveness probes and dashboard diagnostic indicators.

### Dataset Management
- `GET /api/datasets/summary`
  - Returns metadata of the active dataset: record counts, date ranges, data quality audit (valid vs rejected rows, missing values, duplicate IDs), and discovered category values.
- `POST /api/datasets/generate-sample?records=15000&seed=42`
  - Regenerates the synthetic banking benchmark with configurable record volume and seed.
- `POST /api/datasets/upload`
  - Accepts a `multipart/form-data` CSV file. Returns row count, discovered headers, and top 5 preview rows.
- `POST /api/datasets/confirm-mapping`
  - Accepts a JSON body mapping user CSV columns to the internal schema (`transaction_id`, `timestamp`, `amount`, `transaction_type`, `payment_mode`, `branch`, `transaction_status`, `account_type`). Cleans, validates, and activates the dataset.
- `GET /api/datasets/rejected-rows`
  - Returns the list of rows rejected during ingestion along with explicit audit violation causes.

### Analytics Endpoints
- `GET /api/analytics/kpis`
  - Calculates top-level metrics: Total Volume, Total Transaction Value, Average Ticket Size, Success Rate, Failed Count, Statistical Outliers, and prior period comparisons.
- `GET /api/analytics/transactions`
  - Paginated, searchable, and sortable transaction records table. Query params: `page`, `page_size`, `search`, `sort_by`, `sort_order`, plus global filters.
- `GET /api/analytics/daily-trends`
  - Returns continuous daily time-series with 7-day moving averages, 30-day moving averages, and cumulative running totals.
- `GET /api/analytics/trend-aggregations?aggregation=weekly`
  - Aggregates metrics by `daily`, `weekly`, or `monthly` intervals and returns Deposit vs Withdrawal vs Transfer breakdowns.
- `GET /api/analytics/time-heatmap?metric=count`
  - Generates a 24-hour $\times$ 7-day heatmap matrix from timestamps. Metric options: `count`, `amount`, `avg_amount`.
- `GET /api/analytics/calendar-heatmap?year=2025&month=5`
  - Day-by-day density within a specific calendar month.
- `GET /api/analytics/weekday-comparison`
  - Monday through Sunday aggregated volume and amount totals.
- `GET /api/analytics/month-end-analysis`
  - Partitions transactions into Beginning (Days 1–10), Middle (Days 11–20), and Month-End (Days 21–31).
- `GET /api/analytics/seasonality?metric=count`
  - Classical additive decomposition separating series into Observed, Trend, 7-day Seasonality, and Residuals.
- `GET /api/analytics/payment-modes`
  - Time series timelines, stacked area data, and success/failure rates per payment method.
- `POST /api/analytics/anomalies`
  - Evaluates aggregated series using:
    - `mad`: Rolling Median & Median Absolute Deviation.
    - `iqr`: Interquartile Range outer fences.
    - `residual`: 7-day smoothing residual Z-score.
  - Returns flagged observations with deviation scores and explanations.
- `POST /api/analytics/forecast`
  - Chronological time-series forecasting. Supports `exponential_smoothing` (Holt-Winters), `arima` (SARIMAX), and `seasonal_naive`. Returns test set evaluation metrics (MAE, RMSE, MAPE) and future forecast with 95% confidence intervals.
- `GET /api/analytics/branch-comparison?sort_by=total_amount`
  - Cross-branch metrics, branch-wise timelines, monthly heatmaps, and volume vs average ticket scatter data.

### Exports & Reporting
- `GET /api/exports/transactions`
  - Streams active filtered transactions as downloadable CSV.
- `GET /api/exports/anomalies?method=mad&threshold=3.0`
  - Streams anomaly logs as downloadable CSV.
- `GET /api/exports/pdf-report`
  - Generates and streams a professional executive PDF analytics report using ReportLab.
