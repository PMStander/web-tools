"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Video,
  Zap,
  Download,
  Upload,
  CheckCircle,
  Settings,
  FastForward,
  Rewind
} from "lucide-react"

export default function VideoSpeedPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [speedMode, setSpeedMode] = useState("preset")
  const [speedPreset, setSpeedPreset] = useState("2x")
  const [customSpeed, setCustomSpeed] = useState("1.5")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleChangeSpeed = async () => {
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
                  <Zap className="mr-2 h-3 w-3" />
                  Video Speed Changer
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Change Video
                <span className="block text-purple-600">Speed</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Speed up or slow down videos with precision control. 
                Create time-lapse effects, slow motion, or adjust playback speed.
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
                        Speed Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Speed Control</Label>
                        <RadioGroup value={speedMode} onValueChange={setSpeedMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="preset" id="preset" />
                            <Label htmlFor="preset" className="font-medium">Preset Speeds</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="font-medium">Custom Speed</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {speedMode === "preset" && (
                        <div className="space-y-2">
                          <Label>Speed Preset</Label>
                          <RadioGroup value={speedPreset} onValueChange={setSpeedPreset}>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="0.25x" id="0.25x" />
                                <Label htmlFor="0.25x" className="text-sm">0.25x (Ultra Slow)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="0.5x" id="0.5x" />
                                <Label htmlFor="0.5x" className="text-sm">0.5x (Slow Motion)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="0.75x" id="0.75x" />
                                <Label htmlFor="0.75x" className="text-sm">0.75x (Slightly Slow)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1.25x" id="1.25x" />
                                <Label htmlFor="1.25x" className="text-sm">1.25x (Slightly Fast)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1.5x" id="1.5x" />
                                <Label htmlFor="1.5x" className="text-sm">1.5x (Fast)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="2x" id="2x" />
                                <Label htmlFor="2x" className="text-sm">2x (Double Speed)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="3x" id="3x" />
                                <Label htmlFor="3x" className="text-sm">3x (Triple Speed)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="4x" id="4x" />
                                <Label htmlFor="4x" className="text-sm">4x (Time-lapse)</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      {speedMode === "custom" && (
                        <div className="space-y-2">
                          <Label htmlFor="customSpeed">Custom Speed Multiplier</Label>
                          <input
                            id="customSpeed"
                            type="range"
                            min="0.1"
                            max="10"
                            step="0.1"
                            value={customSpeed}
                            onChange={(e) => setCustomSpeed(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>0.1x (Very Slow)</span>
                            <span className="font-medium">{customSpeed}x</span>
                            <span>10x (Very Fast)</span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Effect Preview</h4>
                        <p className="text-sm text-purple-700">
                          {speedMode === "preset" && (
                            <>
                              {parseFloat(speedPreset) < 1 && "Video will be slowed down for slow motion effect"}
                              {parseFloat(speedPreset) === 1 && "Video will play at normal speed"}
                              {parseFloat(speedPreset) > 1 && "Video will be sped up for time-lapse effect"}
                            </>
                          )}
                          {speedMode === "custom" && (
                            <>
                              {parseFloat(customSpeed) < 1 && `Video will be slowed down to ${customSpeed}x speed`}
                              {parseFloat(customSpeed) === 1 && "Video will play at normal speed"}
                              {parseFloat(customSpeed) > 1 && `Video will be sped up to ${customSpeed}x speed`}
                            </>
                          )}
                        </p>
                      </div>

                      <Button 
                        onClick={handleChangeSpeed} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Changing Speed...</>
                        ) : (
                          <>
                            <Zap className="mr-2 h-5 w-5" />
                            Change Speed
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
                    <CardTitle>Speed Effects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Slow Motion (0.1x - 0.9x)</h4>
                      <p className="text-sm text-gray-600">
                        Create dramatic slow motion effects
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Fast Forward (1.1x - 4x+)</h4>
                      <p className="text-sm text-gray-600">
                        Speed up for time-lapse or quick viewing
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Custom Speed</h4>
                      <p className="text-sm text-gray-600">
                        Precise control with any speed multiplier
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
                      <span>Precise speed control</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Audio synchronization</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Custom multipliers</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Time-lapse videos</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Slow motion effects</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Quick reviews</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Creative effects</span>
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
