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
  Video,
  Image as ImageIcon,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Camera,
  Grid
} from "lucide-react"

export default function VideoThumbnailPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [thumbnailMode, setThumbnailMode] = useState("single")
  const [timePosition, setTimePosition] = useState("5")
  const [thumbnailCount, setThumbnailCount] = useState("9")
  const [quality, setQuality] = useState("high")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleGenerate = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsProcessing(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-purple-50 to-violet-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Camera className="mr-2 h-3 w-3" />
                  Thumbnail Generator
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Generate Video
                <span className="block text-purple-600">Thumbnails</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Create high-quality thumbnails from videos at any time position. 
                Perfect for video previews, social media, and content management.
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
                      Upload Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.mp4', '.avi', '.mov', '.webm', '.mkv']}
                      maxSize={2 * 1024 * 1024 * 1024}
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
                        Thumbnail Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Thumbnail Type</Label>
                        <RadioGroup value={thumbnailMode} onValueChange={setThumbnailMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="single" />
                            <Label htmlFor="single" className="font-medium">Single Thumbnail</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multiple" id="multiple" />
                            <Label htmlFor="multiple" className="font-medium">Multiple Thumbnails</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="grid" id="grid" />
                            <Label htmlFor="grid" className="font-medium">Thumbnail Grid</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {thumbnailMode === "single" && (
                        <div className="space-y-2">
                          <Label htmlFor="timePosition">Time Position (seconds)</Label>
                          <Input
                            id="timePosition"
                            type="number"
                            min="0"
                            value={timePosition}
                            onChange={(e) => setTimePosition(e.target.value)}
                          />
                          <p className="text-sm text-gray-600">
                            Extract thumbnail at {timePosition} seconds
                          </p>
                        </div>
                      )}

                      {(thumbnailMode === "multiple" || thumbnailMode === "grid") && (
                        <div className="space-y-2">
                          <Label htmlFor="thumbnailCount">Number of Thumbnails</Label>
                          <select 
                            id="thumbnailCount"
                            value={thumbnailCount}
                            onChange={(e) => setThumbnailCount(e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="4">4 thumbnails</option>
                            <option value="6">6 thumbnails</option>
                            <option value="9">9 thumbnails</option>
                            <option value="12">12 thumbnails</option>
                            <option value="16">16 thumbnails</option>
                          </select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Image Quality</Label>
                        <RadioGroup value={quality} onValueChange={setQuality}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high" className="font-medium">High Quality (1080p)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="font-medium">Medium Quality (720p)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="web" id="web" />
                            <Label htmlFor="web" className="font-medium">Web Quality (480p)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button 
                        onClick={handleGenerate} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Generating Thumbnails...</>
                        ) : (
                          <>
                            <Camera className="mr-2 h-5 w-5" />
                            Generate Thumbnails
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
                    <CardTitle>Thumbnail Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Single</h4>
                      <p className="text-sm text-gray-600">
                        One thumbnail at specific time position
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Multiple</h4>
                      <p className="text-sm text-gray-600">
                        Several thumbnails at different intervals
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Grid</h4>
                      <p className="text-sm text-gray-600">
                        Combined grid view of multiple thumbnails
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
                      <span>High-quality extraction</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Custom time positions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple formats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Batch generation</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Video previews</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Social media posts</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Content management</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Video catalogs</span>
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
