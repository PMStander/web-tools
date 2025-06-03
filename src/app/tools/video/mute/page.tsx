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
  VolumeX,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Volume2,
  VolumeOff
} from "lucide-react"

export default function VideoMutePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [muteOption, setMuteOption] = useState("complete")
  const [volumeLevel, setVolumeLevel] = useState("50")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleMute = async () => {
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
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-purple-50 to-violet-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <VolumeX className="mr-2 h-3 w-3" />
                  Video Mute Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Mute or Adjust
                <span className="block text-purple-600">Video Audio</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Remove audio completely or adjust volume levels in your videos. 
                Perfect for creating silent videos or reducing background noise.
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
                        Audio Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Audio Option</Label>
                        <RadioGroup value={muteOption} onValueChange={setMuteOption}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="complete" id="complete" />
                            <Label htmlFor="complete" className="font-medium flex items-center gap-2">
                              <VolumeOff className="h-4 w-4" />
                              Complete Mute (Remove all audio)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="reduce" id="reduce" />
                            <Label htmlFor="reduce" className="font-medium flex items-center gap-2">
                              <Volume2 className="h-4 w-4" />
                              Reduce Volume
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fade" id="fade" />
                            <Label htmlFor="fade" className="font-medium">
                              Fade Out Audio
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="background" id="background" />
                            <Label htmlFor="background" className="font-medium">
                              Remove Background Noise Only
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {muteOption === "reduce" && (
                        <div className="space-y-2">
                          <Label htmlFor="volumeLevel">Volume Level ({volumeLevel}%)</Label>
                          <input
                            id="volumeLevel"
                            type="range"
                            min="0"
                            max="100"
                            value={volumeLevel}
                            onChange={(e) => setVolumeLevel(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Silent</span>
                            <span>Original Volume</span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Audio Processing</h4>
                        <p className="text-sm text-purple-700">
                          {muteOption === "complete" && "All audio will be completely removed from the video"}
                          {muteOption === "reduce" && `Audio volume will be reduced to ${volumeLevel}% of original`}
                          {muteOption === "fade" && "Audio will gradually fade out over the duration"}
                          {muteOption === "background" && "Background noise will be reduced while preserving speech"}
                        </p>
                      </div>

                      <Button 
                        onClick={handleMute} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Processing Audio...</>
                        ) : (
                          <>
                            <VolumeX className="mr-2 h-5 w-5" />
                            Apply Audio Changes
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
                    <CardTitle>Audio Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Complete Mute</h4>
                      <p className="text-sm text-gray-600">
                        Removes all audio tracks from the video
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Volume Reduction</h4>
                      <p className="text-sm text-gray-600">
                        Adjusts audio volume to desired level
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Fade Effects</h4>
                      <p className="text-sm text-gray-600">
                        Gradually reduces audio over time
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Noise Reduction</h4>
                      <p className="text-sm text-gray-600">
                        Removes background noise while keeping speech
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
                      <span>Complete audio removal</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Volume adjustment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Fade effects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Noise reduction</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Silent videos</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Background music removal</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Noise reduction</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Volume adjustment</span>
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
