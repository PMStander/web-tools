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
  Camera,
  Download,
  Upload,
  CheckCircle,
  Settings
} from "lucide-react"

export default function ImageSepiaPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [sepiaIntensity, setSepiaIntensity] = useState("100")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleApplySepia = async () => {
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
                  <Camera className="mr-2 h-3 w-3" />
                  Sepia Effect
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Apply Vintage
                <span className="block text-blue-600">Sepia Effect</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Transform your images with classic sepia tones for a vintage, nostalgic look. 
                Perfect for creating timeless, artistic photographs.
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
                        Sepia Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="sepiaIntensity">Sepia Intensity ({sepiaIntensity}%)</Label>
                        <input
                          id="sepiaIntensity"
                          type="range"
                          min="0"
                          max="100"
                          value={sepiaIntensity}
                          onChange={(e) => setSepiaIntensity(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtle</span>
                          <span>Full Sepia</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSepiaIntensity("25")}
                        >
                          Light
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSepiaIntensity("50")}
                        >
                          Medium
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSepiaIntensity("100")}
                        >
                          Strong
                        </Button>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-700">
                          Sepia effect adds warm brown tones to create a vintage, nostalgic appearance 
                          reminiscent of old photographs from the early 20th century.
                        </p>
                      </div>

                      <Button 
                        onClick={handleApplySepia} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Applying Sepia...</>
                        ) : (
                          <>
                            <Camera className="mr-2 h-5 w-5" />
                            Apply Sepia Effect
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
                    <CardTitle>About Sepia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Vintage Look</h4>
                      <p className="text-sm text-gray-600">
                        Creates warm, brown-toned vintage appearance
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Artistic Effect</h4>
                      <p className="text-sm text-gray-600">
                        Adds nostalgic, timeless quality to photos
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Adjustable</h4>
                      <p className="text-sm text-gray-600">
                        Control intensity from subtle to full effect
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
                      <span>Adjustable intensity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quick presets</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Instant processing</span>
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
                      <span className="font-medium">• Portrait photography</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Vintage aesthetics</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Artistic projects</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Historical themes</span>
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
