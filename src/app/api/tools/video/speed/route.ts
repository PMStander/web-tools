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

interface VideoSpeedRequest {
  fileId: string
  speedFactor: number // 0.25 to 4.0 (0.5 = half speed, 2.0 = double speed)
  maintainPitch?: boolean // For audio pitch correction
  outputFormat?: 'mp4' | 'webm' | 'avi' | 'mov'
  outputName?: string
}

// FileService handles directory paths
// FileService handles directory paths

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: VideoSpeedRequest = await request.json()
    const { fileId, speedFactor, maintainPitch = true, outputFormat = 'mp4', outputName } = body
    
    if (!fileId || !speedFactor) {
      return NextResponse.json({
        success: false,
        error: 'File ID and speed factor are required'
      }, { status: 400 })
    }
    
    if (speedFactor < 0.25 || speedFactor > 4.0) {
      return NextResponse.json({
        success: false,
        error: 'Speed factor must be between 0.25 and 4.0'
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
    if (!existsSync(inputPath)) {
      return NextResponse.json({
        success: false,
        error: 'Video file not found'
      }, { status: 404 })
    }
    
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `speed-adjusted-video.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    return new Promise((resolve) => {
      let command = ffmpeg(inputPath)
      
      // Apply speed change
      if (maintainPitch) {
        // Use atempo for audio to maintain pitch
        const audioFilter = speedFactor <= 2.0 
          ? `atempo=${speedFactor}`
          : `atempo=2.0,atempo=${speedFactor/2.0}` // Chain filters for >2x speed
        
        command = command
          .videoFilter(`setpts=${1/speedFactor}*PTS`)
          .audioFilter(audioFilter)
      } else {
        // Simple speed change
        command = command.videoFilter(`setpts=${1/speedFactor}*PTS`)
      }
      
      command
        .format(outputFormat)
        .on('end', () => {
          const processingTime = Date.now() - startTime
          resolve(NextResponse.json({
            success: true,
            outputFileId,
            outputFileName,
            downloadUrl: `/api/files/download?fileId=${outputFileId}`,
            speedFactor,
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
