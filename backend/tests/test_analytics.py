import pytest
import pandas as pd
import numpy as np
from app.services.dataset_service import DatasetManager
from app.analytics.kpi import calculate_kpis
from app.analytics.trends import calculate_daily_trends, calculate_trend_aggregations
from app.analytics.anomaly import detect_anomalies
from app.analytics.forecasting import calculate_forecast
from app.analytics.temporal import (
    calculate_time_heatmap,
    calculate_calendar_heatmap,
    calculate_seasonal_decomposition
)
from app.analytics.branch import calculate_branch_comparison

@pytest.fixture(scope="module")
def dm():
    manager = DatasetManager()
    manager.initialize_default_dataset(num_records=1000, seed=123)
    return manager

def test_dataset_generation_and_validation(dm):
    summary = dm.get_summary()
    assert summary.valid_rows == 1002 # 1000 + 2 injected anomalies
    assert summary.total_rows == 1002
    assert summary.invalid_rows == 0
    assert summary.is_synthetic is True
    assert "amount" in summary.columns
    assert "timestamp" in summary.columns

def test_duplicate_id_and_invalid_amount_rejection(dm):
    bad_df = pd.DataFrame([
        {"transaction_id": "T1", "timestamp": "2025-01-01 10:00:00", "amount": 100.0},
        {"transaction_id": "T1", "timestamp": "2025-01-01 11:00:00", "amount": 200.0}, # Duplicate ID
        {"transaction_id": "T2", "timestamp": "2025-01-01 12:00:00", "amount": -50.0}, # Negative amount
        {"transaction_id": "T3", "timestamp": "not-a-date", "amount": 300.0}, # Invalid timestamp
        {"transaction_id": "T4", "timestamp": "2025-01-01 14:00:00", "amount": "abc"} # Non-numeric amount
    ])
    valid_df, summary, invalid_recs = dm.validate_and_clean(bad_df)
    assert len(valid_df) == 1
    assert valid_df.iloc[0]["transaction_id"] == "T1"
    assert len(invalid_recs) == 4
    assert summary.duplicate_ids == 1
    assert summary.invalid_amounts == 2
    assert summary.invalid_timestamps == 1

def test_kpi_calculations(dm):
    kpis = calculate_kpis()
    assert kpis["total_transactions"] > 0
    assert kpis["total_transaction_value"] > 0
    assert kpis["average_transaction_value"] > 0
    assert 0 <= kpis["successful_transaction_rate"] <= 100
    assert kpis["failed_transaction_count"] >= 0

def test_date_range_filtering(dm):
    all_kpis = calculate_kpis()
    filtered_kpis = calculate_kpis(start_date="2025-06-01", end_date="2025-06-30")
    assert filtered_kpis["total_transactions"] < all_kpis["total_transactions"]
    assert filtered_kpis["total_transactions"] > 0

def test_daily_trends_and_moving_averages(dm):
    trends = calculate_daily_trends()
    daily_data = trends["daily_data"]
    assert len(daily_data) > 0
    first_day = daily_data[0]
    assert "count" in first_day
    assert "amount" in first_day
    assert "ma_7_count" in first_day
    assert "cumulative_amount" in first_day
    assert first_day["cumulative_amount"] >= first_day["amount"]

def test_weekly_and_monthly_aggregations(dm):
    weekly = calculate_trend_aggregations(aggregation="weekly")
    assert len(weekly["aggregations"]) > 0
    monthly = calculate_trend_aggregations(aggregation="monthly")
    assert len(monthly["aggregations"]) > 0

def test_anomaly_detection_mad(dm):
    res = detect_anomalies(metric="amount", aggregation="daily", method="mad", threshold=2.5)
    assert res["total_observations"] > 0
    assert res["anomaly_count"] >= 0
    assert len(res["series"]) == res["total_observations"]
    assert "disclaimer" in res

def test_anomaly_detection_iqr(dm):
    res = detect_anomalies(metric="count", aggregation="daily", method="iqr", threshold=1.5)
    assert res["total_observations"] > 0
    assert len(res["series"]) == res["total_observations"]

def test_time_heatmap(dm):
    heatmap = calculate_time_heatmap(metric="count")
    assert len(heatmap["days"]) == 7
    assert len(heatmap["hours"]) == 24
    assert len(heatmap["matrix"]) == 7
    for row in heatmap["matrix"]:
        assert len(row["values"]) == 24

def test_seasonal_decomposition(dm):
    decomp = calculate_seasonal_decomposition(metric="count")
    if decomp["available"]:
        assert len(decomp["components"]) > 0
        comp = decomp["components"][0]
        assert "observed" in comp
        assert "trend" in comp
        assert "seasonal" in comp
        assert "residual" in comp

def test_forecasting_models(dm):
    # Test seasonal naive
    res_naive = calculate_forecast(metric="count", model_name="seasonal_naive", horizon=7)
    assert res_naive["available"] is True
    assert len(res_naive["forecast"]) == 7
    assert "mae" in res_naive["evaluation"]

    # Test exponential smoothing
    res_es = calculate_forecast(metric="count", model_name="exponential_smoothing", horizon=7)
    assert res_es["available"] is True
    assert len(res_es["forecast"]) == 7
    assert res_es["forecast"][0]["lower_bound"] is not None

def test_branch_comparison(dm):
    branch_res = calculate_branch_comparison()
    assert len(branch_res["branch_metrics"]) > 0
    assert len(branch_res["available_branches"]) > 0
    assert len(branch_res["monthly_heatmap"]) > 0
    assert len(branch_res["scatter_data"]) > 0
