import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.services.dataset_service import dataset_manager

def calculate_payment_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    branch: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes comprehensive payment mode analytics including time series trends,
    stacked area data, status breakdowns, and method comparisons.
    """
    df = dataset_manager.get_filtered_df(start_date=start_date, end_date=end_date, branch=branch)
    if df.empty:
        return {
            "modes_summary": [],
            "status_summary": [],
            "timeline": [],
            "status_timeline": []
        }

    # Summary by payment mode
    pm_summary = df.groupby("payment_mode").agg(
        count=("transaction_id", "count"),
        total_amount=("amount", "sum"),
        avg_amount=("amount", "mean")
    ).reset_index()

    # Success rate per payment mode
    succ_df = df[df["transaction_status"].str.lower() == "successful"]
    succ_counts = succ_df.groupby("payment_mode")["transaction_id"].count().to_dict()

    modes_summary = []
    total_txns = len(df)
    total_val = df["amount"].sum()

    for _, r in pm_summary.iterrows():
        m = r["payment_mode"]
        c = int(r["count"])
        sc = succ_counts.get(m, 0)
        s_rate = (sc / c * 100.0) if c > 0 else 0.0

        modes_summary.append({
            "mode": m,
            "count": c,
            "total_amount": round(float(r["total_amount"]), 2),
            "avg_amount": round(float(r["avg_amount"]), 2),
            "success_rate": round(s_rate, 2),
            "pct_of_volume": round(c / total_txns * 100.0, 1) if total_txns > 0 else 0.0,
            "pct_of_value": round(float(r["total_amount"]) / total_val * 100.0, 1) if total_val > 0 else 0.0
        })

    # Summary by transaction status
    status_summary = []
    st_group = df.groupby("transaction_status").agg(
        count=("transaction_id", "count"),
        total_amount=("amount", "sum")
    ).reset_index()
    for _, r in st_group.iterrows():
        status_summary.append({
            "status": r["transaction_status"],
            "count": int(r["count"]),
            "total_amount": round(float(r["total_amount"]), 2),
            "pct": round(int(r["count"]) / total_txns * 100.0, 1) if total_txns > 0 else 0.0
        })

    # Weekly / Daily timeline for stacked area chart and lines
    # Default to weekly for clear readability if > 60 days, otherwise daily
    df["date"] = df["parsed_dt"].dt.date
    unique_days = df["date"].nunique()
    freq = "W-MON" if unique_days > 45 else "D"
    df["period"] = df["parsed_dt"].dt.to_period(freq[0]).dt.to_timestamp()

    timeline_pivot_count = df.pivot_table(
        index="period",
        columns="payment_mode",
        values="transaction_id",
        aggfunc="count",
        fill_value=0
    )
    timeline_pivot_amount = df.pivot_table(
        index="period",
        columns="payment_mode",
        values="amount",
        aggfunc="sum",
        fill_value=0.0
    )

    all_modes = list(df["payment_mode"].unique())
    timeline = []
    for p_idx in timeline_pivot_count.index:
        p_label = p_idx.strftime("%d %b %Y")
        rec = {"period": p_label, "date": p_idx.strftime("%Y-%m-%d")}
        for m in all_modes:
            rec[f"{m}_count"] = int(timeline_pivot_count.loc[p_idx, m]) if m in timeline_pivot_count.columns else 0
            rec[f"{m}_amount"] = round(float(timeline_pivot_amount.loc[p_idx, m]), 2) if m in timeline_pivot_amount.columns else 0.0
        timeline.append(rec)

    # Status timeline (Successful vs Failed vs Pending)
    status_pivot = df.pivot_table(
        index="period",
        columns="transaction_status",
        values="transaction_id",
        aggfunc="count",
        fill_value=0
    )
    status_timeline = []
    all_statuses = ["Successful", "Failed", "Pending"]
    for p_idx in status_pivot.index:
        rec = {"period": p_idx.strftime("%d %b %Y"), "date": p_idx.strftime("%Y-%m-%d")}
        for st in all_statuses:
            rec[st] = int(status_pivot.loc[p_idx, st]) if st in status_pivot.columns else 0
        status_timeline.append(rec)

    return {
        "modes_summary": modes_summary,
        "status_summary": status_summary,
        "timeline": timeline,
        "status_timeline": status_timeline,
        "available_modes": all_modes
    }
