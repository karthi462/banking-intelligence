# ==============================================================================
# BANKING TRANSACTION INTELLIGENCE DASHBOARD - MASTER R ANALYSIS SCRIPT
# Module: analysis.R
# Academic Project Deliverable: Advanced Data Visualization
# ==============================================================================

message("======================================================================")
message("BANKING TRANSACTION INTELLIGENCE - ADVANCED TIME-SERIES R PIPELINE")
message("======================================================================")

# Step 1: Execute Time-Series Visualization & Moving Averages
message("\n[Step 1/3] Executing Time-Series Visualizations & Smoothing...")
source("time_series_visualization.R")

# Step 2: Execute Statistical Anomaly Detection (MAD & IQR)
message("\n[Step 2/3] Executing Statistical Anomaly Detection (MAD & IQR)...")
source("anomaly_analysis.R")

# Step 3: Execute Time-Series Forecasting (SNaive, ETS, ARIMA)
message("\n[Step 3/3] Executing Time-Series Forecasting Models & Evaluation...")
source("forecasting.R")

message("\n======================================================================")
message("ALL R ANALYSIS SCRIPTS COMPLETED SUCCESSFULLY.")
message("Generated output graphics:")
message("  1. r_daily_volume_ma.png (Daily volume with 7-day & 30-day moving averages)")
message("  2. r_cumulative_amount.png (Cumulative liquidity accumulation curve)")
message("  3. r_anomaly_mad_plot.png (Robust MAD outlier identification)")
message("  4. r_forecast_arima.png (ARIMA 14-day future horizon with confidence intervals)")
message("======================================================================")
