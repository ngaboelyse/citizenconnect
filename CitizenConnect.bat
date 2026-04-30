@echo off
title CitizenConnect
cd /d "%~dp0"

:: Start the web server in background
start /B node server.js
timeout /T 2 /NOBREAK >nul

:: Open the app window (Chrome app mode - frameless window)
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:3000 --window-size=400,780 --window-position=100,50 --no-first-run --disable-extensions

:: Launch system tray icon (shows in taskbar corner, right-click to open/exit)
powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0tray.ps1"