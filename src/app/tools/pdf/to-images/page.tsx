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
  FileImage, 
  Download,
  Upload,
  Settings,
  CheckCircle,
  ArrowRight
} from "lucide-react"

export default function PDFToImagesPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState("jpg")
  const [quality, setQuality] = useState("high")
  const [dpi, setDpi] = useState("300")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Track when component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleConvert = async () => {
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
                  <FileImage className="mr-2 h-3 w-3" />
                  PDF to Images Converter
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Convert PDF to
                <span className="block text-red-600">Images</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Convert PDF pages to high-quality JPG, PNG, or other image formats. 
                Perfect for extracting images, creating thumbnails, or sharing specific pages.
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
                            <RadioGroupItem value="jpg" id="jpg" />
                            <Label htmlFor="jpg" className="font-medium">JPG (Smaller file size)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="png" id="png" />
                            <Label htmlFor="png" className="font-medium">PNG (Transparency support)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="webp" id="webp" />
                            <Label htmlFor="webp" className="font-medium">WebP (Modern format)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Image Quality</Label>
                        <RadioGroup value={quality} onValueChange={setQuality}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high" className="font-medium">High Quality (Best for printing)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="font-medium">Medium Quality (Balanced)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="low" id="low" />
                            <Label htmlFor="low" className="font-medium">Low Quality (Smaller files)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dpi">DPI (Dots Per Inch)</Label>
                        <Input
                          id="dpi"
                          type="number"
                          min="72"
                          max="600"
                          placeholder="300"
                          value={dpi}
                          onChange={(e) => setDpi(e.target.value)}
                        />
                        <p className="text-sm text-gray-600">
                          Higher DPI = better quality but larger file size
                        </p>
                      </div>

                      <Button
                        onClick={handleConvert}
                        className="w-full"
                        size="lg"
                        disabled={!isMounted || isProcessing}
                      >
                        {isProcessing ? (
                          <>Converting...</>
                        ) : (
                          <>
                            <FileImage className="mr-2 h-5 w-5" />
                            Convert to Images
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
                    <CardTitle>Output Formats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">JPG</h4>
                      <p className="text-sm text-gray-600">
                        Best for photos and complex images with many colors
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">PNG</h4>
                      <p className="text-sm text-gray-600">
                        Perfect for images with transparency or text
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">WebP</h4>
                      <p className="text-sm text-gray-600">
                        Modern format with excellent compression
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
                      <span>High-quality conversion</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple output formats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Customizable DPI</span>
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
                      <span className="text-sm">Choose format and quality</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download image files</span>
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
                Why Convert PDF to Images?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional-grade PDF to image conversion with quality preservation.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <FileImage className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">High Quality</h3>
                <p className="text-gray-600">
                  Convert PDFs to images with exceptional quality and clarity.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Multiple Formats</h3>
                <p className="text-gray-600">
                  Support for JPG, PNG, WebP and other popular image formats.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Download className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Easy Download</h3>
                <p className="text-gray-600">
                  Get your converted images instantly in a convenient ZIP file.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
