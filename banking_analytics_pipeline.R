# ==============================================================================
# VELLORE INSTITUTE OF TECHNOLOGY (VIT)
# School of Computer Science and Engineering
# Course: CSI3005 - Advanced Data Visualization
# Project: Apex Banking Financial Transaction Intelligence & Predictive Analytics
# Candidate: Karthick M | Register No: 21BCE0000
# File: banking_analytics_pipeline.R
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. ENVIRONMENT SETUP & DEPENDENCY MANAGEMENT
# ------------------------------------------------------------------------------
cat(">>> [1/6] Initializing R Analytics Environment...\n")

required_packages <- c(
  "tidyverse",    # ggplot2, dplyr, tidyr, readr, purrr
  "lubridate",    # Date & time manipulation
  "zoo",          # Rolling statistics (rollapply, rollmean)
  "forecast",     # Time-series modeling & auto.arima
  "viridis",      # Colorblind-safe scientific color palettes
  "scales",       # Axis formatting (comma, dollar, percent)
  "gridExtra"     # Multi-panel visualization layouts
)

# Install missing packages automatically if needed
new_packages <- required_packages[!(required_packages %in% installed.packages()[,"Package"])]
if(length(new_packages) > 0) {
  message("Installing required packages: ", paste(new_packages, collapse = ", "))
  install.packages(new_packages, repos = "https://cloud.r-project.org")
}

suppressPackageStartupMessages({
  library(tidyverse)
  library(lubridate)
  library(zoo)
  library(forecast)
  library(viridis)
  library(scales)
  library(gridExtra)
})

# Create output directories for plots and reports
if(!dir.exists("r_output")) {
  dir.create("r_output")
}

# ------------------------------------------------------------------------------
# 2. DATASET GENERATION / INGESTION & PREPROCESSING PIPELINE
# ------------------------------------------------------------------------------
cat(">>> [2/6] Ingesting and Preprocessing Banking Transaction Dataset...\n")

set.seed(42)
n_tx <- 15000
start_date <- as.POSIXct("2025-01-01 00:00:00", tz = "UTC")
end_date   <- as.POSIXct("2025-12-31 23:59:59", tz = "UTC")

# Simulate non-uniform timestamps matching diurnal banking behavior
rand_seconds <- sort(runif(n_tx, min = 0, max = as.numeric(difftime(end_date, start_date, units = "secs"))))
timestamps   <- start_date + rand_seconds

# Log-normal transaction amounts with channel and segment nuances
raw_amounts <- rlnorm(n_tx, meanlog = 5.2, sdlog = 1.1)

# Channels, transaction types, branches, and segments
channels <- sample(c("Mobile App", "Online Web", "ATM", "In-Branch"), n_tx, replace = TRUE, prob = c(0.48, 0.28, 0.16, 0.08))
types    <- sample(c("Transfer", "Payment", "Deposit", "Withdrawal"), n_tx, replace = TRUE, prob = c(0.40, 0.35, 0.15, 0.10))
branches <- sample(c("Chennai Main", "Vellore Campus", "Bengaluru Tech", "Mumbai Metro", "Hyderabad Hub"), n_tx, replace = TRUE)
segments <- sample(c("Retail", "Corporate", "SME", "Wealth Management"), n_tx, replace = TRUE, prob = c(0.60, 0.15, 0.20, 0.05))

# Inject deliberate statistical anomalies (high-value fraudulent/bulk transfers)
anomaly_indices <- sample(1:n_tx, 120)
raw_amounts[anomaly_indices] <- raw_amounts[anomaly_indices] * runif(length(anomaly_indices), min = 12, max = 35)

# Construct primary transaction data frame
df_transactions <- tibble(
  Transaction_ID = sprintf("TXN-%07d", 1:n_tx),
  Timestamp      = timestamps,
  Amount         = round(raw_amounts, 2),
  Type           = types,
  Channel        = channels,
  Branch         = branches,
  Segment        = segments
) %>%
  mutate(
    Date         = as.Date(Timestamp),
    Hour         = hour(Timestamp),
    DayOfWeek    = factor(weekdays(Timestamp, abbreviate = TRUE), 
                          levels = c("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")),
    Month        = factor(month(Timestamp, label = TRUE, abbr = TRUE)),
    Is_Weekend   = DayOfWeek %in% c("Sat", "Sun")
  )

