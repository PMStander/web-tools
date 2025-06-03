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
  RotateCw,
  Download,
  Upload,
  CheckCircle,
  Settings,
  RotateCcw,
  FlipHorizontal,
  FlipVertical
} from "lucide-react"

export default function VideoRotatePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [rotationAngle, setRotationAngle] = useState("90")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleRotate = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
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
                  <RotateCw className="mr-2 h-3 w-3" />
                  Video Rotator
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Rotate & Flip
                <span className="block text-purple-600">Videos</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Rotate videos to correct orientation or create artistic effects. 
                Fix upside-down videos or change from portrait to landscape.
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
                        Rotation Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Rotation & Flip</Label>
                        <RadioGroup value={rotationAngle} onValueChange={setRotationAngle}>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="90" id="90" />
                              <Label htmlFor="90" className="font-medium flex items-center gap-2">
                                <RotateCw className="h-4 w-4" />
                                90° Clockwise
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="-90" id="-90" />
                              <Label htmlFor="-90" className="font-medium flex items-center gap-2">
                                <RotateCcw className="h-4 w-4" />
                                90° Counter-clockwise
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="180" id="180" />
                              <Label htmlFor="180" className="font-medium">180° (Upside down)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="270" id="270" />
                              <Label htmlFor="270" className="font-medium">270° Clockwise</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="flip-h" id="flip-h" />
                              <Label htmlFor="flip-h" className="font-medium flex items-center gap-2">
                                <FlipHorizontal className="h-4 w-4" />
                                Flip Horizontal
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="flip-v" id="flip-v" />
                              <Label htmlFor="flip-v" className="font-medium flex items-center gap-2">
                                <FlipVertical className="h-4 w-4" />
                                Flip Vertical
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Preview</h4>
                        <p className="text-sm text-purple-700">
                          {rotationAngle === "90" && "Video will be rotated 90° clockwise (portrait to landscape)"}
                          {rotationAngle === "-90" && "Video will be rotated 90° counter-clockwise (landscape to portrait)"}
                          {rotationAngle === "180" && "Video will be rotated 180° (upside down)"}
                          {rotationAngle === "270" && "Video will be rotated 270° clockwise"}
                          {rotationAngle === "flip-h" && "Video will be flipped horizontally (mirror effect)"}
                          {rotationAngle === "flip-v" && "Video will be flipped vertically"}
                        </p>
                      </div>

                      <Button 
                        onClick={handleRotate} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Processing Video...</>
                        ) : (
                          <>
                            <RotateCw className="mr-2 h-5 w-5" />
                            Apply Rotation
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
                    <CardTitle>Rotation Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">90° Rotations</h4>
                      <p className="text-sm text-gray-600">
                        Perfect for fixing orientation issues
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">180° Rotation</h4>
                      <p className="text-sm text-gray-600">
                        Fix upside-down videos quickly
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Flip Effects</h4>
                      <p className="text-sm text-gray-600">
                        Create mirror effects or correct flipped videos
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
                      <span>All rotation angles</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Horizontal/vertical flip</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Fast processing</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Common Uses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Fix phone recordings</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Portrait to landscape</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Correct orientation</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Creative effects</span>
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
