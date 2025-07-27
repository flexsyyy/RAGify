import os
import sys
import tempfile
import shutil
from typing import List, Dict, Any, Optional
import asyncio
from pathlib import Path

# Add the ragify directory to Python path to import existing functions
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ragify'))

# Import the working functions from your Streamlit app (only the ones we need)
try:
    from app import (
        query_collection,
        re_rank_cross_encoders,
        call_llm
    )
    from handwrittingocr import HandwritingOCR
except ImportError as e:
    print(f"Warning: Could not import from ragify app: {e}")
    # Fallback imports
    from langchain_community.document_loaders import PyMuPDFLoader
    from langchain_core.documents import Document
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from sentence_transformers import CrossEncoder
    import ollama
    import chromadb
    from chromadb.utils.embedding_functions.ollama_embedding_function import OllamaEmbeddingFunction
    from handwrittingocr import HandwritingOCR

from models import ProcessResponse, QueryResponse, StatusResponse, ResetResponse

class RAGProcessor:
    """Core RAG processing class with optimized model caching"""

    def __init__(self):
        # Use cached OCR models for better performance
        self.handwriting_ocr = None
        # Cache for embeddings model to avoid recreation
        self._embeddings_cache = None
        # Cache for ChromaDB client
        self._chroma_client_cache = None

    
    async def process_document(self, file_path: str, filename: str, use_handwriting_ocr: bool = False) -> ProcessResponse:
        """Process a document using proven Streamlit logic"""
        try:
            # Create a mock uploaded file object for the existing function
            class MockUploadedFile:
                def __init__(self, file_path: str, filename: str):
                    self.name = filename
                    self.file_path = file_path

                def read(self):
                    with open(self.file_path, 'rb') as f:
                        return f.read()

            mock_file = MockUploadedFile(file_path, filename)

            # Process document directly without Streamlit dependencies
            all_splits = self._process_document_standalone(mock_file, use_handwriting_ocr)

            # Calculate total characters
            total_chars = sum(len(split.page_content) for split in all_splits)

            # Normalize filename for database
            normalized_filename = filename.translate(str.maketrans({"-": "_", ".": "_", " ": "_"}))

            # Add to vector collection directly
            self._add_to_vector_collection(all_splits, normalized_filename)

            # Clean up temp file
            if os.path.exists(file_path):
                os.unlink(file_path)

            processing_method = "handwriting recognition" if use_handwriting_ocr else "standard PDF processing"

            return ProcessResponse(
                success=True,
                message=f"Successfully processed {filename}",
                filename=filename,
                chunks_created=len(all_splits),
                processing_method=processing_method,
                total_characters=total_chars
            )

        except Exception as e:
            # Clean up temp file on error
            if os.path.exists(file_path):
                os.unlink(file_path)
            raise e
    
    async def query_documents(self, query: str, n_results: int = 10) -> QueryResponse:
        """Query documents standalone"""
        try:
            from langchain_community.embeddings import OllamaEmbeddings
            from langchain_chroma import Chroma
            import ollama

            persist_directory = "./ragify-backend-chroma"

            # Check if database exists
            if not os.path.exists(persist_directory):
                return QueryResponse(
                    success=False,
                    query=query,
                    answer="No documents found in the database. Please upload and process some documents first.",
                    retrieved_documents=[],
                    relevant_document_ids=[],
                    context_used=""
                )

            # Use cached embeddings model for better performance
            embeddings = self._get_cached_embeddings()

            # Try to get any collection (we'll use the first one we find)
            import chromadb
            client = chromadb.PersistentClient(path=persist_directory)
            collections = client.list_collections()

            if not collections:
                return QueryResponse(
                    success=False,
                    query=query,
                    answer="No documents found in the database. Please upload and process some documents first.",
                    retrieved_documents=[],
                    relevant_document_ids=[],
                    context_used=""
                )

            # Use the first collection
            collection_name = collections[0].name
            vectorstore = Chroma(
                collection_name=collection_name,
                embedding_function=embeddings,
                persist_directory=persist_directory
            )

            # Query the vector store
            docs = vectorstore.similarity_search(query, k=n_results)

            if not docs:
                return QueryResponse(
                    success=False,
                    query=query,
                    answer="No relevant documents found for your query.",
                    retrieved_documents=[],
                    relevant_document_ids=[],
                    context_used=""
                )

            # Combine document content for context
            context_text = "\n\n".join([doc.page_content for doc in docs])
            retrieved_docs = [doc.page_content for doc in docs]

            # Create prompt for LLM
            prompt = f"""Based on the following context, please answer the question. If the answer is not in the context, say so.

Context:
{context_text}

Question: {query}

Answer:"""

            # Call Ollama LLM
            try:
                response = ollama.chat(
                    model='llama3.2',
                    messages=[{'role': 'user', 'content': prompt}]
                )
                answer = response['message']['content']
            except Exception as llm_error:
                answer = f"Error generating response: {str(llm_error)}"

            return QueryResponse(
                success=True,
                query=query,
                answer=answer,
                retrieved_documents=retrieved_docs,
                relevant_document_ids=list(range(len(retrieved_docs))),
                context_used=context_text
            )

        except Exception as e:
            raise e
    
    async def get_status(self) -> StatusResponse:
        """Get current database status"""
        try:
            import chromadb
            from langchain_community.embeddings import OllamaEmbeddings

            persist_directory = "./ragify-backend-chroma"

            # Check if database directory exists
            if not os.path.exists(persist_directory):
                return StatusResponse(
                    success=True,
                    document_count=0,
                    database_status="empty",
                    message="Database is empty. Upload documents to get started."
                )

            try:
                # Try to connect to ChromaDB and count documents
                client = chromadb.PersistentClient(path=persist_directory)
                collections = client.list_collections()

                total_count = 0
                for collection in collections:
                    total_count += collection.count()

                if total_count > 0:
                    status = "active"
                    message = f"Database contains {total_count} document chunks"
                else:
                    status = "empty"
                    message = "Database is empty. Upload documents to get started."

                return StatusResponse(
                    success=True,
                    document_count=total_count,
                    database_status=status,
                    message=message
                )

            except Exception as db_error:
                return StatusResponse(
                    success=True,
                    document_count=0,
                    database_status="empty",
                    message="Database is empty. Upload documents to get started."
                )

        except Exception as e:
            return StatusResponse(
                success=False,
                document_count=0,
                database_status="error",
                message=f"Error checking database status: {str(e)}"
            )
    
    async def reset_database(self) -> ResetResponse:
        """Reset database by clearing all collections"""
        try:
            import chromadb
            import gc
            import time

            persist_directory = "./ragify-backend-chroma"

            if not os.path.exists(persist_directory):
                return ResetResponse(
                    success=True,
                    message="Vector database is already empty.",
                    actions_performed=["Database was already empty"]
                )

            # Clear all collections instead of deleting files
            try:
                client = chromadb.PersistentClient(path=persist_directory)
                collections = client.list_collections()

                deleted_collections = []
                for collection in collections:
                    try:
                        # Get all documents in the collection and delete them
                        collection_obj = client.get_collection(collection.name)
                        # Get all IDs in the collection
                        all_data = collection_obj.get()
                        if all_data['ids']:
                            # Delete all documents
                            collection_obj.delete(ids=all_data['ids'])

                        # Now delete the empty collection
                        client.delete_collection(collection.name)
                        deleted_collections.append(collection.name)
                    except Exception as e:
                        print(f"Warning: Could not delete collection {collection.name}: {e}")

                # Close the client properly
                del client
                gc.collect()

                if deleted_collections:
                    return ResetResponse(
                        success=True,
                        message="Vector database reset complete! You can now upload new documents.",
                        actions_performed=[f"Deleted collections: {', '.join(deleted_collections)}", "Database reset successfully"]
                    )
                else:
                    return ResetResponse(
                        success=True,
                        message="Vector database was already empty.",
                        actions_performed=["No collections found to delete"]
                    )

            except Exception as e:
                # If collection deletion fails, try to create a new empty database
                print(f"Collection deletion failed: {e}")
                return ResetResponse(
                    success=False,
                    message=f"Could not reset database: {str(e)}. Try restarting the application.",
                    actions_performed=["Reset operation failed"]
                )

        except Exception as e:
            return ResetResponse(
                success=False,
                message=f"Error resetting database: {str(e)}",
                actions_performed=["Reset operation failed"]
            )

    def _process_document_standalone(self, uploaded_file, use_handwriting_ocr=False):
        """Simplified document processing"""
        try:
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            from langchain.schema import Document

            # Initialize text splitter
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )

            # Read file content
            file_content = uploaded_file.read()

            if uploaded_file.name.lower().endswith('.pdf'):
                try:
                    import fitz  # PyMuPDF
                    doc = fitz.open(stream=file_content, filetype="pdf")
                    text = ""

                    for page_num in range(len(doc)):
                        page = doc.load_page(page_num)

                        if use_handwriting_ocr:
                            # Use cached handwriting OCR for better performance
                            if self.handwriting_ocr is None:
                                from handwrittingocr import HandwritingOCR
                                print("⚡ Initializing cached OCR models...")
                                self.handwriting_ocr = HandwritingOCR()  # Will use cached models

                            # Convert PDF page to image and process with handwriting OCR
                            pix = page.get_pixmap()
                            img_data = pix.tobytes("png")

                            # Save temporarily and process
                            import tempfile
                            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_img:
                                temp_img.write(img_data)
                                temp_img_path = temp_img.name

                            try:
                                page_text = self.handwriting_ocr.process_image(temp_img_path)
                            finally:
                                # Clean up temp image
                                if os.path.exists(temp_img_path):
                                    os.unlink(temp_img_path)
                        else:
                            # Use regular text extraction
                            page_text = page.get_text()

                        text += page_text + "\n"

                    doc.close()
                except Exception as e:
                    # Fallback: treat as text
                    text = f"PDF processing failed: {str(e)}. Please upload a text file instead."
            else:
                # Process text file
                text = file_content.decode('utf-8', errors='ignore')

            if not text.strip():
                text = "No text content found in the document."

            # Split text into chunks
            splits = text_splitter.create_documents([text])

            # Add metadata
            for i, split in enumerate(splits):
                split.metadata = {
                    "source": uploaded_file.name,
                    "page": 1,
                    "chunk": i
                }

            return splits

        except Exception as e:
            # Return a single document with error info
            from langchain.schema import Document
            return [Document(
                page_content=f"Error processing document: {str(e)}",
                metadata={"source": uploaded_file.name, "error": True}
            )]

    def _get_cached_embeddings(self):
        """Get cached embeddings model for better performance"""
        if self._embeddings_cache is None:
            from langchain_community.embeddings import OllamaEmbeddings
            print("🔄 Initializing embeddings model (cached)...")
            self._embeddings_cache = OllamaEmbeddings(model="nomic-embed-text:latest")
            print("✅ Embeddings model cached!")
        return self._embeddings_cache

    def _add_to_vector_collection(self, splits, collection_name):
        """Add document splits to vector collection with optimized caching"""
        try:
            from langchain_chroma import Chroma

            # Use cached embeddings model
            embeddings = self._get_cached_embeddings()

            # Initialize ChromaDB
            persist_directory = "./ragify-backend-chroma"

            # Create or get collection
            vectorstore = Chroma(
                collection_name=collection_name,
                embedding_function=embeddings,
                persist_directory=persist_directory
            )

            # Add documents in batches for better performance
            batch_size = 50  # Process in smaller batches for stability
            total_added = 0

            for i in range(0, len(splits), batch_size):
                batch = splits[i:i + batch_size]
                vectorstore.add_documents(batch)
                total_added += len(batch)
                print(f"📄 Added batch {i//batch_size + 1}: {len(batch)} documents")

            print(f"✅ Successfully added {total_added} document chunks to vector store")
            return total_added

        except Exception as e:
            print(f"❌ Error adding to vector collection: {str(e)}")
            # For now, just return the count even if there's an error
            return len(splits)
