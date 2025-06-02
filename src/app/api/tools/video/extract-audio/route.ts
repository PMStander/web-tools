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

interface ExtractAudioRequest {
  fileId: string
  outputFormat: 'mp3' | 'wav' | 'aac' | 'ogg' | 'flac'
  quality?: 'low' | 'medium' | 'high' | 'lossless'
  bitrate?: string // e.g., '128k', '320k'
  sampleRate?: number // e.g., 44100, 48000
  channels?: 1 | 2 // mono or stereo
  startTime?: number // Extract audio from specific time
  duration?: number // Extract specific duration
  outputName?: string
}

interface ExtractAudioResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  audioFormat?: string
  duration?: number
  bitrate?: string
  sampleRate?: number
  channels?: number
  fileSize?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

const QUALITY_PRESETS = {
  low: { bitrate: '96k', sampleRate: 22050 },
  medium: { bitrate: '128k', sampleRate: 44100 },
  high: { bitrate: '320k', sampleRate: 48000 },
  lossless: { bitrate: null, sampleRate: 48000 } // For FLAC
}

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

// Get audio metadata using FFprobe
async function getAudioMetadata(filePath: string): Promise<{
  duration: number
  bitrate: string
  sampleRate: number
  channels: number
  codec: string
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }
      
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio')
      
      if (!audioStream) {
        reject(new Error('No audio stream found'))
        return
      }
      
      resolve({
        duration: metadata.format.duration || 0,
        bitrate: audioStream.bit_rate ? `${Math.round(parseInt(audioStream.bit_rate) / 1000)}k` : '0k',
        sampleRate: audioStream.sample_rate || 0,
        channels: audioStream.channels || 0,
        codec: audioStream.codec_name || 'unknown'
      })
    })
  })
}

