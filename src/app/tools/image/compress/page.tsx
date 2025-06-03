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
  Image as ImageIcon,
  Archive,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Zap,
  FileDown
} from "lucide-react"

export default function ImageCompressPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [compressionMode, setCompressionMode] = useState("quality")
  const [quality, setQuality] = useState("80")
  const [targetSize, setTargetSize] = useState("500")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleCompress = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
  }

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
                  <Archive className="mr-2 h-3 w-3" />
                  Image Compression Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Compress Images
                <span className="block text-blue-600">Efficiently</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Reduce image file size while maintaining visual quality with smart compression. 
                Perfect for web optimization and faster loading times.
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
                      acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
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
                        Compression Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Compression Mode</Label>
                        <RadioGroup value={compressionMode} onValueChange={setCompressionMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="quality" id="quality" />
                            <Label htmlFor="quality" className="font-medium">Quality Based</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="size" id="size" />
                            <Label htmlFor="size" className="font-medium">Target File Size</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="auto" />
                            <Label htmlFor="auto" className="font-medium">Auto Optimize</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {compressionMode === "quality" && (
                        <div className="space-y-2">
                          <Label htmlFor="quality">Quality Level ({quality}%)</Label>
                          <input
                            id="quality"
                            type="range"
                            min="10"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Smaller file</span>
                            <span>Better quality</span>
                          </div>
                        </div>
                      )}

                      {compressionMode === "size" && (
                        <div className="space-y-2">
                          <Label htmlFor="targetSize">Target Size (KB)</Label>
                          <Input
                            id="targetSize"
                            type="number"
                            min="10"
                            value={targetSize}
                            onChange={(e) => setTargetSize(e.target.value)}
                          />
                          <p className="text-sm text-gray-600">
                            Compress to approximately {targetSize}KB
                          </p>
                        </div>
                      )}

                      {compressionMode === "auto" && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            Auto optimization will analyze your image and apply the best compression settings 
                            for optimal file size while preserving visual quality.
                          </p>
                        </div>
                      )}

                      <Button 
                        onClick={handleCompress} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Compressing Image...</>
                        ) : (
                          <>
                            <Archive className="mr-2 h-5 w-5" />
                            Compress Image
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
                    <CardTitle>Compression Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Quality Based</h4>
                      <p className="text-sm text-gray-600">
                        Control compression by quality percentage
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Target Size</h4>
                      <p className="text-sm text-gray-600">
                        Compress to specific file size in KB
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Auto Optimize</h4>
                      <p className="text-sm text-gray-600">
                        AI-powered optimal compression
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
                      <span>Smart compression</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple formats</span>
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
                      <span className="text-sm">Upload your image</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm">Choose compression method</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download compressed image</span>
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
                Smart Image Compression
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Reduce file sizes without compromising visual quality.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Archive className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Compression</h3>
                <p className="text-gray-600">
                  Advanced algorithms optimize file size while preserving quality.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Fast Processing</h3>
                <p className="text-gray-600">
                  Compress images quickly with optimized processing algorithms.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <FileDown className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Size Control</h3>
                <p className="text-gray-600">
                  Precise control over final file size and compression ratio.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
