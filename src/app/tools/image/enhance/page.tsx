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
  Star
} from "lucide-react"

export default function ImageEnhancePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [enhanceMode, setEnhanceMode] = useState("auto")
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
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Sparkles className="mr-2 h-3 w-3" />
                  AI Image Enhancement
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Enhance Images with
                <span className="block text-blue-600">AI Magic</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Transform your images with AI-powered enhancement. Improve quality, 
                reduce noise, and upscale resolution automatically.
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
                        Enhancement Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Choose Enhancement Type</Label>
                        <RadioGroup value={enhanceMode} onValueChange={setEnhanceMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="auto" />
                            <Label htmlFor="auto" className="font-medium">Auto Enhance (Recommended)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="upscale" id="upscale" />
                            <Label htmlFor="upscale" className="font-medium">Upscale Resolution (2x-4x)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="denoise" id="denoise" />
                            <Label htmlFor="denoise" className="font-medium">Noise Reduction</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sharpen" id="sharpen" />
                            <Label htmlFor="sharpen" className="font-medium">Sharpen Details</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="colorize" id="colorize" />
                            <Label htmlFor="colorize" className="font-medium">Colorize B&W Photos</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="restore" id="restore" />
                            <Label htmlFor="restore" className="font-medium">Restore Old Photos</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          {enhanceMode === "auto" && "Auto Enhancement"}
                          {enhanceMode === "upscale" && "AI Upscaling"}
                          {enhanceMode === "denoise" && "Noise Reduction"}
                          {enhanceMode === "sharpen" && "Detail Sharpening"}
                          {enhanceMode === "colorize" && "AI Colorization"}
                          {enhanceMode === "restore" && "Photo Restoration"}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {enhanceMode === "auto" && "AI will analyze your image and apply the best enhancements automatically."}
                          {enhanceMode === "upscale" && "Increase image resolution up to 4x while maintaining quality."}
                          {enhanceMode === "denoise" && "Remove noise and grain from photos taken in low light."}
                          {enhanceMode === "sharpen" && "Enhance details and improve image clarity."}
                          {enhanceMode === "colorize" && "Add realistic colors to black and white photographs."}
                          {enhanceMode === "restore" && "Repair scratches, tears, and damage in old photos."}
                        </p>
                      </div>

                      <Button 
                        onClick={handleEnhance} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>AI Processing...</>
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
                    <CardTitle>AI Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Smart Enhancement</h4>
                      <p className="text-sm text-gray-600">
                        AI analyzes and improves image quality automatically
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Super Resolution</h4>
                      <p className="text-sm text-gray-600">
                        Upscale images up to 4x original resolution
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Photo Restoration</h4>
                      <p className="text-sm text-gray-600">
                        Repair and colorize vintage photographs
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
                      <span>Quality preservation</span>
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
                      <span className="text-sm">AI analyzes and enhances</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download enhanced image</span>
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
                AI-Powered Image Enhancement
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Transform your images with cutting-edge artificial intelligence.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">AI Magic</h3>
                <p className="text-gray-600">
                  Advanced AI algorithms enhance images automatically.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Super Resolution</h3>
                <p className="text-gray-600">
                  Upscale images up to 4x while maintaining quality.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Photo Restoration</h3>
                <p className="text-gray-600">
                  Restore and colorize vintage photographs with AI.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
