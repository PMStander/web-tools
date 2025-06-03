"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  FileText, 
  Search, 
  Download,
  Upload,
  Settings,
  CheckCircle,
  Eye,
  Type
} from "lucide-react"

export default function PDFOCRPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [ocrMode, setOcrMode] = useState("extract")
  const [language, setLanguage] = useState("en")
  const [outputFormat, setOutputFormat] = useState("text")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleOCR = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 5000))
    setIsProcessing(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Search className="mr-2 h-3 w-3" />
                  PDF OCR Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Extract Text from
                <span className="block text-red-600">Scanned PDFs</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Extract text from scanned PDFs and images with advanced OCR technology. 
                Convert non-searchable documents into editable and searchable text.
              </p>
            </div>
          </div>
        </section>

        {/* Main Tool Interface */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload and Settings */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload PDF File
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.pdf']}
                      maxSize={100 * 1024 * 1024}
                    />
                    {uploadedFile && (
                      <div className="mt-4 flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>File uploaded: {uploadedFile.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {uploadedFile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        OCR Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>OCR Mode</Label>
                        <RadioGroup value={ocrMode} onValueChange={setOcrMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="extract" id="extract" />
                            <Label htmlFor="extract" className="font-medium">Extract text only</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="searchable" id="searchable" />
                            <Label htmlFor="searchable" className="font-medium">Create searchable PDF</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both" className="font-medium">Both text and searchable PDF</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Document Language</Label>
                        <select 
                          id="language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                          <option value="pt">Portuguese</option>
                          <option value="ru">Russian</option>
                          <option value="zh">Chinese</option>
                          <option value="ja">Japanese</option>
                          <option value="ko">Korean</option>
                        </select>
                        <p className="text-sm text-gray-600">
                          Select the primary language of your document for better accuracy
                        </p>
                      </div>

                      {ocrMode === "extract" && (
                        <div className="space-y-2">
                          <Label>Output Format</Label>
                          <RadioGroup value={outputFormat} onValueChange={setOutputFormat}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="text" id="text" />
                              <Label htmlFor="text" className="font-medium">Plain Text (.txt)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="word" id="word" />
                              <Label htmlFor="word" className="font-medium">Word Document (.docx)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="json" id="json" />
                              <Label htmlFor="json" className="font-medium">Structured JSON</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      <Button 
                        onClick={handleOCR} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Processing OCR...</>
                        ) : (
                          <>
                            <Search className="mr-2 h-5 w-5" />
                            Extract Text
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Info Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>OCR Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Text Extraction</h4>
                      <p className="text-sm text-gray-600">
                        Extract text from scanned documents and images
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Searchable PDF</h4>
                      <p className="text-sm text-gray-600">
                        Create PDFs with searchable text layer
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Multi-language</h4>
                      <p className="text-sm text-gray-600">
                        Support for 50+ languages and scripts
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>High accuracy OCR</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>50+ languages supported</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple output formats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Preserves formatting</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        1
                      </div>
                      <span className="text-sm">Upload scanned PDF</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm">Select language and options</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download extracted text</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Advanced OCR Technology
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                State-of-the-art optical character recognition for accurate text extraction.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">High Accuracy</h3>
                <p className="text-gray-600">
                  Advanced AI algorithms ensure 99%+ accuracy in text recognition.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Type className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Format Preservation</h3>
                <p className="text-gray-600">
                  Maintain original document structure and formatting in output.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Searchable Output</h3>
                <p className="text-gray-600">
                  Create searchable PDFs that preserve original appearance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
