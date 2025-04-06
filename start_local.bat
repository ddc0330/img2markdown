@echo off
echo Starting local development environment...

echo Checking database connection...
python backend/check_db.py
if %ERRORLEVEL% NEQ 0 (
    echo Database connection failed. Please check your Railway database settings.
    echo See RAILWAY_SETUP.md for instructions.
    pause
    exit /b 1
)

echo Starting backend server...
start cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting frontend server...
start cmd /k "cd frontend && npm start"

echo Local development environment started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000 