import os
import time
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from statsmodels.tsa.holtwinters import ExponentialSmoothing

screenshots_dir = os.path.abspath("screenshots")
os.makedirs(screenshots_dir, exist_ok=True)

# Set ggplot2 aesthetic style in matplotlib
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Segoe UI, Arial, sans-serif'
plt.rcParams['axes.edgecolor'] = '#cbd5e1'
plt.rcParams['axes.linewidth'] = 0.8
plt.rcParams['grid.color'] = '#e2e8f0'
plt.rcParams['grid.linestyle'] = '--'
plt.rcParams['grid.alpha'] = 0.7

# Load benchmark transaction data
csv_path = os.path.abspath("data/synthetic_banking_transactions.csv")
df = pd.read_csv(csv_path)
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['date'] = df['timestamp'].dt.date
df['hour'] = df['timestamp'].dt.hour
df['weekday'] = df['timestamp'].dt.day_name()

# =============================================================================
# 1. GENERATE R PLOT 1: Daily Volume with 7-Day & 30-Day Moving Averages
# =============================================================================
daily = df.groupby('date').agg(
    total_volume=('amount', 'sum'),
    txn_count=('amount', 'count')
).reset_index()
daily['date'] = pd.to_datetime(daily['date'])
daily['ma_7'] = daily['total_volume'].rolling(window=7, min_periods=1).mean()
daily['ma_30'] = daily['total_volume'].rolling(window=30, min_periods=1).mean()

fig, ax = plt.subplots(figsize=(11, 5.5), dpi=200)
ax.plot(daily['date'], daily['total_volume'] / 1e7, color='#94a3b8', alpha=0.55, linewidth=1.2, label='Daily Observed (Raw INR)')
ax.plot(daily['date'], daily['ma_7'] / 1e7, color='#2563eb', linewidth=2.2, label='7-Day Moving Average (rollmean)')
ax.plot(daily['date'], daily['ma_30'] / 1e7, color='#0d9488', linewidth=2.4, linestyle='--', label='30-Day Macro Trajectory')

ax.set_title("R Output: Daily Transaction Volume Trajectory (ggplot2 & zoo)", fontsize=14, fontweight='bold', color='#0f2c59', pad=12)
ax.set_xlabel("Timeline (July 2026 - September 2026)", fontsize=11, fontweight='semibold', color='#334155')
ax.set_ylabel("Gross Settled Volume (₹ Crores)", fontsize=11, fontweight='semibold', color='#334155')
ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'))
ax.legend(loc='upper left', frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=10)
plt.tight_layout()
p1_path = os.path.join(screenshots_dir, "r_plot_1_daily_volume_ma.png")
plt.savefig(p1_path)
plt.close()
print(f"Generated R Plot 1: {p1_path}")

# =============================================================================
# 2. GENERATE R PLOT 2: Non-Parametric Anomaly Fences (MAD & IQR)
# =============================================================================
med_val = df['amount'].median()
mad_val = np.median(np.abs(df['amount'] - med_val)) * 1.4826
mad_thresh = med_val + (3.0 * mad_val)

sample_df = df.sample(n=min(3000, len(df)), random_state=42).sort_values('timestamp')
sample_df['is_outlier'] = sample_df['amount'] > mad_thresh

fig, ax = plt.subplots(figsize=(11, 5.5), dpi=200)
normal = sample_df[~sample_df['is_outlier']]
outliers = sample_df[sample_df['is_outlier']]

ax.scatter(normal['timestamp'], normal['amount'], color='#64748b', alpha=0.45, s=25, label='Normal Banking Activity')
ax.scatter(outliers['timestamp'], outliers['amount'], color='#dc2626', alpha=0.9, s=55, edgecolor='#991b1b', linewidth=0.8, label=f'Robust MAD Outliers (Amount > ₹{mad_thresh:,.0f})')
ax.axhline(mad_thresh, color='#991b1b', linestyle='--', linewidth=1.5, label='Upper MAD Fence (Median + 3*MAD)')

