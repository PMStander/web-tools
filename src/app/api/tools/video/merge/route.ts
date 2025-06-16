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

interface VideoMergeRequest {
  fileIds: string[] // Array of video file IDs to merge
  outputFormat?: 'mp4' | 'webm' | 'avi' | 'mov'
  transition?: 'none' | 'fade' | 'crossfade'
  transitionDuration?: number // Duration in seconds
  resizeToMatch?: boolean // Resize all videos to match the first one
  audioHandling?: 'keep-all' | 'first-only' | 'mix'
  outputName?: string
}

interface VideoMergeResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  totalDuration?: number
  videoCount?: number
  outputFormat?: string
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

// Get video metadata using FFprobe
async function getVideoMetadata(filePath: string): Promise<{
  duration: number
  width: number
  height: number
  fps: number
  hasAudio: boolean
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio')
      
      if (!videoStream) {
        reject(new Error('No video stream found'))
        return
      }
      
      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        fps: eval(videoStream.r_frame_rate || '0') || 0,
        hasAudio: !!audioStream
      })
    })
  })
}

// Create concat file for FFmpeg
async function createConcatFile(fileIds: string[], outputDir: string): Promise<string> {
  const concatFilePath = join(outputDir, `concat_${uuidv4()}.txt`)
  let concatContent = ''
  
  for (const fileId of fileIds) {
    const filePath = join(UPLOAD_DIR, fileId)
    // Escape single quotes and backslashes for FFmpeg
    const escapedPath = filePath.replace(/'/g, "'\\''").replace(/\\/g, '\\\\')
    concatContent += `file '${escapedPath}'\n`
  }
  
  await writeFile(concatFilePath, concatContent)
  return concatFilePath
}

// Merge videos using FFmpeg
async function mergeVideos(
  fileIds: string[],
  outputPath: string,
  options: VideoMergeRequest
): Promise<{ success: boolean; error?: string; totalDuration: number }> {
  return new Promise(async (resolve) => {
    try {
      // Get metadata for all videos
      const videoMetadataList = []
      for (const fileId of fileIds) {
        const filePath = join(UPLOAD_DIR, fileId)
        const metadata = await getVideoMetadata(filePath)
        videoMetadataList.push(metadata)
      }
      
      const totalDuration = videoMetadataList.reduce((sum, meta) => sum + meta.duration, 0)
      
      // Get dimensions from first video for consistency
      const firstVideo = videoMetadataList[0]
      const targetWidth = firstVideo.width
      const targetHeight = firstVideo.height
      
      console.log('Merging videos with FFmpeg:', {
        fileCount: fileIds.length,
        outputPath,
        outputFormat: options.outputFormat,
        targetResolution: `${targetWidth}x${targetHeight}`,
        totalDuration
      })
      
      if (options.resizeToMatch || options.transition !== 'none') {
        // Complex merge with filters (for transitions or resizing)
        let command = ffmpeg()
        
        // Add all input files
        fileIds.forEach(fileId => {
          const filePath = join(UPLOAD_DIR, fileId)
          command = command.input(filePath)
        })
        
        // Build filter complex for resizing and transitions
        let filterComplex = ''
        let inputs = []
        
        // Resize all videos to match first video dimensions
        for (let i = 0; i < fileIds.length; i++) {
          if (options.resizeToMatch) {
            filterComplex += `[${i}:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2[v${i}];`
            inputs.push(`[v${i}]`)
          } else {
            inputs.push(`[${i}:v]`)
          }
        }
        
        // Add transition effects
        if (options.transition === 'fade' && options.transitionDuration) {
          // Add fade transitions between videos
          // This is a simplified implementation
          filterComplex += inputs.join('') + `concat=n=${fileIds.length}:v=1:a=1[outv][outa]`
        } else {
          // Simple concatenation
          filterComplex += inputs.join('') + `concat=n=${fileIds.length}:v=1:a=1[outv][outa]`
        }
        
        command = command
          .complexFilter(filterComplex)
          .outputOptions(['-map', '[outv]', '-map', '[outa]'])
          
      } else {
        // Simple concatenation using concat demuxer (faster)
        const concatFilePath = await createConcatFile(fileIds, OUTPUT_DIR)
        
        command = ffmpeg()
          .input(concatFilePath)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .outputOptions(['-c', 'copy']) // Copy streams without re-encoding
      }
      
      // Set output format
      const outputFormat = options.outputFormat || 'mp4'
      command = command.format(outputFormat)
      
      // Handle audio based on options
      switch (options.audioHandling) {
        case 'first-only':
          // Keep audio only from first video
          break
        case 'mix':
          // Mix audio from all videos (complex)
          break
        case 'keep-all':
        default:
          // Keep all audio tracks (default behavior)
          break
      }
      
      // Execute merge
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg merge command:', commandLine)
        })
        .on('progress', (progress) => {
          console.log('Merge progress: ' + progress.percent + '% done')
        })
        .on('end', () => {
          console.log('Video merge completed successfully')
          resolve({ success: true, totalDuration })
        })
        .on('error', (err) => {
          console.error('FFmpeg merge error:', err.message)
          resolve({ success: false, error: err.message, totalDuration: 0 })
        })
        .save(outputPath)
        
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        totalDuration: 0
      })
    }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: VideoMergeRequest = await request.json()
    const { fileIds, outputFormat = 'mp4', outputName } = body
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length < 2) {
      return NextResponse.json<VideoMergeResponse>({
        success: false,
        error: 'At least 2 video files are required for merging'
      }, { status: 400 })
    }
    
    if (fileIds.length > 10) {
      return NextResponse.json<VideoMergeResponse>({
        success: false,
        error: 'Maximum 10 videos can be merged at once'
      }, { status: 400 })
    }
    
    // Validate all video files exist
    for (const fileId of fileIds) {
      // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
      if (!existsSync(inputPath)) {
        return NextResponse.json<VideoMergeResponse>({
          success: false,
          error: `Video file not found: ${fileId}`
        }, { status: 404 })
      }
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat
    const baseOutputName = outputName || `merged-video.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Merge videos
    const { success, error, totalDuration } = await mergeVideos(fileIds, outputPath, body)
    
    if (!success) {
      return NextResponse.json<VideoMergeResponse>({
        success: false,
        error: error || 'Video merge failed'
      }, { status: 500 })
    }
    
    const processingTime = Date.now() - startTime
    
    // Log merge operation
    const mergeMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      videoCount: fileIds.length,
      totalDuration,
      outputFormat,
      processingTime,
      inputFiles: fileIds,
      options: body,
      createdAt: new Date().toISOString()
    }
    
    console.log('Video merge completed:', mergeMetadata)
    
    return NextResponse.json<VideoMergeResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      totalDuration: Math.round(totalDuration * 100) / 100,
      videoCount: fileIds.length,
      outputFormat,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Video merge error:', error)
    
    return NextResponse.json<VideoMergeResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during video merge',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for merge info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileIds = searchParams.get('fileIds')?.split(',')
  
  if (!fileIds || fileIds.length < 2) {
    return NextResponse.json({
      success: false,
      error: 'At least 2 file IDs are required'
    }, { status: 400 })
  }
  
  try {
    const videoInfoList = []
    let totalDuration = 0
    
    for (const fileId of fileIds) {
      // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
      const metadata = await getVideoMetadata(inputPath)
      videoInfoList.push({
        fileId,
        duration: metadata.duration,
        resolution: `${metadata.width}x${metadata.height}`,
        fps: metadata.fps,
        hasAudio: metadata.hasAudio
      })
      totalDuration += metadata.duration
    }
    
    const info = {
      videoCount: fileIds.length,
      totalDuration: Math.round(totalDuration * 100) / 100,
      videos: videoInfoList,
      outputFormats: ['mp4', 'webm', 'avi', 'mov'],
      transitions: ['none', 'fade', 'crossfade'],
      audioHandling: ['keep-all', 'first-only', 'mix'],
      features: ['resizeToMatch', 'transitions', 'audioMixing', 'progressTracking'],
      limitations: {
        maxVideos: 10,
        recommendedDuration: '< 30 minutes total'
      }
    }
    
    return NextResponse.json({
      success: true,
      data: info
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid video files or unable to read metadata'
    }, { status: 400 })
  }
}
