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
  Blur,
  Download,
  Upload,
  CheckCircle,
  Settings
} from "lucide-react"

export default function ImageBlurPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [blurType, setBlurType] = useState("gaussian")
  const [blurIntensity, setBlurIntensity] = useState("5")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleBlur = async () => {
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
                  <Blur className="mr-2 h-3 w-3" />
                  Image Blur Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Add Blur Effects to
                <span className="block text-blue-600">Images</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Apply professional blur effects with customizable intensity. 
                Perfect for backgrounds, privacy protection, and artistic effects.
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
                        Blur Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Blur Type</Label>
                        <RadioGroup value={blurType} onValueChange={setBlurType}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="gaussian" id="gaussian" />
                            <Label htmlFor="gaussian" className="font-medium">Gaussian Blur</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="motion" id="motion" />
                            <Label htmlFor="motion" className="font-medium">Motion Blur</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="radial" id="radial" />
                            <Label htmlFor="radial" className="font-medium">Radial Blur</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="surface" id="surface" />
                            <Label htmlFor="surface" className="font-medium">Surface Blur</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="blurIntensity">Blur Intensity ({blurIntensity}px)</Label>
                        <input
                          id="blurIntensity"
                          type="range"
                          min="1"
                          max="50"
                          value={blurIntensity}
                          onChange={(e) => setBlurIntensity(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtle</span>
                          <span>Strong</span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleBlur} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Applying Blur...</>
                        ) : (
                          <>
                            <Blur className="mr-2 h-5 w-5" />
                            Apply Blur Effect
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
                    <CardTitle>Blur Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Gaussian</h4>
                      <p className="text-sm text-gray-600">
                        Smooth, natural blur effect
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Motion</h4>
                      <p className="text-sm text-gray-600">
                        Directional blur for movement effect
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Radial</h4>
                      <p className="text-sm text-gray-600">
                        Circular blur from center point
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
                      <span>Multiple blur types</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Adjustable intensity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Real-time preview</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
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
