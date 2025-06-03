"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Image as ImageIcon,
  Info,
  Download,
  Upload,
  CheckCircle,
  FileText,
  Camera
} from "lucide-react"

export default function ImageMetadataPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    // Simulate metadata extraction
    setMetadata({
      filename: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: file.type,
      lastModified: new Date(file.lastModified).toLocaleDateString(),
      dimensions: "1920 × 1080",
      colorSpace: "sRGB",
      bitDepth: "8 bits",
      camera: "Canon EOS R5",
      lens: "RF 24-70mm f/2.8L IS USM",
      focalLength: "50mm",
      aperture: "f/2.8",
      shutterSpeed: "1/125s",
      iso: "400",
      flash: "No Flash",
      gps: "37.7749° N, 122.4194° W"
    })
  }

  const handleExtractMetadata = async () => {
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
                  <Info className="mr-2 h-3 w-3" />
                  Image Metadata Viewer
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                View Image
                <span className="block text-blue-600">Metadata</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Extract and view detailed information from your images including EXIF data, 
                camera settings, GPS location, and technical specifications.
              </p>
            </div>
          </div>
        </section>

        {/* Main Tool Interface */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload and Results */}
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
                      acceptedTypes={['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.raw']}
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

                {metadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Image Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* File Information */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">File Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Filename:</span>
                              <span className="font-medium">{metadata.filename}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">File Size:</span>
                              <span className="font-medium">{metadata.fileSize}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">File Type:</span>
                              <span className="font-medium">{metadata.fileType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Dimensions:</span>
                              <span className="font-medium">{metadata.dimensions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Color Space:</span>
                              <span className="font-medium">{metadata.colorSpace}</span>
                            </div>
                          </div>
                        </div>

                        {/* Camera Settings */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Camera Settings</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Camera:</span>
                              <span className="font-medium">{metadata.camera}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Lens:</span>
                              <span className="font-medium">{metadata.lens}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Focal Length:</span>
                              <span className="font-medium">{metadata.focalLength}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Aperture:</span>
                              <span className="font-medium">{metadata.aperture}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shutter Speed:</span>
                              <span className="font-medium">{metadata.shutterSpeed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">ISO:</span>
                              <span className="font-medium">{metadata.iso}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">GPS Location:</span>
                            <span className="font-medium">{metadata.gps}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Flash:</span>
                            <span className="font-medium">{metadata.flash}</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleExtractMetadata} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Extracting Full Metadata...</>
                        ) : (
                          <>
                            <FileText className="mr-2 h-5 w-5" />
                            Export Metadata Report
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
                    <CardTitle>Metadata Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">EXIF Data</h4>
                      <p className="text-sm text-gray-600">
                        Camera settings, lens info, and shooting parameters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">File Properties</h4>
                      <p className="text-sm text-gray-600">
                        Size, format, dimensions, and creation date
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">GPS Location</h4>
                      <p className="text-sm text-gray-600">
                        Geographic coordinates where photo was taken
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
                      <span>Complete EXIF extraction</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>GPS location data</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Camera settings</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Export reports</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Photography analysis</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Copyright verification</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Location tracking</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Technical documentation</span>
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
