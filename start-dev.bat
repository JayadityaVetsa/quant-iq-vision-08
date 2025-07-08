@echo off
REM Quant IQ Vision Development Startup Script for Windows

echo 🚀 Starting Quant IQ Vision Development Environment...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install frontend dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Check if backend virtual environment exists
if not exist "backend\venv" (
    echo 🐍 Creating Python virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

REM Activate virtual environment and install backend dependencies
echo 🐍 Installing backend dependencies...
cd backend
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo 📝 Creating backend environment file...
    copy backend\env.example backend\.env
    echo ⚠️  Please edit backend\.env with your configuration
)

echo 🎯 Starting development servers...
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔧 Backend will be available at: http://localhost:8000
echo 📚 API docs will be available at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop both servers

REM Start both servers using npm script
npm run dev:full

pause 