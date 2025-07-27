"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Upload,
  Trash2,
  Database,
  Settings,
  MessageSquare,
  File,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api"

interface Document {
  id: string
  name: string
  size: number
  uploadedAt: Date
  temp_path?: string
  processed?: boolean
}

interface QnAItem {
  id: string
  question: string
  answer: string
  timestamp: Date
}

export default function MainApp() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [question, setQuestion] = useState("")
  const [qnaHistory, setQnaHistory] = useState<QnAItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [enableHandwriting, setEnableHandwriting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isAsking, setIsAsking] = useState(false)
  const [databaseStatus, setDatabaseStatus] = useState({ count: 0, status: "unknown" })
  const [isUploading, setIsUploading] = useState(false)

  // Fetch database status on component mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await apiService.getStatus()
        setDatabaseStatus({ count: status.document_count, status: status.database_status })
      } catch (error) {
        console.error('Failed to fetch database status:', error)
      }
    }
    fetchStatus()
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleBrowseClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isPDF = file.type === "application/pdf"
      const isValidSize = file.size <= 200 * 1024 * 1024 // 200MB
      return isPDF && isValidSize
    })

    setIsUploading(true)

    for (const file of validFiles) {
      try {
        const uploadResponse = await apiService.uploadFile(file)

        const newDocument: Document = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
          temp_path: uploadResponse.temp_path,
          processed: false,
        }

        setDocuments((prev) => [...prev, newDocument])
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        // You could add a toast notification here
      }
    }

    setIsUploading(false)
  }

  const handleProcess = async () => {
    setIsProcessing(true)

    try {
      const unprocessedDocs = documents.filter(doc => !doc.processed && doc.temp_path)

      for (const doc of unprocessedDocs) {
        if (doc.temp_path) {
          const processResponse = await apiService.processDocument({
            file_path: doc.temp_path,
            filename: doc.name,
            use_handwriting_ocr: enableHandwriting,
          })

          if (processResponse.success) {
            // Mark document as processed
            setDocuments(prev => prev.map(d =>
              d.id === doc.id ? { ...d, processed: true } : d
            ))
          }
        }
      }

      // Refresh database status
      const status = await apiService.getStatus()
      setDatabaseStatus({ count: status.document_count, status: status.database_status })

    } catch (error) {
      console.error('Processing failed:', error)
      // You could add a toast notification here
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResetDatabase = async () => {
    try {
      const resetResponse = await apiService.resetDatabase()

      if (resetResponse.success) {
        setDocuments([])
        setQnaHistory([])
        setCurrentAnswer("")

        // Refresh database status
        const status = await apiService.getStatus()
        setDatabaseStatus({ count: status.document_count, status: status.database_status })
      }
    } catch (error) {
      console.error('Reset failed:', error)
      // You could add a toast notification here
    }
  }

  const handleAsk = async () => {
    if (!question.trim()) return

    setIsAsking(true)
    const newQuestion = question
    setQuestion("")

    try {
      const queryResponse = await apiService.queryDocuments({
        query: newQuestion,
        n_results: 10,
      })

      if (queryResponse.success) {
        setCurrentAnswer(queryResponse.answer)

        const newQnA: QnAItem = {
          id: Math.random().toString(36).substring(2, 9),
          question: newQuestion,
          answer: queryResponse.answer,
          timestamp: new Date(),
        }

        setQnaHistory((prev) => [newQnA, ...prev])
      } else {
        setCurrentAnswer("Sorry, I couldn't find relevant information in your documents.")
      }
    } catch (error) {
      console.error('Query failed:', error)
      setCurrentAnswer("An error occurred while processing your question. Please try again.")
    } finally {
      setIsAsking(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatAnswer = (text: string) => {
    // Clean up the text and split into sections
    const cleanText = text.replace(/\*\*/g, '**').trim()

    // Split by double line breaks first, then handle single line breaks within sections
    const sections = cleanText.split(/\n\s*\n/).filter(s => s.trim())

    return sections.map((section, sectionIndex) => {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line)

      if (lines.length === 0) return null

      // Check if this section contains headers
      const hasHeaders = section.includes('**')

      if (hasHeaders) {
        // Process headers and content
        const elements = []
        let currentContent = ''

        lines.forEach((line, lineIndex) => {
          if (line.includes('**')) {
            // Save any accumulated content
            if (currentContent.trim()) {
              elements.push(
                <p key={`content-${lineIndex}`} className="text-slate-700 leading-relaxed mb-3">
                  {currentContent.trim()}
                </p>
              )
              currentContent = ''
            }

            // Extract and format headers
            const headerMatch = line.match(/\*\*([^*]+)\*\*/)
            if (headerMatch) {
              elements.push(
                <h3 key={`header-${lineIndex}`} className="font-bold text-lg text-slate-800 mb-2 mt-4">
                  {headerMatch[1]}
                </h3>
              )
              // Add any text after the header
              const afterHeader = line.replace(/\*\*[^*]+\*\*/, '').trim()
              if (afterHeader) {
                currentContent += afterHeader + ' '
              }
            }
          } else {
            currentContent += line + ' '
          }
        })

        // Add any remaining content
        if (currentContent.trim()) {
          elements.push(
            <p key="final-content" className="text-slate-700 leading-relaxed mb-3">
              {currentContent.trim()}
            </p>
          )
        }

        return (
          <div key={sectionIndex} className="mb-6">
            {elements}
          </div>
        )
      }

      // Check for bullet points
      const hasBullets = lines.some(line => line.match(/^\s*[\*\-\•]\s+/))

      if (hasBullets) {
        const bulletItems = []
        let nonBulletContent = ''

        lines.forEach((line, lineIndex) => {
          const bulletMatch = line.match(/^\s*[\*\-\•]\s+(.+)/)
          if (bulletMatch) {
            // Add any non-bullet content before this bullet
            if (nonBulletContent.trim()) {
              bulletItems.push(
                <p key={`text-${lineIndex}`} className="text-slate-700 leading-relaxed mb-3">
                  {nonBulletContent.trim()}
                </p>
              )
              nonBulletContent = ''
            }

            bulletItems.push(
              <li key={`bullet-${lineIndex}`} className="text-slate-700 leading-relaxed mb-1">
                {bulletMatch[1]}
              </li>
            )
          } else {
            nonBulletContent += line + ' '
          }
        })

        // Add any remaining non-bullet content
        if (nonBulletContent.trim()) {
          bulletItems.push(
            <p key="final-text" className="text-slate-700 leading-relaxed mb-3">
              {nonBulletContent.trim()}
            </p>
          )
        }

        return (
          <div key={sectionIndex} className="mb-6">
            {bulletItems.filter(item => item.type !== 'li').length > 0 && (
              <div className="mb-3">
                {bulletItems.filter(item => item.type !== 'li')}
              </div>
            )}
            {bulletItems.filter(item => item.type === 'li').length > 0 && (
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                {bulletItems.filter(item => item.type === 'li')}
              </ul>
            )}
          </div>
        )
      }

      // Check for numbered lists
      const hasNumbers = lines.some(line => line.match(/^\s*\d+\.\s+/))

      if (hasNumbers) {
        const numberedItems = []
        let nonNumberContent = ''

        lines.forEach((line, lineIndex) => {
          const numberMatch = line.match(/^\s*\d+\.\s+(.+)/)
          if (numberMatch) {
            if (nonNumberContent.trim()) {
              numberedItems.push(
                <p key={`text-${lineIndex}`} className="text-slate-700 leading-relaxed mb-3">
                  {nonNumberContent.trim()}
                </p>
              )
              nonNumberContent = ''
            }

            numberedItems.push(
              <li key={`number-${lineIndex}`} className="text-slate-700 leading-relaxed mb-1">
                {numberMatch[1]}
              </li>
            )
          } else {
            nonNumberContent += line + ' '
          }
        })

        if (nonNumberContent.trim()) {
          numberedItems.push(
            <p key="final-text" className="text-slate-700 leading-relaxed mb-3">
              {nonNumberContent.trim()}
            </p>
          )
        }

        return (
          <div key={sectionIndex} className="mb-6">
            {numberedItems.filter(item => item.type !== 'li').length > 0 && (
              <div className="mb-3">
                {numberedItems.filter(item => item.type !== 'li')}
              </div>
            )}
            {numberedItems.filter(item => item.type === 'li').length > 0 && (
              <ol className="list-decimal list-inside space-y-1 ml-4 mb-3">
                {numberedItems.filter(item => item.type === 'li')}
              </ol>
            )}
          </div>
        )
      }

      // Regular paragraph
      const content = lines.join(' ')
      return (
        <p key={sectionIndex} className="text-slate-700 leading-relaxed mb-4">
          {content}
        </p>
      )
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RAGify
            </h1>
          </Link>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-slate-600" />
              RAG Question Answer
            </h2>

            <div className="bg-slate-50 p-3 rounded-lg mb-4">
              <div className="flex items-center text-sm text-slate-600">
                <Database className="w-4 h-4 mr-2" />
                Current documents in database: <span className="font-semibold ml-1">{databaseStatus.count}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Status: {databaseStatus.status}
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6">
            {/* File Upload */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-3">Upload Documents</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-slate-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">
                  {isUploading ? "Uploading files..." : "Drag & drop PDF files here"}
                </p>
                <p className="text-xs text-slate-500 mb-3">or</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                >
                  Browse Files
                </button>
                <p className="text-xs text-slate-500 mt-2">Max 200MB, PDF only</p>
              </div>

              {/* Document List */}
              {documents.length > 0 && (
                <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <File className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{doc.name}</span>
                        {doc.processed && (
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-slate-500 ml-2">{formatFileSize(doc.size)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="handwriting"
                  checked={enableHandwriting}
                  onCheckedChange={(checked) => setEnableHandwriting(checked as boolean)}
                />
                <label htmlFor="handwriting" className="text-sm text-slate-700">
                  Enable Handwriting Recognition
                </label>
              </div>

              <Button
                onClick={handleProcess}
                disabled={documents.filter(d => !d.processed).length === 0 || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Process
                  </>
                )}
              </Button>

              <Button variant="destructive" onClick={handleResetDatabase} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Vector Database
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-slate-200 bg-white">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-slate-600" />
              RAG Question Answer
            </h2>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Question Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ask a Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Type your question about the uploaded documents..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[100px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleAsk()
                      }
                    }}
                  />
                  <Button
                    onClick={handleAsk}
                    disabled={!question.trim() || isAsking || databaseStatus.count === 0}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isAsking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Asking...
                      </>
                    ) : (
                      <>🔥 Ask</>
                    )}
                  </Button>
                  {databaseStatus.count === 0 && (
                    <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Please upload and process documents before asking questions.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Answer */}
              {currentAnswer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">Latest Answer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-slate-700 leading-relaxed">
                        {formatAnswer(currentAnswer)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Q&A History */}
              {qnaHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Question & Answer History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {qnaHistory.map((item) => (
                        <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="mb-3">
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-medium text-blue-600">Q</span>
                              </div>
                              <p className="text-slate-900 font-medium">{item.question}</p>
                            </div>
                          </div>
                          <div className="ml-8">
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-medium text-green-600">A</span>
                              </div>
                              <div className="text-slate-700 leading-relaxed">
                                {formatAnswer(item.answer)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-slate-500 ml-8">{item.timestamp.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
