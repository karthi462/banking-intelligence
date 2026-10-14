import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.arima.model import ARIMA
from app.services.dataset_service import dataset_manager

def calculate_forecast(
    metric: str = "count", # "count" or "amount"
    model_name: str = "exponential_smoothing", # "seasonal_naive", "exponential_smoothing", "arima"
    horizon: int = 14,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    test_split_days: int = 14
) -> Dict[str, Any]:
    """
    Chronological forecasting engine supporting Seasonal Naive, Exponential Smoothing (Holt-Winters),
    and ARIMA. Evaluates against held-out test set with MAE, RMSE, and MAPE safeguards.
    """
    df = dataset_manager.get_filtered_df(start_date=start_date, end_date=end_date)
    if df.empty:
        return {"available": False, "reason": "No data matching filters."}

    df["date"] = df["parsed_dt"].dt.date
    if metric == "amount":
        daily = df.groupby("date")["amount"].sum().reset_index()
        target_col = "amount"
    else:
        daily = df.groupby("date")["transaction_id"].count().reset_index()
        target_col = "transaction_id"

    # Reindex daily to ensure uniform 1-day spacing
    all_dates = pd.date_range(start=daily["date"].min(), end=daily["date"].max(), freq="D")
    daily["date"] = pd.to_datetime(daily["date"])
    series = daily.set_index("date").reindex(all_dates, fill_value=0)[target_col].astype(float)
    total_n = len(series)

    if total_n < 28:
        return {
            "available": False,
            "reason": f"Forecasting requires at least 28 continuous daily observations to support train/test evaluation. Found only {total_n} days."
        }

    # Ensure test split does not consume more than 30% of data
    actual_test_len = min(test_split_days, int(total_n * 0.25))
    if actual_test_len < 7:
        actual_test_len = 7

    train_series = series.iloc[:-actual_test_len]
    test_series = series.iloc[-actual_test_len:]

    # Model evaluation on test set
    def fit_and_predict(train_data, steps, model_type):
        try:
            if model_type == "seasonal_naive":
                # Takes the value from 7 days ago
                pred = []
                for s in range(steps):
                    idx = -(7 - (s % 7))
                    pred.append(float(train_data.iloc[idx]))
                return np.array(pred), None, None

            elif model_type == "exponential_smoothing":
                # Holt-Winters additive
                model = ExponentialSmoothing(
                    train_data,
                    trend="add",
                    seasonal="add",
                    seasonal_periods=7,
                    initialization_method="estimated"
                ).fit()
                pred = model.forecast(steps).values
                # Approximate 95% confidence intervals from residual std
                resid_std = float(model.resid.std())
                lower = np.maximum(0, pred - 1.96 * resid_std)
                upper = pred + 1.96 * resid_std
                return pred, lower, upper

            elif model_type == "arima":
                # ARIMA (1, 1, 1) with seasonal (1, 0, 0, 7)
                model = ARIMA(train_data, order=(1, 1, 1), seasonal_order=(1, 0, 0, 7)).fit()
                forecast_res = model.get_forecast(steps)
                pred = forecast_res.predicted_mean.values
                ci = forecast_res.conf_int(alpha=0.05)
                lower = np.maximum(0, ci.iloc[:, 0].values)
                upper = ci.iloc[:, 1].values
                return pred, lower, upper

            else:
                raise ValueError("Unknown model")
        except Exception:
            # Fallback to seasonal naive if numerical optimization fails
            pred = []
            for s in range(steps):
                idx = -(7 - (s % 7))
                pred.append(float(train_data.iloc[idx]))
            return np.array(pred), None, None

    # Baseline evaluation (Seasonal Naive)
    baseline_pred, _, _ = fit_and_predict(train_series, actual_test_len, "seasonal_naive")
    test_actual = test_series.values

    base_mae = float(np.mean(np.abs(test_actual - baseline_pred)))
    base_rmse = float(np.sqrt(np.mean((test_actual - baseline_pred) ** 2)))

    # Selected model evaluation on test set
    test_pred, _, _ = fit_and_predict(train_series, actual_test_len, model_name)
    mae = float(np.mean(np.abs(test_actual - test_pred)))
    rmse = float(np.sqrt(np.mean((test_actual - test_pred) ** 2)))

    # Safe MAPE: only on non-zero actuals
    non_zero_mask = test_actual > 0
    if np.sum(non_zero_mask) > 0:
        mape = float(np.mean(np.abs((test_actual[non_zero_mask] - test_pred[non_zero_mask]) / test_actual[non_zero_mask])) * 100.0)
    else:
        mape = None

    # Now fit on the FULL series for future horizon forecast
    future_pred, future_lower, future_upper = fit_and_predict(series, horizon, model_name)

    # Build response points
    historical_points = []
    for dt_idx, val in series.items():
        is_in_test = dt_idx >= test_series.index[0]
        historical_points.append({
            "date": dt_idx.strftime("%Y-%m-%d"),
            "actual": round(float(val), 2),
            "split": "test" if is_in_test else "train"
        })

    future_dates = pd.date_range(start=series.index[-1] + pd.Timedelta(days=1), periods=horizon, freq="D")
    forecast_points = []
    for dt_idx, f_val, f_low, f_up in zip(
        future_dates,
        future_pred,
        future_lower if future_lower is not None else [None] * horizon,
        future_upper if future_upper is not None else [None] * horizon
    ):
        forecast_points.append({
            "date": dt_idx.strftime("%Y-%m-%d"),
            "forecast": max(0.0, round(float(f_val), 2)),
            "lower_bound": max(0.0, round(float(f_low), 2)) if f_low is not None else None,
            "upper_bound": round(float(f_up), 2) if f_up is not None else None
        })

    # Test comparison points
    test_comparison = []
    for dt_idx, actual_val, pred_val in zip(test_series.index, test_actual, test_pred):
        test_comparison.append({
            "date": dt_idx.strftime("%Y-%m-%d"),
            "actual": round(float(actual_val), 2),
            "predicted": round(float(pred_val), 2)
        })

    return {
        "available": True,
        "metric": metric,
        "model_name": model_name,
        "horizon": horizon,
        "evaluation": {
            "test_days": actual_test_len,
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2) if mape is not None else "N/A (contains zeros)",
            "baseline_mae": round(base_mae, 2),
            "baseline_rmse": round(base_rmse, 2),
            "mae_improvement_pct": round(((base_mae - mae) / base_mae * 100.0), 1) if base_mae > 0 else 0.0
        },
        "historical": historical_points,
        "forecast": forecast_points,
        "test_comparison": test_comparison,
        "warning": "Forecasting disclaimer: Predictions are aggregate statistical estimates based on historical observations and seasonal patterns. They do not represent financial guarantees or definitive transactional outcomes."
    }
