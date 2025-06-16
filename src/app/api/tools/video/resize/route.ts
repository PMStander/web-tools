import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface ResizeRequest {
  fileId: string
  width?: number
  height?: number
  maintainAspectRatio?: boolean
  scalingMethod?: 'fit' | 'fill' | 'stretch'
  outputFormat?: 'mp4' | 'avi' | 'mov' | 'webm'
  quality?: 'low' | 'medium' | 'high'
  outputName?: string
}

interface ResizeResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalDimensions?: { width: number; height: number }
  newDimensions?: { width: number; height: number }
  processingTime?: number
  error?: string
}

// FileService handles directory paths
// FileService handles directory paths

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

// Helper function to find uploaded file by ID
async function findUploadedFile(fileId: string): Promise<string | null> {
  // First try to find metadata file
  const metadataPath = join(UPLOAD_DIR, `${fileId}.json`)
  try {
    const metadataBuffer = await readFile(metadataPath)
    const metadata = JSON.parse(metadataBuffer.toString())
    return metadata.uploadPath
  } catch (error) {
    // Fallback: search for file starting with fileId
    try {
      const { readdir } = await import('fs/promises')
      const files = await readdir(UPLOAD_DIR)
      const matchingFile = files.find(file => file.startsWith(fileId))
      if (matchingFile) {
        return join(UPLOAD_DIR, matchingFile)
      }
    } catch (dirError) {
      console.error('Error reading upload directory:', dirError)
    }
  }
  return null
}

// Get video metadata using ffprobe
async function getVideoMetadata(filePath: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const ffprobe = require('fluent-ffmpeg').ffprobe
    
    ffprobe(filePath, (err: any, metadata: any) => {
      if (err) {
        reject(err)
        return
      }
      
      const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video')
      if (!videoStream) {
        reject(new Error('No video stream found'))
        return
      }
      
      resolve({
        width: videoStream.width,
        height: videoStream.height,
        duration: parseFloat(metadata.format.duration) || 0
      })
    })
  })
}

