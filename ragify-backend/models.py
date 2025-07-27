from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ProcessRequest(BaseModel):
    """Request model for document processing"""
    file_path: str
    filename: str
    use_handwriting_ocr: bool = False

class ProcessResponse(BaseModel):
    """Response model for document processing"""
    success: bool
    message: str
    filename: str
    chunks_created: int
    processing_method: str
    total_characters: Optional[int] = None

class QueryRequest(BaseModel):
    """Request model for document queries"""
    query: str
    n_results: int = 10

class QueryResponse(BaseModel):
    """Response model for document queries"""
    success: bool
    query: str
    answer: str
    retrieved_documents: List[str]
    relevant_document_ids: List[int]
    context_used: str

class StatusResponse(BaseModel):
    """Response model for database status"""
    success: bool
    document_count: int
    database_status: str
    message: str

class ResetResponse(BaseModel):
    """Response model for database reset"""
    success: bool
    message: str
    actions_performed: List[str]

class ErrorResponse(BaseModel):
    """Standard error response model"""
    success: bool = False
    error: str
    detail: Optional[str] = None
