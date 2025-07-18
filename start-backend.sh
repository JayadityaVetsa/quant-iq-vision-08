#!/bin/bash

echo "Starting Quant IQ Vision Backend..."

# Change to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Start the backend server
echo "Virtual environment activated. Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo "Backend server stopped." 