"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Sparkles, 
  FileText, 
  Brain, 
  Search, 
  BarChart3, 
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Users,
  Clock,
  Target,
  Lightbulb
} from "lucide-react"

interface DocumentAnalysis {
  summary: {
    wordCount: number
    pageCount: number
    readingTime: number
    mainTopics: string[]
    keyPoints: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    confidenceScore: number
  }
  extraction: {
    emails: string[]
    phoneNumbers: string[]
    dates: string[]
    names: string[]
    urls: string[]
    currencies: string[]
    organizations: string[]
  }
  classification: {
    documentType: string
    category: string
    industry: string
    confidenceScore: number
    tags: string[]
  }
  quality: {
    overallScore: number
    readabilityScore: number
    structureScore: number
    contentScore: number
    issues: Array<{
      type: 'warning' | 'error' | 'suggestion'
      message: string
    }>
    suggestions: Array<{
      type: string
      message: string
      priority: 'low' | 'medium' | 'high'
    }>
  }
  insights: {
    complexity: string
    targetAudience: string
    purpose: string
    tone: string
    formality: string
    completeness: number
  }
}

export default function AIDocumentAnalyzerPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setAnalysis(null)
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Mock analysis results
      const mockAnalysis: DocumentAnalysis = {
        summary: {
          wordCount: 1247,
          pageCount: 3,
          readingTime: 6,
          mainTopics: ['Business Strategy', 'Market Analysis', 'Financial Projections'],
          keyPoints: [
            'Q4 revenue increased by 23% compared to previous quarter',
            'New market expansion planned for 2024',
            'Customer satisfaction scores improved to 4.8/5',
            'Investment in AI technology recommended'
          ],
          sentiment: 'positive',
          confidenceScore: 0.89
        },
        extraction: {
          emails: ['contact@company.com', 'ceo@company.com'],
          phoneNumbers: ['(555) 123-4567', '(555) 987-6543'],
          dates: ['2024-01-15', '2024-03-30', '2024-12-31'],
          names: ['John Smith', 'Sarah Johnson', 'Michael Chen'],
          urls: ['https://company.com', 'https://investors.company.com'],
          currencies: ['$2.5M', '$150K', '$1.2M'],
          organizations: ['TechCorp Inc.', 'Global Ventures', 'Innovation Labs']
        },
        classification: {
          documentType: 'Business Report',
          category: 'Financial',
          industry: 'Technology',
          confidenceScore: 0.92,
          tags: ['quarterly-report', 'financial-analysis', 'strategy', 'growth']
        },
        quality: {
          overallScore: 87,
          readabilityScore: 82,
          structureScore: 91,
          contentScore: 89,
          issues: [
            { type: 'suggestion', message: 'Consider adding an executive summary' },
            { type: 'warning', message: 'Some financial figures lack context' }
          ],
          suggestions: [
            { type: 'structure', message: 'Add table of contents for better navigation', priority: 'medium' },
            { type: 'content', message: 'Include more detailed market analysis', priority: 'high' },
            { type: 'formatting', message: 'Standardize chart formatting', priority: 'low' }
          ]
        },
        insights: {
          complexity: 'Moderate',
          targetAudience: 'Executives and Investors',
          purpose: 'Performance Reporting',
          tone: 'Professional',
          formality: 'Formal',
          completeness: 85
        }
      }

      setAnalysisProgress(100)
      setAnalysis(mockAnalysis)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
      clearInterval(progressInterval)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-blue-200 bg-blue-50'
    }
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
                assess quality, and receive optimization suggestions.
              </p>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            {!analysis && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Upload Your Document</h2>
                  <p className="text-gray-600">
                    Support for PDF, Word, and text documents up to 50MB
                  </p>
                </div>
                
                <FileUpload
                  onFileSelect={handleFileUpload}
                  acceptedTypes={['.pdf', '.docx', '.txt']}
                  maxSize={50 * 1024 * 1024}
                />
                
                {uploadedFile && (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>File uploaded: {uploadedFile.name}</span>
                    </div>
                    
                    {isAnalyzing ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600 animate-pulse" />
                          <p className="text-lg font-medium">Analyzing document...</p>
                          <p className="text-sm text-gray-600">This may take a few moments</p>
                        </div>
                        <Progress value={analysisProgress} className="w-full max-w-md mx-auto" />
                      </div>
                    ) : (
                      <Button onClick={handleAnalyze} size="lg" className="px-8">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Analyze Document
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Analysis Complete</h2>
                  <p className="text-gray-600">Here are the insights from your document</p>
                </div>

                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="extraction">Extraction</TabsTrigger>
                    <TabsTrigger value="classification">Classification</TabsTrigger>
                    <TabsTrigger value="quality">Quality</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Document Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Word Count:</span>
                              <p className="font-medium">{analysis.summary.wordCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Pages:</span>
                              <p className="font-medium">{analysis.summary.pageCount}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Reading Time:</span>
                              <p className="font-medium">{analysis.summary.readingTime} min</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Sentiment:</span>
                              <p className={`font-medium capitalize ${getSentimentColor(analysis.summary.sentiment)}`}>
                                {analysis.summary.sentiment}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Main Topics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysis.summary.mainTopics.map((topic, index) => (
                              <Badge key={index} variant="secondary">{topic}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Key Points
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.summary.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="extraction" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Email Addresses</h4>
                            <div className="space-y-1">
                              {analysis.extraction.emails.map((email, index) => (
                                <Badge key={index} variant="outline">{email}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Phone Numbers</h4>
                            <div className="space-y-1">
                              {analysis.extraction.phoneNumbers.map((phone, index) => (
                                <Badge key={index} variant="outline">{phone}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Key Data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Important Dates</h4>
                            <div className="space-y-1">
                              {analysis.extraction.dates.map((date, index) => (
                                <Badge key={index} variant="outline">{date}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Financial Figures</h4>
                            <div className="space-y-1">
                              {analysis.extraction.currencies.map((currency, index) => (
                                <Badge key={index} variant="outline">{currency}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="quality" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center">Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="text-4xl font-bold text-green-600 mb-2">
                            {analysis.quality.overallScore}
                          </div>
                          <p className="text-sm text-gray-600">out of 100</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center">Readability</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {analysis.quality.readabilityScore}
                          </div>
                          <Progress value={analysis.quality.readabilityScore} className="mt-2" />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center">Structure</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {analysis.quality.structureScore}
                          </div>
                          <Progress value={analysis.quality.structureScore} className="mt-2" />
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Improvement Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.quality.suggestions.map((suggestion, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.priority} priority
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.type}
                                </Badge>
                              </div>
                              <p className="text-sm">{suggestion.message}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Audience & Purpose
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="text-gray-600">Target Audience:</span>
                            <p className="font-medium">{analysis.insights.targetAudience}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Purpose:</span>
                            <p className="font-medium">{analysis.insights.purpose}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tone:</span>
                            <p className="font-medium">{analysis.insights.tone}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Document Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="text-gray-600">Complexity:</span>
                            <p className="font-medium">{analysis.insights.complexity}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Formality:</span>
                            <p className="font-medium capitalize">{analysis.insights.formality}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Completeness:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.insights.completeness} className="flex-1" />
                              <span className="font-medium">{analysis.insights.completeness}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAnalysis(null)
                      setUploadedFile(null)
                    }}
                  >
                    Analyze Another Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
