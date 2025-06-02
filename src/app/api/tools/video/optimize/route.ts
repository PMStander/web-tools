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

interface VideoOptimizeRequest {
  fileId: string
  optimizationType: 'web' | 'mobile' | 'streaming' | 'social-media'
  targetPlatform?: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook'
  maxFileSize?: number // In MB
  outputFormat?: 'mp4' | 'webm'
  outputName?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

const OPTIMIZATION_PRESETS = {
  web: {
    videoCodec: 'libx264',
    audioCodec: 'aac',
    videoBitrate: '1000k',
    audioBitrate: '128k',
    maxWidth: 1920,
    maxHeight: 1080,
    fps: 30,
    crf: 23
  },
  mobile: {
    videoCodec: 'libx264',
    audioCodec: 'aac',
    videoBitrate: '500k',
    audioBitrate: '96k',
    maxWidth: 1280,
    maxHeight: 720,
    fps: 24,
    crf: 28
  },
  streaming: {
    videoCodec: 'libx264',
    audioCodec: 'aac',
    videoBitrate: '2500k',
    audioBitrate: '160k',
    maxWidth: 1920,
    maxHeight: 1080,
    fps: 30,
    crf: 20
  },
  'social-media': {
    videoCodec: 'libx264',
    audioCodec: 'aac',
    videoBitrate: '800k',
    audioBitrate: '128k',
    maxWidth: 1080,
    maxHeight: 1080,
    fps: 30,
    crf: 25
  }
}

const PLATFORM_SPECS = {
  youtube: { maxWidth: 1920, maxHeight: 1080, maxDuration: 43200, maxSize: 128000 }, // 12 hours, 128GB
  instagram: { maxWidth: 1080, maxHeight: 1080, maxDuration: 60, maxSize: 100 }, // 1 min, 100MB
  tiktok: { maxWidth: 1080, maxHeight: 1920, maxDuration: 180, maxSize: 500 }, // 3 min, 500MB
  twitter: { maxWidth: 1280, maxHeight: 720, maxDuration: 140, maxSize: 512 }, // 2:20, 512MB
  facebook: { maxWidth: 1920, maxHeight: 1080, maxDuration: 240, maxSize: 4000 } // 4 min, 4GB
}

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: VideoOptimizeRequest = await request.json()
    const { fileId, optimizationType, targetPlatform, outputFormat = 'mp4', outputName } = body
    
    if (!fileId || !optimizationType) {
      return NextResponse.json({
        success: false,
        error: 'File ID and optimization type are required'
      }, { status: 400 })
    }
    
    const supportedTypes = ['web', 'mobile', 'streaming', 'social-media']
    if (!supportedTypes.includes(optimizationType)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported optimization type. Supported types: ${supportedTypes.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    if (!existsSync(inputPath)) {
      return NextResponse.json({
        success: false,
        error: 'Video file not found'
      }, { status: 404 })
    }
    
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `optimized-video.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    return new Promise((resolve) => {
      const preset = OPTIMIZATION_PRESETS[optimizationType]
      const platformSpec = targetPlatform ? PLATFORM_SPECS[targetPlatform] : null
      
      let command = ffmpeg(inputPath)
      
      // Apply video codec and settings
      command = command
        .videoCodec(preset.videoCodec)
        .audioCodec(preset.audioCodec)
        .videoBitrate(preset.videoBitrate)
        .audioBitrate(preset.audioBitrate)
        .addOption('-crf', preset.crf.toString())
        .addOption('-preset', 'medium')
      
      // Apply resolution constraints
      const maxWidth = platformSpec?.maxWidth || preset.maxWidth
      const maxHeight = platformSpec?.maxHeight || preset.maxHeight
      
      command = command.videoFilter(`scale='min(${maxWidth},iw)':'min(${maxHeight},ih)':force_original_aspect_ratio=decrease`)
      
      // Apply FPS limit
      command = command.fps(preset.fps)
      
      // Apply platform-specific constraints
      if (platformSpec?.maxDuration) {
        command = command.duration(platformSpec.maxDuration)
      }
      
      // Set output format
      command = command.format(outputFormat)
      
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg optimize command:', commandLine)
        })
        .on('progress', (progress) => {
          console.log('Optimization progress: ' + progress.percent + '% done')
        })
        .on('end', async () => {
          const processingTime = Date.now() - startTime
          
          // Get file size
          const stats = await import('fs/promises').then(fs => fs.stat(outputPath))
          const fileSizeMB = Math.round(stats.size / 1024 / 1024 * 100) / 100
          
          resolve(NextResponse.json({
            success: true,
            outputFileId,
            outputFileName,
            downloadUrl: `/api/files/download?fileId=${outputFileId}`,
            optimizationType,
            targetPlatform,
            fileSizeMB,
            processingTime
          }))
        })
        .on('error', (err) => {
          resolve(NextResponse.json({
            success: false,
            error: err.message
          }, { status: 500 }))
        })
        .save(outputPath)
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

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
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) reject(err)
        else resolve(metadata)
      })
    }) as any
    
    const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video')
    const stats = await import('fs/promises').then(fs => fs.stat(inputPath))
    
    const info = {
      currentSize: Math.round(stats.size / 1024 / 1024 * 100) / 100,
      duration: metadata.format.duration || 0,
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
      bitrate: metadata.format.bit_rate ? `${Math.round(parseInt(metadata.format.bit_rate) / 1000)}k` : '0k',
      optimizationTypes: [
        { value: 'web', label: 'Web Optimized', description: 'Optimized for web playback' },
        { value: 'mobile', label: 'Mobile Optimized', description: 'Optimized for mobile devices' },
        { value: 'streaming', label: 'Streaming Optimized', description: 'Optimized for streaming platforms' },
        { value: 'social-media', label: 'Social Media', description: 'Optimized for social media platforms' }
      ],
      platforms: Object.keys(PLATFORM_SPECS),
      outputFormats: ['mp4', 'webm']
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
