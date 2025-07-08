# Quant IQ Vision Backend

FastAPI backend for the Quant IQ Vision portfolio analysis application.

## Setup

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual configuration
   ```

## Running the Backend

### Development Mode
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access:
- **Interactive API docs (Swagger UI):** http://localhost:8000/docs
- **Alternative API docs (ReDoc):** http://localhost:8000/redoc
- **Health check:** http://localhost:8000/health

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── env.example         # Environment variables template
├── .env               # Environment variables (create from env.example)
└── README.md          # This file
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/portfolio/analyze` - Portfolio analysis
- `GET /api/market-data/{symbol}` - Market data for a symbol
- `GET /` - Root endpoint with API info

## Development

The backend is configured with CORS to allow requests from the React frontend running on:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (Alternative dev port) 