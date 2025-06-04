"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { AnalysisUploader } from "@/components/tools/ai/AnalysisUploader"
import { AnalysisResults } from "@/components/tools/ai/AnalysisResults"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, FileText, Brain, BarChart3, Zap, Shield, Users } from "lucide-react"

interface AnalysisData {
  id: string
  fileName: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  result?: Record<string, unknown>
  error?: string
}

export default function AIDocumentAnalyzerPage() {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([])
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null)

  const handleAnalysisStart = (analysisId: string, fileName: string) => {
    const newAnalysis: AnalysisData = {
      id: analysisId,
      fileName,
      status: 'processing',
      progress: 0
    }
    setAnalyses(prev => [...prev, newAnalysis])
    setSelectedAnalysisId(analysisId)
  }

  const handleAnalysisComplete = (analysisId: string) => {
    setAnalyses(prev => 
      prev.map(analysis => 
        analysis.id === analysisId 
          ? { ...analysis, status: 'completed' as const, progress: 100 }
          : analysis
      )
    )
  }

  const selectedAnalysis = selectedAnalysisId 
    ? analyses.find(a => a.id === selectedAnalysisId)
    : null

  const handleNewAnalysis = () => {
    setSelectedAnalysisId(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Sparkles className="mr-2 h-3 w-3" />
                  AI-Powered Analysis
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Smart Document
                <span className="block text-purple-600">Analyzer</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Unlock insights from your documents with AI. Get summaries, extract key information, 
                assess quality, and receive optimization suggestions powered by OpenAI GPT-4.
              </p>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful AI Analysis</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our advanced AI engine processes your documents to provide comprehensive insights and actionable recommendations.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Smart Summarization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Get concise summaries, key topics, and main points extracted automatically from your documents.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Entity Extraction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Automatically identify and extract names, dates, organizations, financial figures, and contact information.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Quality Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Receive detailed quality scores, sentiment analysis, and specific recommendations for improvement.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            {!selectedAnalysis ? (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Upload Your Documents</h2>
                  <p className="text-gray-600 mb-8">
                    Support for PDF, Word, and text documents. Process single files or batches up to 50MB each.
                  </p>
                </div>
                
                <AnalysisUploader
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisComplete={handleAnalysisComplete}
                />

                {analyses.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-xl font-semibold mb-6">Recent Analyses</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {analyses.map((analysis) => (
                        <Card 
                          key={analysis.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedAnalysisId(analysis.id)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base truncate">{analysis.fileName}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={
                                  analysis.status === 'completed' ? 'default' :
                                  analysis.status === 'error' ? 'destructive' :
                                  'secondary'
                                }
                              >
                                {analysis.status}
                              </Badge>
                              {analysis.status === 'processing' && (
                                <span className="text-sm text-gray-500">
                                  {analysis.progress}%
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">Analysis Results</h2>
                    <p className="text-gray-600">
                      Results for: {selectedAnalysis.fileName}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleNewAnalysis}
                  >
                    Analyze New Document
                  </Button>
                </div>

                {selectedAnalysisId && (
                  <AnalysisResults 
                    analysisId={selectedAnalysisId}
                    analysisData={null} // Component will fetch data internally
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Technology Section */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Zap className="mr-2 h-3 w-3" />
                  Powered by OpenAI
                </Badge>
              </div>
              <h2 className="text-3xl font-bold">Enterprise-Grade AI</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Built on OpenAI&apos;s GPT-4 technology, our document analyzer provides 
                accurate insights while maintaining the highest standards of data security and privacy.
              </p>
              <div className="flex justify-center items-center gap-8 pt-8">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  Secure Processing
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  Multi-format Support
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BarChart3 className="h-4 w-4" />
                  Detailed Analytics
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
