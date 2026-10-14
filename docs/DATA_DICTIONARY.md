# Data Dictionary: Banking Transaction Intelligence System

## 1. Overview
The Banking Transaction Intelligence Dashboard utilizes an internal standardized banking transaction schema. This schema supports high-frequency transaction logging, multi-branch liquidity tracking, channel usage metrics, and time-series anomaly detection.

---

## 2. Standard Schema Specification

| Field Name | Type | Nullable | Description | Example Values |
| :--- | :--- | :--- | :--- | :--- |
| `transaction_id` | String | No | Unique identifier for the banking transaction. Must be non-empty and unique across the dataset. | `TXN000142`, `TXN009821` |
| `timestamp` | Datetime / String | No | ISO 8601 or standard datetime format (`YYYY-MM-DD HH:MM:SS`) recording the exact timestamp of transaction initiation. | `2025-05-14 14:32:10` |
| `amount` | Float / Double | No | Monetary value of the transaction in INR (₹). Must be finite and non-negative ($x \ge 0$). | `1500.00`, `45000.50` |
| `transaction_type` | Categorical String | No | Functional classification of the liquidity flow. | `Deposit`, `Withdrawal`, `Transfer`, `Payment` |
| `payment_mode` | Categorical String | No | Clearing channel or mechanism through which funds were moved. | `UPI`, `Debit Card`, `Credit Card`, `ATM`, `Bank Transfer` |
| `branch` | Categorical String | No | Originating bank branch office or operational unit. | `Chennai Central`, `Mumbai Fort`, `Bengaluru Indiranagar`, `Delhi Connaught Place`, `Hyderabad Banjara Hills`, `Kolkata Park Street` |
| `transaction_status` | Categorical String | No | Terminal settlement status of the transaction. | `Successful`, `Failed`, `Pending` |
| `account_type` | Categorical String | Optional | Portfolio category of the originating account. | `Savings`, `Current`, `Salary`, `Business` |

---

## 3. Validation Rules & Data Quality Ingestion Fences

During dataset ingestion (via CSV upload or synthetic generator), the following integrity checks are enforced:

1. **Uniqueness**: Every `transaction_id` is tracked in an in-memory hash set. Duplicates are flagged and rejected into the audit log.
2. **Timestamp Parsing**: Timestamps are parsed using ISO and standard date-time conventions. Non-chronological or unparseable timestamps increment `invalid_timestamps` and isolate the record.
3. **Numeric Finiteness**: The `amount` field is validated as a positive numeric value ($amount > 0$). Negative values or string literals (`NaN`, `Inf`) increment `invalid_amounts` and reject the record.
4. **Category Normalization**: String categories are stripped of whitespace and normalized to standard title cases.

---

## 4. Synthetic Benchmark Distribution Profile

For academic evaluation without requiring external live bank connections, the built-in generator produces a benchmark dataset ($N \approx 15,000$ records, 12-month span) with calibrated distributions:

- **Diurnal Velocity**: Diurnal peaks at 12:00–14:00 (lunchtime payments) and 17:00–21:00 (evening retail rush); minimum at 01:00–05:00.
- **Weekly Seasonality**: Friday and Saturday transaction volumes are $15\%\text{--}20\%$ higher than Monday through Thursday.
- **Month-End Velocity**: Calibrated payroll/settlement spikes on days 28–31 and 1–3 of each month ($+35\%$ volume bump).
- **Payment Distribution**: UPI ($45\%$), Debit Card ($20\%$), ATM ($13\%$), Credit Card ($12\%$), Bank Transfer ($10\%$).
- **Success Rate**: Baseline success $93\%$, failed $5\%$, pending $2\%$.
- **Injected Controlled Outliers**:
  - *2025-03-31*: High-value business liquidity transfer (`TXN999901`, ₹7,85,000).
  - *2025-07-15*: Simulated UPI gateway timeout event (failure rate spikes to $48\%$).
  - *2025-10-25*: Festive season retail payment spike (`TXN999902`, ₹6,20,000).
