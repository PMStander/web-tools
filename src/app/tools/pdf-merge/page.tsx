"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  GitMerge,
  Download,
  Upload,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Star,
  AlertCircle
} from "lucide-react"

interface UploadedFile {
  fileId: string
  fileName: string
  fileSize: number
  originalFile: File
}

interface MergeResult {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  error?: string
}

export default function PDFMergePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Track when component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Upload files to server and get file IDs
  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    setError(null)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || `Failed to upload ${file.name}`)
        }

        return {
          fileId: result.fileId,
          fileName: result.fileName,
          fileSize: result.fileSize,
          originalFile: file
        }
      })

      const uploadedFileData = await Promise.all(uploadPromises)
      setUploadedFiles(prev => [...prev, ...uploadedFileData])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  const handleMerge = async () => {
    if (uploadedFiles.length < 2) return

    setIsProcessing(true)
    setProcessingProgress(0)
    setError(null)

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 300)

    try {
      const response = await fetch('/api/tools/pdf/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileIds: uploadedFiles.map(f => f.fileId),
          outputName: 'merged-document.pdf'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to merge PDFs')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to merge PDFs')
      }

      setProcessingProgress(100)
      setMergeResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge PDFs')
    } finally {
      setIsProcessing(false)
      clearInterval(progressInterval)
    }
  }

  const handleDownload = async () => {
    if (!mergeResult?.downloadUrl) return

    try {
      const response = await fetch(mergeResult.downloadUrl)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = mergeResult.outputFileName || 'merged-document.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file')
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    // Clear merge result if files change
    setMergeResult(null)
    setError(null)
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
                  <GitMerge className="mr-2 h-3 w-3" />
                  PDF Merging Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Merge PDF
                <span className="block text-red-600">Files</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Combine multiple PDF files into a single document with drag-and-drop simplicity.
                Perfect for consolidating reports, presentations, and documents.
              </p>
            </div>
          </div>
        </section>

        {/* Main Tool Interface */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload and Processing */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload PDF Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onUpload={uploadFiles}
                      accept={{ 'application/pdf': ['.pdf'] }}
                      maxFiles={10}
                      maxSize={100 * 1024 * 1024}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Upload multiple PDF files to merge them into one document
                    </p>
                    {isUploading && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-blue-600">Uploading files...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Files to Merge ({uploadedFiles.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {uploadedFiles.map((file, index) => (
                        <div key={file.fileId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-medium">{file.fileName}</p>
                              <p className="text-sm text-gray-600">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">#{index + 1}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}

                      {uploadedFiles.length >= 2 && !isProcessing && !mergeResult && (
                        <Button
                          onClick={handleMerge}
                          className="w-full"
                          size="lg"
                          disabled={!isMounted || isUploading}
                        >
                          <GitMerge className="mr-2 h-5 w-5" />
                          Merge {uploadedFiles.length} PDFs
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Processing Status */}
                {isProcessing && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <GitMerge className="h-8 w-8 mx-auto text-red-600 animate-pulse" />
                        <div>
                          <h3 className="font-semibold">Merging PDFs...</h3>
                          <p className="text-sm text-gray-600">Please wait while we combine your files</p>
                        </div>
                        <Progress value={processingProgress} className="w-full" />
                        <p className="text-sm text-gray-500">{processingProgress}% complete</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Error Display */}
                {error && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">Error</p>
                      </div>
                      <p className="text-red-600 mt-2">{error}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Success Result */}
                {mergeResult && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        Merge Complete!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-green-600">
                        Successfully merged {uploadedFiles.length} PDF files into one document.
                      </p>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleDownload}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Download Merged PDF
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setMergeResult(null)
                          setUploadedFiles([])
                          setProcessingProgress(0)
                          setError(null)
                        }}
                      >
                        Merge More Files
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Info Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Unlimited file merging</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Preserve original quality</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Secure processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Fast processing</span>
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
                      <span className="text-sm">Upload PDF files</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm">Arrange file order</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download merged PDF</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-600">
                    <p>• Files will be merged in the order you upload them</p>
                    <p>• You can remove files before merging</p>
                    <p>• All text and images are preserved</p>
                    <p>• Bookmarks and links are maintained</p>
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
                Why Use Our PDF Merger?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional-grade PDF merging with advanced features and security.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <GitMerge className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Merging</h3>
                <p className="text-gray-600">
                  Intelligently combine PDFs while preserving formatting and structure.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-gray-600">
                  Process multiple large PDF files in seconds with optimized algorithms.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-gray-600">
                  Your files are processed securely and deleted automatically after download.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
