import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from datetime import timedelta
from app.services.dataset_service import dataset_manager

def calculate_kpis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    payment_mode: Optional[str] = None,
    transaction_status: Optional[str] = None,
    branch: Optional[str] = None,
    account_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculates the 6 primary dashboard KPIs from the filtered dataset, along with
    a mathematically rigorous comparison against the preceding equivalent time window.
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
            "total_transactions": 0,
            "total_transaction_value": 0.0,
            "average_transaction_value": 0.0,
            "successful_transaction_rate": 0.0,
            "failed_transaction_count": 0,
            "flagged_anomalies_count": 0,
            "matching_transactions_count": 0,
            "period_comparison": {
                "available": False,
                "reason": "No transactions match current filters."
            },
            "currency_symbol": "₹"
        }

    total_txns = len(df)
    total_val = float(df["amount"].sum())
    avg_val = float(df["amount"].mean()) if total_txns > 0 else 0.0

    success_df = df[df["transaction_status"].str.lower() == "successful"]
    failed_df = df[df["transaction_status"].str.lower() == "failed"]

    success_rate = (len(success_df) / total_txns * 100.0) if total_txns > 0 else 0.0
    failed_count = len(failed_df)

    # Flagged anomalies (quick robust baseline using MAD on daily amounts or IQR on raw amount)
    q25 = df["amount"].quantile(0.25)
    q75 = df["amount"].quantile(0.75)
    iqr = q75 - q25
    anomaly_threshold = q75 + (2.5 * iqr) if iqr > 0 else df["amount"].quantile(0.99)
    flagged_anomalies = int((df["amount"] > anomaly_threshold).sum())

    # Preceding equivalent period comparison
    period_comparison = {"available": False, "reason": "Insufficient historical data for comparison."}
    
    if start_date and end_date:
        try:
            cur_start = pd.to_datetime(start_date)
            cur_end = pd.to_datetime(end_date)
            duration = (cur_end - cur_start).total_seconds()
            
            if duration > 0:
                prev_end = cur_start - timedelta(seconds=1)
                prev_start = cur_start - timedelta(seconds=duration)
                
                prev_df = dataset_manager.get_filtered_df(
                    start_date=prev_start.strftime("%Y-%m-%d %H:%M:%S"),
                    end_date=prev_end.strftime("%Y-%m-%d %H:%M:%S"),
                    transaction_type=transaction_type,
                    payment_mode=payment_mode,
                    transaction_status=transaction_status,
                    branch=branch,
                    account_type=account_type
                )
                
                if len(prev_df) >= 10:
                    prev_total_txns = len(prev_df)
                    prev_total_val = float(prev_df["amount"].sum())
                    prev_avg_val = float(prev_df["amount"].mean())
                    prev_success_rate = (len(prev_df[prev_df["transaction_status"].str.lower() == "successful"]) / prev_total_txns * 100.0)

                    pct_txn = ((total_txns - prev_total_txns) / prev_total_txns * 100.0) if prev_total_txns > 0 else 0.0
                    pct_val = ((total_val - prev_total_val) / prev_total_val * 100.0) if prev_total_val > 0 else 0.0
                    pct_avg = ((avg_val - prev_avg_val) / prev_avg_val * 100.0) if prev_avg_val > 0 else 0.0
                    pct_succ = success_rate - prev_success_rate

                    period_comparison = {
                        "available": True,
                        "prev_period_label": f"{prev_start.strftime('%d %b %Y')} - {prev_end.strftime('%d %b %Y')}",
                        "txns_change_pct": round(pct_txn, 1),
                        "value_change_pct": round(pct_val, 1),
                        "avg_val_change_pct": round(pct_avg, 1),
                        "success_rate_change_pts": round(pct_succ, 1)
                    }
                else:
                    period_comparison = {
                        "available": False,
                        "reason": f"Only {len(prev_df)} records found in preceding period ({prev_start.strftime('%d %b')} - {prev_end.strftime('%d %b')}). Minimum 10 required for statistical validity."
                    }
        except Exception as e:
            period_comparison = {"available": False, "reason": str(e)}

    return {
        "total_transactions": total_txns,
        "total_transaction_value": round(total_val, 2),
        "average_transaction_value": round(avg_val, 2),
        "successful_transaction_rate": round(success_rate, 2),
        "failed_transaction_count": failed_count,
        "flagged_anomalies_count": flagged_anomalies,
        "matching_transactions_count": total_txns,
        "period_comparison": period_comparison,
        "currency_symbol": "₹"
    }
