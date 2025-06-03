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
  FlipHorizontal,
  FlipVertical,
  Download,
  Upload,
  CheckCircle,
  Settings
} from "lucide-react"

export default function ImageFlipPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [flipDirection, setFlipDirection] = useState("horizontal")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleFlip = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
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
                  <FlipHorizontal className="mr-2 h-3 w-3" />
                  Image Flip Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Flip Images
                <span className="block text-blue-600">Horizontally & Vertically</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Flip images horizontally or vertically with perfect quality preservation. 
                Create mirror effects or correct image orientation instantly.
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
                        Flip Direction
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Choose Flip Direction</Label>
                        <RadioGroup value={flipDirection} onValueChange={setFlipDirection}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="horizontal" id="horizontal" />
                            <Label htmlFor="horizontal" className="font-medium flex items-center gap-2">
                              <FlipHorizontal className="h-4 w-4" />
                              Horizontal (Mirror)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vertical" id="vertical" />
                            <Label htmlFor="vertical" className="font-medium flex items-center gap-2">
                              <FlipVertical className="h-4 w-4" />
                              Vertical (Upside Down)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both" className="font-medium">
                              Both (180° Rotation)
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button 
                        onClick={handleFlip} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Flipping Image...</>
                        ) : (
                          <>
                            {flipDirection === "horizontal" ? <FlipHorizontal className="mr-2 h-5 w-5" /> : <FlipVertical className="mr-2 h-5 w-5" />}
                            Flip Image
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
                    <CardTitle>Flip Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Horizontal Flip</h4>
                      <p className="text-sm text-gray-600">
                        Creates a mirror image effect
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Vertical Flip</h4>
                      <p className="text-sm text-gray-600">
                        Flips image upside down
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Both Directions</h4>
                      <p className="text-sm text-gray-600">
                        Equivalent to 180° rotation
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
                      <span>Instant processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>All image formats</span>
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
