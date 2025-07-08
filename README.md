# Quant IQ Vision

A modern portfolio analysis and optimization application built with React (frontend) and FastAPI (backend).

## Project Structure

```
quant-iq-vision-08/
├── src/                    # React frontend (Vite + TypeScript)
│   ├── components/         # React components
│   ├── services/          # API services
│   └── ...
├── backend/               # FastAPI backend
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── ...
├── package.json          # Frontend dependencies and scripts
└── README.md            # This file
```

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Set Up Environment Variables

```bash
# Copy backend environment template
cp backend/env.example backend/.env
# Edit backend/.env with your configuration
```

### 4. Run Both Frontend and Backend

```bash
# Run both frontend and backend simultaneously
npm run dev:full
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Development

### Running Frontend Only

```bash
npm run dev
```

### Running Backend Only

```bash
npm run dev:backend
```

### Building for Production

```bash
npm run build
```

## API Endpoints

The backend provides the following endpoints:

- `GET /health` - Health check
- `POST /api/portfolio/analyze` - Portfolio analysis
- `GET /api/market-data/{symbol}` - Market data for a symbol
- `GET /` - Root endpoint with API info

## Frontend-Backend Integration

The frontend is configured to proxy API requests to the backend during development:

- API requests to `/api/*` are proxied to `http://localhost:8000`
- Health check requests to `/health` are proxied to `http://localhost:8000`
- CORS is configured on the backend to allow requests from the frontend

## Features

- **Portfolio Analysis**: Analyze portfolio performance and risk metrics
- **Efficient Frontier**: Visualize optimal portfolio allocations
- **Market Data**: Real-time market data integration
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **RESTful API**: FastAPI backend with automatic documentation

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- React Router for navigation
- Recharts for data visualization

### Backend
- FastAPI for API framework
- Pydantic for data validation
- SQLAlchemy for database ORM
- Uvicorn for ASGI server
- Python 3.8+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License.
