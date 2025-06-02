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
  Scissors, 
  Download,
  Upload,
  Settings,
  CheckCircle,
  ArrowRight
} from "lucide-react"

export default function PDFSplitPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [splitType, setSplitType] = useState("pages")
  const [pageNumbers, setPageNumbers] = useState("")
  const [pagesPerFile, setPagesPerFile] = useState("1")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleSplit = async () => {
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
                  <Scissors className="mr-2 h-3 w-3" />
                  PDF Splitting Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Split PDF
                <span className="block text-red-600">Files</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Split large PDF files into smaller documents by pages, ranges, or file size. 
                Perfect for extracting specific sections or creating manageable file sizes.
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
                        Split Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup value={splitType} onValueChange={setSplitType}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pages" id="pages" />
                          <Label htmlFor="pages" className="font-medium">Split by specific pages</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="range" id="range" />
                          <Label htmlFor="range" className="font-medium">Split by page ranges</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="size" id="size" />
                          <Label htmlFor="size" className="font-medium">Split by pages per file</Label>
                        </div>
                      </RadioGroup>

                      {splitType === "pages" && (
                        <div className="space-y-2">
                          <Label htmlFor="pageNumbers">Page Numbers (comma-separated)</Label>
                          <Input
                            id="pageNumbers"
                            placeholder="e.g., 1, 3, 5, 7"
                            value={pageNumbers}
                            onChange={(e) => setPageNumbers(e.target.value)}
                          />
                          <p className="text-sm text-gray-600">
                            Enter the page numbers you want to extract as separate files
                          </p>
                        </div>
                      )}

                      {splitType === "range" && (
                        <div className="space-y-2">
                          <Label htmlFor="pageRanges">Page Ranges (comma-separated)</Label>
                          <Input
                            id="pageRanges"
                            placeholder="e.g., 1-5, 6-10, 11-15"
                            value={pageNumbers}
                            onChange={(e) => setPageNumbers(e.target.value)}
                          />
                          <p className="text-sm text-gray-600">
                            Enter page ranges using format: start-end
                          </p>
                        </div>
                      )}

                      {splitType === "size" && (
                        <div className="space-y-2">
                          <Label htmlFor="pagesPerFile">Pages per file</Label>
                          <Input
                            id="pagesPerFile"
                            type="number"
                            min="1"
                            placeholder="1"
                            value={pagesPerFile}
                            onChange={(e) => setPagesPerFile(e.target.value)}
                          />
                          <p className="text-sm text-gray-600">
                            Number of pages to include in each split file
                          </p>
                        </div>
                      )}

                      <Button 
                        onClick={handleSplit} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Scissors className="mr-2 h-5 w-5" />
                            Split PDF
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
                    <CardTitle>Split Methods</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">By Specific Pages</h4>
                      <p className="text-sm text-gray-600">
                        Extract individual pages as separate PDF files
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">By Page Ranges</h4>
                      <p className="text-sm text-gray-600">
                        Split into multiple files with specified page ranges
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">By File Size</h4>
                      <p className="text-sm text-gray-600">
                        Create files with a fixed number of pages each
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
                      <span>Preserve original quality</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Batch processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Secure processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>No file size limits</span>
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
                      <span className="text-sm">Choose split method</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download split files</span>
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
                Why Use Our PDF Splitter?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional-grade PDF splitting with advanced options and security.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Scissors className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">Precise Splitting</h3>
                <p className="text-gray-600">
                  Split PDFs exactly where you need with page-level precision.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Quality Preserved</h3>
                <p className="text-gray-600">
                  Maintain original document quality and formatting in split files.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Download className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Instant Download</h3>
                <p className="text-gray-600">
                  Get your split PDF files immediately after processing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
