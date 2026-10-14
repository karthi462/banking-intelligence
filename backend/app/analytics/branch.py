import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.services.dataset_service import dataset_manager

def calculate_branch_comparison(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    sort_by: str = "total_amount" # "total_amount", "count", "avg_amount", "success_rate"
) -> Dict[str, Any]:
    """
    Computes comparative analytics across bank branches including performance metrics,
    monthly heatmaps, time-series progression, and volume vs average value scatter data.
    """
    df = dataset_manager.get_filtered_df(start_date=start_date, end_date=end_date, transaction_type=transaction_type)
    if df.empty:
        return {
            "branch_metrics": [],
            "monthly_heatmap": [],
            "branch_timeline": [],
            "scatter_data": [],
            "available_branches": []
        }

    all_branches = sorted(df["branch"].unique().tolist())
    total_txns = len(df)
    total_val = float(df["amount"].sum())

    # Branch metrics
    metrics = []
    for b in all_branches:
        b_df = df[df["branch"] == b]
        cnt = len(b_df)
        val = float(b_df["amount"].sum())
        avg_v = float(b_df["amount"].mean()) if cnt > 0 else 0.0
        succ_cnt = len(b_df[b_df["transaction_status"].str.lower() == "successful"])
        succ_rate = (succ_cnt / cnt * 100.0) if cnt > 0 else 0.0

        metrics.append({
            "branch": b,
            "count": cnt,
            "total_amount": round(val, 2),
            "avg_amount": round(avg_v, 2),
            "success_rate": round(succ_rate, 2),
            "pct_of_total_count": round(cnt / total_txns * 100.0, 1) if total_txns > 0 else 0.0,
            "pct_of_total_amount": round(val / total_val * 100.0, 1) if total_val > 0 else 0.0
        })

    # Sort
    if sort_by in ["total_amount", "count", "avg_amount", "success_rate"]:
        metrics.sort(key=lambda x: x[sort_by], reverse=True)

    # Monthly heatmap by branch (Months along columns, branches along rows)
    df["month_label"] = df["parsed_dt"].dt.strftime("%b %Y")
    months_order = sorted(df["parsed_dt"].dt.to_period("M").unique().astype(str).tolist())
    # Map to formatted labels
    month_dt_map = {m_str: pd.to_datetime(m_str).strftime("%b %Y") for m_str in months_order}
    ordered_labels = [month_dt_map[m] for m in months_order]

    month_pivot = df.pivot_table(
        index="branch",
        columns="month_label",
        values="amount",
        aggfunc="sum",
        fill_value=0.0
    )

    monthly_heatmap = []
    for b in all_branches:
        row_vals = []
        for m_lbl in ordered_labels:
            val = round(float(month_pivot.loc[b, m_lbl]), 2) if (b in month_pivot.index and m_lbl in month_pivot.columns) else 0.0
            row_vals.append(val)
        monthly_heatmap.append({
            "branch": b,
            "values": row_vals
        })

    # Timeline by branch (weekly or monthly)
    unique_days = df["parsed_dt"].dt.date.nunique()
    freq = "W-MON" if unique_days > 45 else "D"
    df["period"] = df["parsed_dt"].dt.to_period(freq[0]).dt.to_timestamp()

    tl_pivot = df.pivot_table(
        index="period",
        columns="branch",
        values="amount",
        aggfunc="sum",
        fill_value=0.0
    )
    branch_timeline = []
    for p_idx in tl_pivot.index:
        rec = {"period": p_idx.strftime("%d %b %Y"), "date": p_idx.strftime("%Y-%m-%d")}
        for b in all_branches:
            rec[b] = round(float(tl_pivot.loc[p_idx, b]), 2) if b in tl_pivot.columns else 0.0
        branch_timeline.append(rec)

    # Scatter data: transaction count vs average transaction value
    scatter_data = [
        {
            "branch": m["branch"],
            "count": m["count"],
            "avg_amount": m["avg_amount"],
            "total_amount": m["total_amount"],
            "success_rate": m["success_rate"]
        }
        for m in metrics
    ]

    return {
        "branch_metrics": metrics,
        "monthly_heatmap": monthly_heatmap,
        "heatmap_months": ordered_labels,
        "branch_timeline": branch_timeline,
        "scatter_data": scatter_data,
        "available_branches": all_branches
    }
