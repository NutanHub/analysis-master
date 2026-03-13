@echo off
echo Starting PaperScope Local Server...
echo.
echo Navigate to: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
python -m http.server 3000
pause
