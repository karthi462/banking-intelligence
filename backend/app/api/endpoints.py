import io
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException, Response
from fastapi.responses import StreamingResponse

from app.schemas.transaction import (
    ColumnMappingRequest,
    AnomalyDetectionRequest,
    ForecastRequest
)
from app.services.dataset_service import dataset_manager
from app.analytics.kpi import calculate_kpis
from app.analytics.trends import calculate_daily_trends, calculate_trend_aggregations
from app.analytics.temporal import (
    calculate_time_heatmap,
    calculate_calendar_heatmap,
    calculate_weekday_comparison,
    calculate_month_end_analysis,
    calculate_seasonal_decomposition
)
from app.analytics.payment import calculate_payment_analytics
from app.analytics.anomaly import detect_anomalies
from app.analytics.forecasting import calculate_forecast
from app.analytics.branch import calculate_branch_comparison
from app.services.pdf_report import generate_analytics_pdf

router = APIRouter()

# ----------------- DATASET ENDPOINTS ----------------- #

@router.get("/datasets/summary")
def get_dataset_summary():
    """Returns metadata, data quality metrics, and distinct category values for the active dataset."""
    summary = dataset_manager.get_summary()
    return summary

@router.post("/datasets/generate-sample")
def regenerate_sample_dataset(
    records: int = Query(15000, ge=1000, le=50000),
    seed: int = Query(42)
):
    """Regenerates the benchmark synthetic banking dataset with specified record count and seed."""
    dataset_manager.initialize_default_dataset(num_records=records, seed=seed)
    return {
        "status": "success",
        "message": f"Successfully generated {records} synthetic transactions with seed {seed}.",
        "summary": dataset_manager.get_summary()
    }

