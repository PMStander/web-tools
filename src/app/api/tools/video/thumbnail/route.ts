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

interface ThumbnailRequest {
  fileId: string
  method: 'single' | 'multiple' | 'grid'
  timestamp?: number // For single thumbnail (in seconds)
  count?: number // For multiple thumbnails
  interval?: number // For multiple thumbnails (interval in seconds)
  size?: { width: number; height: number }
  quality?: 'low' | 'medium' | 'high'
  format?: 'jpg' | 'png' | 'webp'
  outputName?: string
}

interface ThumbnailResponse {
  success: boolean
  thumbnails?: Array<{
    fileId: string
    fileName: string
    downloadUrl: string
    timestamp: number
    width: number
    height: number
  }>
  gridThumbnail?: {
    fileId: string
    fileName: string
    downloadUrl: string
    thumbnailCount: number
  }
  processingTime?: number
  error?: string
}

// FileService handles directory paths
// FileService handles directory paths

const QUALITY_SETTINGS = {
  low: { quality: 60, scale: 0.5 },
  medium: { quality: 80, scale: 0.75 },
  high: { quality: 95, scale: 1.0 }
}

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

// Get video metadata using FFprobe
async function getVideoMetadata(filePath: string): Promise<{
  duration: number
  width: number
  height: number
  fps: number
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
      
      if (!videoStream) {
        reject(new Error('No video stream found'))
        return
      }
      
      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        fps: eval(videoStream.r_frame_rate || '0') || 0
      })
    })
  })
}

// Generate single thumbnail
async function generateSingleThumbnail(
  inputPath: string,
  outputPath: string,
  timestamp: number,
  options: ThumbnailRequest
): Promise<{ success: boolean; error?: string; width: number; height: number }> {
  return new Promise((resolve) => {
    const quality = options.quality || 'medium'
    const settings = QUALITY_SETTINGS[quality]
    const format = options.format || 'jpg'
    
    let command = ffmpeg(inputPath)
      .seekInput(timestamp)
      .frames(1)
      .format('image2')
    
    // Set size if specified
    if (options.size) {
      command = command.size(`${options.size.width}x${options.size.height}`)
    } else if (settings.scale !== 1.0) {
      command = command.videoFilter(`scale=iw*${settings.scale}:ih*${settings.scale}`)
    }
    
    // Set quality for JPEG
    if (format === 'jpg') {
      command = command.outputOptions(['-q:v', settings.quality.toString()])
    }
    
    command
      .on('start', (commandLine) => {
        console.log('FFmpeg thumbnail command:', commandLine)
      })
      .on('end', async () => {
        try {
          // Get thumbnail dimensions
          const metadata = await getVideoMetadata(outputPath)
          resolve({ success: true, width: metadata.width, height: metadata.height })
        } catch (error) {
          resolve({ success: true, width: 0, height: 0 })
        }
      })
      .on('error', (err) => {
        console.error('FFmpeg thumbnail error:', err.message)
        resolve({ success: false, error: err.message, width: 0, height: 0 })
      })
      .save(outputPath)
  })
}

// Generate multiple thumbnails
async function generateMultipleThumbnails(
  inputPath: string,
  options: ThumbnailRequest
): Promise<{ success: boolean; error?: string; thumbnails: Array<{ path: string; timestamp: number; width: number; height: number }> }> {
  return new Promise(async (resolve) => {
    try {
      const metadata = await getVideoMetadata(inputPath)
      const duration = metadata.duration
      const count = options.count || 5
      const interval = options.interval || (duration / count)
      
      const thumbnails: Array<{ path: string; timestamp: number; width: number; height: number }> = []
      let completedThumbnails = 0
      
      for (let i = 0; i < count; i++) {
        const timestamp = Math.min(i * interval, duration - 1)
        const outputFileId = uuidv4()
        const format = options.format || 'jpg'
        const outputFileName = `${outputFileId}_thumbnail_${i + 1}.${format}`
        const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
        
        const { success, error, width, height } = await generateSingleThumbnail(inputPath, outputPath, timestamp, options)
        
        if (success) {
          thumbnails.push({ path: outputPath, timestamp, width, height })
          completedThumbnails++
        } else {
          resolve({ success: false, error: error || 'Failed to generate thumbnail', thumbnails: [] })
          return
        }
      }
      
      resolve({ success: true, thumbnails })
      
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        thumbnails: []
      })
    }
  })
}

