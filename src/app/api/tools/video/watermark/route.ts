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

interface VideoWatermarkRequest {
  fileId: string
  watermarkType: 'text' | 'image'
  text?: string
  imageFileId?: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  opacity?: number // 0-100
  size?: number // For text: font size, for image: scale factor (0.1-2.0)
  color?: string // For text watermark
  fontFamily?: string // For text watermark
  margin?: number // Distance from edge in pixels
  outputFormat?: 'mp4' | 'webm' | 'avi' | 'mov'
  outputName?: string
}

interface VideoWatermarkResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  watermarkType?: string
  position?: string
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

// Add watermark to video using FFmpeg
async function addWatermarkToVideo(
  inputPath: string,
  outputPath: string,
  options: VideoWatermarkRequest
): Promise<{ success: boolean; error?: string }> {
  return new Promise(async (resolve) => {
    try {
      console.log('Adding watermark to video with FFmpeg:', {
        input: inputPath,
        output: outputPath,
        watermarkType: options.watermarkType,
        position: options.position
      })
      
      let command = ffmpeg(inputPath)
      let filterComplex = ''
      
      const opacity = (options.opacity || 70) / 100
      const margin = options.margin || 20
      
      if (options.watermarkType === 'text') {
        if (!options.text) {
          resolve({ success: false, error: 'Text is required for text watermark' })
          return
        }
        
        const fontSize = options.size || 24
        const color = options.color || 'white'
        const fontFamily = options.fontFamily || 'Arial'
        
        // Calculate position
        let x = margin
        let y = margin
        
        switch (options.position) {
          case 'top-left':
            x = margin
            y = margin
            break
          case 'top-right':
            x = `w-text_w-${margin}`
            y = margin
            break
          case 'bottom-left':
            x = margin
            y = `h-text_h-${margin}`
            break
          case 'bottom-right':
            x = `w-text_w-${margin}`
            y = `h-text_h-${margin}`
            break
          case 'center':
            x = '(w-text_w)/2'
            y = '(h-text_h)/2'
            break
        }
        
        // Create text overlay filter
        filterComplex = `drawtext=text='${options.text}':fontfile=/System/Library/Fonts/Arial.ttf:fontsize=${fontSize}:fontcolor=${color}@${opacity}:x=${x}:y=${y}`
        
      } else if (options.watermarkType === 'image') {
        if (!options.imageFileId) {
          resolve({ success: false, error: 'Image file ID is required for image watermark' })
          return
        }
        
        const watermarkPath = join(UPLOAD_DIR, options.imageFileId)
        if (!existsSync(watermarkPath)) {
          resolve({ success: false, error: 'Watermark image file not found' })
          return
        }
        
        // Add watermark image as input
        command = command.input(watermarkPath)
        
        const scale = options.size || 0.2 // Default to 20% of video size
        
        // Calculate position for image overlay
        let x = margin
        let y = margin
        
        switch (options.position) {
          case 'top-left':
            x = margin
            y = margin
            break
          case 'top-right':
            x = `main_w-overlay_w-${margin}`
            y = margin
            break
          case 'bottom-left':
            x = margin
            y = `main_h-overlay_h-${margin}`
            break
          case 'bottom-right':
            x = `main_w-overlay_w-${margin}`
            y = `main_h-overlay_h-${margin}`
            break
          case 'center':
            x = '(main_w-overlay_w)/2'
            y = '(main_h-overlay_h)/2'
            break
        }
        
        // Create overlay filter with scaling and opacity
        filterComplex = `[1:v]scale=iw*${scale}:ih*${scale},format=rgba,colorchannelmixer=aa=${opacity}[watermark];[0:v][watermark]overlay=${x}:${y}`
      }
      
      // Apply filter
      if (filterComplex) {
        command = command.complexFilter(filterComplex)
      }
      
      // Set output format
      const outputFormat = options.outputFormat || 'mp4'
      command = command.format(outputFormat)
      
      // Set video codec
      command = command.videoCodec('libx264')
      command = command.audioCodec('aac')
      
      // Execute watermarking
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg watermark command:', commandLine)
        })
        .on('progress', (progress) => {
          console.log('Watermark progress: ' + progress.percent + '% done')
        })
        .on('end', () => {
          console.log('Video watermarking completed successfully')
          resolve({ success: true })
        })
        .on('error', (err) => {
          console.error('FFmpeg watermark error:', err.message)
          resolve({ success: false, error: err.message })
        })
        .save(outputPath)
        
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: VideoWatermarkRequest = await request.json()
    const { fileId, watermarkType, position, outputFormat = 'mp4', outputName } = body
    
    if (!fileId) {
      return NextResponse.json<VideoWatermarkResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!watermarkType) {
      return NextResponse.json<VideoWatermarkResponse>({
        success: false,
        error: 'Watermark type is required'
      }, { status: 400 })
    }
    
    if (!position) {
      return NextResponse.json<VideoWatermarkResponse>({
        success: false,
        error: 'Watermark position is required'
      }, { status: 400 })
    }
    
    const supportedTypes = ['text', 'image']
    if (!supportedTypes.includes(watermarkType)) {
      return NextResponse.json<VideoWatermarkResponse>({
        success: false,
        error: `Unsupported watermark type. Supported types: ${supportedTypes.join(', ')}`
      }, { status: 400 })
    }
    
    const supportedPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']
    if (!supportedPositions.includes(position)) {
      return NextResponse.json<VideoWatermarkResponse>({
        success: false,
        error: `Unsupported position. Supported positions: ${supportedPositions.join(', ')}`
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
      return NextResponse.json<VideoWatermarkResponse>({
        success: false,
        error: 'Video file not found'
      }, { status: 404 })
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat
    const baseOutputName = outputName || `watermarked-video.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Add watermark to video
    const { success, error } = await addWatermarkToVideo(inputPath, outputPath, body)
    
    if (!success) {
      return NextResponse.json<VideoWatermarkResponse>({
        success: false,
        error: error || 'Video watermarking failed'
      }, { status: 500 })
    }
    
    const processingTime = Date.now() - startTime
    
    // Log watermark operation
    const watermarkMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      watermarkType,
      position,
      opacity: body.opacity,
      size: body.size,
      outputFormat,
      processingTime,
      inputFile: fileId,
      options: body,
      createdAt: new Date().toISOString()
    }
    
    console.log('Video watermarking completed:', watermarkMetadata)
    
    return NextResponse.json<VideoWatermarkResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      watermarkType,
      position,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Video watermarking error:', error)
    
    return NextResponse.json<VideoWatermarkResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during video watermarking',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for watermark info
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
    // Get video metadata using FFprobe
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) reject(err)
        else resolve(metadata)
      })
    }) as any
    
    const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video')
    
    const info = {
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
      duration: metadata.format.duration || 0,
      watermarkTypes: [
        { value: 'text', label: 'Text Watermark', description: 'Add text overlay to video' },
        { value: 'image', label: 'Image Watermark', description: 'Add image overlay to video' }
      ],
      positions: [
        { value: 'top-left', label: 'Top Left' },
        { value: 'top-right', label: 'Top Right' },
        { value: 'bottom-left', label: 'Bottom Left' },
        { value: 'bottom-right', label: 'Bottom Right' },
        { value: 'center', label: 'Center' }
      ],
      outputFormats: ['mp4', 'webm', 'avi', 'mov'],
      features: ['opacityControl', 'sizeControl', 'colorControl', 'fontSelection', 'positionControl']
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
