import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'

// Set FFmpeg and FFprobe paths
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}
if (ffprobeStatic.path) {
  ffmpeg.setFfprobePath(ffprobeStatic.path)
}

interface VideoCompressRequest {
  fileId: string
  compressionLevel: 'light' | 'medium' | 'heavy' | 'extreme'
  targetSize?: number // Target file size in MB
  maxBitrate?: string // e.g., '2M', '500k'
  maintainQuality?: boolean
  outputFormat?: 'mp4' | 'webm' | 'avi'
  outputName?: string
}

interface VideoCompressResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalSize?: number
  compressedSize?: number
  compressionRatio?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

const COMPRESSION_PRESETS = {
  light: { crf: '23', preset: 'medium', scale: '1.0' },
  medium: { crf: '28', preset: 'medium', scale: '0.8' },
  heavy: { crf: '32', preset: 'fast', scale: '0.6' },
  extreme: { crf: '35', preset: 'fast', scale: '0.5' }
}

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

// Compress video using FFmpeg
async function compressVideo(
  inputPath: string,
  outputPath: string,
  options: VideoCompressRequest
): Promise<{ success: boolean; error?: string; originalSize: number; compressedSize: number }> {
  return new Promise(async (resolve) => {
    try {
      const originalStats = await import('fs/promises').then(fs => fs.stat(inputPath))
      const originalSize = originalStats.size
      
      const preset = COMPRESSION_PRESETS[options.compressionLevel]
      
      console.log('Compressing video with FFmpeg:', {
        input: inputPath,
        output: outputPath,
        compressionLevel: options.compressionLevel,
        targetSize: options.targetSize,
        maxBitrate: options.maxBitrate
      })
      
      let command = ffmpeg(inputPath)
      
      // Set output format
      const outputFormat = options.outputFormat || 'mp4'
      command = command.format(outputFormat)
      
      // Set video codec for compression
      command = command.videoCodec('libx264')
      
      // Apply compression settings
      command = command.addOption('-crf', preset.crf)
      command = command.addOption('-preset', preset.preset)
      
      // Scale video if needed
      if (preset.scale !== '1.0') {
        command = command.videoFilter(`scale=iw*${preset.scale}:ih*${preset.scale}`)
      }
      
      // Set maximum bitrate if specified
      if (options.maxBitrate) {
        command = command.videoBitrate(options.maxBitrate)
      }
      
      // Two-pass encoding for better compression if targeting specific size
      if (options.targetSize) {
        const targetBitrate = Math.round((options.targetSize * 8 * 1024) / 120) // Rough calculation for 2-minute video
        command = command.videoBitrate(`${targetBitrate}k`)
        command = command.addOption('-maxrate', `${Math.round(targetBitrate * 1.5)}k`)
        command = command.addOption('-bufsize', `${Math.round(targetBitrate * 2)}k`)
      }
      
      // Maintain quality settings
      if (options.maintainQuality) {
        command = command.addOption('-preset', 'slow') // Better quality preset
        command = command.addOption('-tune', 'film')
      }
      
      // Execute compression
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg compression command:', commandLine)
        })
        .on('progress', (progress) => {
          console.log('Compression progress: ' + progress.percent + '% done')
        })
        .on('end', async () => {
          try {
            const compressedStats = await import('fs/promises').then(fs => fs.stat(outputPath))
            const compressedSize = compressedStats.size
            
            console.log('Video compression completed successfully')
            console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`)
            console.log(`Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`)
            console.log(`Compression ratio: ${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`)
            
            resolve({ success: true, originalSize, compressedSize })
          } catch (error) {
            resolve({ success: false, error: 'Failed to get compressed file stats', originalSize, compressedSize: 0 })
          }
        })
        .on('error', (err) => {
          console.error('FFmpeg compression error:', err.message)
          resolve({ success: false, error: err.message, originalSize, compressedSize: 0 })
        })
        .save(outputPath)
        
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        originalSize: 0,
        compressedSize: 0
      })
    }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: VideoCompressRequest = await request.json()
    const { fileId, compressionLevel, outputFormat = 'mp4', outputName } = body
    
    if (!fileId) {
      return NextResponse.json<VideoCompressResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!compressionLevel) {
      return NextResponse.json<VideoCompressResponse>({
        success: false,
        error: 'Compression level is required'
      }, { status: 400 })
    }
    
    const supportedLevels = ['light', 'medium', 'heavy', 'extreme']
    if (!supportedLevels.includes(compressionLevel)) {
      return NextResponse.json<VideoCompressResponse>({
        success: false,
        error: `Unsupported compression level. Supported levels: ${supportedLevels.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate video file exists
    if (!existsSync(inputPath)) {
      return NextResponse.json<VideoCompressResponse>({
        success: false,
        error: 'Video file not found'
      }, { status: 404 })
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat
    const baseOutputName = outputName || `compressed-video.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Compress video
    const { success, error, originalSize, compressedSize } = await compressVideo(inputPath, body)
    
    if (!success) {
      return NextResponse.json<VideoCompressResponse>({
        success: false,
        error: error || 'Video compression failed'
      }, { status: 500 })
    }
    
    const processingTime = Date.now() - startTime
    const compressionRatio = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100) : 0
    
    // Log compression operation
    const compressionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      compressionLevel,
      originalSize,
      compressedSize,
      compressionRatio,
      outputFormat,
      processingTime,
      inputFile: fileId,
      options: body,
      createdAt: new Date().toISOString()
    }
    
    console.log('Video compression completed:', compressionMetadata)
    
    return NextResponse.json<VideoCompressResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Video compression error:', error)
    
    return NextResponse.json<VideoCompressResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during video compression',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for compression info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  
  if (!fileId) {
    return NextResponse.json({
      success: false,
      error: 'File ID is required'
    }, { status: 400 })
  }
  
  const inputPath = join(UPLOAD_DIR, fileId)
  
  try {
    // Get video metadata using FFprobe
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) reject(err)
        else resolve(metadata)
      })
    }) as any
    
    const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video')
    const stats = await import('fs/promises').then(fs => fs.stat(inputPath))
    
    const info = {
      duration: metadata.format.duration || 0,
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
      bitrate: metadata.format.bit_rate ? `${Math.round(parseInt(metadata.format.bit_rate) / 1000)}k` : '0k',
      codec: videoStream?.codec_name || 'unknown',
      size: stats.size,
      compressionLevels: [
        { value: 'light', label: 'Light Compression', description: 'Minimal quality loss, ~20% size reduction' },
        { value: 'medium', label: 'Medium Compression', description: 'Balanced quality/size, ~40% size reduction' },
        { value: 'heavy', label: 'Heavy Compression', description: 'Noticeable quality loss, ~60% size reduction' },
        { value: 'extreme', label: 'Extreme Compression', description: 'Significant quality loss, ~80% size reduction' }
      ],
      outputFormats: ['mp4', 'webm', 'avi'],
      features: ['targetSize', 'maxBitrate', 'maintainQuality', 'progressTracking']
    }
    
    return NextResponse.json({
      success: true,
      data: info
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid video file or unable to read metadata'
    }, { status: 400 })
  }
}
