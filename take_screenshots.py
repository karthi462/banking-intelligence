import os
import time
from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge.service import Service as EdgeService

options = EdgeOptions()
options.add_argument("--headless=new")
options.add_argument("--window-size=1600,1050")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

out_dir = os.path.abspath("screenshots")
os.makedirs(out_dir, exist_ok=True)

driver = webdriver.Edge(options=options)

pages = [
    ("01_welcome_portal.png", "http://localhost:5173/welcome"),
    ("02_dashboard_overview.png", "http://localhost:5173/overview"),
    ("03_transaction_trends.png", "http://localhost:5173/trends"),
    ("04_time_analysis_heatmaps.png", "http://localhost:5173/time-analysis"),
    ("05_payment_analytics.png", "http://localhost:5173/payment-analytics"),
    ("06_statistical_anomalies.png", "http://localhost:5173/anomalies"),
    ("07_forecasting_models.png", "http://localhost:5173/forecasting"),
    ("08_branch_comparison.png", "http://localhost:5173/branches"),
    ("09_dataset_explorer.png", "http://localhost:5173/dataset-explorer"),
    ("10_reports_export.png", "http://localhost:5173/reports"),
]

try:
    for filename, url in pages:
        print(f"Capturing {url} -> {filename}...")
        driver.get(url)
        time.sleep(2.5)  # allow charts and animations to render
        save_path = os.path.join(out_dir, filename)
        driver.save_screenshot(save_path)
        print(f"Saved: {save_path} ({os.path.getsize(save_path)} bytes)")
finally:
    driver.quit()

print("All screenshots successfully captured!")
