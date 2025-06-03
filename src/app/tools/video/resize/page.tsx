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
  Maximize2,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Monitor,
  Smartphone
} from "lucide-react"

export default function VideoResizePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [resizeMode, setResizeMode] = useState("preset")
  const [preset, setPreset] = useState("1080p")
  const [customWidth, setCustomWidth] = useState("1920")
  const [customHeight, setCustomHeight] = useState("1080")
  const [maintainAspect, setMaintainAspect] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleResize = async () => {
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
                  <Maximize2 className="mr-2 h-3 w-3" />
                  Video Resizer
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Resize Videos for
                <span className="block text-purple-600">Any Platform</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Resize videos to any dimensions with quality preservation. 
                Perfect for social media, web optimization, and device compatibility.
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
                        Resize Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Resize Mode</Label>
                        <RadioGroup value={resizeMode} onValueChange={setResizeMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="preset" id="preset" />
                            <Label htmlFor="preset" className="font-medium">Preset Resolutions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="font-medium">Custom Dimensions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="social" id="social" />
                            <Label htmlFor="social" className="font-medium">Social Media Formats</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {resizeMode === "preset" && (
                        <div className="space-y-2">
                          <Label>Resolution Preset</Label>
                          <RadioGroup value={preset} onValueChange={setPreset}>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="4k" id="4k" />
                                <Label htmlFor="4k" className="text-sm">4K (3840×2160)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1080p" id="1080p" />
                                <Label htmlFor="1080p" className="text-sm">1080p (1920×1080)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="720p" id="720p" />
                                <Label htmlFor="720p" className="text-sm">720p (1280×720)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="480p" id="480p" />
                                <Label htmlFor="480p" className="text-sm">480p (854×480)</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      {resizeMode === "custom" && (
                        <>
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
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="maintainAspect"
                              checked={maintainAspect}
                              onChange={(e) => setMaintainAspect(e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor="maintainAspect" className="font-medium">
                              Maintain aspect ratio
                            </Label>
                          </div>
                        </>
                      )}

                      {resizeMode === "social" && (
                        <div className="space-y-2">
                          <Label>Social Media Format</Label>
                          <div className="grid grid-cols-1 gap-2">
                            <Button variant="outline" size="sm">Instagram Square (1080×1080)</Button>
                            <Button variant="outline" size="sm">Instagram Story (1080×1920)</Button>
                            <Button variant="outline" size="sm">YouTube (1920×1080)</Button>
                            <Button variant="outline" size="sm">TikTok (1080×1920)</Button>
                            <Button variant="outline" size="sm">Twitter (1280×720)</Button>
                            <Button variant="outline" size="sm">Facebook (1920×1080)</Button>
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
                          <>Resizing Video...</>
                        ) : (
                          <>
                            <Maximize2 className="mr-2 h-5 w-5" />
                            Resize Video
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
                      <h4 className="font-medium">Preset Resolutions</h4>
                      <p className="text-sm text-gray-600">
                        Standard video resolutions for common use cases
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Custom Dimensions</h4>
                      <p className="text-sm text-gray-600">
                        Specify exact width and height in pixels
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Social Media</h4>
                      <p className="text-sm text-gray-600">
                        Optimized formats for social platforms
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
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Aspect ratio control</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Social media presets</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Batch processing</span>
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
