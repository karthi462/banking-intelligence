import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.services.dataset_service import dataset_manager

def calculate_daily_trends(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    payment_mode: Optional[str] = None,
    transaction_status: Optional[str] = None,
    branch: Optional[str] = None,
    account_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes daily time-series metrics including transaction count, total amount,
    7-day and 30-day moving averages, and cumulative transaction value.
    """
    df = dataset_manager.get_filtered_df(
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        payment_mode=payment_mode,
        transaction_status=transaction_status,
        branch=branch,
        account_type=account_type
    )

    if df.empty:
        return {
            "daily_data": [],
            "summary": {"days_count": 0, "has_30d_ma": False},
            "types_distribution": [],
            "payment_distribution": []
        }

    # Group by date
    df["date"] = df["parsed_dt"].dt.date
    daily = df.groupby("date").agg(
        transaction_count=("transaction_id", "count"),
        total_amount=("amount", "sum"),
        avg_amount=("amount", "mean")
    ).reset_index()

    # Reindex over complete date range so missing days show 0 count and 0 amount
    all_dates = pd.date_range(start=daily["date"].min(), end=daily["date"].max(), freq="D")
    daily["date"] = pd.to_datetime(daily["date"])
    daily = daily.set_index("date").reindex(all_dates, fill_value=0).reset_index()
    daily = daily.rename(columns={"index": "date"})

    daily["date_str"] = daily["date"].dt.strftime("%Y-%m-%d")
    daily["day_of_week"] = daily["date"].dt.day_name()

    # Calculate 7-day and 30-day moving averages
    daily["ma_7_count"] = daily["transaction_count"].rolling(window=7, min_periods=1).mean().round(2)
    daily["ma_7_amount"] = daily["total_amount"].rolling(window=7, min_periods=1).mean().round(2)

    has_30d = len(daily) >= 30
    if has_30d:
        daily["ma_30_count"] = daily["transaction_count"].rolling(window=30, min_periods=15).mean().round(2)
        daily["ma_30_amount"] = daily["total_amount"].rolling(window=30, min_periods=15).mean().round(2)
    else:
        daily["ma_30_count"] = None
        daily["ma_30_amount"] = None

    # Cumulative running sum
    daily["cumulative_amount"] = daily["total_amount"].cumsum().round(2)
    daily["cumulative_count"] = daily["transaction_count"].cumsum()

    # Convert to JSON-friendly records
    records = []
    for _, r in daily.iterrows():
        records.append({
            "date": r["date_str"],
            "day_of_week": r["day_of_week"],
            "count": int(r["transaction_count"]),
            "amount": round(float(r["total_amount"]), 2),
            "avg_amount": round(float(r["avg_amount"]), 2) if r["avg_amount"] > 0 else 0.0,
            "ma_7_count": float(r["ma_7_count"]) if pd.notnull(r["ma_7_count"]) else None,
            "ma_7_amount": float(r["ma_7_amount"]) if pd.notnull(r["ma_7_amount"]) else None,
            "ma_30_count": float(r["ma_30_count"]) if pd.notnull(r["ma_30_count"]) else None,
            "ma_30_amount": float(r["ma_30_amount"]) if pd.notnull(r["ma_30_amount"]) else None,
            "cumulative_amount": float(r["cumulative_amount"]),
            "cumulative_count": int(r["cumulative_count"])
        })

    # Types distribution
    type_group = df.groupby("transaction_type").agg(
        count=("transaction_id", "count"),
        total_amount=("amount", "sum"),
        avg_amount=("amount", "mean")
    ).reset_index()
    types_dist = [
        {
            "type": r["transaction_type"],
            "count": int(r["count"]),
            "total_amount": round(float(r["total_amount"]), 2),
            "avg_amount": round(float(r["avg_amount"]), 2)
        }
        for _, r in type_group.iterrows()
    ]

    # Payment distribution
    pay_group = df.groupby("payment_mode").agg(
        count=("transaction_id", "count"),
        total_amount=("amount", "sum"),
        avg_amount=("amount", "mean")
    ).reset_index()
    pay_dist = [
        {
            "mode": r["payment_mode"],
            "count": int(r["count"]),
            "total_amount": round(float(r["total_amount"]), 2),
            "avg_amount": round(float(r["avg_amount"]), 2)
        }
        for _, r in pay_group.iterrows()
    ]

    return {
        "daily_data": records,
        "summary": {
            "days_count": len(daily),
            "has_30d_ma": has_30d,
            "min_date": daily["date_str"].min(),
            "max_date": daily["date_str"].max()
        },
        "types_distribution": types_dist,
        "payment_distribution": pay_dist
    }

def calculate_trend_aggregations(
    aggregation: str = "weekly", # "daily", "weekly", "monthly"
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    branch: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes weekly or monthly aggregated trends and deposit vs withdrawal comparisons.
    """
    df = dataset_manager.get_filtered_df(
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        branch=branch
    )

    if df.empty:
        return {"aggregations": [], "type_comparison": []}

    freq_code = "W-MON" if aggregation == "weekly" else ("MS" if aggregation == "monthly" else "D")
    df["period"] = df["parsed_dt"].dt.to_period(freq_code[0]).dt.to_timestamp()

    # Aggregated time series
    agg_df = df.groupby("period").agg(
        count=("transaction_id", "count"),
        total_amount=("amount", "sum"),
        avg_amount=("amount", "mean")
    ).reset_index()

    aggregations = []
    for _, r in agg_df.iterrows():
        period_label = r["period"].strftime("%b %Y") if aggregation == "monthly" else (r["period"].strftime("W %d %b %Y") if aggregation == "weekly" else r["period"].strftime("%Y-%m-%d"))
        aggregations.append({
            "period": period_label,
            "date": r["period"].strftime("%Y-%m-%d"),
            "count": int(r["count"]),
            "total_amount": round(float(r["total_amount"]), 2),
            "avg_amount": round(float(r["avg_amount"]), 2)
        })

    # Type comparison over periods (Deposits vs Withdrawals vs Transfers vs Payments)
    type_pivot = df.pivot_table(
        index="period",
        columns="transaction_type",
        values="amount",
        aggfunc=["sum", "count"],
        fill_value=0
    )

    type_comparison = []
    for period_idx in type_pivot.index:
        label = period_idx.strftime("%b %Y") if aggregation == "monthly" else period_idx.strftime("%d %b %Y")
        row_dict = {"period": label, "date": period_idx.strftime("%Y-%m-%d")}
        for col in type_pivot["sum"].columns:
            row_dict[f"{col}_amount"] = round(float(type_pivot["sum"].loc[period_idx, col]), 2)
        for col in type_pivot["count"].columns:
            row_dict[f"{col}_count"] = int(type_pivot["count"].loc[period_idx, col])
        type_comparison.append(row_dict)

    return {
        "aggregations": aggregations,
        "type_comparison": type_comparison
    }
