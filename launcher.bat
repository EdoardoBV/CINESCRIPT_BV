@echo off
echo Starting CineScript AI...

:: Start the Vite development server in a new window
start "CineScript Server" cmd /c "npm run dev"

:: Wait for the server to start (adjust seconds if needed)
timeout /t 5 /nobreak >nul

:: URL of the application
set "APP_URL=http://localhost:3000"

:: Try to open in Chrome App mode
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=%APP_URL%
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=%APP_URL%
) else (
    :: Fallback to default browser
    start %APP_URL%
)

echo Application started!
exit
