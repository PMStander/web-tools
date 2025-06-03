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
  CornerDownRight,
  Download,
  Upload,
  CheckCircle,
  Settings
} from "lucide-react"

export default function RoundCornersPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [cornerRadius, setCornerRadius] = useState("20")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleRoundCorners = async () => {
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
                  <CornerDownRight className="mr-2 h-3 w-3" />
                  Round Corners
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Add Rounded
                <span className="block text-blue-600">Corners</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Create modern, rounded corner effects for your images. 
                Perfect for web design, social media, and professional presentations.
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
                        Corner Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="cornerRadius">Corner Radius ({cornerRadius}px)</Label>
                        <input
                          id="cornerRadius"
                          type="range"
                          min="5"
                          max="100"
                          value={cornerRadius}
                          onChange={(e) => setCornerRadius(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtle</span>
                          <span>Very Round</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCornerRadius("10")}
                        >
                          10px
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCornerRadius("20")}
                        >
                          20px
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCornerRadius("50")}
                        >
                          50px
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCornerRadius("100")}
                        >
                          100px
                        </Button>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Rounded corners create a modern, friendly appearance. The output will be a PNG 
                          with transparent corners, perfect for web use and overlays.
                        </p>
                      </div>

                      <Button 
                        onClick={handleRoundCorners} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Rounding Corners...</>
                        ) : (
                          <>
                            <CornerDownRight className="mr-2 h-5 w-5" />
                            Round Corners
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
                    <CardTitle>Corner Effects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Subtle (5-15px)</h4>
                      <p className="text-sm text-gray-600">
                        Gentle rounding for professional look
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Medium (20-40px)</h4>
                      <p className="text-sm text-gray-600">
                        Balanced modern appearance
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Strong (50px+)</h4>
                      <p className="text-sm text-gray-600">
                        Bold, distinctive rounded style
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
                      <span>Adjustable radius</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Transparent output</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quick presets</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Web-ready PNG</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Web design</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Social media posts</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• App interfaces</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Modern presentations</span>
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
