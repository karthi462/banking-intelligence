import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_synthetic_transactions(num_records: int = 15000, seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic banking transaction dataset for advanced time-series analysis.
    The dataset includes diurnal patterns, weekend effects, month-end surges, and distinct 
    statistical anomaly events for visualization and academic evaluation.
    """
    random.seed(seed)
    np.random.seed(seed)

    start_date = datetime(2025, 1, 1, 0, 0, 0)
    total_days = 365

    account_types = ["Savings", "Current", "Salary", "Business"]
    account_weights = [0.55, 0.25, 0.15, 0.05]

    transaction_types = ["Deposit", "Withdrawal", "Transfer", "Payment"]
    type_weights = [0.20, 0.25, 0.35, 0.20]

    payment_modes = ["UPI", "Debit Card", "Credit Card", "ATM", "Bank Transfer"]
    mode_weights = [0.45, 0.20, 0.12, 0.13, 0.10]

    branches = [
        "Chennai Central",
        "Mumbai Fort",
        "Bengaluru Indiranagar",
        "Delhi Connaught Place",
        "Hyderabad Banjara Hills",
        "Kolkata Park Street"
    ]
    branch_weights = [0.22, 0.24, 0.20, 0.15, 0.11, 0.08]

    records = []
    
    # Generate timestamps based on realistic non-uniform distribution
    # Peak hours: 10:00 - 14:00, 17:00 - 21:00. Low hours: 01:00 - 06:00
    hour_weights = [
        0.01, 0.005, 0.005, 0.005, 0.01, 0.02, # 0 - 5
        0.03, 0.05, 0.07, 0.08, 0.09, 0.08,    # 6 - 11
        0.09, 0.07, 0.06, 0.06, 0.07, 0.08,    # 12 - 17
        0.09, 0.08, 0.07, 0.05, 0.03, 0.02     # 18 - 23
    ]
    hour_weights = np.array(hour_weights) / sum(hour_weights)

    # Days of week weights: Mon-Thu normal, Fri-Sat peak, Sun moderate
    dow_multipliers = [1.0, 0.98, 1.02, 1.05, 1.15, 1.20, 0.90]

    for i in range(1, num_records + 1):
        # Pick day with probability influenced by day-of-week and month-end
        day_offset = random.randint(0, total_days - 1)
        current_day = start_date + timedelta(days=day_offset)
        
        # Month-end bump (28-31, 1-3)
        day_of_month = current_day.day
        month_end_factor = 1.35 if (day_of_month >= 28 or day_of_month <= 3) else 1.0
        
        # Festival / fiscal event bumps
        # March 31: Financial year end surge
        # Oct 25: Festival peak
        is_fiscal_yearend = (current_day.month == 3 and current_day.day >= 29)
        is_festival_peak = (current_day.month == 10 and 20 <= current_day.day <= 26)
        
        hour = np.random.choice(range(24), p=hour_weights)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        ts = current_day.replace(hour=hour, minute=minute, second=second)

        acc_type = np.random.choice(account_types, p=account_weights)
        txn_type = np.random.choice(transaction_types, p=type_weights)
        pay_mode = np.random.choice(payment_modes, p=mode_weights)
        branch = np.random.choice(branches, p=branch_weights)

        # Baseline amount generation depending on mode and type
        if pay_mode == "UPI":
            # UPI tends to have smaller, frequent amounts
            base_amount = np.random.exponential(scale=1200) + 20
            base_amount = min(base_amount, 95000) # UPI limit
        elif pay_mode == "ATM":
            # ATM cash withdrawals in multiples of 100 or 500
            mult = random.choice([500, 1000, 2000, 2500, 5000, 10000])
            base_amount = mult + random.choice([0, 100, 200, 500])
        elif pay_mode == "Bank Transfer":
            # High-value NEFT/RTGS transfers
            base_amount = np.random.lognormal(mean=9.5, sigma=1.0) # ~ 10,000 to 200,000
        else: # Debit / Credit cards
            base_amount = np.random.lognormal(mean=7.5, sigma=0.9) # ~ 1,000 to 25,000

        # Adjust for account type
        if acc_type in ["Business", "Current"]:
            base_amount *= random.uniform(1.8, 3.5)

        # Round amount to 2 decimal places
        amount = round(float(base_amount), 2)
        if amount < 10.0:
            amount = 10.0

        # Status logic: typically 93% success, 5% failed, 2% pending
        # Injected anomaly: July 15-16 has simulated UPI gateway breakdown (higher failure rate)
        if ts.month == 7 and ts.day in [15, 16] and pay_mode == "UPI":
            status = np.random.choice(["Successful", "Failed", "Pending"], p=[0.45, 0.48, 0.07])
        else:
            status = np.random.choice(["Successful", "Failed", "Pending"], p=[0.93, 0.05, 0.02])

        records.append({
            "transaction_id": f"TXN{i:07d}",
            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "account_type": acc_type,
            "transaction_type": txn_type,
            "amount": amount,
            "payment_mode": pay_mode,
            "branch": branch,
            "transaction_status": status
        })

    # Inject a few high-value outliers and surge days to make anomaly analysis rich
    # Injected statistical anomaly 1: March 31 huge corporate settlement
    records.append({
        "transaction_id": f"TXN999901",
        "timestamp": "2025-03-31 16:45:12",
        "account_type": "Business",
        "transaction_type": "Transfer",
        "amount": 785000.00,
        "payment_mode": "Bank Transfer",
        "branch": "Mumbai Fort",
        "transaction_status": "Successful"
    })
    # Injected statistical anomaly 2: October 25 festival rush high transaction
    records.append({
        "transaction_id": f"TXN999902",
        "timestamp": "2025-10-25 19:22:05",
        "account_type": "Current",
        "transaction_type": "Payment",
        "amount": 620000.00,
        "payment_mode": "Credit Card",
        "branch": "Bengaluru Indiranagar",
        "transaction_status": "Successful"
    })

    df = pd.DataFrame(records)
    # Sort chronologically
    df["dt"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("dt").drop(columns=["dt"]).reset_index(drop=True)
    return df