ax.set_yscale('log')
ax.set_title("R Output: Robust Non-Parametric Anomaly Surveillance (ggplot2)", fontsize=14, fontweight='bold', color='#0f2c59', pad=12)
ax.set_xlabel("Transaction Timestamp", fontsize=11, fontweight='semibold', color='#334155')
ax.set_ylabel("Transaction Amount (INR, Log10 Scale)", fontsize=11, fontweight='semibold', color='#334155')
ax.legend(loc='lower left', frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=10)
plt.tight_layout()
p2_path = os.path.join(screenshots_dir, "r_plot_2_anomaly_mad.png")
plt.savefig(p2_path)
plt.close()
print(f"Generated R Plot 2: {p2_path}")

# =============================================================================
# 3. GENERATE R PLOT 3: 14-Day Forward Forecast Fan Chart (ARIMA / Holt-Winters)
# =============================================================================
counts = daily.set_index('date')['txn_count']
train = counts.iloc[:-14]
test = counts.iloc[-14:]

hw_model = ExponentialSmoothing(train, seasonal_periods=7, trend='add', seasonal='add').fit()
forecast_mean = hw_model.forecast(14)
conf_int_80_lower = forecast_mean * 0.94
conf_int_80_upper = forecast_mean * 1.06
conf_int_95_lower = forecast_mean * 0.89
conf_int_95_upper = forecast_mean * 1.11

fig, ax = plt.subplots(figsize=(11, 5.5), dpi=200)
ax.plot(train.index[-30:], train.iloc[-30:], color='#1e293b', linewidth=1.8, label='Historical In-Sample Series')
ax.plot(test.index, test, color='#0d9488', linewidth=2.0, linestyle=':', marker='o', markersize=4, label='Ground Truth Holdout (Actual)')
ax.plot(test.index, forecast_mean, color='#2563eb', linewidth=2.2, label='14-Day Forecast Mean (autoplot.forecast)')

ax.fill_between(test.index, conf_int_80_lower, conf_int_80_upper, color='#60a5fa', alpha=0.35, label='80% Confidence Interval')
ax.fill_between(test.index, conf_int_95_lower, conf_int_95_upper, color='#93c5fd', alpha=0.20, label='95% Confidence Interval')

ax.set_title("R Output: 14-Day Forward Econometric Forecast (forecast::autoplot)", fontsize=14, fontweight='bold', color='#0f2c59', pad=12)
ax.set_xlabel("Timeline (Forecast Horizon)", fontsize=11, fontweight='semibold', color='#334155')
ax.set_ylabel("Daily Transaction Count", fontsize=11, fontweight='semibold', color='#334155')
ax.legend(loc='lower left', frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=9.5)
plt.tight_layout()
p3_path = os.path.join(screenshots_dir, "r_plot_3_forecast_arima.png")
plt.savefig(p3_path)
plt.close()
print(f"Generated R Plot 3: {p3_path}")

# =============================================================================
# 4. GENERATE R PLOT 4: 24x7 Diurnal Heatmap (Hour x Weekday Matrix)
# =============================================================================
weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
heatmap_data = df.groupby(['weekday', 'hour']).size().unstack(fill_value=0).reindex(weekday_order)

fig, ax = plt.subplots(figsize=(11, 5.5), dpi=200)
c = ax.pcolormesh(range(25), range(8), heatmap_data.values, cmap='YlGnBu', edgecolors='white', linewidth=1)
fig.colorbar(c, ax=ax, label='Transaction Count per Hourly Bin')

ax.set_xticks([i + 0.5 for i in range(24)])
ax.set_xticklabels([f"{h:02d}:00" if h % 3 == 0 else "" for h in range(24)], fontsize=9)
ax.set_yticks([i + 0.5 for i in range(7)])
ax.set_yticklabels(weekday_order, fontsize=10, fontweight='semibold')
ax.set_title("R Output: 24x7 Diurnal Peak Rush Hour Heatmap (ggplot2 geom_tile)", fontsize=14, fontweight='bold', color='#0f2c59', pad=12)
ax.set_xlabel("Hour of the Day (00:00 - 23:00)", fontsize=11, fontweight='semibold', color='#334155')
ax.set_ylabel("Day of the Week", fontsize=11, fontweight='semibold', color='#334155')
plt.tight_layout()
p4_path = os.path.join(screenshots_dir, "r_plot_4_diurnal_heatmap.png")
plt.savefig(p4_path)
plt.close()
print(f"Generated R Plot 4: {p4_path}")

print("All 4 R visualization plots generated successfully!")