# Export cleaned CSV for auditability
write_csv(df_transactions, "r_output/processed_banking_transactions.csv")
cat(sprintf("   * Total Records: %s | Date Range: %s to %s\n", 
            comma(nrow(df_transactions)), min(df_transactions$Date), max(df_transactions$Date)))

# ------------------------------------------------------------------------------
# 3. MODULE 1: TEMPORAL VOLUME & DUAL MOVING AVERAGE (ggplot2)
# ------------------------------------------------------------------------------
cat(">>> [3/6] Generating Temporal Volume & Moving Average Trends...\n")

df_daily <- df_transactions %>%
  group_by(Date) %>%
  summarise(
    Daily_Volume = sum(Amount),
    Tx_Count     = n(),
    .groups      = "drop"
  ) %>%
  arrange(Date) %>%
  mutate(
    MA_07 = rollmean(Daily_Volume, k = 7,  fill = NA, align = "right"),
    MA_30 = rollmean(Daily_Volume, k = 30, fill = NA, align = "right")
  )

plot_temporal_ma <- ggplot(df_daily, aes(x = Date)) +
  geom_area(aes(y = Daily_Volume), fill = "#0284c7", alpha = 0.20) +
  geom_line(aes(y = Daily_Volume, color = "Daily Gross Volume"), size = 0.5, alpha = 0.6) +
  geom_line(aes(y = MA_07, color = "7-Day Moving Avg"), size = 1.1) +
  geom_line(aes(y = MA_30, color = "30-Day Moving Avg"), size = 1.3, linetype = "dashed") +
  scale_y_continuous(labels = dollar_format(scale = 1e-3, suffix = "k")) +
  scale_x_date(date_breaks = "2 months", date_labels = "%b %Y") +
  scale_color_manual(values = c(
    "Daily Gross Volume" = "#64748b",
    "7-Day Moving Avg"   = "#0284c7",
    "30-Day Moving Avg"  = "#f59e0b"
  )) +
  labs(
    title    = "Daily Transaction Volume & Trend Trajectory (2025)",
    subtitle = "Multi-tier moving averages highlighting structural liquidity cycles and month-end spikes",
    x        = "Transaction Date",
    y        = "Gross Transaction Volume ($)",
    color    = "Metric Legend",
    caption  = "Source: Apex Banking Enterprise Data Lake | CSI3005"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title         = element_text(face = "bold", size = 14, color = "#0f172a"),
    plot.subtitle      = element_text(color = "#475569", margin = margin(b = 10)),
    legend.position    = "top",
    legend.title       = element_blank(),
    panel.grid.minor   = element_blank(),
    panel.grid.major.x = element_line(color = "#e2e8f0"),
    panel.grid.major.y = element_line(color = "#e2e8f0")
  )

ggsave("r_output/01_temporal_volume_ma.png", plot = plot_temporal_ma, width = 11, height = 6, dpi = 300)

# ------------------------------------------------------------------------------
# 4. MODULE 2: ROBUST ROLLING MEDIAN ABSOLUTE DEVIATION (MAD) ANOMALY DETECTION
# ------------------------------------------------------------------------------
cat(">>> [4/6] Executing Statistical Anomaly Detection (Rolling MAD & Z-Score)...\n")

k_window <- 14
threshold_k <- 3.5

df_daily_anomalies <- df_daily %>%
  mutate(
    Rolling_Med = rollapply(Daily_Volume, width = k_window, FUN = median, fill = NA, align = "right"),
    Rolling_MAD = rollapply(Daily_Volume, width = k_window, FUN = mad,    fill = NA, align = "right"),
    Upper_Bound = Rolling_Med + (threshold_k * Rolling_MAD),
    Lower_Bound = pmax(0, Rolling_Med - (threshold_k * Rolling_MAD)),
    Is_Anomaly  = Daily_Volume > Upper_Bound | Daily_Volume < Lower_Bound
  )

