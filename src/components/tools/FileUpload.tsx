"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, File, Image, Video, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number // in bytes
  onUpload: (files: File[]) => Promise<void>
  preview?: boolean
  aiValidation?: boolean
  batchProcessing?: boolean
  className?: string
}

interface UploadedFile extends File {
  id: string
  preview?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export function FileUpload({
  accept,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024, // 50MB default
  onUpload,
  preview = false,
  aiValidation = false,
  batchProcessing = false,
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileIdCounter = useRef(0)

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`
    }
    return null
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => {
      const error = validateFile(file)
      return {
        ...file,
        id: `file-${fileIdCounter.current++}`,
        status: error ? 'error' : 'pending',
        progress: 0,
        error,
        preview: preview && file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      } as UploadedFile
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [maxSize, preview])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    const validFiles = files.filter(f => f.status !== 'error')

    try {
      // Update files to uploading status
      setFiles(prev => prev.map(f =>
        validFiles.includes(f) ? { ...f, status: 'uploading' as const } : f
      ))

      // Simulate progress for each file
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.status === 'uploading' && f.progress < 100) {
            return { ...f, progress: Math.min(f.progress + 10, 100) }
          }
          return f
        }))
      }, 200)

      // Call the actual upload function
      await onUpload(validFiles)

      // Mark files as successful
      setFiles(prev => prev.map(f =>
        validFiles.includes(f) ? { ...f, status: 'success' as const, progress: 100 } : f
      ))

      clearInterval(progressInterval)
    } catch (error) {
      // Mark files as failed
      setFiles(prev => prev.map(f =>
        validFiles.includes(f) ? {
          ...f,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-primary bg-primary/5 scale-105"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={cn(
              "h-12 w-12 transition-colors",
              isDragActive ? "text-primary" : "text-gray-400"
            )} />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive ? "Drop files here" : "Upload your files"}
            </p>
            <p className="text-sm text-gray-500">
              Drag & drop files here, or click to browse
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">Max {maxFiles} files</Badge>
              <Badge variant="secondary">Up to {formatFileSize(maxSize)}</Badge>
              {aiValidation && <Badge variant="outline">AI Validation</Badge>}
              {batchProcessing && <Badge variant="outline">Batch Processing</Badge>}
            </div>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm"
              >
                {preview && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                    {getFileIcon(file)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(file.size)}
                    </Badge>
                  </div>

                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{file.progress}% uploaded</p>
                    </div>
                  )}

                  {file.status === 'error' && file.error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {file.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {file.status === 'success' && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">Upload complete</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={uploading}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {files.some(f => f.status === 'pending') && (
            <Button
              onClick={handleUpload}
              disabled={uploading || files.every(f => f.status === 'error')}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Processing {files.filter(f => f.status === 'uploading').length} files...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {files.filter(f => f.status === 'pending').length} files
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
