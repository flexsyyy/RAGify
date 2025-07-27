from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import tempfile
import os
import shutil
import uvicorn

# Import our RAG modules (we'll create these next)
from rag_core import RAGProcessor
from models import (
    ProcessRequest, 
    ProcessResponse, 
    QueryRequest, 
    QueryResponse, 
    StatusResponse,
    ResetResponse
)

app = FastAPI(
    title="RAGify API",
    description="A powerful RAG (Retrieval-Augmented Generation) API for document processing and Q&A",
    version="1.0.0"
)

# Configure CORS to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev server (multiple ports)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG processor
rag_processor = RAGProcessor()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "RAGify API is running!", "status": "healthy"}

@app.post("/upload", response_model=dict)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a PDF file for processing
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Save uploaded file temporarily
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        content = await file.read()
        temp_file.write(content)
        temp_file.close()
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "temp_path": temp_file.name,
            "size": len(content)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/process", response_model=ProcessResponse)
async def process_document(request: ProcessRequest):
    """
    Process uploaded document with optional handwriting OCR
    """
    try:
        result = await rag_processor.process_document(
            file_path=request.file_path,
            filename=request.filename,
            use_handwriting_ocr=request.use_handwriting_ocr
        )
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Query the vector database and get AI-powered responses
    """
    try:
        result = await rag_processor.query_documents(
            query=request.query,
            n_results=request.n_results
        )
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.get("/status", response_model=StatusResponse)
async def get_status():
    """
    Get current database status and document count
    """
    try:
        status = await rag_processor.get_status()
        return status
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@app.delete("/reset", response_model=ResetResponse)
async def reset_database():
    """
    Reset/clear the entire vector database
    """
    try:
        result = await rag_processor.reset_database()
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
