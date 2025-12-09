@echo off
echo Starting Startpage Development Servers...
echo.

echo Starting proxy server in background...
start "Proxy Server" cmd /c "cd /d %~dp0 && node proxy-server.js"

timeout /t 2 /nobreak > nul

echo Starting frontend server...
cd /d %~dp0
python -m http.server 8000

echo.
echo Servers started!
echo Frontend: http://localhost:8000
echo Backend:  http://localhost:3001
echo.
echo Press Ctrl+C to stop all servers
