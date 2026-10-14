@echo off
TITLE Standalone R Time-Series Analysis Pipeline
COLOR 0E

echo ======================================================================
echo    STANDALONE R TIME-SERIES ANALYSIS PIPELINE
echo    Libraries: ggplot2, forecast, zoo, dplyr, lubridate, scales
echo ======================================================================
echo.

:: Check Rscript
where Rscript >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [NOTICE] Rscript is not detected in your system PATH.
    echo If you have R installed, add the R bin directory to your PATH (e.g. C:\Program Files\R\R-4.x.x\bin).
    echo.
    echo Remember: The main web dashboard runs fully independently with Python & React!
    echo.
    pause
    exit /b 0
)

echo Executing master R analysis pipeline (analysis.R)...
cd r-analysis
Rscript analysis.R
cd ..

echo.
echo ======================================================================
echo    R PIPELINE EXECUTION COMPLETE
echo    Graphics generated in r-analysis/ directory:
echo    - r_daily_volume_ma.png
echo    - r_cumulative_amount.png
echo    - r_anomaly_mad_plot.png
echo    - r_forecast_arima.png
echo ======================================================================
pause
