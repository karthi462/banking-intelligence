import os
import io
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, Tuple, List
from datetime import datetime
from app.utils.sample_generator import generate_synthetic_transactions
from app.schemas.transaction import DatasetSummary

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
os.makedirs(DATA_DIR, exist_ok=True)
SAMPLE_DATA_PATH = os.path.join(DATA_DIR, "synthetic_banking_transactions.csv")

class DatasetManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatasetManager, cls).__new__(cls)
            cls._instance.active_df = None
            cls._instance.active_summary = None
            cls._instance.invalid_records = []
            cls._instance.dataset_id = "sample_default"
            cls._instance.dataset_name = "Synthetic Banking Transactions (Simulated)"
            cls._instance.is_synthetic = True
            cls._instance.raw_upload_df = None
            cls._instance.initialize_default_dataset()
        return cls._instance

    def initialize_default_dataset(self, num_records: int = 15000, seed: int = 42):
        """Generates or loads the default synthetic dataset."""
        df = generate_synthetic_transactions(num_records=num_records, seed=seed)
        df.to_csv(SAMPLE_DATA_PATH, index=False)
        self.dataset_id = "sample_default"
        self.dataset_name = "Synthetic Banking Transactions (Simulated)"
        self.is_synthetic = True
        self.set_active_dataset(df, is_synthetic=True, name="Synthetic Banking Transactions (Simulated)")

    def set_active_dataset(self, df: pd.DataFrame, is_synthetic: bool = False, name: str = "Custom Dataset"):
        """Validates, cleans, and stores the active dataset."""
        self.is_synthetic = is_synthetic
        self.dataset_name = name
        
        valid_df, summary, invalid_recs = self.validate_and_clean(df)
        self.active_df = valid_df
        self.active_summary = summary
        self.invalid_records = invalid_recs

    def validate_and_clean(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, DatasetSummary, List[Dict[str, Any]]]:
        """
        Validates columns, timestamp parsing, amounts, missing values, duplicates.
        Ensures invalid records are isolated with clear rejection reasons.
        """
        total_rows = len(df)
        missing_values = df.isnull().sum().to_dict()
        invalid_recs = []

        # Required columns for analysis
        req_cols = ["transaction_id", "timestamp", "amount"]
        for col in req_cols:
            if col not in df.columns:
                raise ValueError(f"Required column '{col}' missing from dataset.")

        clean_rows = []
        seen_ids = set()
        duplicate_ids_count = 0
        invalid_ts_count = 0
        invalid_amount_count = 0

        for idx, row in df.iterrows():
            reason = []
            tid = str(row.get("transaction_id", "")).strip()
            
            if not tid or tid.lower() == "nan":
                reason.append("Empty transaction_id")
            elif tid in seen_ids:
                reason.append("Duplicate transaction_id")
                duplicate_ids_count += 1
            else:
                seen_ids.add(tid)

            # Check timestamp
            ts_val = row.get("timestamp")
            parsed_ts = None
            try:
                parsed_ts = pd.to_datetime(ts_val)
                if pd.isnull(parsed_ts):
                    reason.append("Null or unparseable timestamp")
                    invalid_ts_count += 1
            except Exception:
                reason.append("Invalid timestamp format")
                invalid_ts_count += 1

            # Check amount
            amount_val = row.get("amount")
            parsed_amount = None
            try:
                parsed_amount = float(amount_val)
                if np.isnan(parsed_amount) or np.isinf(parsed_amount):
                    reason.append("Non-finite amount")
                    invalid_amount_count += 1
                elif parsed_amount < 0:
                    reason.append("Negative amount not permitted")
                    invalid_amount_count += 1
            except Exception:
                reason.append("Non-numeric amount value")
                invalid_amount_count += 1

            if reason:
                rec_dict = row.to_dict()
                rec_dict["rejection_reason"] = "; ".join(reason)
                rec_dict["row_index"] = idx
                invalid_recs.append(rec_dict)
            else:
                clean_row = {
                    "transaction_id": tid,
                    "timestamp": parsed_ts.strftime("%Y-%m-%d %H:%M:%S"),
                    "amount": round(parsed_amount, 2),
                    "account_type": str(row.get("account_type", "Standard")).strip() if pd.notnull(row.get("account_type")) else "Standard",
                    "transaction_type": str(row.get("transaction_type", "Transfer")).strip() if pd.notnull(row.get("transaction_type")) else "Transfer",
                    "payment_mode": str(row.get("payment_mode", "Bank Transfer")).strip() if pd.notnull(row.get("payment_mode")) else "Bank Transfer",
                    "branch": str(row.get("branch", "Main Branch")).strip() if pd.notnull(row.get("branch")) else "Main Branch",
                    "transaction_status": str(row.get("transaction_status", "Successful")).strip() if pd.notnull(row.get("transaction_status")) else "Successful"
                }
                clean_rows.append(clean_row)

        valid_df = pd.DataFrame(clean_rows)
        if not valid_df.empty:
            valid_df["parsed_dt"] = pd.to_datetime(valid_df["timestamp"])
            valid_df = valid_df.sort_values("parsed_dt").reset_index(drop=True)
            start_date = valid_df["timestamp"].min()
            end_date = valid_df["timestamp"].max()
        else:
            start_date, end_date = None, None

        # Build distinct category values
        categories = {}
        for cat_col in ["account_type", "transaction_type", "payment_mode", "branch", "transaction_status"]:
            if cat_col in valid_df.columns:
                categories[cat_col] = sorted(valid_df[cat_col].unique().tolist())
            else:
                categories[cat_col] = []

        summary = DatasetSummary(
            dataset_id=self.dataset_id,
            name=self.dataset_name,
            is_synthetic=self.is_synthetic,
            total_rows=total_rows,
            valid_rows=len(valid_df),
            invalid_rows=len(invalid_recs),
            start_date=start_date,
            end_date=end_date,
            columns=list(valid_df.columns),
            missing_values={k: int(v) for k, v in missing_values.items()},
            duplicate_ids=duplicate_ids_count,
            invalid_timestamps=invalid_ts_count,
            invalid_amounts=invalid_amount_count,
            categories=categories
        )

        return valid_df, summary, invalid_recs

    def get_filtered_df(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        transaction_type: Optional[str] = None,
        payment_mode: Optional[str] = None,
        transaction_status: Optional[str] = None,
        branch: Optional[str] = None,
        account_type: Optional[str] = None
    ) -> pd.DataFrame:
        """Returns the active dataframe filtered by provided parameters."""
        if self.active_df is None or self.active_df.empty:
            return pd.DataFrame()

        df = self.active_df.copy()

        if start_date:
            try:
                s_dt = pd.to_datetime(start_date)
                df = df[df["parsed_dt"] >= s_dt]
            except Exception:
                pass

        if end_date:
            try:
                # Include end of day
                e_dt = pd.to_datetime(end_date)
                if len(end_date) == 10: # YYYY-MM-DD
                    e_dt = e_dt.replace(hour=23, minute=59, second=59)
                df = df[df["parsed_dt"] <= e_dt]
            except Exception:
                pass

        if transaction_type and transaction_type.lower() != "all":
            df = df[df["transaction_type"].str.lower() == transaction_type.lower()]

        if payment_mode and payment_mode.lower() != "all":
            df = df[df["payment_mode"].str.lower() == payment_mode.lower()]

        if transaction_status and transaction_status.lower() != "all":
            df = df[df["transaction_status"].str.lower() == transaction_status.lower()]

        if branch and branch.lower() != "all":
            df = df[df["branch"].str.lower() == branch.lower()]

        if account_type and account_type.lower() != "all":
            df = df[df["account_type"].str.lower() == account_type.lower()]

        return df

    def get_summary(self) -> DatasetSummary:
        return self.active_summary

    def get_invalid_records(self) -> List[Dict[str, Any]]:
        return self.invalid_records

dataset_manager = DatasetManager()
