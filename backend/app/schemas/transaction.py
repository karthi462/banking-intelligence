from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class Transaction(BaseModel):
    transaction_id: str
    timestamp: str
    account_type: str = "Savings"
    transaction_type: str = "Deposit"
    amount: float
    payment_mode: str = "UPI"
    branch: str = "Chennai Central"
    transaction_status: str = "Successful"

class FilterParams(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    transaction_type: Optional[str] = None
    payment_mode: Optional[str] = None
    transaction_status: Optional[str] = None
    branch: Optional[str] = None
    account_type: Optional[str] = None

class KPISummary(BaseModel):
    total_transactions: int
    total_transaction_value: float
    average_transaction_value: float
    successful_transaction_rate: float
    failed_transaction_count: int
    flagged_anomalies_count: int
    matching_transactions_count: int
    period_comparison: Dict[str, Any]
    currency_symbol: str = "₹"

class DatasetSummary(BaseModel):
    dataset_id: str
    name: str
    is_synthetic: bool
    total_rows: int
    valid_rows: int
    invalid_rows: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    columns: List[str]
    missing_values: Dict[str, int]
    duplicate_ids: int
    invalid_timestamps: int
    invalid_amounts: int
    categories: Dict[str, List[str]]

class ColumnMappingRequest(BaseModel):
    transaction_id: str
    timestamp: str
    amount: str
    transaction_type: Optional[str] = None
    payment_mode: Optional[str] = None
    branch: Optional[str] = None
    transaction_status: Optional[str] = None
    account_type: Optional[str] = None

class AnomalyDetectionRequest(BaseModel):
    metric: str = "amount" # "amount" or "count"
    aggregation: str = "daily" # "daily", "weekly"
    method: str = "mad" # "mad" or "iqr"
    threshold: float = 3.0 # robust z-score threshold or IQR multiplier (e.g. 1.5, 3.0)
    rolling_window: int = 14
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    transaction_type: Optional[str] = None
    branch: Optional[str] = None

class ForecastRequest(BaseModel):
    metric: str = "count" # "count" or "amount"
    model: str = "exponential_smoothing" # "seasonal_naive", "exponential_smoothing", "arima"
    horizon: int = 14 # days
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    test_split_days: int = 14
