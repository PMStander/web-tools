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

interface VideoMuteRequest {
  fileId: string
  muteType: 'complete' | 'partial'
  startTime?: number // For partial mute (in seconds)
  endTime?: number // For partial mute (in seconds)
  fadeIn?: number // Fade in duration (in seconds)
  fadeOut?: number // Fade out duration (in seconds)
  outputFormat?: 'mp4' | 'webm' | 'avi' | 'mov'
  outputName?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: VideoMuteRequest = await request.json()
    const { fileId, muteType, outputFormat = 'mp4', outputName } = body
    
    if (!fileId || !muteType) {
      return NextResponse.json({
        success: false,
        error: 'File ID and mute type are required'
      }, { status: 400 })
    }
    
    const supportedTypes = ['complete', 'partial']
    if (!supportedTypes.includes(muteType)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported mute type. Supported types: ${supportedTypes.join(', ')}`
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
    const baseOutputName = outputName || `muted-video.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    return new Promise((resolve) => {
      let command = ffmpeg(inputPath)
      
      if (muteType === 'complete') {
        // Remove audio completely
        command = command.noAudio()
      } else if (muteType === 'partial') {
        // Partial mute with volume control
        let audioFilter = ''
        
        if (body.startTime !== undefined && body.endTime !== undefined) {
          // Mute specific time range
          audioFilter = `volume=enable='between(t,${body.startTime},${body.endTime})':volume=0`
        } else if (body.fadeIn || body.fadeOut) {
          // Apply fade effects
          const filters = []
          if (body.fadeIn) {
            filters.push(`afade=t=in:ss=0:d=${body.fadeIn}`)
          }
          if (body.fadeOut) {
            // Need to get video duration for fade out
            filters.push(`afade=t=out:st=${body.fadeOut}:d=1`)
          }
          audioFilter = filters.join(',')
        }
        
        if (audioFilter) {
          command = command.audioFilter(audioFilter)
        }
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
            muteType,
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
