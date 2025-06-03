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
  Split,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Plus,
  Minus
} from "lucide-react"

export default function VideoSplitPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [splitMode, setSplitMode] = useState("equal")
  const [segmentCount, setSegmentCount] = useState("4")
  const [splitPoints, setSplitPoints] = useState(["00:01:00", "00:02:00", "00:03:00"])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleSplit = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 4000))
    setIsProcessing(false)
  }

  const addSplitPoint = () => {
    setSplitPoints([...splitPoints, "00:00:00"])
  }

  const removeSplitPoint = (index: number) => {
    setSplitPoints(splitPoints.filter((_, i) => i !== index))
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
                  <Split className="mr-2 h-3 w-3" />
                  Video Splitter
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Split Videos into
                <span className="block text-purple-600">Multiple Parts</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Split large videos into smaller segments with precise timing control. 
                Perfect for creating chapters, highlights, or manageable file sizes.
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
                        Split Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Split Mode</Label>
                        <RadioGroup value={splitMode} onValueChange={setSplitMode}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="equal" id="equal" />
                            <Label htmlFor="equal" className="font-medium">Equal Duration Segments</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="font-medium">Custom Split Points</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="size" id="size" />
                            <Label htmlFor="size" className="font-medium">Split by File Size</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {splitMode === "equal" && (
                        <div className="space-y-2">
                          <Label htmlFor="segmentCount">Number of Segments</Label>
                          <select 
                            id="segmentCount"
                            value={segmentCount}
                            onChange={(e) => setSegmentCount(e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="2">2 segments</option>
                            <option value="3">3 segments</option>
                            <option value="4">4 segments</option>
                            <option value="5">5 segments</option>
                            <option value="6">6 segments</option>
                            <option value="8">8 segments</option>
                            <option value="10">10 segments</option>
                          </select>
                          <p className="text-sm text-gray-600">
                            Video will be split into {segmentCount} equal parts
                          </p>
                        </div>
                      )}

                      {splitMode === "custom" && (
                        <div className="space-y-2">
                          <Label>Split Points (Time positions)</Label>
                          <div className="space-y-2">
                            {splitPoints.map((point, index) => (
                              <div key={index} className="flex gap-2 items-center">
                                <Input
                                  type="time"
                                  step="1"
                                  value={point}
                                  onChange={(e) => {
                                    const newPoints = [...splitPoints]
                                    newPoints[index] = e.target.value
                                    setSplitPoints(newPoints)
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeSplitPoint(index)}
                                  disabled={splitPoints.length <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addSplitPoint}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Split Point
                            </Button>
                          </div>
                        </div>
                      )}

                      {splitMode === "size" && (
                        <div className="space-y-2">
                          <Label>Target File Size per Segment</Label>
                          <RadioGroup defaultValue="100mb">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="50mb" id="50mb" />
                              <Label htmlFor="50mb" className="font-medium">50 MB per segment</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="100mb" id="100mb" />
                              <Label htmlFor="100mb" className="font-medium">100 MB per segment</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="250mb" id="250mb" />
                              <Label htmlFor="250mb" className="font-medium">250 MB per segment</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="500mb" id="500mb" />
                              <Label htmlFor="500mb" className="font-medium">500 MB per segment</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Output Preview</h4>
                        <p className="text-sm text-purple-700">
                          {splitMode === "equal" && `Video will be split into ${segmentCount} equal segments`}
                          {splitMode === "custom" && `Video will be split at ${splitPoints.length} custom time points`}
                          {splitMode === "size" && "Video will be split based on target file size"}
                        </p>
                      </div>

                      <Button 
                        onClick={handleSplit} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Splitting Video...</>
                        ) : (
                          <>
                            <Split className="mr-2 h-5 w-5" />
                            Split Video
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
                    <CardTitle>Split Methods</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Equal Duration</h4>
                      <p className="text-sm text-gray-600">
                        Split into segments of equal time length
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Custom Points</h4>
                      <p className="text-sm text-gray-600">
                        Define exact time positions for splits
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">File Size</h4>
                      <p className="text-sm text-gray-600">
                        Split based on target file size limits
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
                      <span>Precise timing control</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple split methods</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Quality preservation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Batch download</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Creating chapters</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• File size management</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Highlight reels</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Social media clips</span>
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
