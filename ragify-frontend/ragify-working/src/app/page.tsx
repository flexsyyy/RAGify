import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Zap, Brain, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Animated Background Objects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float-medium"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-xl animate-float-fast"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-xl animate-float-slow"></div>

        {/* Geometric Shapes */}
        <div className="absolute top-1/4 left-1/2 w-16 h-16 border-2 border-blue-300/30 rotate-45 animate-spin-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-r from-purple-300/30 to-pink-300/30 transform rotate-12 animate-bounce-slow"></div>
        <div className="absolute bottom-1/3 left-1/6 w-20 h-20 border-2 border-cyan-300/30 rounded-full animate-pulse-slow"></div>

        {/* Floating Particles */}
        <div className="absolute top-1/2 left-1/5 w-2 h-2 bg-blue-400/40 rounded-full animate-float-particle-1"></div>
        <div className="absolute top-1/3 right-1/5 w-3 h-3 bg-purple-400/40 rounded-full animate-float-particle-2"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400/40 rounded-full animate-float-particle-3"></div>
        <div className="absolute bottom-1/2 right-1/6 w-3 h-3 bg-green-400/40 rounded-full animate-float-particle-4"></div>

        {/* Document Icons */}
        <div className="absolute top-1/6 right-1/3 opacity-10 animate-float-document">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <div className="absolute bottom-1/5 left-1/5 opacity-10 animate-float-document-reverse">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-gentle">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RAGify
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>Powered by RAG & LLM Technology</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight animate-fade-in-up animation-delay-200">
              Ask Anything From Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Documents
              </span>
            </h2>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Transform your PDFs into an intelligent knowledge base. Upload documents, ask questions, and get instant,
              accurate answers powered by advanced AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up animation-delay-600">
            <Link href="/app">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 animate-bounce-gentle"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 animate-pulse" />
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-800">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto animate-bounce-gentle animation-delay-1000">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">PDF Processing</h3>
              <p className="text-slate-600 text-sm">
                Upload and process PDF documents with advanced text extraction and handwriting recognition.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-1000">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto animate-bounce-gentle animation-delay-1200">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI-Powered QnA</h3>
              <p className="text-slate-600 text-sm">
                Ask natural language questions and get intelligent answers from your document content.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-1200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto animate-bounce-gentle animation-delay-1400">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Instant Results</h3>
              <p className="text-slate-600 text-sm">
                Get fast, accurate responses with context-aware answers from your knowledge base.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-slate-200 mt-20 relative z-10">
        <div className="text-center text-slate-500 text-sm">
          <p>&copy; 2025 RAGify. Transform your documents into intelligent knowledge.</p>
        </div>
      </footer>
    </div>
  )
}
