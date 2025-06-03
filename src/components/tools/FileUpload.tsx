"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { X, Upload, File, Image as ImageIcon, Video, FileText, CheckCircle2 } from "lucide-react"
import { cn, formatFileSize, getFileIcon } from "@/lib/utils"
import Image from "next/image"
 
interface FileUploadProps {
  // New interface (preferred)
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number // in bytes
  onUpload?: (files: File[]) => Promise<void>

  // Legacy interface (for backward compatibility)
  onFileSelect?: (file: File) => void
  acceptedTypes?: string[]

  // Common props
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

// Helper function to convert acceptedTypes to accept format
const convertAcceptedTypes = (acceptedTypes: string[]): Record<string, string[]> => {
  const accept: Record<string, string[]> = {}

  acceptedTypes.forEach(type => {
    if (type.startsWith('.')) {
      // File extension
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska'
      }
      const mimeType = mimeTypes[type as keyof typeof mimeTypes] || '*/*'
      if (!accept[mimeType]) {
        accept[mimeType] = []
      }
      accept[mimeType].push(type)
    }
  })

  return accept
}

export function FileUpload({
  // New interface props
  accept,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024, // 50MB default
  onUpload,

  // Legacy interface props
  onFileSelect,
  acceptedTypes,

  // Common props
  preview = false,
  aiValidation = false,
  batchProcessing = false,
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Track when component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Cleanup preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  // Determine which interface is being used
  const isLegacyMode = !!onFileSelect && !onUpload

  // Convert acceptedTypes to accept format if using legacy interface
  const finalAccept = isLegacyMode && acceptedTypes
    ? convertAcceptedTypes(acceptedTypes)
    : accept

  const getFileIconComponent = (file: File | UploadedFile) => {
    // Handle both File and UploadedFile types safely
    if (!file) return <File className="h-4 w-4" />

    const fileType = file.type || ''
    const iconType = getFileIcon(fileType)
    switch (iconType) {
      case 'Image': return <ImageIcon className="h-4 w-4" />
      case 'Video': return <Video className="h-4 w-4" />
      case 'FileText': return <FileText className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`
    }
    return null
  }, [maxSize])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (isLegacyMode && onFileSelect && acceptedFiles.length > 0) {
      // Legacy mode: immediately call onFileSelect with the first file
      onFileSelect(acceptedFiles[0])
      return
    }

    const newFiles: UploadedFile[] = acceptedFiles.map((file) => {
      const error = validateFile(file)
      return {
        ...file,
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        status: error ? 'error' : 'pending',
        progress: 0,
        error,
        preview: preview && file.type && file.type.startsWith('image/') && isMounted ? URL.createObjectURL(file) : undefined
      } as UploadedFile
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [preview, isLegacyMode, onFileSelect, isMounted, validateFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: finalAccept,
    maxFiles,
    onDragEnter: () => isMounted && setDragActive(true),
    onDragLeave: () => isMounted && setDragActive(false),
  })

  // Use our local dragActive state for consistent hydration
  const showDragActive = isMounted && (isDragActive || dragActive)

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleUpload = async () => {
    if (files.length === 0 || !onUpload) return

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
          showDragActive
            ? "border-primary bg-primary/5 scale-105"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={cn(
              "h-12 w-12 transition-colors",
              showDragActive ? "text-primary" : "text-gray-400"
            )} />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {showDragActive ? "Drop files here" : "Upload your files"}
            </p>
            <p className="text-sm text-gray-500">
              Drag & drop files here, or click to browse
            </p>
            {isMounted && (
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Max {maxFiles} files</Badge>
                <Badge variant="secondary">Up to {formatFileSize(maxSize)}</Badge>
                {aiValidation && <Badge variant="outline">AI Validation</Badge>}
                {batchProcessing && <Badge variant="outline">Batch Processing</Badge>}
              </div>
            )}
          </div>
        </div>
      </div>

      {isMounted && files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm"
              >
                {preview && file.preview ? (
                  <Image
                    src={file.preview}
                    alt={file.name}
                    width={48}
                    height={48}
                    className="object-cover rounded"
                    unoptimized
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                    {getFileIconComponent(file)}
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
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                      {file.error}
                    </div>
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

          {!isLegacyMode && isMounted && files.some(f => f.status === 'pending') && (
            <Button
              onClick={handleUpload}
              disabled={!isMounted || uploading || files.every(f => f.status === 'error')}
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
