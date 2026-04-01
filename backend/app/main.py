"""
AI Resume Reviewer - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables before importing other modules
load_dotenv(override=True)

from app.routes.analyze import router as analyze_router

app = FastAPI(
    title="AI Resume Reviewer",
    description="Intelligent resume analysis for recruiters",
    version="1.0.0"
)

# Allow frontend to connect
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "AI Resume Reviewer API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
