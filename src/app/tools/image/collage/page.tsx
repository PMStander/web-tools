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
  Grid,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Plus
} from "lucide-react"

export default function ImageCollagePage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [layout, setLayout] = useState("grid-2x2")
  const [spacing, setSpacing] = useState("10")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFiles(prev => [...prev, file])
  }

  const handleCreateCollage = async () => {
    if (uploadedFiles.length < 2) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
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
                  <Grid className="mr-2 h-3 w-3" />
                  Image Collage Maker
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Create Beautiful
                <span className="block text-blue-600">Collages</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Combine multiple images into stunning collages with customizable layouts. 
                Perfect for social media, presentations, and creative projects.
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
                      Upload Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                      maxSize={50 * 1024 * 1024}
                    />
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>{uploadedFiles.length} images uploaded</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="text-xs p-2 bg-gray-100 rounded truncate">
                              {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Upload 2 or more images to create a collage. You can add up to 9 images.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {uploadedFiles.length >= 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Collage Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Layout Style</Label>
                        <RadioGroup value={layout} onValueChange={setLayout}>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="grid-2x2" id="grid-2x2" />
                              <Label htmlFor="grid-2x2" className="text-sm">2×2 Grid</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="grid-3x3" id="grid-3x3" />
                              <Label htmlFor="grid-3x3" className="text-sm">3×3 Grid</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="horizontal" id="horizontal" />
                              <Label htmlFor="horizontal" className="text-sm">Horizontal Strip</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="vertical" id="vertical" />
                              <Label htmlFor="vertical" className="text-sm">Vertical Strip</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mosaic" id="mosaic" />
                              <Label htmlFor="mosaic" className="text-sm">Mosaic</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="polaroid" id="polaroid" />
                              <Label htmlFor="polaroid" className="text-sm">Polaroid Style</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="spacing">Image Spacing ({spacing}px)</Label>
                        <input
                          id="spacing"
                          type="range"
                          min="0"
                          max="50"
                          value={spacing}
                          onChange={(e) => setSpacing(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>No spacing</span>
                          <span>Large spacing</span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleCreateCollage} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing || uploadedFiles.length < 2}
                      >
                        {isProcessing ? (
                          <>Creating Collage...</>
                        ) : (
                          <>
                            <Grid className="mr-2 h-5 w-5" />
                            Create Collage
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
                    <CardTitle>Layout Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Grid Layouts</h4>
                      <p className="text-sm text-gray-600">
                        Organized grid patterns for clean presentation
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Strip Layouts</h4>
                      <p className="text-sm text-gray-600">
                        Linear arrangements for storytelling
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Creative Styles</h4>
                      <p className="text-sm text-gray-600">
                        Mosaic and polaroid effects for artistic flair
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
                      <span>Multiple layout options</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Adjustable spacing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Auto image fitting</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>High-resolution output</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Social media posts</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Photo albums</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Presentations</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Creative projects</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
