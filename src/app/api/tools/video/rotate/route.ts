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

interface VideoRotateRequest {
  fileId: string
  rotation: 90 | 180 | 270 | -90 | -180 | -270
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
    
    const body: VideoRotateRequest = await request.json()
    const { fileId, rotation, outputFormat = 'mp4', outputName } = body
    
    if (!fileId || rotation === undefined) {
      return NextResponse.json({
        success: false,
        error: 'File ID and rotation are required'
      }, { status: 400 })
    }
    
    const validRotations = [90, 180, 270, -90, -180, -270]
    if (!validRotations.includes(rotation)) {
      return NextResponse.json({
        success: false,
        error: `Invalid rotation. Supported rotations: ${validRotations.join(', ')}`
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
    const baseOutputName = outputName || `rotated-video.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    return new Promise((resolve) => {
      let command = ffmpeg(inputPath)
      
      // Apply rotation filter
      let rotationFilter = ''
      switch (rotation) {
        case 90:
        case -270:
          rotationFilter = 'transpose=1' // 90 degrees clockwise
          break
        case 180:
        case -180:
          rotationFilter = 'transpose=1,transpose=1' // 180 degrees
          break
        case 270:
        case -90:
          rotationFilter = 'transpose=2' // 90 degrees counter-clockwise
          break
      }
      
      command = command
        .videoFilter(rotationFilter)
        .format(outputFormat)
        .on('end', () => {
          const processingTime = Date.now() - startTime
          resolve(NextResponse.json({
            success: true,
            outputFileId,
            outputFileName,
            downloadUrl: `/api/files/download?fileId=${outputFileId}`,
            rotation,
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
