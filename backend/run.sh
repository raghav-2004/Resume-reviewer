#!/bin/bash
# Start the FastAPI backend server

# Load .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Starting AI Resume Reviewer Backend..."
echo "📍 API will be available at: http://localhost:8000"
echo "📖 API docs at: http://localhost:8000/docs"

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
