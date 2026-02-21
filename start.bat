@echo off
title Smart Waste Management App

echo =========================================
echo   Smart Waste Management App Launcher
echo =========================================
echo.

:: Check and install frontend dependencies
if not exist "node_modules" (
    echo [Frontend] Installing dependencies...
    call npm install
    echo.
)

:: Check and install backend dependencies
if not exist "backend\node_modules" (
    echo [Backend] Installing dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

echo Starting Backend server...
start "Backend - EcoSync API" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 2 /nobreak >nul

echo Starting Frontend dev server...
start "Frontend - Vite Dev Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo =========================================
echo   Both servers are starting...
echo   Backend  : http://localhost:3001
echo   Frontend : http://localhost:5173
echo =========================================
echo.
pause