// Extract audio using FFmpeg
async function extractAudio(
  inputPath: string,
  outputPath: string,
  options: ExtractAudioRequest
): Promise<{ success: boolean; error?: string; metadata: any }> {
  return new Promise(async (resolve) => {
    try {
      const originalMetadata = await getAudioMetadata(inputPath)
      const quality = options.quality || 'medium'
      const preset = QUALITY_PRESETS[quality]
      
      console.log('Extracting audio with FFmpeg:', {
        input: inputPath,
        output: outputPath,
        format: options.outputFormat,
        quality: options.quality,
        bitrate: options.bitrate,
        sampleRate: options.sampleRate
      })
      
      let command = ffmpeg(inputPath)
      
      // Set time range if specified
      if (options.startTime !== undefined) {
        command = command.seekInput(options.startTime)
      }
      
      if (options.duration !== undefined) {
        command = command.duration(options.duration)
      }
      
      // Remove video stream, keep only audio
      command = command.noVideo()
      
      // Set audio codec based on output format
      switch (options.outputFormat) {
        case 'mp3':
          command = command.audioCodec('libmp3lame')
          break
        case 'wav':
          command = command.audioCodec('pcm_s16le')
          break
        case 'aac':
          command = command.audioCodec('aac')
          break
        case 'ogg':
          command = command.audioCodec('libvorbis')
          break
        case 'flac':
          command = command.audioCodec('flac')
          break
        default:
          command = command.audioCodec('libmp3lame')
      }
      
      // Set audio quality
      if (options.bitrate) {
        command = command.audioBitrate(options.bitrate)
      } else if (preset.bitrate && options.outputFormat !== 'flac') {
        command = command.audioBitrate(preset.bitrate)
      }
      
      // Set sample rate
      const sampleRate = options.sampleRate || preset.sampleRate
      command = command.audioFrequency(sampleRate)
      
      // Set channels (mono/stereo)
      if (options.channels) {
        command = command.audioChannels(options.channels)
      }
      
      // Set output format
      command = command.format(options.outputFormat)
      
      // Execute extraction
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg audio extraction command:', commandLine)
        })
        .on('progress', (progress) => {
          console.log('Audio extraction progress: ' + progress.percent + '% done')
        })
        .on('end', async () => {
          try {
            const stats = await import('fs/promises').then(fs => fs.stat(outputPath))
            const extractedMetadata = await getAudioMetadata(outputPath)
            
            console.log('Audio extraction completed successfully')
            resolve({ 
              success: true, 
              metadata: {
                ...extractedMetadata,
                fileSize: stats.size
              }
            })
          } catch (error) {
            resolve({ success: false, error: 'Failed to get extracted audio metadata', metadata: {} })
          }
        })
        .on('error', (err) => {
          console.error('FFmpeg audio extraction error:', err.message)
          resolve({ success: false, error: err.message, metadata: {} })
        })
        .save(outputPath)
        
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {}
      })
    }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: ExtractAudioRequest = await request.json()
    const { fileId, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<ExtractAudioResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!outputFormat) {
      return NextResponse.json<ExtractAudioResponse>({
        success: false,
        error: 'Output format is required'
      }, { status: 400 })
    }
    
    const supportedFormats = ['mp3', 'wav', 'aac', 'ogg', 'flac']
    if (!supportedFormats.includes(outputFormat)) {
      return NextResponse.json<ExtractAudioResponse>({
        success: false,
        error: `Unsupported output format. Supported formats: ${supportedFormats.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate video file exists
    if (!existsSync(inputPath)) {
      return NextResponse.json<ExtractAudioResponse>({
        success: false,
        error: 'Video file not found'
      }, { status: 404 })
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat
    const baseOutputName = outputName || `extracted-audio.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Extract audio
    const { success, error, metadata } = await extractAudio(inputPath, outputPath, body)
    
    if (!success) {
      return NextResponse.json<ExtractAudioResponse>({
        success: false,
        error: error || 'Audio extraction failed'
      }, { status: 500 })
    }
    
    const processingTime = Date.now() - startTime
    
    // Log extraction operation
    const extractionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      audioFormat: outputFormat,
      duration: metadata.duration,
      bitrate: metadata.bitrate,
      sampleRate: metadata.sampleRate,
      channels: metadata.channels,
      fileSize: metadata.fileSize,
      processingTime,
      inputFile: fileId,
      options: body,
      createdAt: new Date().toISOString()
    }
    
    console.log('Audio extraction completed:', extractionMetadata)
    
    return NextResponse.json<ExtractAudioResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      audioFormat: outputFormat,
      duration: Math.round(metadata.duration * 100) / 100,
      bitrate: metadata.bitrate,
      sampleRate: metadata.sampleRate,
      channels: metadata.channels,
      fileSize: metadata.fileSize,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Audio extraction error:', error)
    
    return NextResponse.json<ExtractAudioResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during audio extraction',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for extraction info
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
    const metadata = await getAudioMetadata(inputPath)
    
    const info = {
      hasAudio: true,
      duration: Math.round(metadata.duration * 100) / 100,
      currentBitrate: metadata.bitrate,
      currentSampleRate: metadata.sampleRate,
      currentChannels: metadata.channels,
      currentCodec: metadata.codec,
      outputFormats: [
        { value: 'mp3', label: 'MP3', description: 'Most compatible, good compression' },
        { value: 'wav', label: 'WAV', description: 'Uncompressed, highest quality' },
        { value: 'aac', label: 'AAC', description: 'Modern codec, good quality' },
        { value: 'ogg', label: 'OGG', description: 'Open source, good compression' },
        { value: 'flac', label: 'FLAC', description: 'Lossless compression' }
      ],
      qualityLevels: ['low', 'medium', 'high', 'lossless'],
      features: ['timeRange', 'qualityControl', 'formatConversion', 'channelControl']
    }
    
    return NextResponse.json({
      success: true,
      data: info
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid video file or no audio stream found'
    }, { status: 400 })
  }
}
