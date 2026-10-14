# ==============================================================================
# BANKING TRANSACTION INTELLIGENCE DASHBOARD - TIME-SERIES FORECASTING
# Module: forecasting.R
# Libraries: forecast, ggplot2, dplyr, lubridate, zoo
# ==============================================================================

suppressPackageStartupMessages({
  if (!require("forecast", quietly = TRUE)) install.packages("forecast")
  library(forecast)
  library(ggplot2)
  library(dplyr)
  library(lubridate)
  library(zoo)
})

data_file <- "../data/synthetic_banking_transactions.csv"
if (!file.exists(data_file)) {
  stop("Dataset not found at ../data/synthetic_banking_transactions.csv.")
}

df <- read.csv(data_file, stringsAsFactors = FALSE)
df$date <- as.Date(df$timestamp)

daily <- df %>%
  group_by(date) %>%
  summarise(txn_count = n(), .groups = "drop") %>%
  arrange(date)

# Create daily time-series object with frequency = 7 (weekly seasonality)
ts_count <- ts(daily$txn_count, frequency = 7)

# Chronological Train-Test Split (Last 14 days held out for validation)
test_len <- 14
train_len <- length(ts_count) - test_len
train_ts <- subset(ts_count, end = train_len)
test_ts <- subset(ts_count, start = train_len + 1)

# Model 1: Seasonal Naive Baseline (snaive)
fit_snaive <- snaive(train_ts, h = test_len)

# Model 2: Exponential Smoothing (ets)
fit_ets <- ets(train_ts)
fc_ets <- forecast(fit_ets, h = test_len)

# Model 3: Auto-ARIMA with weekly seasonality
fit_arima <- auto.arima(train_ts, seasonal = TRUE)
fc_arima <- forecast(fit_arima, h = test_len)

# Accuracy Evaluation
acc_snaive <- accuracy(fit_snaive, test_ts)
acc_ets <- accuracy(fc_ets, test_ts)
acc_arima <- accuracy(fc_arima, test_ts)

message("Model Performance Comparison on Test Set (14-day holdout):")
message("1. Seasonal Naive Baseline:")
print(acc_snaive)
message("2. Exponential Smoothing (ETS):")
print(acc_ets)
message("3. Auto-ARIMA:")
print(acc_arima)

# Fit Auto-ARIMA on full series for 14-day future horizon
fit_full_arima <- auto.arima(ts_count, seasonal = TRUE)
future_fc <- forecast(fit_full_arima, h = 14)

# Visualization of Forecast with 80% & 95% Confidence Intervals
p_fc <- autoplot(future_fc) +
  labs(
    title = "Aggregate Banking Transaction Volume: ARIMA 14-Day Horizon Forecast",
    subtitle = "Weekly seasonal ARIMA specification with 80% and 95% confidence bands",
    x = "Timeline (Weeks)",
    y = "Daily Transaction Count"
  ) +
  theme_minimal(base_size = 12) +
  theme(plot.title = element_text(face = "bold", color = "#0a1128"))

ggsave("r_forecast_arima.png", p_fc, width = 10, height = 5.5, dpi = 300)
message("Saved forecast visualization to r_forecast_arima.png")
