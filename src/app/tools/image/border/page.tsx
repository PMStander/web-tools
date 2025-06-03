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
  Square,
  Download,
  Upload,
  CheckCircle,
  Settings
} from "lucide-react"

export default function ImageBorderPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [borderStyle, setBorderStyle] = useState("solid")
  const [borderWidth, setBorderWidth] = useState("10")
  const [borderColor, setBorderColor] = useState("#000000")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleAddBorder = async () => {
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
                  <Square className="mr-2 h-3 w-3" />
                  Image Border Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Add Borders to
                <span className="block text-blue-600">Images</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Add custom borders to your images with various styles and colors. 
                Perfect for framing photos and creating professional presentations.
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
                        Border Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Border Style</Label>
                        <RadioGroup value={borderStyle} onValueChange={setBorderStyle}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="solid" id="solid" />
                            <Label htmlFor="solid" className="font-medium">Solid</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dashed" id="dashed" />
                            <Label htmlFor="dashed" className="font-medium">Dashed</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dotted" id="dotted" />
                            <Label htmlFor="dotted" className="font-medium">Dotted</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="double" id="double" />
                            <Label htmlFor="double" className="font-medium">Double</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="borderWidth">Border Width ({borderWidth}px)</Label>
                        <input
                          id="borderWidth"
                          type="range"
                          min="1"
                          max="50"
                          value={borderWidth}
                          onChange={(e) => setBorderWidth(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Thin</span>
                          <span>Thick</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="borderColor">Border Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="borderColor"
                            type="color"
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            type="text"
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setBorderColor("#000000")}
                          className="h-8"
                          style={{backgroundColor: "#000000", color: "white"}}
                        >
                          Black
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setBorderColor("#ffffff")}
                          className="h-8"
                          style={{backgroundColor: "#ffffff", color: "black"}}
                        >
                          White
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setBorderColor("#808080")}
                          className="h-8"
                          style={{backgroundColor: "#808080", color: "white"}}
                        >
                          Gray
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setBorderColor("#8B4513")}
                          className="h-8"
                          style={{backgroundColor: "#8B4513", color: "white"}}
                        >
                          Brown
                        </Button>
                      </div>

                      <Button 
                        onClick={handleAddBorder} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Adding Border...</>
                        ) : (
                          <>
                            <Square className="mr-2 h-5 w-5" />
                            Add Border
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
                    <CardTitle>Border Styles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Solid</h4>
                      <p className="text-sm text-gray-600">
                        Clean, continuous border line
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Dashed</h4>
                      <p className="text-sm text-gray-600">
                        Stylish dashed border pattern
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Dotted</h4>
                      <p className="text-sm text-gray-600">
                        Decorative dotted border style
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
                      <span>Multiple border styles</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Custom colors</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Adjustable width</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Color presets</span>
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
