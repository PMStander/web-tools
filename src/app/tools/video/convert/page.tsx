"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Video,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  Settings,
  FileVideo,
  Zap
} from "lucide-react"

export default function VideoConvertPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState("mp4")
  const [quality, setQuality] = useState("high")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleConvert = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 5000))
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
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Video Converter
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Convert Videos to
                <span className="block text-purple-600">Any Format</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Convert videos between all major formats with professional quality. 
                Support for MP4, AVI, MOV, WebM, MKV, and more with hardware acceleration.
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
                      acceptedTypes={['.mp4', '.avi', '.mov', '.webm', '.mkv', '.wmv', '.flv']}
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
                        Conversion Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <RadioGroup value={outputFormat} onValueChange={setOutputFormat}>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mp4" id="mp4" />
                              <Label htmlFor="mp4" className="font-medium">MP4 (Universal)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="avi" id="avi" />
                              <Label htmlFor="avi" className="font-medium">AVI (High Quality)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mov" id="mov" />
                              <Label htmlFor="mov" className="font-medium">MOV (QuickTime)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="webm" id="webm" />
                              <Label htmlFor="webm" className="font-medium">WebM (Web)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mkv" id="mkv" />
                              <Label htmlFor="mkv" className="font-medium">MKV (Open)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wmv" id="wmv" />
                              <Label htmlFor="wmv" className="font-medium">WMV (Windows)</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Quality Settings</Label>
                        <RadioGroup value={quality} onValueChange={setQuality}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high" className="font-medium">High Quality (Best for archiving)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="font-medium">Medium Quality (Balanced)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="web" id="web" />
                            <Label htmlFor="web" className="font-medium">Web Optimized (Smaller size)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button 
                        onClick={handleConvert} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Converting Video...</>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Convert Video
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
                      <h4 className="font-medium">Input Formats</h4>
                      <p className="text-sm text-gray-600">
                        MP4, AVI, MOV, WebM, MKV, WMV, FLV, 3GP, and more
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Output Formats</h4>
                      <p className="text-sm text-gray-600">
                        All major video formats with optimized settings
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
                      <span>Hardware acceleration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Fast processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Batch conversion</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">
                        1
                      </div>
                      <span className="text-sm">Upload your video</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm">Choose output format</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download converted video</span>
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
                Professional Video Conversion
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Convert videos with industry-standard quality and speed.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Universal Compatibility</h3>
                <p className="text-gray-600">
                  Convert between all major video formats with perfect compatibility.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-gray-600">
                  Hardware-accelerated processing for maximum conversion speed.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FileVideo className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Quality Preserved</h3>
                <p className="text-gray-600">
                  Advanced algorithms maintain video quality during conversion.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
