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
  Video,
  Archive,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Zap,
  FileDown
} from "lucide-react"

export default function VideoCompressPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [compressionMode, setCompressionMode] = useState("balanced")
  const [targetSize, setTargetSize] = useState("50")
  const [quality, setQuality] = useState("80")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleCompress = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 4000))
    setIsProcessing(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-purple-50 to-violet-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Archive className="mr-2 h-3 w-3" />
                  Video Compressor
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Compress Videos
                <span className="block text-purple-600">Efficiently</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Reduce video file size while maintaining quality with smart compression. 
                Perfect for web upload, storage optimization, and faster sharing.
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
                      Upload Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.mp4', '.avi', '.mov', '.webm', '.mkv']}
                      maxSize={2 * 1024 * 1024 * 1024}
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
                            <RadioGroupItem value="size" id="size" />
                            <Label htmlFor="size" className="font-medium">Target File Size</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="quality" id="quality" />
                            <Label htmlFor="quality" className="font-medium">Quality Based</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="balanced" id="balanced" />
                            <Label htmlFor="balanced" className="font-medium">Balanced (Recommended)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="web" id="web" />
                            <Label htmlFor="web" className="font-medium">Web Optimized</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {compressionMode === "size" && (
                        <div className="space-y-2">
                          <Label htmlFor="targetSize">Target Size (% of original)</Label>
                          <input
                            id="targetSize"
                            type="range"
                            min="10"
                            max="90"
                            value={targetSize}
                            onChange={(e) => setTargetSize(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>10% (Maximum compression)</span>
                            <span>90% (Minimal compression)</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Target: {targetSize}% of original size
                          </p>
                        </div>
                      )}

                      {compressionMode === "quality" && (
                        <div className="space-y-2">
                          <Label htmlFor="quality">Quality Level ({quality}%)</Label>
                          <input
                            id="quality"
                            type="range"
                            min="20"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Lower quality</span>
                            <span>Higher quality</span>
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={handleCompress} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Compressing Video...</>
                        ) : (
                          <>
                            <Archive className="mr-2 h-5 w-5" />
                            Compress Video
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
                      <h4 className="font-medium">Target Size</h4>
                      <p className="text-sm text-gray-600">
                        Compress to specific percentage of original size
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Quality Based</h4>
                      <p className="text-sm text-gray-600">
                        Control compression by quality percentage
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Web Optimized</h4>
                      <p className="text-sm text-gray-600">
                        Perfect settings for web streaming
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
                      <span>Fast processing</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Web uploads</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Email attachments</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Storage optimization</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Social media sharing</span>
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
                Smart Video Compression
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Reduce file sizes without compromising visual quality.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Archive className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Compression</h3>
                <p className="text-gray-600">
                  Advanced algorithms optimize file size while preserving quality.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Fast Processing</h3>
                <p className="text-gray-600">
                  Hardware acceleration ensures quick compression times.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FileDown className="h-8 w-8 text-green-600" />
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
