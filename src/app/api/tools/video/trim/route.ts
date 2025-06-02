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

interface VideoTrimRequest {
  fileId: string
  startTime: number // Start time in seconds
  endTime?: number // End time in seconds (optional, if not provided, trim to end)
  duration?: number // Duration in seconds (alternative to endTime)
  outputFormat?: 'mp4' | 'webm' | 'avi' | 'mov'
  maintainQuality?: boolean
  outputName?: string
}

interface VideoTrimResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalDuration?: number
  trimmedDuration?: number
  startTime?: number
  endTime?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

// Get video duration using FFprobe
async function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }
      resolve(metadata.format.duration || 0)
    })
  })
}

// Trim video using FFmpeg
async function trimVideo(
  inputPath: string,
  outputPath: string,
  options: VideoTrimRequest
): Promise<{ success: boolean; error?: string; originalDuration: number; trimmedDuration: number }> {
  return new Promise(async (resolve) => {
    try {
      const originalDuration = await getVideoDuration(inputPath)
      
      // Calculate end time
      let endTime = options.endTime
      if (!endTime && options.duration) {
        endTime = options.startTime + options.duration
      }
      if (!endTime) {
        endTime = originalDuration
      }
      
      // Validate times
      if (options.startTime < 0) {
        resolve({ success: false, error: 'Start time cannot be negative', originalDuration, trimmedDuration: 0 })
        return
      }
      
      if (options.startTime >= originalDuration) {
        resolve({ success: false, error: 'Start time exceeds video duration', originalDuration, trimmedDuration: 0 })
        return
      }
      
      if (endTime <= options.startTime) {
        resolve({ success: false, error: 'End time must be greater than start time', originalDuration, trimmedDuration: 0 })
        return
      }
      
      // Ensure end time doesn't exceed video duration
      endTime = Math.min(endTime, originalDuration)
      const trimmedDuration = endTime - options.startTime
      
      console.log('Trimming video with FFmpeg:', {
        input: inputPath,
        output: outputPath,
        startTime: options.startTime,
        endTime: endTime,
        duration: trimmedDuration,
        originalDuration
      })
      
      let command = ffmpeg(inputPath)
      
      // Set start time and duration
      command = command.seekInput(options.startTime)
      command = command.duration(trimmedDuration)
      
      // Set output format
      const outputFormat = options.outputFormat || 'mp4'
      command = command.format(outputFormat)
      
      // Maintain quality settings
      if (options.maintainQuality) {
        command = command.videoCodec('copy') // Copy video stream without re-encoding
        command = command.audioCodec('copy') // Copy audio stream without re-encoding
      } else {
        // Re-encode with good quality
        command = command.videoCodec('libx264')
        command = command.audioCodec('aac')
        command = command.addOption('-crf', '18') // High quality
      }
      
      // Execute trimming
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg trim command:', commandLine)
        })
        .on('progress', (progress) => {
          console.log('Trimming progress: ' + progress.percent + '% done')
        })
        .on('end', () => {
          console.log('Video trimming completed successfully')
          resolve({ success: true, originalDuration, trimmedDuration })
        })
        .on('error', (err) => {
          console.error('FFmpeg trimming error:', err.message)
          resolve({ success: false, error: err.message, originalDuration, trimmedDuration: 0 })
        })
        .save(outputPath)
        
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        originalDuration: 0,
        trimmedDuration: 0
      })
    }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: VideoTrimRequest = await request.json()
    const { fileId, startTime: trimStartTime, endTime, duration, outputFormat = 'mp4', outputName } = body
    
    if (!fileId) {
      return NextResponse.json<VideoTrimResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (trimStartTime === undefined || trimStartTime === null) {
      return NextResponse.json<VideoTrimResponse>({
        success: false,
        error: 'Start time is required'
      }, { status: 400 })
    }
    
    if (!endTime && !duration) {
      return NextResponse.json<VideoTrimResponse>({
        success: false,
        error: 'Either end time or duration must be specified'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate video file exists
    if (!existsSync(inputPath)) {
      return NextResponse.json<VideoTrimResponse>({
        success: false,
        error: 'Video file not found'
      }, { status: 404 })
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat
    const baseOutputName = outputName || `trimmed-video.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Trim video
    const { success, error, originalDuration, trimmedDuration } = await trimVideo(inputPath, outputPath, body)
    
    if (!success) {
      return NextResponse.json<VideoTrimResponse>({
        success: false,
        error: error || 'Video trimming failed'
      }, { status: 500 })
    }
    
    const processingTime = Date.now() - startTime
    const actualEndTime = endTime || (duration ? trimStartTime + duration : originalDuration)
    
    // Log trimming operation
    const trimMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      startTime: trimStartTime,
      endTime: actualEndTime,
      originalDuration,
      trimmedDuration,
      outputFormat,
      processingTime,
      inputFile: fileId,
      options: body,
      createdAt: new Date().toISOString()
    }
    
    console.log('Video trimming completed:', trimMetadata)
    
    return NextResponse.json<VideoTrimResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalDuration: Math.round(originalDuration * 100) / 100,
      trimmedDuration: Math.round(trimmedDuration * 100) / 100,
      startTime: trimStartTime,
      endTime: actualEndTime,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Video trimming error:', error)
    
    return NextResponse.json<VideoTrimResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during video trimming',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for trim info
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
    const duration = await getVideoDuration(inputPath)
    
    const info = {
      duration: Math.round(duration * 100) / 100,
      maxDuration: duration,
      outputFormats: ['mp4', 'webm', 'avi', 'mov'],
      features: ['preciseTimestamp', 'qualityPreservation', 'formatConversion', 'progressTracking'],
      timeFormat: 'seconds (decimal supported)',
      examples: {
        'First 30 seconds': { startTime: 0, duration: 30 },
        'Middle section': { startTime: 60, endTime: 120 },
        'Last minute': { startTime: duration - 60, endTime: duration }
      }
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
