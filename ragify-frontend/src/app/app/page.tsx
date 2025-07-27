import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "/components/ui/button"
import { Checkbox } from "/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card"
import { Textarea } from "/components/ui/textarea"
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

interface Document {
  id: string
  name: string
  size: number
  uploadedAt: Date
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

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isPDF = file.type === "application/pdf"
      const isValidSize = file.size <= 200 * 1024 * 1024 // 200MB
      return isPDF && isValidSize
    })

    const newDocuments: Document[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    }))

    setDocuments((prev) => [...prev, ...newDocuments])
  }

  const handleProcess = async () => {
    setIsProcessing(true)
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
  }

  const handleResetDatabase = () => {
    setDocuments([])
    setQnaHistory([])
    setCurrentAnswer("")
  }

  const handleAsk = async () => {
    if (!question.trim()) return

    setIsAsking(true)
    const newQuestion = question
    setQuestion("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockAnswer =
      "This is a simulated answer from the RAG backend. In a real implementation, this would be the AI-generated response based on your uploaded documents and the question asked."

    setCurrentAnswer(mockAnswer)

    const newQnA: QnAItem = {
      id: Math.random().toString(36).substr(2, 9),
      question: newQuestion,
      answer: mockAnswer,
      timestamp: new Date(),
    }

    setQnaHistory((prev) => [newQnA, ...prev])
    setIsAsking(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
                Current documents in database: <span className="font-semibold ml-1">{documents.length}</span>
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
                <p className="text-sm text-slate-600 mb-2">Drag & drop PDF files here</p>
                <p className="text-xs text-slate-500 mb-3">or</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" size="sm" className="cursor-pointer bg-transparent">
                    Browse Files
                  </Button>
                </label>
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

              <Button onClick={handleProcess} disabled={documents.length === 0 || isProcessing} className="w-full">
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
                    disabled={!question.trim() || isAsking || documents.length === 0}
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
                  {documents.length === 0 && (
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
                      <p className="text-slate-700 leading-relaxed">{currentAnswer}</p>
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
                              <p className="text-slate-700 leading-relaxed">{item.answer}</p>
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
