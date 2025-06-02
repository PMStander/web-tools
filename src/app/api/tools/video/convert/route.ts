import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { spawn } from 'child_process'

interface VideoConvertRequest {
  fileId: string
  outputFormat: 'mp4' | 'avi' | 'mov' | 'webm' | 'mkv'
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  resolution?: string // e.g., "1920x1080", "1280x720"
  fps?: number
  bitrate?: string // e.g., "2M", "5M"
  codec?: 'h264' | 'h265' | 'vp9' | 'av1'
  outputName?: string
}

interface VideoConvertResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalSize?: number
  convertedSize?: number
  compressionRatio?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

// Quality presets
const QUALITY_PRESETS = {
  low: { crf: '28', preset: 'fast', bitrate: '1M' },
  medium: { crf: '23', preset: 'medium', bitrate: '3M' },
  high: { crf: '18', preset: 'slow', bitrate: '8M' },
  ultra: { crf: '15', preset: 'veryslow', bitrate: '15M' }
}

async function ensureOutputDir() {
  try {
    const { mkdir } = await import('fs/promises')
    await mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create output directory:', error)
  }
}

// Convert video using FFmpeg (simulated for demo)
async function convertVideo(
  inputPath: string,
  outputPath: string,
  options: VideoConvertRequest
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    // In production, this would use actual FFmpeg
    // For demo purposes, we'll simulate the conversion
    
    const quality = options.quality || 'medium'
    const preset = QUALITY_PRESETS[quality]
    
    console.log('Simulating video conversion with options:', {
      input: inputPath,
      output: outputPath,
      format: options.outputFormat,
      quality: options.quality,
      resolution: options.resolution,
      fps: options.fps,
      codec: options.codec
    })
    
    // Simulate processing time
    setTimeout(async () => {
      try {
        // For demo, copy the input file to output with new extension
        const inputBuffer = await readFile(inputPath)
        await writeFile(outputPath, inputBuffer)
        
        resolve({ success: true })
      } catch (error) {
        resolve({ success: false, error: 'Conversion failed' })
      }
    }, 3000) // Simulate 3 second processing
  })
}

// Get video metadata (simulated)
async function getVideoMetadata(filePath: string): Promise<{
  duration: number
  width: number
  height: number
  fps: number
  bitrate: string
  codec: string
  size: number
}> {
  // In production, use ffprobe to get actual metadata
  const stats = await import('fs/promises').then(fs => fs.stat(filePath))
  
  return {
    duration: 120, // 2 minutes (simulated)
    width: 1920,
    height: 1080,
    fps: 30,
    bitrate: '5M',
    codec: 'h264',
    size: stats.size
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: VideoConvertRequest = await request.json()
    const {
      fileId,
      outputFormat,
      quality = 'medium',
      resolution,
      fps,
      codec = 'h264',
      outputName
    } = body
    
    if (!fileId) {
      return NextResponse.json<VideoConvertResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!outputFormat) {
      return NextResponse.json<VideoConvertResponse>({
        success: false,
        error: 'Output format is required'
      }, { status: 400 })
    }
    
    if (!['mp4', 'avi', 'mov', 'webm', 'mkv'].includes(outputFormat)) {
      return NextResponse.json<VideoConvertResponse>({
        success: false,
        error: 'Invalid output format'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Get original video metadata
    const originalMetadata = await getVideoMetadata(inputPath)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `converted-video.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Convert video
    const conversionResult = await convertVideo(inputPath, outputPath, body)
    
    if (!conversionResult.success) {
      return NextResponse.json<VideoConvertResponse>({
        success: false,
        error: conversionResult.error || 'Video conversion failed'
      }, { status: 500 })
    }
    
    // Get converted file size
    const convertedStats = await import('fs/promises').then(fs => fs.stat(outputPath))
    const convertedSize = convertedStats.size
    const compressionRatio = ((originalMetadata.size - convertedSize) / originalMetadata.size) * 100
    
    const processingTime = Date.now() - startTime
    
    // Log conversion metadata
    const conversionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: convertedSize,
      mimeType: `video/${outputFormat}`,
      createdAt: new Date().toISOString(),
      processingTime,
      inputFile: fileId,
      originalMetadata,
      conversionOptions: body,
      compressionRatio
    }
    
    console.log('Video conversion completed:', conversionMetadata)
    
    return NextResponse.json<VideoConvertResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalSize: originalMetadata.size,
      convertedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Video conversion error:', error)
    
    return NextResponse.json<VideoConvertResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during video conversion',
      processingTime
    }, { status: 500 })
  }
}

// Get video info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID required'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    try {
      const metadata = await getVideoMetadata(inputPath)
      
      return NextResponse.json({
        success: true,
        data: {
          ...metadata,
          supportedFormats: ['mp4', 'avi', 'mov', 'webm', 'mkv'],
          supportedCodecs: ['h264', 'h265', 'vp9', 'av1'],
          qualityOptions: ['low', 'medium', 'high', 'ultra']
        }
      })
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid video file'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Video info error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
