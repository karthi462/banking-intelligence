# PowerShell Runner for Banking Transaction Intelligence Dashboard

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   BANKING TRANSACTION INTELLIGENCE DASHBOARD" -ForegroundColor White
Write-Host "   Advanced Time-Series Financial Analytics System" -ForegroundColor Gray
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Verify Python
try {
    $pyVer = python --version
    Write-Host "[OK] Detected $pyVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# Verify Node
try {
    $nodeVer = node --version
    Write-Host "[OK] Detected Node.js $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='backend'; python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000" -PassThru

Write-Host "[2/3] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru

Write-Host "[3/3] Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

Write-Host "Opening web browser at http://localhost:5173..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Dashboard is active!" -ForegroundColor Green
Write-Host " - Web Interface: http://localhost:5173" -ForegroundColor White
Write-Host " - Backend API:   http://127.0.0.1:8000" -ForegroundColor White
Write-Host " - Swagger Docs:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
