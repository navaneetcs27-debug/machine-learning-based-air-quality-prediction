@echo off
title AeroAI - ML Air Quality Prediction Engine
echo Starting AeroAI Machine Learning Server...
cd /d "%~dp0"
.\.venv\Scripts\python.exe run_server.py
pause
