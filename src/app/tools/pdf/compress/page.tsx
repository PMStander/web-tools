"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Compress, 
  Download,
  Upload,
  Settings,
  CheckCircle,
  TrendingDown,
  Zap,
  Shield
} from "lucide-react"

const compressionLevels = [
  {
    id: "low",
    name: "Low Compression",
    description: "Minimal compression, highest quality",
    reduction: "10-20%",
    quality: "Excellent"
  },
  {
    id: "medium",
    name: "Medium Compression",
    description: "Balanced compression and quality",
    reduction: "30-50%",
    quality: "Very Good"
  },
  {
    id: "high",
    name: "High Compression",
    description: "Strong compression, good quality",
    reduction: "50-70%",
    quality: "Good"
  },
  {
    id: "maximum",
    name: "Maximum Compression",
    description: "Highest compression, acceptable quality",
    reduction: "70-85%",
    quality: "Acceptable"
  }
]

export default function PDFCompressPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [compressionLevel, setCompressionLevel] = useState("medium")
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressionResult, setCompressionResult] = useState<{
    originalSize: number
    compressedSize: number
    reduction: number
  } | null>(null)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setCompressionResult(null)
  }

  const handleCompress = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    
    // Simulate compression
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mock compression results
    const originalSize = uploadedFile.size
    const reductionPercent = compressionLevel === "low" ? 15 :
                           compressionLevel === "medium" ? 40 :
                           compressionLevel === "high" ? 60 : 75
    
    const compressedSize = originalSize * (1 - reductionPercent / 100)
    
    setCompressionResult({
      originalSize,
      compressedSize,
      reduction: reductionPercent
    })
    
    setIsProcessing(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Compress className="mr-2 h-3 w-3" />
                  PDF Compression Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Compress PDF
                <span className="block text-red-600">Files</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Reduce PDF file size while maintaining quality with intelligent compression. 
                Perfect for email attachments, web uploads, and storage optimization.
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
                      Upload PDF File
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.pdf']}
                      maxSize={100 * 1024 * 1024}
                    />
                    {uploadedFile && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>File uploaded: {uploadedFile.name}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Original size: {formatFileSize(uploadedFile.size)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {uploadedFile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Compression Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup value={compressionLevel} onValueChange={setCompressionLevel}>
                        {compressionLevels.map((level) => (
                          <div key={level.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value={level.id} id={level.id} className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor={level.id} className="font-medium cursor-pointer">
                                {level.name}
                              </Label>
                              <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                              <div className="flex gap-4 mt-2 text-xs">
                                <span className="text-blue-600">Size reduction: {level.reduction}</span>
                                <span className="text-green-600">Quality: {level.quality}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>

                      <Button 
                        onClick={handleCompress} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Compressing...</>
                        ) : (
                          <>
                            <Compress className="mr-2 h-5 w-5" />
                            Compress PDF
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Compression Results */}
                {compressionResult && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        Compression Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Original Size:</span>
                          <p className="font-medium">{formatFileSize(compressionResult.originalSize)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Compressed Size:</span>
                          <p className="font-medium">{formatFileSize(compressionResult.compressedSize)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Size Reduction</span>
                          <span className="font-medium text-green-600">{compressionResult.reduction}%</span>
                        </div>
                        <Progress value={compressionResult.reduction} className="h-2" />
                      </div>

                      <Button className="w-full" size="lg">
                        <Download className="mr-2 h-5 w-5" />
                        Download Compressed PDF
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Info Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compression Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span>Reduce file size by up to 85%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span>Faster uploads and downloads</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span>Maintain document security</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Preserve text and images</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Use Cases</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">Email Attachments</h4>
                      <p className="text-xs text-gray-600">Reduce size for email limits</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">Web Uploads</h4>
                      <p className="text-xs text-gray-600">Faster website uploads</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">Storage Optimization</h4>
                      <p className="text-xs text-gray-600">Save disk space</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">Mobile Sharing</h4>
                      <p className="text-xs text-gray-600">Reduce data usage</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        1
                      </div>
                      <span className="text-sm">Upload your PDF</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm">Choose compression level</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download compressed file</span>
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
