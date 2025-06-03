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
  Scissors,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Sparkles,
  Layers
} from "lucide-react"

export default function BackgroundRemovalPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [removalMode, setRemovalMode] = useState("auto")
  const [outputFormat, setOutputFormat] = useState("png")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleRemoveBackground = async () => {
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
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Scissors className="mr-2 h-3 w-3" />
                  AI Background Removal
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Remove Backgrounds
                <span className="block text-blue-600">Instantly</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Remove image backgrounds with AI precision in seconds. 
                Perfect for product photos, portraits, and professional presentations.
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
                        Removal Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Removal Mode</Label>
                        <RadioGroup value={removalMode} onValueChange={setRemovalMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="auto" />
                            <Label htmlFor="auto" className="font-medium">Auto AI Detection</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="person" id="person" />
                            <Label htmlFor="person" className="font-medium">Person/Portrait</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="product" id="product" />
                            <Label htmlFor="product" className="font-medium">Product/Object</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="precise" id="precise" />
                            <Label htmlFor="precise" className="font-medium">Precise Mode</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <RadioGroup value={outputFormat} onValueChange={setOutputFormat}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="png" id="png" />
                            <Label htmlFor="png" className="font-medium">PNG (Transparent)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="jpg-white" id="jpg-white" />
                            <Label htmlFor="jpg-white" className="font-medium">JPG (White Background)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="jpg-custom" id="jpg-custom" />
                            <Label htmlFor="jpg-custom" className="font-medium">JPG (Custom Background)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button 
                        onClick={handleRemoveBackground} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Processing with AI...</>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Remove Background
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
                    <CardTitle>AI Modes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Auto Detection</h4>
                      <p className="text-sm text-gray-600">
                        AI automatically detects the main subject
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Person Mode</h4>
                      <p className="text-sm text-gray-600">
                        Optimized for portraits and people
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Product Mode</h4>
                      <p className="text-sm text-gray-600">
                        Perfect for e-commerce and product photos
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
                      <span>AI-powered precision</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple output formats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Edge refinement</span>
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
                      <span className="text-sm">AI analyzes and removes background</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download transparent image</span>
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
                AI-Powered Background Removal
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional-quality background removal with artificial intelligence.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">AI Precision</h3>
                <p className="text-gray-600">
                  Advanced AI algorithms for pixel-perfect background removal.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Scissors className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Clean Edges</h3>
                <p className="text-gray-600">
                  Smooth, clean edges with automatic edge refinement.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Layers className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Multiple Formats</h3>
                <p className="text-gray-600">
                  Export as PNG with transparency or JPG with custom backgrounds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
