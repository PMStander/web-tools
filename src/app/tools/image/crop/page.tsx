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
  Crop,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Square,
  Rectangle
} from "lucide-react"

export default function ImageCropPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [cropMode, setCropMode] = useState("aspect")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [customWidth, setCustomWidth] = useState("800")
  const [customHeight, setCustomHeight] = useState("600")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleCrop = async () => {
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
                  <Crop className="mr-2 h-3 w-3" />
                  Image Cropping Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Crop Images
                <span className="block text-blue-600">Precisely</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Crop images with custom dimensions, aspect ratios, and smart positioning. 
                Perfect for social media, thumbnails, and professional presentations.
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
                      acceptedTypes={['.jpg', '.jpeg', '.png', '.webp', '.gif']}
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
                        Crop Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Crop Mode</Label>
                        <RadioGroup value={cropMode} onValueChange={setCropMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="aspect" id="aspect" />
                            <Label htmlFor="aspect" className="font-medium">Aspect Ratio</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="font-medium">Custom Dimensions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="square" id="square" />
                            <Label htmlFor="square" className="font-medium">Square Crop</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {cropMode === "aspect" && (
                        <div className="space-y-2">
                          <Label>Aspect Ratio</Label>
                          <RadioGroup value={aspectRatio} onValueChange={setAspectRatio}>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="16:9" id="16:9" />
                                <Label htmlFor="16:9" className="text-sm">16:9 (Widescreen)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="4:3" id="4:3" />
                                <Label htmlFor="4:3" className="text-sm">4:3 (Standard)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="3:2" id="3:2" />
                                <Label htmlFor="3:2" className="text-sm">3:2 (Photo)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1:1" id="1:1" />
                                <Label htmlFor="1:1" className="text-sm">1:1 (Square)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="9:16" id="9:16" />
                                <Label htmlFor="9:16" className="text-sm">9:16 (Portrait)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="21:9" id="21:9" />
                                <Label htmlFor="21:9" className="text-sm">21:9 (Ultrawide)</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      {cropMode === "custom" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="width">Width (px)</Label>
                            <Input
                              id="width"
                              type="number"
                              value={customWidth}
                              onChange={(e) => setCustomWidth(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="height">Height (px)</Label>
                            <Input
                              id="height"
                              type="number"
                              value={customHeight}
                              onChange={(e) => setCustomHeight(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={handleCrop} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Cropping Image...</>
                        ) : (
                          <>
                            <Crop className="mr-2 h-5 w-5" />
                            Crop Image
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
                    <CardTitle>Crop Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Aspect Ratios</h4>
                      <p className="text-sm text-gray-600">
                        Pre-defined ratios for common use cases
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Custom Dimensions</h4>
                      <p className="text-sm text-gray-600">
                        Specify exact pixel dimensions
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Smart Positioning</h4>
                      <p className="text-sm text-gray-600">
                        Automatic center-focused cropping
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
                      <span>Multiple aspect ratios</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Custom dimensions</span>
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
                      <span className="text-sm">Choose crop settings</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download cropped image</span>
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
                Professional Image Cropping
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Crop images with precision for any use case or platform.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Crop className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Precise Cropping</h3>
                <p className="text-gray-600">
                  Crop images with pixel-perfect precision and smart positioning.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Rectangle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Multiple Ratios</h3>
                <p className="text-gray-600">
                  Support for all common aspect ratios and custom dimensions.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Square className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Center</h3>
                <p className="text-gray-600">
                  Automatic center-focused cropping for best results.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
