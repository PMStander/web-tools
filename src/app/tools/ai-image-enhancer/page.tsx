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
  Image as ImageIcon,
  Sparkles,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Zap,
  Eye,
  Wand2
} from "lucide-react"

export default function AIImageEnhancerPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [enhancementType, setEnhancementType] = useState("auto")
  const [upscaleFactor, setUpscaleFactor] = useState("2x")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleEnhance = async () => {
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
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Sparkles className="mr-2 h-3 w-3" />
                  AI Image Enhancer
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Enhance Images with
                <span className="block text-purple-600">AI Technology</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Upscale, denoise, and enhance image quality using cutting-edge AI models. 
                Transform low-resolution images into high-quality masterpieces.
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
                        Enhancement Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Enhancement Type</Label>
                        <RadioGroup value={enhancementType} onValueChange={setEnhancementType}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="auto" />
                            <Label htmlFor="auto" className="font-medium">Auto Enhancement (Recommended)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="upscale" id="upscale" />
                            <Label htmlFor="upscale" className="font-medium">Upscale & Sharpen</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="denoise" id="denoise" />
                            <Label htmlFor="denoise" className="font-medium">Noise Reduction</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="restore" id="restore" />
                            <Label htmlFor="restore" className="font-medium">Photo Restoration</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="colorize" id="colorize" />
                            <Label htmlFor="colorize" className="font-medium">AI Colorization</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {(enhancementType === "auto" || enhancementType === "upscale") && (
                        <div className="space-y-2">
                          <Label>Upscale Factor</Label>
                          <RadioGroup value={upscaleFactor} onValueChange={setUpscaleFactor}>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="2x" id="2x" />
                                <Label htmlFor="2x" className="text-sm">2x (Double Size)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="4x" id="4x" />
                                <Label htmlFor="4x" className="text-sm">4x (Quadruple Size)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="8x" id="8x" />
                                <Label htmlFor="8x" className="text-sm">8x (Maximum Quality)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="auto-size" id="auto-size" />
                                <Label htmlFor="auto-size" className="text-sm">Auto Size</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">AI Enhancement Features</h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• Super-resolution upscaling with detail preservation</li>
                          <li>• Intelligent noise reduction and artifact removal</li>
                          <li>• Color enhancement and saturation optimization</li>
                          <li>• Sharpness improvement and edge enhancement</li>
                          <li>• Automatic quality assessment and optimization</li>
                        </ul>
                      </div>

                      <Button 
                        onClick={handleEnhance} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Wand2 className="mr-2 h-5 w-5 animate-pulse" />
                            Enhancing Image...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Enhance Image
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
                    <CardTitle>AI Enhancement Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Auto Enhancement</h4>
                      <p className="text-sm text-gray-600">
                        Comprehensive AI analysis and optimization
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Super Resolution</h4>
                      <p className="text-sm text-gray-600">
                        Upscale images up to 8x with detail preservation
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Noise Reduction</h4>
                      <p className="text-sm text-gray-600">
                        Remove noise while preserving important details
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Photo Restoration</h4>
                      <p className="text-sm text-gray-600">
                        Repair old or damaged photographs
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
                      <span>AI-powered enhancement</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple enhancement modes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Up to 8x upscaling</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Low-resolution photos</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Noisy images</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Old photographs</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Print preparation</span>
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
                Advanced AI Enhancement
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Transform your images with state-of-the-art AI technology.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Super Resolution</h3>
                <p className="text-gray-600">
                  Upscale images up to 8x while preserving fine details and textures.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Intelligent Analysis</h3>
                <p className="text-gray-600">
                  AI analyzes your image to apply the most effective enhancements.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Wand2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">One-Click Enhancement</h3>
                <p className="text-gray-600">
                  Automatic enhancement with professional-quality results.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
