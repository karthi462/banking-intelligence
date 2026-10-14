import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.services.dataset_service import dataset_manager

def detect_anomalies(
    metric: str = "amount", # "amount" or "count"
    aggregation: str = "daily", # "daily" or "weekly"
    method: str = "mad", # "mad", "iqr", "residual"
    threshold: float = 3.0,
    rolling_window: int = 14,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    branch: Optional[str] = None
) -> Dict[str, Any]:
    """
    Statistical anomaly detection on aggregated time-series observations.
    Supports Rolling Median & MAD, Interquartile Range (IQR), and Residual-based detection.
    """
    df = dataset_manager.get_filtered_df(
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        branch=branch
    )

    if df.empty:
        return {
            "series": [],
            "anomalies": [],
            "total_observations": 0,
            "anomaly_count": 0,
            "normal_count": 0,
            "method": method,
            "threshold": threshold,
            "metric": metric,
            "disclaimer": "No data available for the selected filters."
        }

    freq = "W-MON" if aggregation == "weekly" else "D"
    df["period"] = df["parsed_dt"].dt.to_period(freq[0]).dt.to_timestamp()

    grouped = df.groupby("period").agg(
        total_amount=("amount", "sum"),
        count=("transaction_id", "count"),
        avg_amount=("amount", "mean")
    ).reset_index()

    # Reindex over full continuous range
    all_periods = pd.date_range(start=grouped["period"].min(), end=grouped["period"].max(), freq=freq)
    grouped["period"] = pd.to_datetime(grouped["period"])
    grouped = grouped.set_index("period").reindex(all_periods, fill_value=0).reset_index()
    grouped = grouped.rename(columns={"index": "period"})

    target_col = "total_amount" if metric == "amount" else "count"
    values = grouped[target_col].astype(float)
    n = len(values)

    anomalies_list = []
    series_records = []

    if method == "mad":
        # Method 1: Rolling Median and MAD
        # Robust z-score = 0.6745 * |x - median| / MAD
        window = min(rolling_window, max(5, n // 2))
        rolling_median = values.rolling(window=window, min_periods=max(3, window // 2), center=False).median()
        # Backfill initial window
        rolling_median = rolling_median.bfill().fillna(values.median())

        # Compute MAD within rolling window
        rolling_mad = []
        for i in range(n):
            start_idx = max(0, i - window + 1)
            window_vals = values.iloc[start_idx : i + 1]
            med = float(np.median(window_vals))
            mad_val = float(np.median(np.abs(window_vals - med)))
            # Zero MAD safeguard: fallback to 0.1 * std or small constant
            if mad_val < 1e-4:
                std_fallback = float(np.std(window_vals))
                mad_val = std_fallback * 0.6745 if std_fallback > 1e-4 else 1.0
            rolling_mad.append(mad_val)
        
        rolling_mad = pd.Series(rolling_mad, index=values.index)

        # Deviation score
        dev_scores = 0.6745 * np.abs(values - rolling_median) / rolling_mad
        flags = dev_scores > threshold

        for idx, r in grouped.iterrows():
            is_anomaly = bool(flags.iloc[idx])
            obs_val = float(values.iloc[idx])
            baseline = float(rolling_median.iloc[idx])
            dev = float(dev_scores.iloc[idx])
            date_str = r["period"].strftime("%Y-%m-%d")

            item = {
                "date": date_str,
                "observed": round(obs_val, 2),
                "baseline": round(baseline, 2),
                "count": int(r["count"]),
                "amount": round(float(r["total_amount"]), 2),
                "is_anomaly": is_anomaly,
                "deviation_score": round(dev, 2)
            }
            series_records.append(item)

            if is_anomaly:
                diff_pct = ((obs_val - baseline) / baseline * 100.0) if baseline > 0 else 0.0
                direction = "surged above" if obs_val > baseline else "fell below"
                explanation = (
                    f"Observation ({obs_val:,.2f}) {direction} the {window}-day rolling median "
                    f"baseline ({baseline:,.2f}) with a robust MAD score of {dev:.2f} (threshold: {threshold}). "
                    f"Represents a {abs(diff_pct):.1f}% deviation from local expectation."
                )
                anomalies_list.append({
                    "date": date_str,
                    "aggregated_count": int(r["count"]),
                    "aggregated_amount": round(float(r["total_amount"]), 2),
                    "baseline": round(baseline, 2),
                    "observed": round(obs_val, 2),
                    "deviation_score": round(dev, 2),
                    "method": "Rolling Median & MAD",
                    "explanation": explanation
                })

    elif method == "iqr":
        # Method 2: Interquartile Range (IQR) rule
        q1 = float(values.quantile(0.25))
        q3 = float(values.quantile(0.75))
        iqr_val = q3 - q1
        baseline = float(values.median())

        lower_bound = q1 - (threshold * iqr_val)
        upper_bound = q3 + (threshold * iqr_val)

        for idx, r in grouped.iterrows():
            obs_val = float(values.iloc[idx])
            is_anomaly = bool(obs_val > upper_bound or obs_val < lower_bound)
            # Distance in IQR units
            dev = abs(obs_val - baseline) / (iqr_val if iqr_val > 0 else 1.0)
            date_str = r["period"].strftime("%Y-%m-%d")

            item = {
                "date": date_str,
                "observed": round(obs_val, 2),
                "baseline": round(baseline, 2),
                "lower_bound": round(lower_bound, 2),
                "upper_bound": round(upper_bound, 2),
                "count": int(r["count"]),
                "amount": round(float(r["total_amount"]), 2),
                "is_anomaly": is_anomaly,
                "deviation_score": round(dev, 2)
            }
            series_records.append(item)

            if is_anomaly:
                bound_hit = f"upper bound ({upper_bound:,.2f})" if obs_val > upper_bound else f"lower bound ({lower_bound:,.2f})"
                explanation = (
                    f"Observation ({obs_val:,.2f}) exceeded the IQR outer fence {bound_hit} "
                    f"[Q1={q1:,.2f}, Q3={q3:,.2f}, IQR={iqr_val:,.2f}] by {dev:.2f} IQR multiples."
                )
                anomalies_list.append({
                    "date": date_str,
                    "aggregated_count": int(r["count"]),
                    "aggregated_amount": round(float(r["total_amount"]), 2),
                    "baseline": round(baseline, 2),
                    "observed": round(obs_val, 2),
                    "deviation_score": round(dev, 2),
                    "method": "Interquartile Range (IQR)",
                    "explanation": explanation
                })

    else:
        # Method 3: Residual z-score from 7-day smoothing
        smoothed = values.rolling(window=7, min_periods=1, center=True).mean()
        residuals = values - smoothed
        std_res = float(residuals.std())
        if std_res < 1e-4:
            std_res = 1.0
        z_scores = np.abs(residuals) / std_res

        for idx, r in grouped.iterrows():
            obs_val = float(values.iloc[idx])
            baseline = float(smoothed.iloc[idx])
            dev = float(z_scores.iloc[idx])
            is_anomaly = bool(dev > threshold)
            date_str = r["period"].strftime("%Y-%m-%d")

            item = {
                "date": date_str,
                "observed": round(obs_val, 2),
                "baseline": round(baseline, 2),
                "count": int(r["count"]),
                "amount": round(float(r["total_amount"]), 2),
                "is_anomaly": is_anomaly,
                "deviation_score": round(dev, 2)
            }
            series_records.append(item)

            if is_anomaly:
                explanation = (
                    f"Residual error ({abs(obs_val - baseline):,.2f}) deviated from 7-day moving trend "
                    f"by {dev:.2f} standard deviations (threshold: {threshold})."
                )
                anomalies_list.append({
                    "date": date_str,
                    "aggregated_count": int(r["count"]),
                    "aggregated_amount": round(float(r["total_amount"]), 2),
                    "baseline": round(baseline, 2),
                    "observed": round(obs_val, 2),
                    "deviation_score": round(dev, 2),
                    "method": "Residual Z-Score",
                    "explanation": explanation
                })

    total_obs = len(series_records)
    anomaly_cnt = len(anomalies_list)

    return {
        "series": series_records,
        "anomalies": anomalies_list,
        "total_observations": total_obs,
        "anomaly_count": anomaly_cnt,
        "normal_count": total_obs - anomaly_cnt,
        "anomaly_percentage": round(anomaly_cnt / total_obs * 100.0, 1) if total_obs > 0 else 0.0,
        "method": method,
        "threshold": threshold,
        "metric": metric,
        "disclaimer": (
            "Academic Notice: This module identifies statistical distribution outliers in aggregate time-series. "
            "A statistically unusual daily total or single transaction is never proof of fraudulent or illicit conduct. "
            "All flagged events represent candidates for secondary verification."
        )
    }
