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
  Maximize2,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Link,
  Unlink
} from "lucide-react"

export default function ImageResizePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [resizeMode, setResizeMode] = useState("percentage")
  const [percentage, setPercentage] = useState("50")
  const [width, setWidth] = useState("800")
  const [height, setHeight] = useState("600")
  const [maintainAspect, setMaintainAspect] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleResize = async () => {
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
                  <Maximize2 className="mr-2 h-3 w-3" />
                  Image Resizing Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Resize Images
                <span className="block text-blue-600">Perfectly</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Resize images with precision control over dimensions and aspect ratio. 
                Perfect for web optimization, social media, and print preparation.
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
                        Resize Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Resize Mode</Label>
                        <RadioGroup value={resizeMode} onValueChange={setResizeMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" />
                            <Label htmlFor="percentage" className="font-medium">By Percentage</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dimensions" id="dimensions" />
                            <Label htmlFor="dimensions" className="font-medium">By Dimensions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="preset" id="preset" />
                            <Label htmlFor="preset" className="font-medium">Preset Sizes</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {resizeMode === "percentage" && (
                        <div className="space-y-2">
                          <Label htmlFor="percentage">Scale Percentage</Label>
                          <Input
                            id="percentage"
                            type="number"
                            min="1"
                            max="500"
                            value={percentage}
                            onChange={(e) => setPercentage(e.target.value)}
                          />
                          <p className="text-sm text-gray-600">
                            Scale image to {percentage}% of original size
                          </p>
                        </div>
                      )}

                      {resizeMode === "dimensions" && (
                        <>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="maintainAspect"
                              checked={maintainAspect}
                              onChange={(e) => setMaintainAspect(e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor="maintainAspect" className="font-medium flex items-center gap-2">
                              {maintainAspect ? <Link className="h-4 w-4" /> : <Unlink className="h-4 w-4" />}
                              Maintain aspect ratio
                            </Label>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="width">Width (px)</Label>
                              <Input
                                id="width"
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="height">Height (px)</Label>
                              <Input
                                id="height"
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {resizeMode === "preset" && (
                        <div className="space-y-2">
                          <Label>Preset Sizes</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm">1920×1080 (HD)</Button>
                            <Button variant="outline" size="sm">1280×720 (HD)</Button>
                            <Button variant="outline" size="sm">800×600 (SVGA)</Button>
                            <Button variant="outline" size="sm">640×480 (VGA)</Button>
                            <Button variant="outline" size="sm">1080×1080 (Square)</Button>
                            <Button variant="outline" size="sm">1200×630 (Social)</Button>
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={handleResize} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Resizing Image...</>
                        ) : (
                          <>
                            <Maximize2 className="mr-2 h-5 w-5" />
                            Resize Image
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
                    <CardTitle>Resize Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Percentage</h4>
                      <p className="text-sm text-gray-600">
                        Scale image proportionally by percentage
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Dimensions</h4>
                      <p className="text-sm text-gray-600">
                        Set exact width and height in pixels
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Presets</h4>
                      <p className="text-sm text-gray-600">
                        Common sizes for web and social media
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
                      <span>Aspect ratio control</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Preset dimensions</span>
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
                      <span className="text-sm">Choose resize method</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download resized image</span>
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
                Smart Image Resizing
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Resize images with precision while maintaining quality and aspect ratio.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Maximize2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Flexible Resizing</h3>
                <p className="text-gray-600">
                  Multiple resize methods for any use case or requirement.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Link className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Aspect Control</h3>
                <p className="text-gray-600">
                  Maintain or adjust aspect ratios with precision control.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <ImageIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Quality Preserved</h3>
                <p className="text-gray-600">
                  Advanced algorithms maintain image quality during resizing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
