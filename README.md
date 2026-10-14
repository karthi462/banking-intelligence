# Banking Transaction Intelligence Dashboard
## Advanced Time-Series Data Visualization Using R, Python, and Modern Web Technologies

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![R](https://img.shields.io/badge/R-4.2+-276DC3.svg)](https://www.r-project.org/)

An enterprise-grade, academic web application for advanced time-series visualization, statistical anomaly detection, chronological forecasting, and multi-channel liquidity analysis of banking transactions.

---

## 🌟 Key Features

1. **Dashboard Overview**:
   - 6 Dynamic KPI cards with valid prior-period comparisons and statistical explanations.
   - Daily volume time-series with optional 7-day moving average.
   - Daily monetary value throughput formatted in Indian numbering conventions (₹ INR, Lakhs, Crores).
   - Transaction classification breakdown (Deposits, Withdrawals, Transfers, Payments).
   - Payment method usage by count or monetary volume.
   - Paginated, searchable, and sortable transaction records table with statistical outlier flags.

2. **Advanced Transaction Trends**:
   - Dedicated time-series exploration with metric switching (Count vs Amount).
   - Dynamic aggregation intervals (Daily, Weekly, Monthly).
   - Multi-tier rolling moving averages (7-Day and 30-Day) for noise filtration.
   - Cumulative transaction liquidity growth area chart.
   - Deposit vs Withdrawal vs Transfer trajectory comparisons.

3. **Temporal Analysis**:
   - 24-hour $\times$ 7-day diurnal traffic heatmap matrix computed from actual timestamps.
   - Monthly calendar activity heatmap with day-by-day density indicators.
   - Monday through Sunday aggregated weekday distributions.
   - Month-end payroll analysis (Beginning Days 1–10, Middle Days 11–20, End Days 21–31).
   - Classical additive time-series decomposition (Observed, Trend, 7-Day Seasonality, Residuals).

4. **Payment Channel Intelligence**:
   - Channel breakdown: UPI, Debit Card, Credit Card, ATM, Bank Transfer.
   - Stacked area evolution chart tracking payment mode market share over time.
   - Gateway reliability tracking: Successful vs Failed transaction velocities.
   - Average transaction ticket size comparison across payment modes.

5. **Statistical Anomaly Detection**:
   - Multi-method detection: Rolling Median & MAD, Interquartile Range (IQR), and Residual Z-Scores.
   - Interactive threshold sensitivity slider and rolling window size controls.
   - Synchronized line chart with flagged outliers highlighted with red markers.
   - Searchable anomaly inspection table with deviation scores and analytical interpretations.
   - **Important Academic Safeguard:** Clearly distinguishes mathematical anomalies from confirmed fraud.

6. **Chronological Time-Series Forecasting**:
   - Target metrics: Daily Transaction Count or Aggregate Monetary Value.
   - Predictive models: Holt-Winters Exponential Smoothing, SARIMAX, and Seasonal Naive Baseline.
   - Chronological train/test backtesting with zero forward-looking data leakage.
   - Error metrics: MAE, RMSE, MAPE, and percentage improvement over naive baseline.
   - Projection horizons of 7 to 30 days with 95% confidence intervals.

7. **Branch Comparison**:
   - Multi-branch metrics for major financial hubs (Chennai, Mumbai, Bengaluru, Delhi, Hyderabad, Kolkata).
   - Sortable volume comparison bar chart.
   - Temporal progression line chart by branch.
   - Branch-by-month seasonality matrix heatmap.
   - Quadrant scatter plot: Transaction count vs Average ticket size.

8. **Dataset Explorer & Governance**:
   - CSV dataset uploader with drag-and-drop support.
   - Flexible column mapping interface mapping custom spreadsheets to standard schemas.
   - Data quality audit report: Total rows, valid rows, rejected records, missing values, duplicate IDs, invalid timestamps.
   - Rejected record inspection log with specific audit failure reasons.
   - Built-in synthetic benchmark dataset generator with configurable volume (1,000–50,000) and random seed.

9. **Reports & Exports**:
   - One-click PDF generation creating an executive analytics dossier using ReportLab.
   - Filtered transaction records export (CSV).
   - Statistical anomaly log export (CSV).
   - In-app live report preview document.

10. **Standalone R Analysis Module (`r-analysis/`)**:
    - `time_series_visualization.R`: Multi-tier moving averages and cumulative curves with `ggplot2` and `zoo`.
    - `anomaly_analysis.R`: Non-parametric MAD and IQR anomaly plots.
    - `forecasting.R`: Seasonal naive, ETS, and auto.arima models with accuracy evaluations.
    - `analysis.R`: Master pipeline script executing all analyses in sequence.

---

## 🏗️ Project Architecture

```
advt-banking-dashboard/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/           # Sidebar, Header, GlobalFilters, KPICard
│   │   ├── pages/                # 10 Dedicated Analytical Views
│   │   ├── context/              # Global FilterContext
│   │   ├── services/             # API client & currency formatters
│   │   ├── types/                # TypeScript Interfaces
│   │   ├── App.tsx               # Router & Layout
│   │   └── index.css             # Design Tokens & Styles
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # Python 3.14 + FastAPI + Statsmodels
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint & CORS
│   │   ├── api/endpoints.py      # REST Endpoints
│   │   ├── analytics/            # KPIs, Trends, Temporal, Payment, Anomaly, Forecast, Branch
│   │   ├── services/             # Dataset Manager & PDF Report Generator
│   │   ├── schemas/              # Pydantic Schemas
│   │   └── utils/                # Synthetic Benchmark Data Generator
│   ├── tests/                    # Pytest Suite (12 Unit & Integration Tests)
│   └── requirements.txt
│
├── r-analysis/                   # Standalone Academic R Scripts
│   ├── analysis.R                # Master execution pipeline
│   ├── time_series_visualization.R
│   ├── anomaly_analysis.R
│   └── forecasting.R
│
├── data/                         # Synthetic & Uploaded CSV Storage
│   └── synthetic_banking_transactions.csv
│
├── docs/                         # Academic Deliverables
│   ├── PROJECT_REPORT.md         # Comprehensive Academic Report
│   ├── DATA_DICTIONARY.md        # Schema & Ingestion Specifications
│   └── API_DOCUMENTATION.md      # REST API Reference
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm
- *(Optional)* R 4.2+ for running standalone R scripts

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to the project root:
   ```bash
   cd "advt project"
   ```

2. Install Python dependencies:
   ```bash
   python -m pip install -r backend/requirements.txt
   ```

3. Run the automated backend test suite:
   ```bash
   # Windows PowerShell
   $env:PYTHONPATH='backend'; python -m pytest backend\tests

   # Linux / macOS
   PYTHONPATH=backend pytest backend/tests
   ```

4. Launch the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
   ```
   The backend API will be live at `http://127.0.0.1:8000`.
   Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

---

### 3. Frontend Setup (React + Vite)

1. Open a second terminal and navigate to `frontend`:
   ```bash
   cd "advt project/frontend"
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

### 4. Running the Standalone R Analysis

The project includes standalone R scripts in `r-analysis/` for academic evaluation. Note that the web dashboard runs independently without requiring R.

To execute the R pipeline:
1. Ensure the Python backend has generated the benchmark dataset at `data/synthetic_banking_transactions.csv`.
2. Navigate to `r-analysis/`:
   ```bash
   cd r-analysis
   ```
3. Run the master script via `Rscript`:
   ```bash
   Rscript analysis.R
   ```
   This will execute the time-series smoothing, anomaly detection, and forecasting scripts, generating high-resolution PNG plots:
   - `r_daily_volume_ma.png`
   - `r_cumulative_amount.png`
   - `r_anomaly_mad_plot.png`
   - `r_forecast_arima.png`

---

## 🧪 Testing Results

The automated test suite in `backend/tests/test_analytics.py` verifies 12 key analytical systems:
- [x] Benchmark synthetic dataset generation and reproducibility
- [x] Duplicate transaction ID and invalid amount isolation
- [x] Real-time KPI calculations and prior-period comparison math
- [x] Date-range filtering and boundary conditions
- [x] Daily time-series aggregation and 7-day/30-day moving averages
- [x] Weekly and monthly interval resampling
- [x] Rolling Median and MAD anomaly detection
- [x] Interquartile Range (IQR) outer fence detection
- [x] 24-hour $\times$ 7-day diurnal timestamp heatmap matrix
- [x] Statsmodels classical additive seasonal decomposition
- [x] Chronological train/test forecasting (Seasonal Naive & Holt-Winters)
- [x] Cross-branch comparison metrics and scatter data

All 12 tests passed successfully.

---

## 📜 Academic Governance & Privacy

This application is developed strictly for academic demonstration in **Advanced Data Visualization**. It does not collect personal banking credentials, credit card PINs, or live banking account numbers. All benchmark datasets are mathematically simulated using calibrated distributions and reproducible random seeds.
