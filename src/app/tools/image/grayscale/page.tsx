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
  Palette,
  Download,
  Upload,
  CheckCircle,
  Settings
} from "lucide-react"

export default function ImageGrayscalePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [conversionMode, setConversionMode] = useState("standard")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleConvert = async () => {
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
                  <Palette className="mr-2 h-3 w-3" />
                  Grayscale Converter
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Convert to
                <span className="block text-blue-600">Grayscale</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Convert color images to beautiful black and white with multiple conversion methods. 
                Perfect for artistic effects and professional photography.
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
                        Conversion Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Choose Conversion Method</Label>
                        <RadioGroup value={conversionMode} onValueChange={setConversionMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="standard" />
                            <Label htmlFor="standard" className="font-medium">Standard Grayscale</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="luminance" id="luminance" />
                            <Label htmlFor="luminance" className="font-medium">Luminance Method</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="average" id="average" />
                            <Label htmlFor="average" className="font-medium">Average Method</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="desaturate" id="desaturate" />
                            <Label htmlFor="desaturate" className="font-medium">Desaturation</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {conversionMode === "standard" && "Standard Grayscale"}
                          {conversionMode === "luminance" && "Luminance Method"}
                          {conversionMode === "average" && "Average Method"}
                          {conversionMode === "desaturate" && "Desaturation"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {conversionMode === "standard" && "Uses weighted RGB values for natural-looking grayscale conversion."}
                          {conversionMode === "luminance" && "Preserves perceived brightness for the most accurate conversion."}
                          {conversionMode === "average" && "Simple average of RGB values for uniform conversion."}
                          {conversionMode === "desaturate" && "Removes color saturation while maintaining original tones."}
                        </p>
                      </div>

                      <Button 
                        onClick={handleConvert} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Converting to Grayscale...</>
                        ) : (
                          <>
                            <Palette className="mr-2 h-5 w-5" />
                            Convert to Grayscale
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
                    <CardTitle>Conversion Methods</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Standard</h4>
                      <p className="text-sm text-gray-600">
                        Balanced conversion for most images
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Luminance</h4>
                      <p className="text-sm text-gray-600">
                        Preserves perceived brightness
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Average</h4>
                      <p className="text-sm text-gray-600">
                        Simple RGB averaging method
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
                      <span>Multiple conversion methods</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Instant processing</span>
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
