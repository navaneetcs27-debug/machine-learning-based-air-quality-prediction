@echo off
title AeroAI - ML Air Quality Prediction Engine (B.Tech Capstone Project)
echo ============================================================
echo   AeroAI: CPCB Air Quality Index Prediction System
echo   Academic Capstone Project - Phase 2 Demonstration
echo ============================================================
echo.
echo [1/2] Launching Local Server at http://localhost:8000 ...
cd /d "%~dp0"

REM Open browser automatically after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8000"

REM Start Python FastAPI Server
.\.venv\Scripts\python.exe run_server.py
pause