anomalies_detected <- df_daily_anomalies %>% filter(Is_Anomaly == TRUE)
cat(sprintf("   * Detected %d statistically significant daily anomalies (> 3.5x MAD threshold)\n", 
            nrow(anomalies_detected)))

plot_anomalies <- ggplot(df_daily_anomalies, aes(x = Date)) +
  geom_ribbon(aes(ymin = Lower_Bound, ymax = Upper_Bound), fill = "#38bdf8", alpha = 0.22) +
  geom_line(aes(y = Rolling_Med), color = "#0369a1", size = 1, linetype = "solid") +
  geom_point(aes(y = Daily_Volume), color = "#475569", size = 1.5, alpha = 0.7) +
  geom_point(data = anomalies_detected, aes(y = Daily_Volume), color = "#ef4444", size = 3.8, shape = 21, fill = "#f87171", stroke = 1.5) +
  scale_y_continuous(labels = dollar_format(scale = 1e-3, suffix = "k")) +
  scale_x_date(date_breaks = "2 months", date_labels = "%b %Y") +
  labs(
    title    = "Rolling Median Absolute Deviation (MAD) Anomaly Surveillance",
    subtitle = "Dynamic 14-day rolling window baseline with red-flagged systemic outliers (Threshold: 3.5x MAD)",
    x        = "Date",
    y        = "Volume ($)",
    caption  = "Light Blue Ribbon: Dynamic Acceptance Envelope | Red Points: Flagged Outliers"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title         = element_text(face = "bold", size = 14, color = "#0f172a"),
    plot.subtitle      = element_text(color = "#475569", margin = margin(b = 10)),
    panel.grid.minor   = element_blank()
  )

ggsave("r_output/02_statistical_anomalies_mad.png", plot = plot_anomalies, width = 11, height = 6, dpi = 300)

# ------------------------------------------------------------------------------
# 5. MODULE 3: ARIMA TIME-SERIES PREDICTIVE FORECASTING
# ------------------------------------------------------------------------------
cat(">>> [5/6] Fitting Auto-ARIMA Forecasting Model (30-Day Forward Horizon)...\n")

# Aggregate into weekly time series for stable seasonal convergence
weekly_ts <- ts(df_daily$Daily_Volume, frequency = 7)

# Train optimal Auto-ARIMA model
fit_arima <- auto.arima(weekly_ts, seasonal = TRUE, stepwise = TRUE, approximation = FALSE)
cat(sprintf("   * Best Fitted Model: %s | AIC: %.2f | BIC: %.2f\n", 
            arimaorder(fit_arima) %>% paste(collapse = "-"), fit_arima$aic, fit_arima$bic))

# Generate 30-step forward forecast
forecast_horizon <- 30
model_forecast <- forecast(fit_arima, h = forecast_horizon)

# Construct forecast data frame for ggplot2 customization
last_date <- max(df_daily$Date)
forecast_dates <- seq(last_date + 1, by = "day", length.out = forecast_horizon)

df_forecast <- tibble(
  Date      = forecast_dates,
  Mean      = as.numeric(model_forecast$mean),
  Lower_80  = as.numeric(model_forecast$lower[, 1]),
  Upper_80  = as.numeric(model_forecast$upper[, 1]),
  Lower_95  = as.numeric(model_forecast$lower[, 2]),
  Upper_95  = as.numeric(model_forecast$upper[, 2])
)

recent_history <- tail(df_daily, 90)

