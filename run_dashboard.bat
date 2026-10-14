@echo off
TITLE Banking Transaction Intelligence Dashboard Launcher
COLOR 0B

echo ======================================================================
echo    BANKING TRANSACTION INTELLIGENCE DASHBOARD
echo    Advanced Time-Series Financial Analytics System
echo ======================================================================
echo.

:: Check Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Python is not found in PATH. Please install Python 3.10+ and add it to PATH.
    pause
    exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Node.js is not found in PATH. Please install Node.js and add it to PATH.
    pause
    exit /b 1
)

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Banking Analytics Backend (FastAPI)" cmd /k "set PYTHONPATH=backend && python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000"

echo [2/3] Starting React Vite Frontend on http://localhost:5173 ...
cd frontend
start "Banking Analytics Frontend (React Vite)" cmd /k "npm run dev"
cd ..

echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo Launching browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ======================================================================
echo  Dashboard is launching!
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://127.0.0.1:8000
echo  - Swagger Docs: http://127.0.0.1:8000/docs
echo ======================================================================
echo.
echo Leave this window open or close it. Both services are running in separate consoles.
pause
