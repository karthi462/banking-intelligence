import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from statsmodels.tsa.seasonal import seasonal_decompose
from app.services.dataset_service import dataset_manager

DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def calculate_time_heatmap(
    metric: str = "count", # "count", "amount", "avg_amount"
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    branch: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes a 24-hour x 7-day heatmap matrix from timestamps for count, sum amount, or avg amount.
    """
    df = dataset_manager.get_filtered_df(
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        branch=branch
    )

    if df.empty:
        return {"days": DAYS_ORDER, "hours": list(range(24)), "matrix": [], "metric": metric}

    df["hour"] = df["parsed_dt"].dt.hour
    df["day_name"] = df["parsed_dt"].dt.day_name()

    if metric == "amount":
        pivot = df.pivot_table(index="day_name", columns="hour", values="amount", aggfunc="sum", fill_value=0.0)
    elif metric == "avg_amount":
        pivot = df.pivot_table(index="day_name", columns="hour", values="amount", aggfunc="mean", fill_value=0.0)
    else: # count
        pivot = df.pivot_table(index="day_name", columns="hour", values="transaction_id", aggfunc="count", fill_value=0)

    # Reindex to ensure all 7 days and 24 hours exist
    pivot = pivot.reindex(index=DAYS_ORDER, columns=list(range(24)), fill_value=0)

    matrix = []
    max_val = 0.0
    for day in DAYS_ORDER:
        row_vals = []
        for h in range(24):
            val = round(float(pivot.loc[day, h]), 2) if metric != "count" else int(pivot.loc[day, h])
            row_vals.append(val)
            if val > max_val:
                max_val = val
        matrix.append({"day": day, "values": row_vals})

    return {
        "days": DAYS_ORDER,
        "hours": list(range(24)),
        "matrix": matrix,
        "metric": metric,
        "max_value": max_val
    }

def calculate_calendar_heatmap(
    year: int,
    month: int,
    metric: str = "count",
    transaction_type: Optional[str] = None,
    branch: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes daily data for a specific calendar month and year.
    """
    df = dataset_manager.get_filtered_df(
        transaction_type=transaction_type,
        branch=branch
    )

    if df.empty:
        return {"days": [], "year": year, "month": month, "metric": metric}

    df_month = df[(df["parsed_dt"].dt.year == year) & (df["parsed_dt"].dt.month == month)].copy()

    # Determine days in this month
    start_m = pd.Timestamp(year=year, month=month, day=1)
    end_m = start_m + pd.offsets.MonthEnd(1)
    all_days = pd.date_range(start=start_m, end=end_m, freq="D")

    daily = df_month.groupby(df_month["parsed_dt"].dt.date).agg(
        count=("transaction_id", "count"),
        total_amount=("amount", "sum")
    ).reset_index()

    daily["date"] = pd.to_datetime(daily["parsed_dt"])
    daily = daily.set_index("date").reindex(all_days, fill_value=0).reset_index()
    daily = daily.rename(columns={"index": "date"})

    calendar_days = []
    for _, r in daily.iterrows():
        calendar_days.append({
            "date": r["date"].strftime("%Y-%m-%d"),
            "day_number": r["date"].day,
            "day_of_week": r["date"].day_name(),
            "count": int(r["count"]),
            "amount": round(float(r["total_amount"]), 2)
        })

    return {
        "year": year,
        "month": month,
        "metric": metric,
        "days": calendar_days
    }

def calculate_weekday_comparison(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    branch: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes aggregated comparisons across Monday to Sunday.
    """
    df = dataset_manager.get_filtered_df(start_date=start_date, end_date=end_date, branch=branch)
    if df.empty:
        return {"weekdays": []}

    df["day_name"] = df["parsed_dt"].dt.day_name()
    dow_group = df.groupby("day_name").agg(
        count=("transaction_id", "count"),
        total_amount=("amount", "sum"),
        avg_amount=("amount", "mean")
    ).reindex(DAYS_ORDER, fill_value=0).reset_index()

    result = []
    for _, r in dow_group.iterrows():
        result.append({
            "day": r["day_name"],
            "count": int(r["count"]),
            "total_amount": round(float(r["total_amount"]), 2),
            "avg_amount": round(float(r["avg_amount"]), 2)
        })

    return {"weekdays": result}

def calculate_month_end_analysis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    branch: Optional[str] = None
) -> Dict[str, Any]:
    """
    Analyzes transaction patterns partitioned into Beginning (1-10), Middle (11-20),
    and Month-End (21-31) of the calendar month.
    """
    df = dataset_manager.get_filtered_df(start_date=start_date, end_date=end_date, branch=branch)
    if df.empty:
        return {"segments": []}

    def categorize_day(d):
        if d <= 10:
            return "Beginning (Days 1-10)"
        elif d <= 20:
            return "Middle (Days 11-20)"
        else:
            return "Month-End (Days 21-31)"

    df["segment"] = df["parsed_dt"].dt.day.apply(categorize_day)
    seg_group = df.groupby("segment").agg(
        count=("transaction_id", "count"),
        total_amount=("amount", "sum"),
        avg_amount=("amount", "mean")
    ).reset_index()

    segments = []
    order = ["Beginning (Days 1-10)", "Middle (Days 11-20)", "Month-End (Days 21-31)"]
    for seg_name in order:
        match = seg_group[seg_group["segment"] == seg_name]
        if not match.empty:
            r = match.iloc[0]
            segments.append({
                "segment": seg_name,
                "count": int(r["count"]),
                "total_amount": round(float(r["total_amount"]), 2),
                "avg_amount": round(float(r["avg_amount"]), 2),
                "pct_of_total_count": round(int(r["count"]) / len(df) * 100.0, 1),
                "pct_of_total_amount": round(float(r["total_amount"]) / df["amount"].sum() * 100.0, 1)
            })

    return {"segments": segments}

def calculate_seasonal_decomposition(
    metric: str = "count",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Applies classical additive time-series decomposition into Observed, Trend,
    Seasonal (weekly period=7), and Residual components using statsmodels.
    """
    df = dataset_manager.get_filtered_df(start_date=start_date, end_date=end_date)
    if df.empty:
        return {"available": False, "reason": "No data available."}

    df["date"] = df["parsed_dt"].dt.date
    if metric == "amount":
        daily = df.groupby("date")["amount"].sum().reset_index()
        col = "amount"
    else:
        daily = df.groupby("date")["transaction_id"].count().reset_index()
        col = "transaction_id"

    # Reindex daily series
    all_dates = pd.date_range(start=daily["date"].min(), end=daily["date"].max(), freq="D")
    daily["date"] = pd.to_datetime(daily["date"])
    series = daily.set_index("date").reindex(all_dates, fill_value=0)[col]

    # Need at least 2 complete cycles (14 observations)
    if len(series) < 14:
        return {
            "available": False,
            "reason": f"Time-series decomposition requires at least 14 continuous daily observations (2 full 7-day cycles). The current selection contains only {len(series)} days."
        }

    try:
        decomp = seasonal_decompose(series, model="additive", period=7, extrapolate_trend="period")
        
        records = []
        for dt_idx, obs, tr, seas, res in zip(
            series.index, decomp.observed, decomp.trend, decomp.seasonal, decomp.resid
        ):
            records.append({
                "date": dt_idx.strftime("%Y-%m-%d"),
                "observed": round(float(obs), 2),
                "trend": round(float(tr), 2) if pd.notnull(tr) else None,
                "seasonal": round(float(seas), 2) if pd.notnull(seas) else None,
                "residual": round(float(res), 2) if pd.notnull(res) else None
            })

        return {
            "available": True,
            "metric": metric,
            "model": "additive",
            "period": 7,
            "explanation": "Classical additive decomposition separating the continuous daily series into underlying trend, 7-day weekly seasonality, and irregular residual noise.",
            "components": records
        }
    except Exception as e:
        return {
            "available": False,
            "reason": f"Decomposition failed: {str(e)}"
        }
