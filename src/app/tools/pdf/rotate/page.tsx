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
  RotateCw, 
  Download,
  Upload,
  Settings,
  CheckCircle,
  RotateCcw,
  RefreshCw
} from "lucide-react"

export default function PDFRotatePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [rotationAngle, setRotationAngle] = useState("90")
  const [rotationDirection, setRotationDirection] = useState("clockwise")
  const [pageSelection, setPageSelection] = useState("all")
  const [pageRange, setPageRange] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleRotate = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
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
                  <RotateCw className="mr-2 h-3 w-3" />
                  PDF Rotation Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Rotate PDF
                <span className="block text-red-600">Pages</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Rotate PDF pages to correct orientation with smart detection. 
                Fix upside-down or sideways pages with precise angle control.
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
                        Rotation Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Rotation Angle</Label>
                        <RadioGroup value={rotationAngle} onValueChange={setRotationAngle}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="90" id="90" />
                            <Label htmlFor="90" className="font-medium">90 degrees</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="180" id="180" />
                            <Label htmlFor="180" className="font-medium">180 degrees</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="270" id="270" />
                            <Label htmlFor="270" className="font-medium">270 degrees</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="font-medium">Custom angle</Label>
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
                            placeholder="Enter angle"
                          />
                          <p className="text-sm text-gray-600">
                            Enter any angle between -360 and 360 degrees
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Direction</Label>
                        <RadioGroup value={rotationDirection} onValueChange={setRotationDirection}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="clockwise" id="clockwise" />
                            <Label htmlFor="clockwise" className="font-medium">Clockwise</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="counterclockwise" id="counterclockwise" />
                            <Label htmlFor="counterclockwise" className="font-medium">Counter-clockwise</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Apply to Pages</Label>
                        <RadioGroup value={pageSelection} onValueChange={setPageSelection}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all" className="font-medium">All pages</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="odd" id="odd" />
                            <Label htmlFor="odd" className="font-medium">Odd pages only</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="even" id="even" />
                            <Label htmlFor="even" className="font-medium">Even pages only</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="range" id="range" />
                            <Label htmlFor="range" className="font-medium">Specific pages</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {pageSelection === "range" && (
                        <div className="space-y-2">
                          <Label htmlFor="pageRange">Page Range</Label>
                          <Input
                            id="pageRange"
                            placeholder="e.g., 1-5, 10, 15-20"
                            value={pageRange}
                            onChange={(e) => setPageRange(e.target.value)}
                          />
                          <p className="text-sm text-gray-600">
                            Enter page numbers or ranges separated by commas
                          </p>
                        </div>
                      )}

                      <Button 
                        onClick={handleRotate} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Rotating Pages...</>
                        ) : (
                          <>
                            <RotateCw className="mr-2 h-5 w-5" />
                            Rotate PDF
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
                      <h4 className="font-medium">90° Rotation</h4>
                      <p className="text-sm text-gray-600">
                        Perfect for fixing landscape/portrait orientation
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">180° Rotation</h4>
                      <p className="text-sm text-gray-600">
                        Fix upside-down pages quickly
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Custom Angles</h4>
                      <p className="text-sm text-gray-600">
                        Precise rotation for any angle needed
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
                      <span>Precise angle control</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Page range selection</span>
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
                      <span className="text-sm">Upload your PDF file</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm">Choose rotation settings</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download rotated PDF</span>
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
                Smart PDF Rotation
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Fix page orientation issues with precise rotation control.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <RotateCw className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">Precise Control</h3>
                <p className="text-gray-600">
                  Rotate pages by exact angles with clockwise or counter-clockwise direction.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Flexible Selection</h3>
                <p className="text-gray-600">
                  Apply rotation to all pages, odd/even pages, or specific page ranges.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Quality Maintained</h3>
                <p className="text-gray-600">
                  Preserve original document quality and content during rotation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