// Generate grid thumbnail
async function generateGridThumbnail(
  inputPath: string,
  outputPath: string,
  options: ThumbnailRequest
): Promise<{ success: boolean; error?: string; thumbnailCount: number }> {
  return new Promise(async (resolve) => {
    try {
      const metadata = await getVideoMetadata(inputPath)
      const duration = metadata.duration
      const count = options.count || 9 // 3x3 grid by default
      const cols = Math.ceil(Math.sqrt(count))
      const rows = Math.ceil(count / cols)
      
      const quality = options.quality || 'medium'
      const settings = QUALITY_SETTINGS[quality]
      
      // Calculate thumbnail size for grid
      const thumbWidth = Math.floor((options.size?.width || metadata.width * settings.scale) / cols)
      const thumbHeight = Math.floor((options.size?.height || metadata.height * settings.scale) / rows)
      
      let command = ffmpeg(inputPath)
      
      // Generate grid of thumbnails
      const filterComplex = `select='not(mod(n\\,${Math.floor(duration * metadata.fps / count)}))',scale=${thumbWidth}:${thumbHeight},tile=${cols}x${rows}`
      
      command = command
        .outputOptions([
          '-vf', filterComplex,
          '-frames:v', '1',
          '-q:v', settings.quality.toString()
        ])
        .format('image2')
      
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg grid thumbnail command:', commandLine)
        })
        .on('end', () => {
          console.log('Grid thumbnail generation completed')
          resolve({ success: true, thumbnailCount: count })
        })
        .on('error', (err) => {
          console.error('FFmpeg grid thumbnail error:', err.message)
          resolve({ success: false, error: err.message, thumbnailCount: 0 })
        })
        .save(outputPath)
        
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        thumbnailCount: 0
      })
    }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: ThumbnailRequest = await request.json()
    const { fileId, method, format = 'jpg', outputName } = body
    
    if (!fileId) {
      return NextResponse.json<ThumbnailResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!method) {
      return NextResponse.json<ThumbnailResponse>({
        success: false,
        error: 'Thumbnail method is required'
      }, { status: 400 })
    }
    
    const supportedMethods = ['single', 'multiple', 'grid']
    if (!supportedMethods.includes(method)) {
      return NextResponse.json<ThumbnailResponse>({
        success: false,
        error: `Unsupported method. Supported methods: ${supportedMethods.join(', ')}`
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
    
    // Validate video file exists
    if (!existsSync(inputPath)) {
      return NextResponse.json<ThumbnailResponse>({
        success: false,
        error: 'Video file not found'
      }, { status: 404 })
    }
    
    let response: ThumbnailResponse = { success: false }
    
    switch (method) {
      case 'single':
        const timestamp = body.timestamp || 0
        const outputFileId = uuidv4()
        const singleOutputName = outputName || `thumbnail.${format}`
        const singleOutputFileName = `${outputFileId}_${singleOutputName}`
        const singleOutputPath = join(OUTPUT_DIR, singleOutputFileName)
        
        const { success: singleSuccess, error: singleError, width, height } = await generateSingleThumbnail(inputPath, singleOutputPath, timestamp, body)
        
        if (singleSuccess) {
          response = {
            success: true,
            thumbnails: [{
              fileId: outputFileId,
              fileName: singleOutputFileName,
              downloadUrl: `/api/files/download?fileId=${outputFileId}`,
              timestamp,
              width,
              height
            }]
          }
        } else {
          response = { success: false, error: singleError }
        }
        break
        
      case 'multiple':
        const { success: multiSuccess, error: multiError, thumbnails } = await generateMultipleThumbnails(inputPath, body)
        
        if (multiSuccess) {
          response = {
            success: true,
            thumbnails: thumbnails.map((thumb, index) => {
              const fileName = thumb.path.split('/').pop() || ''
              const fileId = fileName.split('_')[0]
              
              return {
                fileId,
                fileName,
                downloadUrl: `/api/files/download?fileId=${fileId}`,
                timestamp: thumb.timestamp,
                width: thumb.width,
                height: thumb.height
              }
            })
          }
        } else {
          response = { success: false, error: multiError }
        }
        break
        
      case 'grid':
        const gridOutputFileId = uuidv4()
        const gridOutputName = outputName || `grid-thumbnail.${format}`
        const gridOutputFileName = `${gridOutputFileId}_${gridOutputName}`
        const gridOutputPath = join(OUTPUT_DIR, gridOutputFileName)
        
        const { success: gridSuccess, error: gridError, thumbnailCount } = await generateGridThumbnail(inputPath, gridOutputPath, body)
        
        if (gridSuccess) {
          response = {
            success: true,
            gridThumbnail: {
              fileId: gridOutputFileId,
              fileName: gridOutputFileName,
              downloadUrl: `/api/files/download?fileId=${gridOutputFileId}`,
              thumbnailCount
            }
          }
        } else {
          response = { success: false, error: gridError }
        }
        break
    }
    
    const processingTime = Date.now() - startTime
    response.processingTime = processingTime
    
    if (response.success) {
      console.log('Thumbnail generation completed:', {
        method,
        fileId,
        processingTime,
        thumbnailCount: response.thumbnails?.length || (response.gridThumbnail ? 1 : 0)
      })
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Thumbnail generation error:', error)
    
    return NextResponse.json<ThumbnailResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during thumbnail generation',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for thumbnail info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  
  if (!fileId) {
    return NextResponse.json({
      success: false,
      error: 'File ID is required'
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
    
    const info = {
      duration: Math.round(metadata.duration * 100) / 100,
      width: metadata.width,
      height: metadata.height,
      fps: metadata.fps,
      methods: [
        { value: 'single', label: 'Single Thumbnail', description: 'Generate one thumbnail at specific time' },
        { value: 'multiple', label: 'Multiple Thumbnails', description: 'Generate multiple thumbnails at intervals' },
        { value: 'grid', label: 'Grid Thumbnail', description: 'Generate a grid of thumbnails in one image' }
      ],
      formats: ['jpg', 'png', 'webp'],
      qualityLevels: ['low', 'medium', 'high'],
      features: ['customSize', 'qualityControl', 'formatSelection', 'timestampControl']
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