// Resize video using ffmpeg
async function resizeVideo(
  inputPath: string,
  outputPath: string,
  options: Pick<ResizeRequest, 'width' | 'height' | 'maintainAspectRatio' | 'scalingMethod' | 'outputFormat' | 'quality'>
): Promise<{ originalDimensions: { width: number; height: number }; newDimensions: { width: number; height: number } }> {
  return new Promise(async (resolve, reject) => {
    try {
      const ffmpeg = require('fluent-ffmpeg')
      const originalMetadata = await getVideoMetadata(inputPath)
      const { width: origWidth, height: origHeight } = originalMetadata
      
      let targetWidth = options.width || origWidth
      let targetHeight = options.height || origHeight
      
      // Handle aspect ratio maintenance
      if (options.maintainAspectRatio && options.width && options.height) {
        const aspectRatio = origWidth / origHeight
        const targetAspectRatio = options.width / options.height
        
        if (options.scalingMethod === 'fit') {
          // Fit within bounds, maintaining aspect ratio
          if (aspectRatio > targetAspectRatio) {
            targetHeight = Math.round(options.width / aspectRatio)
            targetWidth = options.width
          } else {
            targetWidth = Math.round(options.height * aspectRatio)
            targetHeight = options.height
          }
        } else if (options.scalingMethod === 'fill') {
          // Fill bounds, crop if necessary
          if (aspectRatio > targetAspectRatio) {
            targetWidth = Math.round(options.height * aspectRatio)
            targetHeight = options.height
          } else {
            targetHeight = Math.round(options.width / aspectRatio)
            targetWidth = options.width
          }
        }
        // stretch mode uses exact dimensions
      }
      
      // Quality settings
      const qualitySettings = {
        low: { crf: 28, preset: 'fast' },
        medium: { crf: 23, preset: 'medium' },
        high: { crf: 18, preset: 'slow' }
      }
      
      const quality = qualitySettings[options.quality || 'medium']
      
      let command = ffmpeg(inputPath)
        .size(`${targetWidth}x${targetHeight}`)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          `-crf ${quality.crf}`,
          `-preset ${quality.preset}`,
          '-movflags +faststart'
        ])
      
      // Handle different scaling methods for cropping
      if (options.scalingMethod === 'fill' && options.maintainAspectRatio) {
        command = command.outputOptions([
          `-vf scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${options.width || targetWidth}:${options.height || targetHeight}`
        ])
      }
      
      command
        .output(outputPath)
        .on('start', (commandLine: string) => {
          console.log('Video resize started:', commandLine)
        })
        .on('progress', (progress: any) => {
          console.log(`Video resize progress: ${Math.round(progress.percent || 0)}%`)
        })
        .on('end', () => {
          resolve({
            originalDimensions: { width: origWidth, height: origHeight },
            newDimensions: { width: targetWidth, height: targetHeight }
          })
        })
        .on('error', (err: Error) => {
          reject(err)
        })
        .run()
        
    } catch (error) {
      reject(error)
    }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: ResizeRequest = await request.json()
    const { 
      fileId, 
      width, 
      height, 
      maintainAspectRatio = true,
      scalingMethod = 'fit',
      outputFormat = 'mp4',
      quality = 'medium',
      outputName
    } = body
    
    if (!fileId) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!width && !height) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'At least width or height must be specified'
      }, { status: 400 })
    }
    
    const supportedFormats = ['mp4', 'avi', 'mov', 'webm']
    if (!supportedFormats.includes(outputFormat)) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: `Unsupported output format. Supported formats: ${supportedFormats.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = await findUploadedFile(fileId)
    if (!inputPath) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }

    // Validate video file
    try {
      await getVideoMetadata(inputPath)
    } catch (error) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'Invalid or corrupted video file'
      }, { status: 400 })
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `resized-video.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Resize video
    const { originalDimensions, newDimensions } = await resizeVideo(inputPath, outputPath, {
      width,
      height,
      maintainAspectRatio,
      scalingMethod,
      outputFormat,
      quality
    })
    
    const processingTime = Date.now() - startTime
    
    // Get file size
    const stats = await import('fs/promises').then(fs => fs.stat(outputPath))
    
    // Log resize operation
    const resizeMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: stats.size,
      mimeType: `video/${outputFormat}`,
      originalDimensions,
      newDimensions,
      width,
      height,
      maintainAspectRatio,
      scalingMethod,
      outputFormat,
      quality,
      processingTime,
      inputFile: fileId,
      createdAt: new Date().toISOString()
    }
    
    console.log('Video resize completed:', resizeMetadata)
    
    return NextResponse.json<ResizeResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalDimensions,
      newDimensions,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Video resize error:', error)
    
    return NextResponse.json<ResizeResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during video resize',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for video info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  
  if (!fileId) {
    return NextResponse.json({
      success: false,
      error: 'File ID is required'
    }, { status: 400 })
  }
  
  const inputPath = await findUploadedFile(fileId)
  if (!inputPath) {
    return NextResponse.json({
      success: false,
      error: 'File not found'
    }, { status: 404 })
  }

  try {
    const metadata = await getVideoMetadata(inputPath)
    
    const info = {
      originalDimensions: {
        width: metadata.width,
        height: metadata.height
      },
      duration: metadata.duration,
      aspectRatio: (metadata.width / metadata.height).toFixed(2),
      supportedFormats: ['mp4', 'avi', 'mov', 'webm'],
      supportedQualities: ['low', 'medium', 'high'],
      supportedScalingMethods: ['fit', 'fill', 'stretch'],
      recommendations: {
        // Common video sizes
        hd: { width: 1280, height: 720 },
        fullHd: { width: 1920, height: 1080 },
        fourK: { width: 3840, height: 2160 },
        mobile: { width: 640, height: 360 },
        square: { width: 1080, height: 1080 }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: info
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid video file'
    }, { status: 400 })
  }
}