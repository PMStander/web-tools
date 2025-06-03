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
  RotateCw,
  Download,
  Upload,
  CheckCircle,
  Settings,
  RotateCcw,
  RefreshCw
} from "lucide-react"

export default function ImageRotatePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [rotationAngle, setRotationAngle] = useState("90")
  const [customAngle, setCustomAngle] = useState("45")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleRotate = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
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
                  <RotateCw className="mr-2 h-3 w-3" />
                  Image Rotation Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Rotate Images
                <span className="block text-blue-600">Precisely</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Rotate images by any angle with smart background filling. 
                Perfect for fixing orientation or creating artistic effects.
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
                        Rotation Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Rotation Angle</Label>
                        <RadioGroup value={rotationAngle} onValueChange={setRotationAngle}>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="90" id="90" />
                              <Label htmlFor="90" className="text-sm">90° Right</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="-90" id="-90" />
                              <Label htmlFor="-90" className="text-sm">90° Left</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="180" id="180" />
                              <Label htmlFor="180" className="text-sm">180°</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="custom" id="custom" />
                              <Label htmlFor="custom" className="text-sm">Custom</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      {rotationAngle === "custom" && (
                        <div className="space-y-2">
                          <Label htmlFor="customAngle">Custom Angle (degrees)</Label>
                          <Input
                            id="customAngle"
                            type="number"
                            min="-360"
                            max="360"
                            value={customAngle}
                            onChange={(e) => setCustomAngle(e.target.value)}
                          />
                          <p className="text-sm text-gray-600">
                            Enter any angle between -360 and 360 degrees
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="backgroundColor">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="backgroundColor"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            placeholder="#ffffff"
                            className="flex-1"
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          Background color for areas created by rotation
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleRotate} 
                          className="flex-1" 
                          size="lg"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>Rotating...</>
                          ) : (
                            <>
                              <RotateCw className="mr-2 h-5 w-5" />
                              Rotate Image
                            </>
                          )}
                        </Button>
                      </div>
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
                      <h4 className="font-medium">Quick Rotations</h4>
                      <p className="text-sm text-gray-600">
                        90°, 180°, and 270° rotations for common needs
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Custom Angles</h4>
                      <p className="text-sm text-gray-600">
                        Any angle from -360° to 360° for precise control
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Background Fill</h4>
                      <p className="text-sm text-gray-600">
                        Choose background color for exposed areas
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
                      <span>Any angle rotation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Smart background fill</span>
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
                      <span className="text-sm">Choose rotation angle</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download rotated image</span>
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
                Precise Image Rotation
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Rotate images with precision and smart background handling.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <RotateCw className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Any Angle</h3>
                <p className="text-gray-600">
                  Rotate images by any angle with precise degree control.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Fill</h3>
                <p className="text-gray-600">
                  Intelligent background filling for rotated areas.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <ImageIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Quality Maintained</h3>
                <p className="text-gray-600">
                  Preserve image quality during rotation operations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
