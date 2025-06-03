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
  Video,
  Merge,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Plus,
  ArrowRight
} from "lucide-react"

export default function VideoMergePage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [mergeMode, setMergeMode] = useState("sequence")
  const [outputQuality, setOutputQuality] = useState("high")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFiles(prev => [...prev, file])
  }

  const handleMerge = async () => {
    if (uploadedFiles.length < 2) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 4000))
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
                  <Merge className="mr-2 h-3 w-3" />
                  Video Merger
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Merge Multiple
                <span className="block text-purple-600">Videos</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Combine multiple video files into one seamless video. 
                Perfect for creating compilations, joining clips, and video storytelling.
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
                      Upload Videos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.mp4', '.avi', '.mov', '.webm', '.mkv']}
                      maxSize={2 * 1024 * 1024 * 1024}
                    />
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>{uploadedFiles.length} videos uploaded</span>
                        </div>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                              <span className="text-sm font-medium">{index + 1}.</span>
                              <span className="text-sm truncate flex-1">{file.name}</span>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-700">
                        Upload 2 or more videos to merge them. Videos will be joined in upload order.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {uploadedFiles.length >= 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Merge Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Merge Mode</Label>
                        <RadioGroup value={mergeMode} onValueChange={setMergeMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sequence" id="sequence" />
                            <Label htmlFor="sequence" className="font-medium">Sequential (One after another)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="crossfade" id="crossfade" />
                            <Label htmlFor="crossfade" className="font-medium">With Crossfade Transitions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fade" id="fade" />
                            <Label htmlFor="fade" className="font-medium">With Fade In/Out</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Output Quality</Label>
                        <RadioGroup value={outputQuality} onValueChange={setOutputQuality}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high" className="font-medium">High Quality (Best)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="font-medium">Medium Quality (Balanced)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="web" id="web" />
                            <Label htmlFor="web" className="font-medium">Web Quality (Smaller)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button 
                        onClick={handleMerge} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing || uploadedFiles.length < 2}
                      >
                        {isProcessing ? (
                          <>Merging Videos...</>
                        ) : (
                          <>
                            <Merge className="mr-2 h-5 w-5" />
                            Merge Videos
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
                    <CardTitle>Merge Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Sequential</h4>
                      <p className="text-sm text-gray-600">
                        Join videos one after another with no transitions
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Crossfade</h4>
                      <p className="text-sm text-gray-600">
                        Smooth transitions between video clips
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Fade Effects</h4>
                      <p className="text-sm text-gray-600">
                        Add fade in/out effects for professional look
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
                      <span>Multiple video formats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Transition effects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Custom ordering</span>
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
