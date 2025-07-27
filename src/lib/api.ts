const API_BASE_URL = 'http://localhost:8000'

export interface ProcessRequest {
  file_path: string
  filename: string
  use_handwriting_ocr: boolean
}

export interface ProcessResponse {
  success: boolean
  message: string
  filename: string
  chunks_created: number
  processing_method: string
  total_characters?: number
}

export interface QueryRequest {
  query: string
  n_results?: number
}

export interface QueryResponse {
  success: boolean
  query: string
  answer: string
  retrieved_documents: string[]
  relevant_document_ids: number[]
  context_used: string
}

export interface StatusResponse {
  success: boolean
  document_count: number
  database_status: string
  message: string
}

export interface ResetResponse {
  success: boolean
  message: string
  actions_performed: string[]
}

export interface UploadResponse {
  message: string
  filename: string
  temp_path: string
  size: number
}

class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Upload failed: ${response.status}`)
    }

    return response.json()
  }

  async processDocument(request: ProcessRequest): Promise<ProcessResponse> {
    return this.request<ProcessResponse>('/process', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async queryDocuments(request: QueryRequest): Promise<QueryResponse> {
    return this.request<QueryResponse>('/query', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getStatus(): Promise<StatusResponse> {
    return this.request<StatusResponse>('/status', {
      method: 'GET',
    })
  }

  async resetDatabase(): Promise<ResetResponse> {
    return this.request<ResetResponse>('/reset', {
      method: 'DELETE',
    })
  }

  async healthCheck(): Promise<{ message: string; status: string }> {
    return this.request<{ message: string; status: string }>('/', {
      method: 'GET',
    })
  }
}

export const apiService = new APIService()
