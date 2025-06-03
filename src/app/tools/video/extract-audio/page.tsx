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
  Music,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Headphones,
  FileAudio
} from "lucide-react"

export default function ExtractAudioPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [audioFormat, setAudioFormat] = useState("mp3")
  const [quality, setQuality] = useState("high")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleExtract = async () => {
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
                  <Music className="mr-2 h-3 w-3" />
                  Audio Extractor
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Extract Audio from
                <span className="block text-purple-600">Videos</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Extract high-quality audio tracks from videos in multiple formats. 
                Perfect for creating podcasts, music files, or audio content.
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
                      acceptedTypes={['.mp4', '.avi', '.mov', '.webm', '.mkv', '.wmv']}
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
                        Audio Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <RadioGroup value={audioFormat} onValueChange={setAudioFormat}>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mp3" id="mp3" />
                              <Label htmlFor="mp3" className="font-medium">MP3 (Universal)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wav" id="wav" />
                              <Label htmlFor="wav" className="font-medium">WAV (Lossless)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="aac" id="aac" />
                              <Label htmlFor="aac" className="font-medium">AAC (High Quality)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="flac" id="flac" />
                              <Label htmlFor="flac" className="font-medium">FLAC (Lossless)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="ogg" id="ogg" />
                              <Label htmlFor="ogg" className="font-medium">OGG (Open Source)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="m4a" id="m4a" />
                              <Label htmlFor="m4a" className="font-medium">M4A (Apple)</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Audio Quality</Label>
                        <RadioGroup value={quality} onValueChange={setQuality}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high" className="font-medium">High Quality (320 kbps)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="font-medium">Medium Quality (192 kbps)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="standard" />
                            <Label htmlFor="standard" className="font-medium">Standard Quality (128 kbps)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700">
                          The audio will be extracted with the original quality preserved. 
                          Choose your preferred format and quality settings above.
                        </p>
                      </div>

                      <Button 
                        onClick={handleExtract} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Extracting Audio...</>
                        ) : (
                          <>
                            <Music className="mr-2 h-5 w-5" />
                            Extract Audio
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
                    <CardTitle>Audio Formats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">MP3</h4>
                      <p className="text-sm text-gray-600">
                        Universal compatibility, good compression
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">WAV/FLAC</h4>
                      <p className="text-sm text-gray-600">
                        Lossless quality, larger file size
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">AAC</h4>
                      <p className="text-sm text-gray-600">
                        High quality with efficient compression
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
                      <span>Multiple audio formats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Fast extraction</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Batch processing</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Podcast creation</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Music extraction</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Audio content</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Voice recordings</span>
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
                Professional Audio Extraction
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Extract high-quality audio from any video format.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Music className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">High Quality</h3>
                <p className="text-gray-600">
                  Extract audio with original quality preservation.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Headphones className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Multiple Formats</h3>
                <p className="text-gray-600">
                  Support for MP3, WAV, AAC, FLAC, and more formats.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FileAudio className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Fast Extraction</h3>
                <p className="text-gray-600">
                  Quick processing with optimized extraction algorithms.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
