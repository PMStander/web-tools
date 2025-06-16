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

interface VideoSplitRequest {
  fileId: string
  splitMethod: 'time-intervals' | 'equal-parts' | 'custom-segments'
  segmentDuration?: number // For time-intervals (in seconds)
  numberOfParts?: number // For equal-parts
  customSegments?: Array<{ start: number; end: number; name?: string }> // For custom-segments
  outputFormat?: 'mp4' | 'webm' | 'avi' | 'mov'
  maintainQuality?: boolean
  outputPrefix?: string
}

interface VideoSplitResponse {
  success: boolean
  outputFiles?: Array<{
    fileId: string
    fileName: string
    downloadUrl: string
    duration: number
    segmentNumber: number
  }>
  totalSegments?: number
  originalDuration?: number
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

// Split video into segments
async function splitVideo(
  inputPath: string,
  options: VideoSplitRequest
): Promise<{ success: boolean; error?: string; segments: Array<{ path: string; duration: number; start: number; end: number }> }> {
  return new Promise(async (resolve) => {
    try {
      const originalDuration = await getVideoDuration(inputPath)
      let segments: Array<{ start: number; end: number; name?: string }> = []
      
      // Calculate segments based on split method
      switch (options.splitMethod) {
        case 'time-intervals':
          if (!options.segmentDuration) {
            resolve({ success: false, error: 'Segment duration is required for time-intervals method', segments: [] })
            return
          }
          
          for (let start = 0; start < originalDuration; start += options.segmentDuration) {
            const end = Math.min(start + options.segmentDuration, originalDuration)
            segments.push({ start, end, name: `segment_${segments.length + 1}` })
          }
          break
          
        case 'equal-parts':
          if (!options.numberOfParts || options.numberOfParts < 2) {
            resolve({ success: false, error: 'Number of parts must be at least 2 for equal-parts method', segments: [] })
            return
          }
          
          const partDuration = originalDuration / options.numberOfParts
          for (let i = 0; i < options.numberOfParts; i++) {
            const start = i * partDuration
            const end = Math.min((i + 1) * partDuration, originalDuration)
            segments.push({ start, end, name: `part_${i + 1}` })
          }
          break
          
        case 'custom-segments':
          if (!options.customSegments || options.customSegments.length === 0) {
            resolve({ success: false, error: 'Custom segments are required for custom-segments method', segments: [] })
            return
          }
          
          segments = options.customSegments.map((seg, index) => ({
            start: seg.start,
            end: seg.end,
            name: seg.name || `custom_${index + 1}`
          }))
          break
          
        default:
          resolve({ success: false, error: `Unsupported split method: ${options.splitMethod}`, segments: [] })
          return
      }
      
      // Validate segments
      for (const segment of segments) {
        if (segment.start < 0 || segment.end > originalDuration || segment.start >= segment.end) {
          resolve({ success: false, error: 'Invalid segment times', segments: [] })
          return
        }
      }
      
      console.log('Splitting video into segments:', {
        input: inputPath,
        method: options.splitMethod,
        segmentCount: segments.length,
        originalDuration
      })
      
      const outputSegments: Array<{ path: string; duration: number; start: number; end: number }> = []
      let completedSegments = 0
      
      // Process each segment
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        const outputFileId = uuidv4()
        const outputFormat = options.outputFormat || 'mp4'
        const outputPrefix = options.outputPrefix || 'split'
        const outputFileName = `${outputFileId}_${outputPrefix}_${segment.name}.${outputFormat}`
        const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
        
        await new Promise<void>((segmentResolve, segmentReject) => {
          let command = ffmpeg(inputPath)
          
          // Set time range
          command = command.seekInput(segment.start)
          command = command.duration(segment.end - segment.start)
          
          // Set output format
          command = command.format(outputFormat)
          
          // Quality settings
          if (options.maintainQuality) {
            command = command.videoCodec('copy')
            command = command.audioCodec('copy')
          } else {
            command = command.videoCodec('libx264')
            command = command.audioCodec('aac')
            command = command.addOption('-crf', '18')
          }
          
          command
            .on('start', (commandLine) => {
              console.log(`FFmpeg split segment ${i + 1} command:`, commandLine)
            })
            .on('progress', (progress) => {
              console.log(`Segment ${i + 1} progress: ${progress.percent}% done`)
            })
            .on('end', () => {
              console.log(`Segment ${i + 1} completed successfully`)
              outputSegments.push({
                path: outputPath,
                duration: segment.end - segment.start,
                start: segment.start,
                end: segment.end
              })
              completedSegments++
              
              if (completedSegments === segments.length) {
                resolve({ success: true, segments: outputSegments })
              }
              segmentResolve()
            })
            .on('error', (err) => {
              console.error(`FFmpeg split segment ${i + 1} error:`, err.message)
              segmentReject(err)
            })
            .save(outputPath)
        })
      }
      
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        segments: []
      })
    }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: VideoSplitRequest = await request.json()
    const { fileId, splitMethod, outputFormat = 'mp4' } = body
    