@router.post("/datasets/upload")
async def upload_dataset_preview(file: UploadFile = File(...)):
    """Uploads a CSV dataset, parses preview rows, and returns headers for mapping."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are currently supported.")

    content = await file.read()
    try:
        raw_df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if raw_df.empty:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")

    # Store raw dataframe in memory for mapping confirmation
    dataset_manager.raw_upload_df = raw_df
    dataset_manager.raw_upload_filename = file.filename

    preview_rows = raw_df.head(5).fillna("").to_dict(orient="records")
    return {
        "filename": file.filename,
        "total_rows": len(raw_df),
        "columns": list(raw_df.columns),
        "preview": preview_rows
    }

@router.post("/datasets/confirm-mapping")
def confirm_column_mapping(mapping: ColumnMappingRequest):
    """Applies column mapping to raw uploaded CSV and makes it the active dataset."""
    if dataset_manager.raw_upload_df is None:
        raise HTTPException(status_code=400, detail="No uploaded dataset awaiting mapping.")

    raw_df = dataset_manager.raw_upload_df.copy()
    
    # Rename mapped columns to internal schema
    rename_dict = {
        mapping.transaction_id: "transaction_id",
        mapping.timestamp: "timestamp",
        mapping.amount: "amount",
    }
    if mapping.transaction_type and mapping.transaction_type in raw_df.columns:
        rename_dict[mapping.transaction_type] = "transaction_type"
    if mapping.payment_mode and mapping.payment_mode in raw_df.columns:
        rename_dict[mapping.payment_mode] = "payment_mode"
    if mapping.branch and mapping.branch in raw_df.columns:
        rename_dict[mapping.branch] = "branch"
    if mapping.transaction_status and mapping.transaction_status in raw_df.columns:
        rename_dict[mapping.transaction_status] = "transaction_status"
    if mapping.account_type and mapping.account_type in raw_df.columns:
        rename_dict[mapping.account_type] = "account_type"

    mapped_df = raw_df.rename(columns=rename_dict)
    
    try:
        dataset_manager.set_active_dataset(
            mapped_df,
            is_synthetic=False,
            name=f"Custom Upload: {getattr(dataset_manager, 'raw_upload_filename', 'user_data.csv')}"
        )
        return {
            "status": "success",
            "message": "Dataset successfully mapped, validated, and activated.",
            "summary": dataset_manager.get_summary()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation failed: {str(e)}")

@router.get("/datasets/rejected-rows")
def get_rejected_rows():
    """Returns invalid rows that were rejected during data quality validation."""
    return dataset_manager.get_invalid_records()

# ----------------- ANALYTICS ENDPOINTS ----------------- #

@router.get("/analytics/kpis")
def get_kpis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    payment_mode: Optional[str] = None,
    transaction_status: Optional[str] = None,
    branch: Optional[str] = None,
    account_type: Optional[str] = None
):
    """Calculates top-level KPI metrics from filtered data."""
    return calculate_kpis(
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        payment_mode=payment_mode,
        transaction_status=transaction_status,
        branch=branch,
        account_type=account_type
    )

@router.get("/analytics/transactions")
def get_transactions_table(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    payment_mode: Optional[str] = None,
    transaction_status: Optional[str] = None,
    branch: Optional[str] = None,
    account_type: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "timestamp",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 15
):
    """Returns paginated, searchable, and sortable transaction records."""
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
        return {"data": [], "total": 0, "page": page, "page_size": page_size, "total_pages": 0}

    # Search across text columns
    if search:
        s = search.lower().strip()
        mask = (
            df["transaction_id"].str.lower().str.contains(s) |
            df["branch"].str.lower().str.contains(s) |
            df["payment_mode"].str.lower().str.contains(s) |
            df["transaction_type"].str.lower().str.contains(s) |
            df["transaction_status"].str.lower().str.contains(s)
        )
        df = df[mask]

    # Sort
    ascending = (sort_order.lower() == "asc")
    if sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=ascending)
    elif sort_by == "timestamp":
        df = df.sort_values(by="parsed_dt", ascending=ascending)

    total_records = len(df)
    total_pages = max(1, (total_records + page_size - 1) // page_size)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    page_df = df.iloc[start_idx:end_idx]
    
    # Calculate simple outlier flag on the page for visual badge
    q75 = df["amount"].quantile(0.75) if len(df) > 10 else 1e9
    iqr = q75 - df["amount"].quantile(0.25) if len(df) > 10 else 0
    anomaly_threshold = q75 + 2.5 * iqr

    records = []
    for _, r in page_df.iterrows():
        records.append({
            "transaction_id": r["transaction_id"],
            "timestamp": r["timestamp"],
            "account_type": r["account_type"],
            "transaction_type": r["transaction_type"],
            "amount": float(r["amount"]),
            "payment_mode": r["payment_mode"],
            "branch": r["branch"],
            "transaction_status": r["transaction_status"],
            "is_anomaly": bool(r["amount"] > anomaly_threshold)
        })

    return {
        "data": records,
        "total": total_records,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/analytics/daily-trends")
def get_daily_trends(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    payment_mode: Optional[str] = None,
    transaction_status: Optional[str] = None,
    branch: Optional[str] = None,
    account_type: Optional[str] = None
):
    """Calculates daily time-series with moving averages and distributions."""
    return calculate_daily_trends(
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        payment_mode=payment_mode,
        transaction_status=transaction_status,
        branch=branch,
        account_type=account_type
    )

@router.get("/analytics/trend-aggregations")
def get_trend_aggregations(
    aggregation: str = "weekly",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    branch: Optional[str] = None
):
    """Aggregates trends weekly/monthly and compares transaction types."""
    return calculate_trend_aggregations(
        aggregation=aggregation,
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        branch=branch
    )

@router.get("/analytics/time-heatmap")
def get_time_heatmap(
    metric: str = "count",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    branch: Optional[str] = None
):
    """Hour of day x Day of week heatmap matrix."""
    return calculate_time_heatmap(
        metric=metric,
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        branch=branch
    )

@router.get("/analytics/calendar-heatmap")
def get_calendar_heatmap(
    year: int = 2025,
    month: int = 5,
    metric: str = "count",
    transaction_type: Optional[str] = None,
    branch: Optional[str] = None
):
    """Calendar month day-by-day heatmap data."""
    return calculate_calendar_heatmap(
        year=year,
        month=month,
        metric=metric,
        transaction_type=transaction_type,
        branch=branch
    )

@router.get("/analytics/weekday-comparison")
def get_weekday_comparison(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    branch: Optional[str] = None
):
    """Day of week aggregations."""
    return calculate_weekday_comparison(start_date=start_date, end_date=end_date, branch=branch)

@router.get("/analytics/month-end-analysis")
def get_month_end_analysis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    branch: Optional[str] = None
):
    """Comparison of Beginning (1-10), Middle (11-20), and End (21-31)."""
    return calculate_month_end_analysis(start_date=start_date, end_date=end_date, branch=branch)

@router.get("/analytics/seasonality")
def get_seasonality_decomposition(
    metric: str = "count",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Classical time-series decomposition into Observed, Trend, Seasonal, and Residual."""
    return calculate_seasonal_decomposition(metric=metric, start_date=start_date, end_date=end_date)

