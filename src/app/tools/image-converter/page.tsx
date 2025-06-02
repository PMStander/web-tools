"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Image as ImageIcon,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Zap,
  Shield,
  Star
} from "lucide-react"

const IMAGE_FORMATS = [
  {
    value: "jpeg",
    label: "JPEG",
    description: "Best for photos",
    extension: ".jpg"
  },
  {
    value: "png",
    label: "PNG",
    description: "Best for graphics with transparency",
    extension: ".png"
  },
  {
    value: "webp",
    label: "WebP",
    description: "Modern web format, smaller files",
    extension: ".webp"
  },
  {
    value: "gif",
    label: "GIF",
    description: "Best for simple animations",
    extension: ".gif"
  },
  {
    value: "bmp",
    label: "BMP",
    description: "Uncompressed bitmap",
    extension: ".bmp"
  },
  {
    value: "tiff",
    label: "TIFF",
    description: "High quality, large files",
    extension: ".tiff"
  }
]

export default function ImageConverterPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState<string>("jpeg")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [convertedImage, setConvertedImage] = useState<string | null>(null)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setConvertedImage(null)
  }

  const handleConvert = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 20
      })
    }, 200)

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    setProcessingProgress(100)
    setConvertedImage(`converted.${targetFormat}`)
    setIsProcessing(false)
    clearInterval(progressInterval)
  }

  const selectedFormat = IMAGE_FORMATS.find(f => f.value === targetFormat)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Image Conversion Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Convert Images
                <span className="block text-blue-600">Instantly</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Convert images between different formats with AI optimization.
                Support for JPEG, PNG, WebP, GIF, and more with quality preservation.
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
                      Upload Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']}
                      maxSize={50 * 1024 * 1024}
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
                        Conversion Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="format">Output Format</Label>
                        <Select value={targetFormat} onValueChange={setTargetFormat}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            {IMAGE_FORMATS.map((format) => (
                              <SelectItem key={format.value} value={format.value}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{format.label}</span>
                                  <span className="text-xs text-gray-500">{format.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedFormat && (
                          <p className="text-sm text-gray-600">
                            {selectedFormat.description} • Output: {selectedFormat.extension}
                          </p>
                        )}
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
                            Convert to {selectedFormat?.label}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Processing Status */}
                {isProcessing && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <RefreshCw className="h-8 w-8 mx-auto text-blue-600 animate-spin" />
                        <div>
                          <h3 className="font-semibold">Converting Image...</h3>
                          <p className="text-sm text-gray-600">Processing your image with AI optimization</p>
                        </div>
                        <Progress value={processingProgress} className="w-full" />
                        <p className="text-sm text-gray-500">{processingProgress}% complete</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Success Result */}
                {convertedImage && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        Conversion Complete!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-green-600">
                        Successfully converted your image to {selectedFormat?.label} format.
                      </p>
                      <Button className="w-full" size="lg">
                        <Download className="mr-2 h-5 w-5" />
                        Download Converted Image
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setConvertedImage(null)
                          setUploadedFile(null)
                          setProcessingProgress(0)
                        }}
                      >
                        Convert Another Image
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
                  <CardContent className="space-y-3">
                    {IMAGE_FORMATS.slice(0, 4).map((format) => (
                      <div key={format.value} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{format.label}</span>
                        <span className="text-gray-500">{format.extension}</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-600 pt-2">
                      And many more formats supported
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>AI-powered optimization</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Batch processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Secure processing</span>
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
                      <span className="text-sm">Upload your image</span>
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
                      <span className="text-sm">Download converted image</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Formats Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Supported Image Formats
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Convert between all major image formats with professional quality.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {IMAGE_FORMATS.map((format) => (
                <div key={format.value} className="text-center p-4 bg-white rounded-lg border">
                  <h3 className="font-bold text-lg mb-1">{format.label}</h3>
                  <p className="text-sm text-gray-600 mb-2">{format.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {format.extension}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Why Choose Our Image Converter?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional-grade image conversion with AI optimization and quality preservation.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Conversion</h3>
                <p className="text-gray-600">
                  AI-powered conversion that optimizes quality and file size automatically.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-gray-600">
                  Convert images in seconds with our optimized processing algorithms.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-gray-600">
                  Your images are processed securely and deleted automatically after conversion.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
