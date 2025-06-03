"use client"

import { useState, useEffect } from "react"
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
  Type, 
  Download,
  Upload,
  Settings,
  CheckCircle,
  Copy,
  FileCode
} from "lucide-react"

export default function PDFExtractTextPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractMode, setExtractMode] = useState("all")
  const [outputFormat, setOutputFormat] = useState("text")
  const [pageRange, setPageRange] = useState("")
  const [preserveFormatting, setPreserveFormatting] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Track when component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleExtract = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000))
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
                  <Type className="mr-2 h-3 w-3" />
                  PDF Text Extractor
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Extract Text from
                <span className="block text-red-600">PDF Documents</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Extract text content from PDF documents in multiple formats. 
                Perfect for data analysis, content migration, and text processing workflows.
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
                        Extraction Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Extract From</Label>
                        <RadioGroup value={extractMode} onValueChange={setExtractMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all" className="font-medium">All pages</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="range" id="range" />
                            <Label htmlFor="range" className="font-medium">Specific page range</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="first" id="first" />
                            <Label htmlFor="first" className="font-medium">First page only</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="last" id="last" />
                            <Label htmlFor="last" className="font-medium">Last page only</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {extractMode === "range" && (
                        <div className="space-y-2">
                          <Label htmlFor="pageRange">Page Range</Label>
                          <Input
                            id="pageRange"
                            placeholder="e.g., 1-5, 10, 15-20"
                            value={pageRange}
                            onChange={(e) => setPageRange(e.target.value)}
                          />
                          <p className="text-sm text-gray-600">
                            Enter page numbers or ranges separated by commas
                          </p>
                        </div>
                      )}

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
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="csv" id="csv" />
                            <Label htmlFor="csv" className="font-medium">CSV (for tables)</Label>
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
                          Preserve text formatting and structure
                        </Label>
                      </div>

                      <Button
                        onClick={handleExtract}
                        className="w-full"
                        size="lg"
                        disabled={!isMounted || isProcessing}
                      >
                        {isProcessing ? (
                          <>Extracting Text...</>
                        ) : (
                          <>
                            <Type className="mr-2 h-5 w-5" />
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
                    <CardTitle>Extraction Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Plain Text</h4>
                      <p className="text-sm text-gray-600">
                        Extract raw text content without formatting
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Structured JSON</h4>
                      <p className="text-sm text-gray-600">
                        Get text with metadata and structure information
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">CSV Format</h4>
                      <p className="text-sm text-gray-600">
                        Perfect for extracting table data from PDFs
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
                      <span>High accuracy extraction</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple output formats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Page range selection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Preserves structure</span>
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
                      <span className="text-sm">Choose extraction options</span>
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
                Advanced Text Extraction
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Extract text from PDFs with precision and multiple output options.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Type className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">Accurate Extraction</h3>
                <p className="text-gray-600">
                  Advanced algorithms ensure high-quality text extraction.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileCode className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Multiple Formats</h3>
                <p className="text-gray-600">
                  Export to text, Word, JSON, or CSV based on your needs.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Copy className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Structure Preserved</h3>
                <p className="text-gray-600">
                  Maintain original document structure and formatting.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
