"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  FolderOpen, 
  Brain, 
  FileText, 
  Image, 
  Video,
  Archive,
  Calendar,
  Tag,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Download,
  Settings
} from "lucide-react"

const organizationSuggestions = [
  {
    folder: "Documents/Work/Reports",
    files: ["Q4_Report.pdf", "Sales_Analysis.xlsx", "Meeting_Notes.docx"],
    reason: "Business documents detected",
    confidence: 95
  },
  {
    folder: "Media/Photos/2024",
    files: ["IMG_001.jpg", "IMG_002.jpg", "vacation_pic.png"],
    reason: "Images from 2024 detected",
    confidence: 88
  },
  {
    folder: "Projects/WebDev",
    files: ["index.html", "styles.css", "script.js"],
    reason: "Web development files detected",
    confidence: 92
  },
  {
    folder: "Archives/Old_Files",
    files: ["backup_2023.zip", "old_project.tar"],
    reason: "Archive files detected",
    confidence: 85
  }
]

const organizationRules = [
  { name: "By File Type", description: "Group files by their format (PDF, Images, Videos, etc.)", active: true },
  { name: "By Date Created", description: "Organize files by creation date into year/month folders", active: false },
  { name: "By Project", description: "Use AI to detect project-related files and group them", active: true },
  { name: "By Size", description: "Separate large files from small ones for better management", active: false }
]

export default function FileOrganizerPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
    setShowSuggestions(false)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 15
      })
    }, 500)

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setAnalysisProgress(100)
    setShowSuggestions(true)
    setIsAnalyzing(false)
    clearInterval(progressInterval)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Brain className="mr-2 h-3 w-3" />
                  AI-Powered Organization
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Smart File
                <span className="block text-green-600">Organizer</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Let AI analyze your files and automatically organize them into logical folder structures. 
                Save hours of manual sorting with intelligent file management.
              </p>
            </div>
          </div>
        </section>

        {/* Main Interface */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            {!showSuggestions && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Upload Your Files</h2>
                  <p className="text-gray-600">
                    Upload multiple files and let our AI organize them intelligently
                  </p>
                </div>
                
                <FileUpload
                  onFileSelect={(file) => handleFileUpload([...uploadedFiles, file])}
                  acceptedTypes={['*']}
                  maxSize={100 * 1024 * 1024}
                  multiple={true}
                />
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                        <CheckCircle className="h-5 w-5" />
                        <span>{uploadedFiles.length} files uploaded</span>
                      </div>
                      
                      {isAnalyzing ? (
                        <div className="space-y-4">
                          <div className="text-center">
                            <Brain className="h-8 w-8 mx-auto mb-2 text-green-600 animate-pulse" />
                            <p className="text-lg font-medium">Analyzing files...</p>
                            <p className="text-sm text-gray-600">AI is examining file types, content, and patterns</p>
                          </div>
                          <Progress value={analysisProgress} className="w-full max-w-md mx-auto" />
                        </div>
                      ) : (
                        <Button onClick={handleAnalyze} size="lg" className="px-8">
                          <Brain className="mr-2 h-5 w-5" />
                          Analyze & Organize
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Organization Suggestions */}
            {showSuggestions && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Organization Suggestions</h2>
                  <p className="text-gray-600">AI has analyzed your files and suggests this folder structure</p>
                </div>

                <div className="space-y-4">
                  {organizationSuggestions.map((suggestion, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FolderOpen className="h-5 w-5 text-green-600" />
                              <h3 className="font-semibold text-lg">{suggestion.folder}</h3>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{suggestion.reason}</p>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.files.map((file, fileIndex) => (
                                <Badge key={fileIndex} variant="secondary" className="text-xs">
                                  {file}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center gap-4">
                  <Button size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    Apply Organization
                  </Button>
                  <Button variant="outline" size="lg">
                    <Settings className="mr-2 h-5 w-5" />
                    Customize Rules
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Organization Rules */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Organization Rules
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Customize how the AI organizes your files with intelligent rules and patterns.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              {organizationRules.map((rule, index) => (
                <Card key={index} className={rule.active ? 'ring-2 ring-green-500' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{rule.name}</h3>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                      </div>
                      <Badge variant={rule.active ? "default" : "secondary"} className="ml-4">
                        {rule.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Smart Organization Features
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Advanced AI capabilities that understand your files and create logical structures.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">AI Analysis</h3>
                <p className="text-gray-600">
                  Advanced AI examines file content, metadata, and patterns to suggest optimal organization.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Tag className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Tagging</h3>
                <p className="text-gray-600">
                  Automatically tag files with relevant keywords and categories for easy searching.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Date Intelligence</h3>
                <p className="text-gray-600">
                  Organize files by creation date, modification time, or content-based temporal data.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Archive className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold">Bulk Processing</h3>
                <p className="text-gray-600">
                  Handle thousands of files at once with efficient batch processing and organization.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
