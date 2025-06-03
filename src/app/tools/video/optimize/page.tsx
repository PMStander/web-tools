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
  Zap,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Monitor,
  Smartphone,
  Globe
} from "lucide-react"

export default function VideoOptimizePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [optimizationTarget, setOptimizationTarget] = useState("web")
  const [quality, setQuality] = useState("balanced")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleOptimize = async () => {
    if (!uploadedFile) return
    
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
                  <Zap className="mr-2 h-3 w-3" />
                  Video Optimizer
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Optimize Videos for
                <span className="block text-purple-600">Any Platform</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Optimize videos for web, mobile, streaming, and social media platforms. 
                Reduce file size while maintaining quality for faster loading and better performance.
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
                        Optimization Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Optimization Target</Label>
                        <RadioGroup value={optimizationTarget} onValueChange={setOptimizationTarget}>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="web" id="web" />
                              <Label htmlFor="web" className="font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Web Streaming (Balanced quality & size)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mobile" id="mobile" />
                              <Label htmlFor="mobile" className="font-medium flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                Mobile Devices (Smaller size, faster loading)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="social" id="social" />
                              <Label htmlFor="social" className="font-medium">
                                Social Media (Platform optimized)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="streaming" id="streaming" />
                              <Label htmlFor="streaming" className="font-medium">
                                Video Streaming (Adaptive bitrate)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="email" id="email" />
                              <Label htmlFor="email" className="font-medium">
                                Email Attachment (Maximum compression)
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Quality vs Size Balance</Label>
                        <RadioGroup value={quality} onValueChange={setQuality}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="quality" id="quality" />
                            <Label htmlFor="quality" className="font-medium">Prioritize Quality</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="balanced" id="balanced" />
                            <Label htmlFor="balanced" className="font-medium">Balanced (Recommended)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="size" id="size" />
                            <Label htmlFor="size" className="font-medium">Prioritize Small Size</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Optimization Preview</h4>
                        <div className="text-sm text-purple-700 space-y-1">
                          {optimizationTarget === "web" && (
                            <>
                              <p>• Optimized for web browsers and streaming</p>
                              <p>• H.264 codec with web-friendly settings</p>
                              <p>• Balanced quality and file size</p>
                            </>
                          )}
                          {optimizationTarget === "mobile" && (
                            <>
                              <p>• Optimized for mobile devices</p>
                              <p>• Reduced resolution and bitrate</p>
                              <p>• Fast loading on cellular networks</p>
                            </>
                          )}
                          {optimizationTarget === "social" && (
                            <>
                              <p>• Optimized for social media platforms</p>
                              <p>• Platform-specific encoding settings</p>
                              <p>• Maximum compatibility</p>
                            </>
                          )}
                          {optimizationTarget === "streaming" && (
                            <>
                              <p>• Optimized for video streaming services</p>
                              <p>• Adaptive bitrate encoding</p>
                              <p>• Multiple quality levels</p>
                            </>
                          )}
                          {optimizationTarget === "email" && (
                            <>
                              <p>• Maximum compression for email</p>
                              <p>• Smallest possible file size</p>
                              <p>• Suitable for email attachments</p>
                            </>
                          )}
                        </div>
                      </div>

                      <Button 
                        onClick={handleOptimize} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Optimizing Video...</>
                        ) : (
                          <>
                            <Zap className="mr-2 h-5 w-5" />
                            Optimize Video
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
                    <CardTitle>Optimization Targets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Web Streaming</h4>
                      <p className="text-sm text-gray-600">
                        Perfect balance for websites and online platforms
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Mobile Devices</h4>
                      <p className="text-sm text-gray-600">
                        Optimized for smartphones and tablets
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Social Media</h4>
                      <p className="text-sm text-gray-600">
                        Platform-specific optimization for social networks
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
                      <span>Platform optimization</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Smart compression</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Fast processing</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Website embedding</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Social media uploads</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Mobile streaming</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Email sharing</span>
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