@router.get("/analytics/payment-modes")
def get_payment_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    branch: Optional[str] = None
):
    """Comprehensive payment modes analytics and timelines."""
    return calculate_payment_analytics(start_date=start_date, end_date=end_date, branch=branch)

@router.post("/analytics/anomalies")
def post_anomaly_detection(req: AnomalyDetectionRequest):
    """Statistical anomaly detection via MAD, IQR, or Residual methods."""
    return detect_anomalies(
        metric=req.metric,
        aggregation=req.aggregation,
        method=req.method,
        threshold=req.threshold,
        rolling_window=req.rolling_window,
        start_date=req.start_date,
        end_date=req.end_date,
        transaction_type=req.transaction_type,
        branch=req.branch
    )

@router.post("/analytics/forecast")
def post_forecast(req: ForecastRequest):
    """Chronological time-series forecasting with train/test evaluation."""
    return calculate_forecast(
        metric=req.metric,
        model_name=req.model,
        horizon=req.horizon,
        start_date=req.start_date,
        end_date=req.end_date,
        test_split_days=req.test_split_days
    )

@router.get("/analytics/branch-comparison")
def get_branch_comparison(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    sort_by: str = "total_amount"
):
    """Cross-branch metrics, heatmaps, timelines, and scatter points."""
    return calculate_branch_comparison(
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        sort_by=sort_by
    )

# ----------------- EXPORT ENDPOINTS ----------------- #

@router.get("/exports/transactions")
def export_transactions_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    payment_mode: Optional[str] = None,
    transaction_status: Optional[str] = None,
    branch: Optional[str] = None
):
    """Streams filtered transactions as a downloadable CSV."""
    df = dataset_manager.get_filtered_df(
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        payment_mode=payment_mode,
        transaction_status=transaction_status,
        branch=branch
    )
    # Exclude internal parsing columns
    export_df = df.drop(columns=["parsed_dt", "date", "period"], errors="ignore")
    csv_buf = io.StringIO()
    export_df.to_csv(csv_buf, index=False)
    csv_buf.seek(0)

    return StreamingResponse(
        iter([csv_buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=filtered_transactions.csv"}
    )

@router.get("/exports/anomalies")
def export_anomalies_csv(
    method: str = "mad",
    threshold: float = 3.0,
    metric: str = "amount"
):
    """Streams anomaly detection output as a downloadable CSV."""
    res = detect_anomalies(metric=metric, method=method, threshold=threshold)
    anomalies = res.get("anomalies", [])
    df = pd.DataFrame(anomalies)
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_buf.seek(0)

    return StreamingResponse(
        iter([csv_buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=anomalies_{method}_{metric}.csv"}
    )

@router.get("/exports/pdf-report")
def export_pdf_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    branch: Optional[str] = None
):
    """Generates and streams an executive PDF analytics report."""
    pdf_bytes = generate_analytics_pdf(
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        branch=branch
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Banking_Intelligence_Report.pdf"}
    )
