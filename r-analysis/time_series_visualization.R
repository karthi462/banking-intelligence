# ==============================================================================
# BANKING TRANSACTION INTELLIGENCE DASHBOARD - ADVANCED TIME-SERIES VISUALIZATION
# Module: time_series_visualization.R
# Libraries: ggplot2, dplyr, tidyr, lubridate, zoo, scales
# ==============================================================================

suppressPackageStartupMessages({
  if (!require("ggplot2", quietly = TRUE)) install.packages("ggplot2")
  if (!require("dplyr", quietly = TRUE)) install.packages("dplyr")
  if (!require("tidyr", quietly = TRUE)) install.packages("tidyr")
  if (!require("lubridate", quietly = TRUE)) install.packages("lubridate")
  if (!require("zoo", quietly = TRUE)) install.packages("zoo")
  if (!require("scales", quietly = TRUE)) install.packages("scales")
  library(ggplot2)
  library(dplyr)
  library(tidyr)
  library(lubridate)
  library(zoo)
  library(scales)
})

# Path to synthetic banking transaction data
data_file <- "../data/synthetic_banking_transactions.csv"

if (!file.exists(data_file)) {
  stop("Dataset not found at ../data/synthetic_banking_transactions.csv. Run Python backend to generate.")
}

message("Loading banking transaction dataset into R...")
df <- read.csv(data_file, stringsAsFactors = FALSE)
df$dt <- ymd_hms(df$timestamp)
df$date <- as.Date(df$dt)

# 1. Daily Aggregation & Multi-tier Rolling Moving Averages (7-day and 30-day)
daily_series <- df %>%
  group_by(date) %>%
  summarise(
    txn_count = n(),
    total_amount = sum(amount, na.rm = TRUE),
    avg_amount = mean(amount, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  arrange(date) %>%
  mutate(
    ma_7_count = rollmean(txn_count, k = 7, fill = NA, align = "right"),
    ma_30_count = rollmean(txn_count, k = 30, fill = NA, align = "right"),
    ma_7_amount = rollmean(total_amount, k = 7, fill = NA, align = "right"),
    ma_30_amount = rollmean(total_amount, k = 30, fill = NA, align = "right"),
    cum_amount = cumsum(total_amount)
  )

message("Summary of Daily Aggregate Time-Series:")
print(head(daily_series))

# 2. Daily Transaction Volume with Moving Averages Plot
p1 <- ggplot(daily_series, aes(x = date)) +
  geom_line(aes(y = txn_count, color = "Daily Observed"), alpha = 0.45, linewidth = 0.6) +
  geom_line(aes(y = ma_7_count, color = "7-Day Moving Avg"), linewidth = 1.0) +
  geom_line(aes(y = ma_30_count, color = "30-Day Moving Avg"), linewidth = 1.1, linetype = "dashed") +
  scale_color_manual(values = c("Daily Observed" = "#94a3b8", "7-Day Moving Avg" = "#2563eb", "30-Day Moving Avg" = "#0d9488")) +
  scale_x_date(date_labels = "%b %Y", date_breaks = "2 months") +
  labs(
    title = "Banking Transaction Volume Trajectory with Multi-Tier Smoothing",
    subtitle = "7-Day Moving Average isolates weekly diurnal noise; 30-Day MA reveals macro trajectory",
    x = "Timeline",
    y = "Daily Transaction Count",
    color = "Series"
  ) +
  theme_minimal(base_size = 12) +
  theme(legend.position = "top", plot.title = element_text(face = "bold", color = "#0a1128"))

# 3. Cumulative Liquidity Growth Curve
p2 <- ggplot(daily_series, aes(x = date, y = cum_amount)) +
  geom_area(fill = "#2563eb", alpha = 0.15) +
  geom_line(color = "#1d4ed8", linewidth = 1.0) +
  scale_y_continuous(labels = label_currency(prefix = "INR ", big.mark = ",")) +
  scale_x_date(date_labels = "%b %Y", date_breaks = "2 months") +
  labs(
    title = "Cumulative Banking Transaction Value Accumulation",
    subtitle = "Continuous running total across the 12-month observation window",
    x = "Date",
    y = "Cumulative Value (INR)"
  ) +
  theme_minimal(base_size = 12) +
  theme(plot.title = element_text(face = "bold", color = "#0a1128"))

# Save plots
ggsave("r_daily_volume_ma.png", p1, width = 10, height = 5.5, dpi = 300)
ggsave("r_cumulative_amount.png", p2, width = 10, height = 5.5, dpi = 300)

message("Time-series visualization plots generated successfully: r_daily_volume_ma.png, r_cumulative_amount.png")
