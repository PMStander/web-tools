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
  Droplets,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Type,
  Image as ImageIcon
} from "lucide-react"

export default function VideoWatermarkPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [watermarkType, setWatermarkType] = useState("text")
  const [watermarkText, setWatermarkText] = useState("")
  const [position, setPosition] = useState("bottom-right")
  const [opacity, setOpacity] = useState("70")
  const [size, setSize] = useState("medium")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleAddWatermark = async () => {
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
                  <Droplets className="mr-2 h-3 w-3" />
                  Video Watermark
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Add Watermarks to
                <span className="block text-purple-600">Videos</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Protect your videos with custom watermarks. Add text or logo overlays 
                with precise positioning and transparency control.
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
                        Watermark Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Watermark Type</Label>
                        <RadioGroup value={watermarkType} onValueChange={setWatermarkType}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="text" id="text" />
                            <Label htmlFor="text" className="font-medium">Text Watermark</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="image" id="image" />
                            <Label htmlFor="image" className="font-medium">Image/Logo Watermark</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {watermarkType === "text" && (
                        <div className="space-y-2">
                          <Label htmlFor="watermarkText">Watermark Text</Label>
                          <Input
                            id="watermarkText"
                            placeholder="© Your Name 2024"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                          />
                        </div>
                      )}

                      {watermarkType === "image" && (
                        <div className="space-y-2">
                          <Label>Upload Watermark Image</Label>
                          <FileUpload
                            onFileSelect={() => {}}
                            acceptedTypes={['.png', '.jpg', '.jpeg']}
                            maxSize={10 * 1024 * 1024}
                          />
                          <p className="text-sm text-gray-600">
                            PNG files with transparency work best for watermarks
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Position</Label>
                        <RadioGroup value={position} onValueChange={setPosition}>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="top-left" id="top-left" />
                              <Label htmlFor="top-left" className="text-sm">Top Left</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="top-center" id="top-center" />
                              <Label htmlFor="top-center" className="text-sm">Top Center</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="top-right" id="top-right" />
                              <Label htmlFor="top-right" className="text-sm">Top Right</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="center-left" id="center-left" />
                              <Label htmlFor="center-left" className="text-sm">Center Left</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="center" id="center" />
                              <Label htmlFor="center" className="text-sm">Center</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="center-right" id="center-right" />
                              <Label htmlFor="center-right" className="text-sm">Center Right</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bottom-left" id="bottom-left" />
                              <Label htmlFor="bottom-left" className="text-sm">Bottom Left</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bottom-center" id="bottom-center" />
                              <Label htmlFor="bottom-center" className="text-sm">Bottom Center</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bottom-right" id="bottom-right" />
                              <Label htmlFor="bottom-right" className="text-sm">Bottom Right</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Size</Label>
                        <RadioGroup value={size} onValueChange={setSize}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="small" id="small" />
                            <Label htmlFor="small" className="font-medium">Small</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="font-medium">Medium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="large" id="large" />
                            <Label htmlFor="large" className="font-medium">Large</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="opacity">Opacity ({opacity}%)</Label>
                        <input
                          id="opacity"
                          type="range"
                          min="10"
                          max="100"
                          value={opacity}
                          onChange={(e) => setOpacity(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Transparent</span>
                          <span>Opaque</span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleAddWatermark} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing || (watermarkType === "text" && !watermarkText)}
                      >
                        {isProcessing ? (
                          <>Adding Watermark...</>
                        ) : (
                          <>
                            <Droplets className="mr-2 h-5 w-5" />
                            Add Watermark
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
                    <CardTitle>Watermark Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Text Watermark</h4>
                      <p className="text-sm text-gray-600">
                        Add custom text with copyright or branding
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Image Watermark</h4>
                      <p className="text-sm text-gray-600">
                        Use your logo or signature image
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Positioning</h4>
                      <p className="text-sm text-gray-600">
                        9 position options with size and opacity control
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
                      <span>Custom positioning</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Adjustable opacity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Text and image support</span>
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
                      <span className="font-medium">• Copyright protection</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Brand promotion</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Content attribution</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Professional videos</span>
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
