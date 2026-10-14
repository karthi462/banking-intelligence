# ==============================================================================
# BANKING TRANSACTION INTELLIGENCE DASHBOARD - STATISTICAL ANOMALY DETECTION
# Module: anomaly_analysis.R
# Libraries: ggplot2, dplyr, lubridate, zoo, scales
# ==============================================================================

suppressPackageStartupMessages({
  library(ggplot2)
  library(dplyr)
  library(lubridate)
  library(zoo)
  library(scales)
})

data_file <- "../data/synthetic_banking_transactions.csv"
if (!file.exists(data_file)) {
  stop("Dataset not found at ../data/synthetic_banking_transactions.csv.")
}

df <- read.csv(data_file, stringsAsFactors = FALSE)
df$date <- as.Date(df$timestamp)

daily <- df %>%
  group_by(date) %>%
  summarise(
    total_amount = sum(amount, na.rm = TRUE),
    txn_count = n(),
    .groups = "drop"
  ) %>%
  arrange(date)

# ----------------- METHOD 1: ROLLING MEDIAN & MAD ----------------- #
# Window: 14 days. MAD: median(|x - median|)
k_window <- 14
mad_threshold <- 3.0

calc_rolling_mad <- function(x, w) {
  n <- length(x)
  meds <- rollapply(x, width = w, FUN = median, fill = "extend", align = "right")
  mads <- numeric(n)
  for (i in seq_len(n)) {
    sub_x <- x[max(1, i - w + 1):i]
    m_val <- median(abs(sub_x - median(sub_x)))
    # Guard against zero MAD
    if (m_val < 1e-4) m_val <- sd(sub_x) * 0.6745
    if (is.na(m_val) || m_val < 1e-4) m_val <- 1.0
    mads[i] <- m_val
  }
  robust_z <- 0.6745 * abs(x - meds) / mads
  data.frame(rolling_med = meds, rolling_mad = mads, robust_z = robust_z)
}

mad_results <- calc_rolling_mad(daily$total_amount, k_window)
daily$mad_baseline <- mad_results$rolling_med
daily$mad_score <- mad_results$robust_z
daily$is_mad_anomaly <- daily$mad_score > mad_threshold

# ----------------- METHOD 2: INTERQUARTILE RANGE (IQR) ----------------- #
q1 <- quantile(daily$total_amount, 0.25)
q3 <- quantile(daily$total_amount, 0.75)
iqr_val <- q3 - q1
upper_fence <- q3 + (2.5 * iqr_val)
lower_fence <- max(0, q1 - (2.5 * iqr_val))

daily$is_iqr_anomaly <- (daily$total_amount > upper_fence) | (daily$total_amount < lower_fence)

message(sprintf("MAD Anomalies Detected (Threshold %.1f): %d observations", mad_threshold, sum(daily$is_mad_anomaly)))
message(sprintf("IQR Outer Fence Anomalies Detected: %d observations", sum(daily$is_iqr_anomaly)))

# Plot: Statistical Anomaly Detection in Daily Transaction Amount
p_anom <- ggplot(daily, aes(x = date, y = total_amount)) +
  geom_line(color = "#cbd5e1", linewidth = 0.7) +
  geom_line(aes(y = mad_baseline), color = "#0d9488", linetype = "dashed", linewidth = 0.8) +
  geom_point(data = filter(daily, !is_mad_anomaly), color = "#3b82f6", alpha = 0.6, size = 1.8) +
  geom_point(data = filter(daily, is_mad_anomaly), aes(color = "Statistical Outlier (MAD > 3.0)"), size = 3.5, shape = 21, fill = "#ef4444", stroke = 1.2) +
  scale_y_continuous(labels = label_currency(prefix = "INR ", big.mark = ",")) +
  scale_color_manual(values = c("Statistical Outlier (MAD > 3.0)" = "#ef4444")) +
  labs(
    title = "Statistical Anomaly Identification on Daily Liquidity Volumes",
    subtitle = "Dashed teal line: 14-day rolling median baseline. Red dots: Robust MAD outliers.",
    caption = "Notice: Statistical outliers indicate distribution variance, NOT confirmed fraud.",
    x = "Timeline",
    y = "Daily Aggregate Amount (INR)",
    color = "Flag"
  ) +
  theme_minimal(base_size = 12) +
  theme(legend.position = "top", plot.title = element_text(face = "bold", color = "#0a1128"))

ggsave("r_anomaly_mad_plot.png", p_anom, width = 10, height = 5.5, dpi = 300)
message("Saved anomaly plot to r_anomaly_mad_plot.png")
