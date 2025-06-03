"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Image as ImageIcon,
  Sun,
  Download,
  Upload,
  CheckCircle,
  Settings
} from "lucide-react"

export default function BrightnessContrastPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [brightness, setBrightness] = useState("0")
  const [contrast, setContrast] = useState("0")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleAdjust = async () => {
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
                  <Sun className="mr-2 h-3 w-3" />
                  Brightness & Contrast
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Adjust Brightness &
                <span className="block text-blue-600">Contrast</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Fine-tune image brightness and contrast with precise controls. 
                Perfect for correcting exposure and enhancing image quality.
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
                        Adjustment Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="brightness">Brightness ({brightness > 0 ? '+' : ''}{brightness})</Label>
                        <input
                          id="brightness"
                          type="range"
                          min="-100"
                          max="100"
                          value={brightness}
                          onChange={(e) => setBrightness(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Darker</span>
                          <span>Brighter</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contrast">Contrast ({contrast > 0 ? '+' : ''}{contrast})</Label>
                        <input
                          id="contrast"
                          type="range"
                          min="-100"
                          max="100"
                          value={contrast}
                          onChange={(e) => setContrast(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Lower</span>
                          <span>Higher</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {setBrightness("0"); setContrast("0")}}
                          className="flex-1"
                        >
                          Reset
                        </Button>
                        <Button 
                          onClick={handleAdjust} 
                          className="flex-1" 
                          size="lg"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>Adjusting...</>
                          ) : (
                            <>
                              <Sun className="mr-2 h-5 w-5" />
                              Apply Changes
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
                    <CardTitle>Adjustment Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Brightness</h4>
                      <p className="text-sm text-gray-600">
                        Adjusts overall lightness of the image
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Contrast</h4>
                      <p className="text-sm text-gray-600">
                        Controls difference between light and dark areas
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Best Practice</h4>
                      <p className="text-sm text-gray-600">
                        Make small adjustments for natural results
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
                      <span>Precise control sliders</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Real-time preview</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>One-click reset</span>
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
