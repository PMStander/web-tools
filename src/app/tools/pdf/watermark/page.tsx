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
  FileText, 
  Droplets, 
  Download,
  Upload,
  Settings,
  CheckCircle,
  Type,
  Image
} from "lucide-react"

export default function PDFWatermarkPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [watermarkType, setWatermarkType] = useState("text")
  const [watermarkText, setWatermarkText] = useState("")
  const [position, setPosition] = useState("center")
  const [opacity, setOpacity] = useState("50")
  const [fontSize, setFontSize] = useState("24")
  const [color, setColor] = useState("#000000")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleWatermark = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsProcessing(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Droplets className="mr-2 h-3 w-3" />
                  PDF Watermark Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Add Watermarks to
                <span className="block text-red-600">PDF Files</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Add text or image watermarks to PDF pages with custom positioning and transparency. 
                Perfect for branding, copyright protection, and document security.
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
                      Upload PDF File
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.pdf']}
                      maxSize={100 * 1024 * 1024}
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
                        Watermark Options
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
                            <Label htmlFor="image" className="font-medium">Image Watermark</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {watermarkType === "text" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="watermarkText">Watermark Text</Label>
                            <Input
                              id="watermarkText"
                              placeholder="Enter watermark text"
                              value={watermarkText}
                              onChange={(e) => setWatermarkText(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fontSize">Font Size</Label>
                              <Input
                                id="fontSize"
                                type="number"
                                min="8"
                                max="72"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="color">Text Color</Label>
                              <Input
                                id="color"
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {watermarkType === "image" && (
                        <div className="space-y-2">
                          <Label>Upload Watermark Image</Label>
                          <FileUpload
                            onFileSelect={() => {}}
                            acceptedTypes={['.png', '.jpg', '.jpeg']}
                            maxSize={10 * 1024 * 1024}
                          />
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
                      </div>

                      <Button 
                        onClick={handleWatermark} 
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
                        Add custom text with font, color, and size control
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Image Watermark</h4>
                      <p className="text-sm text-gray-600">
                        Use your logo or image as a watermark
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Positioning</h4>
                      <p className="text-sm text-gray-600">
                        9 position options with custom opacity control
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
                      <span>Adjustable transparency</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Text and image support</span>
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
                      <span className="text-sm">Upload your PDF file</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm">Configure watermark</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download watermarked PDF</span>
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
                Professional Watermarking
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Add professional watermarks to protect and brand your PDF documents.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Type className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">Custom Text</h3>
                <p className="text-gray-600">
                  Add custom text watermarks with full typography control.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Image className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Logo Support</h3>
                <p className="text-gray-600">
                  Use your company logo or any image as a watermark.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Droplets className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Perfect Positioning</h3>
                <p className="text-gray-600">
                  Precise control over watermark position and transparency.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
