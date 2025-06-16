import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
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

// FileService handles directory paths
// FileService handles directory paths

// Quality presets
const QUALITY_PRESETS = {
  low: { crf: '28', preset: 'fast', bitrate: '1M' },
  medium: { crf: '23', preset: 'medium', bitrate: '3M' },
  high: { crf: '18', preset: 'slow', bitrate: '8M' },
  ultra: { crf: '15', preset: 'veryslow', bitrate: '15M' }
}

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

// Convert video using FFmpeg
async function convertVideo(
  inputPath: string,
  outputPath: string,
  options: VideoConvertRequest
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const quality = options.quality || 'medium'
    const preset = QUALITY_PRESETS[quality]

    console.log('Converting video with FFmpeg:', {
      input: inputPath,
      output: outputPath,
      format: options.outputFormat,
      quality: options.quality,
      resolution: options.resolution,
      fps: options.fps,
      codec: options.codec
    })

    let command = ffmpeg(inputPath)

    // Set output format
    command = command.format(options.outputFormat)

    // Set video codec
    if (options.codec) {
      const codecMap = {
        'h264': 'libx264',
        'h265': 'libx265',
        'vp9': 'libvpx-vp9',
        'av1': 'libaom-av1'
      }
      command = command.videoCodec(codecMap[options.codec] || 'libx264')
    }

    // Set quality/bitrate
    if (options.bitrate) {
      command = command.videoBitrate(options.bitrate)
    } else {
      command = command.addOption('-crf', preset.crf)
    }

    // Set resolution
    if (options.resolution) {
      command = command.size(options.resolution)
    }

    // Set FPS
    if (options.fps) {
      command = command.fps(options.fps)
    }

    // Set preset for encoding speed vs compression
    command = command.addOption('-preset', preset.preset)

    // Execute conversion
    command
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine)
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done')
      })
      .on('end', () => {
        console.log('Video conversion completed successfully')
        resolve({ success: true })
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err.message)
        resolve({ success: false, error: err.message })
      })
      .save(outputPath)
  })
}

// Get video metadata using FFprobe
async function getVideoMetadata(filePath: string): Promise<{
  duration: number
  width: number
  height: number
  fps: number
  bitrate: string
  codec: string
  size: number
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, async (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
      const stats = await import('fs/promises').then(fs => fs.stat(filePath))

      if (!videoStream) {
        reject(new Error('No video stream found'))
        return
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        fps: eval(videoStream.r_frame_rate || '0') || 0,
        bitrate: metadata.format.bit_rate ? `${Math.round(parseInt(metadata.format.bit_rate) / 1000)}k` : '0k',
        codec: videoStream.codec_name || 'unknown',
        size: stats.size
      })
    })
  })
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
    
    // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
    
    // Get original video metadata
    const originalMetadata = await getVideoMetadata(inputPath)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `converted-video.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
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
    
    // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
    
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