    if (!fileId) {
      return NextResponse.json<VideoSplitResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!splitMethod) {
      return NextResponse.json<VideoSplitResponse>({
        success: false,
        error: 'Split method is required'
      }, { status: 400 })
    }
    
    const supportedMethods = ['time-intervals', 'equal-parts', 'custom-segments']
    if (!supportedMethods.includes(splitMethod)) {
      return NextResponse.json<VideoSplitResponse>({
        success: false,
        error: `Unsupported split method. Supported methods: ${supportedMethods.join(', ')}`
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
      return NextResponse.json<VideoSplitResponse>({
        success: false,
        error: 'Video file not found'
      }, { status: 404 })
    }
    
    // Get original duration
    const originalDuration = await getVideoDuration(inputPath)
    
    // Split video
    const { success, error, segments } = await splitVideo(inputPath, body)
    
    if (!success) {
      return NextResponse.json<VideoSplitResponse>({
        success: false,
        error: error || 'Video split failed'
      }, { status: 500 })
    }
    
    const processingTime = Date.now() - startTime
    
    // Prepare output files info
    const outputFiles = segments.map((segment, index) => {
      const fileName = segment.path.split('/').pop() || ''
      const fileId = fileName.split('_')[0]
      
      return {
        fileId,
        fileName,
        downloadUrl: `/api/files/download?fileId=${fileId}`,
        duration: Math.round(segment.duration * 100) / 100,
        segmentNumber: index + 1
      }
    })
    
    // Log split operation
    const splitMetadata = {
      splitMethod,
      totalSegments: segments.length,
      originalDuration,
      outputFiles,
      processingTime,
      inputFile: fileId,
      options: body,
      createdAt: new Date().toISOString()
    }
    
    console.log('Video split completed:', splitMetadata)
    
    return NextResponse.json<VideoSplitResponse>({
      success: true,
      outputFiles,
      totalSegments: segments.length,
      originalDuration: Math.round(originalDuration * 100) / 100,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Video split error:', error)
    
    return NextResponse.json<VideoSplitResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during video split',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for split info
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
    const duration = await getVideoDuration(inputPath)
    
    const info = {
      duration: Math.round(duration * 100) / 100,
      splitMethods: [
        { value: 'time-intervals', label: 'Time Intervals', description: 'Split by fixed time duration' },
        { value: 'equal-parts', label: 'Equal Parts', description: 'Split into equal duration parts' },
        { value: 'custom-segments', label: 'Custom Segments', description: 'Split at custom time points' }
      ],
      outputFormats: ['mp4', 'webm', 'avi', 'mov'],
      features: ['qualityPreservation', 'customNaming', 'progressTracking'],
      limitations: {
        maxSegments: 20,
        minSegmentDuration: 1
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
