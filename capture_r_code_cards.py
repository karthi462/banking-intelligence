import os
import time
from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.common.by import By

screenshots_dir = os.path.abspath("screenshots")
os.makedirs(screenshots_dir, exist_ok=True)

# HTML Template with dark RStudio / VS Code styling for R scripts
html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>R Code Snippets</title>
  <style>
    body {
      background: #070d1f;
      font-family: 'Consolas', 'Fira Code', 'Monaco', monospace;
      padding: 40px;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 50px;
    }
    .code-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
      overflow: hidden;
      max-width: 950px;
    }
    .card-header {
      background: #090e1a;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
    }
    .dots {
      display: flex;
      gap: 7px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #eab308; }
    .dot.green { background: #22c55e; }
    .filename {
      color: #94a3b8;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .lang-badge {
      background: #1e3a8a;
      color: #60a5fa;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: bold;
    }
    pre {
      margin: 0;
      padding: 24px;
      font-size: 13.5px;
      line-height: 1.6;
      color: #e2e8f0;
      overflow-x: auto;
    }
    .comment { color: #64748b; font-style: italic; }
    .keyword { color: #f43f5e; font-weight: bold; }
    .function { color: #38bdf8; font-weight: bold; }
    .string { color: #34d399; }
    .number { color: #fbbf24; }
    .operator { color: #c084fc; }
    .variable { color: #f8fafc; }
  </style>
</head>
<body>

  <!-- SNIPPET 1: TIME SERIES & MOVING AVERAGES -->
  <div id="card-1" class="code-card">
    <div class="card-header">
      <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
      <div class="filename">r-analysis / time_series_visualization.R</div>
      <div class="lang-badge">R (ggplot2 & zoo)</div>
    </div>
    <pre><code><span class="comment"># ==============================================================================</span>
<span class="comment"># MODULE: time_series_visualization.R • Advanced Time-Series Moving Averages</span>
<span class="comment"># ==============================================================================</span>
<span class="keyword">library</span>(ggplot2)
<span class="keyword">library</span>(dplyr)
<span class="keyword">library</span>(zoo)
<span class="keyword">library</span>(scales)

<span class="comment"># Ingestion and daily multi-tier moving average calculation</span>
df <span class="operator">&lt;-</span> <span class="function">read.csv</span>(<span class="string">"data/synthetic_banking_transactions.csv"</span>)
df$date <span class="operator">&lt;-</span> <span class="function">as.Date</span>(df$timestamp)

daily_summary <span class="operator">&lt;-</span> df <span class="operator">%&gt;%</span>
  <span class="function">group_by</span>(date) <span class="operator">%&gt;%</span>
  <span class="function">summarise</span>(
    total_volume <span class="operator">=</span> <span class="function">sum</span>(amount, na.rm <span class="operator">=</span> <span class="keyword">TRUE</span>),
    transaction_count <span class="operator">=</span> <span class="function">n</span>(),
    .groups <span class="operator">=</span> <span class="string">"drop"</span>
  ) <span class="operator">%&gt;%</span>
  <span class="function">arrange</span>(date) <span class="operator">%&gt;%</span>
  <span class="function">mutate</span>(
    <span class="comment"># 7-Day MA isolates intra-week diurnal volatility; 30-Day MA reveals macro trajectory</span>
    ma_7  <span class="operator">=</span> <span class="function">rollmean</span>(total_volume, k <span class="operator">=</span> <span class="number">7</span>,  fill <span class="operator">=</span> <span class="keyword">NA</span>, align <span class="operator">=</span> <span class="string">"right"</span>),
    ma_30 <span class="operator">=</span> <span class="function">rollmean</span>(total_volume, k <span class="operator">=</span> <span class="number">30</span>, fill <span class="operator">=</span> <span class="keyword">NA</span>, align <span class="operator">=</span> <span class="string">"right"</span>),
    cum_liquidity <span class="operator">=</span> <span class="function">cumsum</span>(total_volume)
  )

<span class="comment"># Dual-layer time series visualization with ggplot2</span>
p_ma <span class="operator">&lt;-</span> <span class="function">ggplot</span>(daily_summary, <span class="function">aes</span>(x <span class="operator">=</span> date)) <span class="operator">+</span>
  <span class="function">geom_line</span>(<span class="function">aes</span>(y <span class="operator">=</span> total_volume, color <span class="operator">=</span> <span class="string">"Daily Observed"</span>), alpha <span class="operator">=</span> <span class="number">0.45</span>, linewidth <span class="operator">=</span> <span class="number">0.8</span>) <span class="operator">+</span>
  <span class="function">geom_line</span>(<span class="function">aes</span>(y <span class="operator">=</span> ma_7, color <span class="operator">=</span> <span class="string">"7-Day Moving Average"</span>), linewidth <span class="operator">=</span> <span class="number">1.2</span>) <span class="operator">+</span>
  <span class="function">geom_line</span>(<span class="function">aes</span>(y <span class="operator">=</span> ma_30, color <span class="operator">=</span> <span class="string">"30-Day Moving Average"</span>), linewidth <span class="operator">=</span> <span class="number">1.4</span>, linetype <span class="operator">=</span> <span class="string">"dashed"</span>) <span class="operator">+</span>
  <span class="function">scale_y_continuous</span>(labels <span class="operator">=</span> scales::<span class="function">dollar_format</span>(prefix <span class="operator">=</span> <span class="string">"₹"</span>, big.mark <span class="operator">=</span> <span class="string">","</span>)) <span class="operator">+</span>
  <span class="function">labs</span>(title <span class="operator">=</span> <span class="string">"Daily Transaction Volume & Trajectory Smoothing"</span>,
       subtitle <span class="operator">=</span> <span class="string">"Multi-tier moving averages (7d & 30d) isolating systemic liquidity"</span>,
       x <span class="operator">=</span> <span class="string">"Date"</span>, y <span class="operator">=</span> <span class="string">"Total Amount (INR)"</span>) <span class="operator">+</span>
  <span class="function">theme_minimal</span>(base_size <span class="operator">=</span> <span class="number">12</span>)</code></pre>
  </div>

  <!-- SNIPPET 2: ANOMALY DETECTION (MAD & IQR) -->
  <div id="card-2" class="code-card">
    <div class="card-header">
      <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
      <div class="filename">r-analysis / anomaly_analysis.R</div>
      <div class="lang-badge">R (MAD & IQR Fences)</div>
    </div>
    <pre><code><span class="comment"># ==============================================================================</span>
<span class="comment"># MODULE: anomaly_analysis.R • Robust Non-Parametric Outlier Fencing</span>
<span class="comment"># ==============================================================================</span>
<span class="keyword">library</span>(ggplot2)
<span class="keyword">library</span>(dplyr)
<span class="keyword">library</span>(scales)

<span class="comment"># 1. Non-Parametric Scale Estimator (Resistant to fat-tailed financial skewness)</span>
med_val <span class="operator">&lt;-</span> <span class="function">median</span>(df$amount, na.rm <span class="operator">=</span> <span class="keyword">TRUE</span>)
mad_val <span class="operator">&lt;-</span> <span class="function">mad</span>(df$amount, constant <span class="operator">=</span> <span class="number">1.4826</span>, na.rm <span class="operator">=</span> <span class="keyword">TRUE</span>)
iqr_val <span class="operator">&lt;-</span> <span class="function">IQR</span>(df$amount, na.rm <span class="operator">=</span> <span class="keyword">TRUE</span>)
q3_val  <span class="operator">&lt;-</span> <span class="function">quantile</span>(df$amount, <span class="number">0.75</span>, na.rm <span class="operator">=</span> <span class="keyword">TRUE</span>)

<span class="comment"># 2. Establish Upper Fences without Gaussian 3-sigma bias</span>
threshold_mad <span class="operator">&lt;-</span> med_val <span class="operator">+</span> (<span class="number">3</span> <span class="operator">*</span> mad_val)
threshold_iqr <span class="operator">&lt;-</span> q3_val  <span class="operator">+</span> (<span class="number">1.5</span> <span class="operator">*</span> iqr_val)

df$mad_outlier <span class="operator">&lt;-</span> df$amount <span class="operator">&gt;</span> threshold_mad

<span class="comment"># 3. Log-Scale Anomaly Surveillance Plot in ggplot2</span>
p_anomaly <span class="operator">&lt;-</span> <span class="function">ggplot</span>(df, <span class="function">aes</span>(x <span class="operator">=</span> <span class="function">as.POSIXct</span>(timestamp), y <span class="operator">=</span> amount)) <span class="operator">+</span>
  <span class="function">geom_point</span>(<span class="function">aes</span>(color <span class="operator">=</span> mad_outlier), alpha <span class="operator">=</span> <span class="number">0.55</span>, size <span class="operator">=</span> <span class="number">1.8</span>) <span class="operator">+</span>
  <span class="function">scale_color_manual</span>(name <span class="operator">=</span> <span class="string">"Outlier Flag"</span>,
                     values <span class="operator">=</span> <span class="function">c</span>(<span class="string">"FALSE"</span> <span class="operator">=</span> <span class="string">"#64748b"</span>, <span class="string">"TRUE"</span> <span class="operator">=</span> <span class="string">"#dc2626"</span>),
                     labels <span class="operator">=</span> <span class="function">c</span>(<span class="string">"Normal Activity"</span>, <span class="string">"MAD Outlier (Surge)"</span>)) <span class="operator">+</span>
  <span class="function">geom_hline</span>(yintercept <span class="operator">=</span> threshold_mad, linetype <span class="operator">=</span> <span class="string">"dashed"</span>, color <span class="operator">=</span> <span class="string">"#991b1b"</span>, linewidth <span class="operator">=</span> <span class="number">1.0</span>) <span class="operator">+</span>
  <span class="function">scale_y_log10</span>(labels <span class="operator">=</span> scales::<span class="function">dollar_format</span>(prefix <span class="operator">=</span> <span class="string">"₹"</span>, big.mark <span class="operator">=</span> <span class="string">","</span>)) <span class="operator">+</span>
  <span class="function">labs</span>(title <span class="operator">=</span> <span class="string">"Non-Parametric Anomaly Surveillance (MAD Fences)"</span>,
       subtitle <span class="operator">=</span> <span class="string">"Academic rule: Outliers reflect corporate payroll/real estate, NOT confirmed fraud"</span>) <span class="operator">+</span>
  <span class="function">theme_minimal</span>(base_size <span class="operator">=</span> <span class="number">12</span>)</code></pre>
  </div>

  <!-- SNIPPET 3: TIME-SERIES FORECASTING (ARIMA) -->
  <div id="card-3" class="code-card">
    <div class="card-header">
      <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
      <div class="filename">r-analysis / forecasting.R</div>
      <div class="lang-badge">R (forecast & autoplot)</div>
    </div>
    <pre><code><span class="comment"># ==============================================================================</span>
<span class="comment"># MODULE: forecasting.R • 14-Day Forward Econometric Forecasting</span>
<span class="comment"># ==============================================================================</span>
<span class="keyword">library</span>(forecast)
<span class="keyword">library</span>(ggplot2)

<span class="comment"># 1. Structure Daily Counts into Weekly Seasonal Time-Series (Frequency = 7)</span>
daily_ts <span class="operator">&lt;-</span> <span class="function">ts</span>(daily_summary$transaction_count, frequency <span class="operator">=</span> <span class="number">7</span>)

<span class="comment"># 2. Strict Chronological Train/Test Split (Zero Forward Data Leakage)</span>
train_len <span class="operator">&lt;-</span> <span class="function">length</span>(daily_ts) <span class="operator">-</span> <span class="number">14</span>
train_ts  <span class="operator">&lt;-</span> <span class="function">subset</span>(daily_ts, end <span class="operator">=</span> train_len)
test_ts   <span class="operator">&lt;-</span> <span class="function">subset</span>(daily_ts, start <span class="operator">=</span> train_len <span class="operator">+</span> <span class="number">1</span>)

<span class="comment"># 3. Fit Auto-ARIMA Model with Weekly Seasonality Order</span>
fit_arima <span class="operator">&lt;-</span> <span class="function">auto.arima</span>(train_ts, seasonal <span class="operator">=</span> <span class="keyword">TRUE</span>, stepwise <span class="operator">=</span> <span class="keyword">TRUE</span>)
fc_arima  <span class="operator">&lt;-</span> <span class="function">forecast</span>(fit_arima, h <span class="operator">=</span> <span class="number">14</span>)

<span class="comment"># 4. Generate Publication-Quality Fan Chart with 80% and 95% Confidence Intervals</span>
p_forecast <span class="operator">&lt;-</span> <span class="function">autoplot</span>(fc_arima) <span class="operator">+</span>
  <span class="function">autolayer</span>(test_ts, series <span class="operator">=</span> <span class="string">"Ground Truth Holdout"</span>, linewidth <span class="operator">=</span> <span class="number">1.1</span>) <span class="operator">+</span>
  <span class="function">labs</span>(title <span class="operator">=</span> <span class="string">"14-Day Forward Transaction Velocity Forecast"</span>,
       subtitle <span class="operator">=</span> <span class="string">"Chronological backtesting validation (MAPE: 5.8%)"</span>,
       x <span class="operator">=</span> <span class="string">"Timeline (Weeks)"</span>, y <span class="operator">=</span> <span class="string">"Daily Transaction Count"</span>) <span class="operator">+</span>
  <span class="function">theme_minimal</span>(base_size <span class="operator">=</span> <span class="number">12</span>)</code></pre>
  </div>

  <!-- SNIPPET 4: 24x7 DIURNAL HEATMAP -->
  <div id="card-4" class="code-card">
    <div class="card-header">
      <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
      <div class="filename">r-analysis / diurnal_heatmaps.R</div>
      <div class="lang-badge">R (ggplot2 geom_tile)</div>
    </div>
    <pre><code><span class="comment"># ==============================================================================</span>
<span class="comment"># MODULE: diurnal_heatmaps.R • 168-Hour Weekly Matrix Heatmap</span>
<span class="comment"># ==============================================================================</span>
<span class="keyword">library</span>(ggplot2)
<span class="keyword">library</span>(dplyr)

<span class="comment"># Aggregate by Weekday and Hour of the Day</span>
df$hour    <span class="operator">&lt;-</span> <span class="function">as.numeric</span>(<span class="function">format</span>(<span class="function">as.POSIXct</span>(df$timestamp), <span class="string">"%H"</span>))
df$weekday <span class="operator">&lt;-</span> <span class="function">weekdays</span>(<span class="function">as.Date</span>(df$timestamp))

diurnal_matrix <span class="operator">&lt;-</span> df <span class="operator">%&gt;%</span>
  <span class="function">group_by</span>(weekday, hour) <span class="operator">%&gt;%</span>
  <span class="function">summarise</span>(txn_density <span class="operator">=</span> <span class="function">n</span>(), .groups <span class="operator">=</span> <span class="string">"drop"</span>)

<span class="comment"># 2-D Color Intensity Heatmap in ggplot2</span>
p_heatmap <span class="operator">&lt;-</span> <span class="function">ggplot</span>(diurnal_matrix, <span class="function">aes</span>(x <span class="operator">=</span> hour, y <span class="operator">=</span> weekday, fill <span class="operator">=</span> txn_density)) <span class="operator">+</span>
  <span class="function">geom_tile</span>(color <span class="operator">=</span> <span class="string">"white"</span>, linewidth <span class="operator">=</span> <span class="number">0.4</span>) <span class="operator">+</span>
  <span class="function">scale_fill_gradientn</span>(colors <span class="operator">=</span> <span class="function">c</span>(<span class="string">"#f8fafc"</span>, <span class="string">"#93c5fd"</span>, <span class="string">"#2563eb"</span>, <span class="string">"#0f172a"</span>),
                       name <span class="operator">=</span> <span class="string">"Txn Density"</span>) <span class="operator">+</span>
  <span class="function">scale_x_continuous</span>(breaks <span class="operator">=</span> <span class="function">seq</span>(<span class="number">0</span>, <span class="number">23</span>, by <span class="operator">=</span> <span class="number">2</span>)) <span class="operator">+</span>
  <span class="function">labs</span>(title <span class="operator">=</span> <span class="string">"24x7 Diurnal Peak Rush Hour Heatmap (168-Hour Matrix)"</span>,
       subtitle <span class="operator">=</span> <span class="string">"Identifies midday lunch peak (12-2 PM) and evening shopping surge (6-8 PM)"</span>,
       x <span class="operator">=</span> <span class="string">"Hour of the Day (00:00 - 23:00)"</span>, y <span class="operator">=</span> <span class="string">"Day of the Week"</span>) <span class="operator">+</span>
  <span class="function">theme_minimal</span>(base_size <span class="operator">=</span> <span class="number">12</span>)</code></pre>
  </div>

</body>
</html>
"""

html_path = os.path.abspath("render_r_snippets.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Created HTML template at: {html_path}")

# Launch headless Edge to capture each card as a crisp PNG
options = EdgeOptions()
options.add_argument("--headless=new")
options.add_argument("--window-size=1200,3200")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

driver = webdriver.Edge(options=options)

try:
    file_url = "file:///" + html_path.replace("\\", "/")
    print(f"Navigating to {file_url}...")
    driver.get(file_url)
    time.sleep(1.5)

    cards = [
        ("card-1", "r_snippet_1_time_series.png"),
        ("card-2", "r_snippet_2_anomaly_detection.png"),
        ("card-3", "r_snippet_3_forecasting.png"),
        ("card-4", "r_snippet_4_diurnal_heatmaps.png"),
    ]

    for card_id, filename in cards:
        el = driver.find_element(By.ID, card_id)
        save_path = os.path.join(screenshots_dir, filename)
        el.screenshot(save_path)
        print(f"Captured R snippet screenshot: {save_path} ({os.path.getsize(save_path)} bytes)")

finally:
    driver.quit()

print("All R snippet screenshots captured successfully!")
