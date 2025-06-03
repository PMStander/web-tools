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
  RefreshCw, 
  Download,
  Upload,
  Settings,
  CheckCircle,
  FileSpreadsheet,
  FileImage
} from "lucide-react"

export default function PDFConvertPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState("word")
  const [quality, setQuality] = useState("high")
  const [preserveFormatting, setPreserveFormatting] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleConvert = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 4000))
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
                  <RefreshCw className="mr-2 h-3 w-3" />
                  PDF Converter
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Convert PDF to
                <span className="block text-red-600">Any Format</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Convert PDFs to Word, Excel, PowerPoint, images, and more formats. 
                Maintain formatting and quality with our advanced conversion technology.
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
                        Conversion Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <RadioGroup value={outputFormat} onValueChange={setOutputFormat}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="word" id="word" />
                            <Label htmlFor="word" className="font-medium">Microsoft Word (.docx)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="excel" id="excel" />
                            <Label htmlFor="excel" className="font-medium">Microsoft Excel (.xlsx)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="powerpoint" id="powerpoint" />
                            <Label htmlFor="powerpoint" className="font-medium">PowerPoint (.pptx)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="text" id="text" />
                            <Label htmlFor="text" className="font-medium">Plain Text (.txt)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="html" id="html" />
                            <Label htmlFor="html" className="font-medium">HTML (.html)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="epub" id="epub" />
                            <Label htmlFor="epub" className="font-medium">EPUB (.epub)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Conversion Quality</Label>
                        <RadioGroup value={quality} onValueChange={setQuality}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high" className="font-medium">High Quality (Best formatting)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="font-medium">Medium Quality (Balanced)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fast" id="fast" />
                            <Label htmlFor="fast" className="font-medium">Fast (Quick conversion)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="preserveFormatting"
                          checked={preserveFormatting}
                          onChange={(e) => setPreserveFormatting(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="preserveFormatting" className="font-medium">
                          Preserve original formatting
                        </Label>
                      </div>

                      <Button 
                        onClick={handleConvert} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Converting...</>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Convert PDF
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
                    <CardTitle>Supported Formats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Office Documents</h4>
                      <p className="text-sm text-gray-600">
                        Word, Excel, PowerPoint with full formatting
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Text Formats</h4>
                      <p className="text-sm text-gray-600">
                        Plain text, HTML, EPUB for various uses
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Images</h4>
                      <p className="text-sm text-gray-600">
                        JPG, PNG, WebP for visual content
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
                      <span>Preserves formatting</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple output formats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>High-quality conversion</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Batch processing</span>
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
                      <span className="text-sm">Upload your PDF file</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm">Choose output format</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download converted file</span>
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
                Professional PDF Conversion
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Convert PDFs to any format while preserving quality and formatting.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Conversion</h3>
                <p className="text-gray-600">
                  Advanced algorithms ensure accurate format conversion.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Format Variety</h3>
                <p className="text-gray-600">
                  Support for all major document and image formats.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Quality Preserved</h3>
                <p className="text-gray-600">
                  Maintain original document quality and structure.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
