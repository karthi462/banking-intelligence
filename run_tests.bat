@echo off
TITLE Banking Dashboard Test Suite Runner
COLOR 0A

echo ======================================================================
echo    RUNNING BANKING ANALYTICS BACKEND TEST SUITE (PYTEST)
echo ======================================================================
echo.

set PYTHONPATH=backend
python -m pytest backend\tests -v

echo.
echo ======================================================================
echo    TEST EXECUTION FINISHED
echo ======================================================================
pause