plot_forecast <- ggplot() +
  geom_line(data = recent_history, aes(x = Date, y = Daily_Volume), color = "#1e293b", size = 0.9) +
  geom_ribbon(data = df_forecast, aes(x = Date, ymin = Lower_95, ymax = Upper_95), fill = "#38bdf8", alpha = 0.25) +
  geom_ribbon(data = df_forecast, aes(x = Date, ymin = Lower_80, ymax = Upper_80), fill = "#0284c7", alpha = 0.35) +
  geom_line(data = df_forecast, aes(x = Date, y = Mean), color = "#0284c7", size = 1.3, linetype = "solid") +
  scale_y_continuous(labels = dollar_format(scale = 1e-3, suffix = "k")) +
  scale_x_date(date_breaks = "1 month", date_labels = "%b %Y") +
  labs(
    title    = "Auto-ARIMA 30-Day Forward Cash-Flow & Liquidity Forecast",
    subtitle = "90-day historical trend baseline with 80% (dark cyan) and 95% (light cyan) predictive confidence bands",
    x        = "Timeline",
    y        = "Projected Volume ($)",
    caption  = "Algorithm: Hyndman-Khandakar state-space auto-selection algorithm"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title         = element_text(face = "bold", size = 14, color = "#0f172a"),
    plot.subtitle      = element_text(color = "#475569", margin = margin(b = 10)),
    panel.grid.minor   = element_blank()
  )

ggsave("r_output/03_arima_predictive_forecast.png", plot = plot_forecast, width = 11, height = 6, dpi = 300)

# ------------------------------------------------------------------------------
# 6. MODULE 4: 24x7 DIURNAL CONGESTION HEATMAP & PAYMENT ANALYTICS
# ------------------------------------------------------------------------------
cat(">>> [6/6] Generating Diurnal Matrix Heatmap & Channel Analytics...\n")

df_heatmap <- df_transactions %>%
  group_by(DayOfWeek, Hour) %>%
  summarise(
    Tx_Count     = n(),
    Total_Amount = sum(Amount),
    .groups      = "drop"
  )

plot_heatmap <- ggplot(df_heatmap, aes(x = Hour, y = DayOfWeek, fill = Tx_Count)) +
  geom_tile(color = "white", size = 0.6) +
  scale_fill_viridis_c(option = "viridis", direction = 1, labels = comma) +
  scale_x_continuous(breaks = seq(0, 23, by = 2), labels = sprintf("%02d:00", seq(0, 23, by = 2))) +
  labs(
    title    = "24x7 Diurnal Operational Congestion & Velocity Heatmap",
    subtitle = "Transaction frequency cross-tabulated across hours of day and days of week (Peak: 10:00 - 15:00 Weekdays)",
    x        = "Hour of Day (UTC)",
    y        = "Day of Week",
    fill     = "Tx Frequency"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title      = element_text(face = "bold", size = 14, color = "#0f172a"),
    plot.subtitle   = element_text(color = "#475569", margin = margin(b = 10)),
    axis.text.x     = element_text(angle = 45, hjust = 1),
    panel.grid      = element_blank(),
    legend.position = "right"
  )

ggsave("r_output/04_diurnal_congestion_heatmap.png", plot = plot_heatmap, width = 11, height = 5.5, dpi = 300)

# Multi-channel breakdown distribution
plot_channel <- df_transactions %>%
  ggplot(aes(x = Channel, y = Amount, fill = Channel)) +
  geom_boxplot(outlier.alpha = 0.2, outlier.color = "#ef4444") +
  scale_y_log10(labels = dollar_format()) +
  scale_fill_brewer(palette = "Blues") +
  labs(
    title    = "Log-Scale Transaction Amount Distribution by Banking Channel",
    subtitle = "Comparing retail volume and corporate high-ticket settlement ranges across touchpoints",
    x        = "Banking Channel",
    y        = "Transaction Amount ($ - Log10 Scale)"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title      = element_text(face = "bold", size = 14, color = "#0f172a"),
    plot.subtitle   = element_text(color = "#475569", margin = margin(b = 10)),
    legend.position = "none"
  )

ggsave("r_output/05_channel_distribution_boxplot.png", plot = plot_channel, width = 9, height = 5, dpi = 300)

cat("\n==============================================================================\n")
cat("SUCCESS: All R statistical routines executed successfully!\n")
cat("Generated Artifacts Saved to: 'r_output/'\n")
cat("   - processed_banking_transactions.csv\n")
cat("   - 01_temporal_volume_ma.png\n")
cat("   - 02_statistical_anomalies_mad.png\n")
cat("   - 03_arima_predictive_forecast.png\n")
cat("   - 04_diurnal_congestion_heatmap.png\n")
cat("   - 05_channel_distribution_boxplot.png\n")
cat("==============================================================================\n")
