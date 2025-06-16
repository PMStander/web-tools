import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { FileService, AppError } from '@/lib/file-service'

interface CompressRequest {
  fileId: string
  compressionLevel: 'low' | 'medium' | 'high' | 'maximum'
  quality?: number
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  progressive?: boolean
  stripMetadata?: boolean
  outputName?: string
}

interface CompressResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalSize?: number
  compressedSize?: number
  compressionRatio?: number
  qualityScore?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

// Compression presets
const COMPRESSION_PRESETS = {
  low: {
    jpeg: { quality: 90, progressive: true },
    png: { compressionLevel: 3, progressive: true },
    webp: { quality: 90, effort: 2 },
    avif: { quality: 90, effort: 2 }
  },
  medium: {
    jpeg: { quality: 80, progressive: true },
    png: { compressionLevel: 6, progressive: true },
    webp: { quality: 80, effort: 4 },
    avif: { quality: 80, effort: 4 }
  },
  high: {
    jpeg: { quality: 70, progressive: true },
    png: { compressionLevel: 8, progressive: true },
    webp: { quality: 70, effort: 6 },
    avif: { quality: 70, effort: 6 }
  },
  maximum: {
    jpeg: { quality: 60, progressive: true },
    png: { compressionLevel: 9, progressive: true },
    webp: { quality: 60, effort: 6 },
    avif: { quality: 60, effort: 6 }
  }
}

async function ensureOutputDir() {
  try {
    const { mkdir } = await import('fs/promises')
    await mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create output directory:', error)
  }
}

// Calculate quality score based on compression ratio and settings
function calculateQualityScore(
  compressionRatio: number,
  quality: number,
  format: string
): number {
  // Base score from quality setting
  let score = quality
  
  // Adjust based on compression ratio
  if (compressionRatio > 70) {
    score -= 20 // Heavy compression penalty
  } else if (compressionRatio > 50) {
    score -= 10 // Medium compression penalty
  } else if (compressionRatio > 30) {
    score -= 5 // Light compression penalty
  }
  
  // Format bonuses
  if (format === 'webp' || format === 'avif') {
    score += 5 // Modern format bonus
  }
  
  return Math.max(0, Math.min(100, score))
}

async function compressImage(
  inputPath: string,
  options: CompressRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo; originalMetadata: sharp.Metadata }> {
  const originalMetadata = await sharp(inputPath).metadata()
  
  let pipeline = sharp(inputPath)
  
  // Strip metadata if requested
  if (options.stripMetadata) {
    pipeline = pipeline.withMetadata({})
  }
  
  const outputFormat = options.outputFormat || originalMetadata.format as any || 'jpeg'
  const compressionLevel = options.compressionLevel
  const preset = COMPRESSION_PRESETS[compressionLevel][outputFormat as keyof typeof COMPRESSION_PRESETS.low]
  
  // Use custom quality if provided, otherwise use preset
  const quality = options.quality || preset.quality || 80
  
  // Apply format-specific compression
  switch (outputFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({
        quality,
        progressive: options.progressive ?? preset.progressive,
        mozjpeg: true // Use mozjpeg for better compression
      })
      break
      
    case 'png':
      pipeline = pipeline.png({
        compressionLevel: preset.compressionLevel || 6,
        progressive: options.progressive ?? preset.progressive,
        palette: compressionLevel === 'maximum' // Use palette for maximum compression
      })
      break
      
    case 'webp':
      pipeline = pipeline.webp({
        quality,
        effort: preset.effort || 4,
        lossless: false
      })
      break
      
    case 'avif':
      pipeline = pipeline.avif({
        quality,
        effort: preset.effort || 4
      })
      break
      
    default:
      throw new Error(`Unsupported output format: ${outputFormat}`)
  }
  
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
  
  return {
    buffer: data,
    metadata: info,
    originalMetadata
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: CompressRequest = await request.json()
    const {
      fileId,
      compressionLevel,
      quality,
      outputFormat,
      progressive = true,
      stripMetadata = false,
      outputName
    } = body
    
    if (!fileId) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!compressionLevel) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'Compression level is required'
      }, { status: 400 })
    }
    
    if (!['low', 'medium', 'high', 'maximum'].includes(compressionLevel)) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'Invalid compression level. Must be: low, medium, high, or maximum'
      }, { status: 400 })
    }
    
    // Validate quality if provided
    if (quality !== undefined && (quality < 1 || quality > 100)) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'Quality must be between 1 and 100'
      }, { status: 400 })
    }
    
    // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId)
    if (!inputPath) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }
    
    // Validate input image
    let originalMetadata: sharp.Metadata
    try {
      originalMetadata = await sharp(inputPath).metadata()
    } catch (error) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Compress image
    const { buffer, metadata } = await compressImage(inputPath, body)
    
    // Generate output filename using FileService
    const outputFileId = uuidv4()
    const finalOutputFormat = outputFormat || originalMetadata.format || 'jpeg'
    const baseOutputName = outputName || `compressed-image.${finalOutputFormat}`
    const outputPath = FileService.generateOutputPath(outputFileId, baseOutputName, '-compressed')
    
    // Save compressed image
    await writeFile(outputPath, buffer)
    
    const processingTime = Date.now() - startTime
    const originalSize = originalMetadata.size || 0
    const compressedSize = buffer.length
    const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0
    
    // Calculate quality score
    const usedQuality = quality || COMPRESSION_PRESETS[compressionLevel][finalOutputFormat as keyof typeof COMPRESSION_PRESETS.low]?.quality || 80
    const qualityScore = calculateQualityScore(compressionRatio, usedQuality, finalOutputFormat)
    
    // Get output filename from path
    const outputFileName = outputPath.split('/').pop() || `${outputFileId}_${baseOutputName}`
    
    // Create compression metadata
    const compressionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: compressedSize,
      mimeType: `image/${finalOutputFormat}`,
      createdAt: new Date().toISOString(),
      processingTime,
      inputFile: fileId,
      originalSize,
      compressedSize,
      compressionRatio,
      compressionLevel,
      quality: usedQuality,
      qualityScore,
      outputFormat: finalOutputFormat,
      settings: {
        progressive,
        stripMetadata,
        preset: COMPRESSION_PRESETS[compressionLevel][finalOutputFormat as keyof typeof COMPRESSION_PRESETS.low]
      }
    }
    
    console.log('Image compression completed:', compressionMetadata)
    
    return NextResponse.json<CompressResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      qualityScore: Math.round(qualityScore),
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image compression error:', error)
    
    return NextResponse.json<CompressResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during image compression',
      processingTime
    }, { status: 500 })
  }
}

// Get compression preview/estimates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID required'
      }, { status: 400 })
    }
    
    // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId)
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }
    
    try {
      const metadata = await sharp(inputPath).metadata()
      const originalSize = metadata.size || 0
      
      // Estimate compression ratios for different levels
      const estimates = {
        low: Math.round(originalSize * 0.8),
        medium: Math.round(originalSize * 0.6),
        high: Math.round(originalSize * 0.4),
        maximum: Math.round(originalSize * 0.25)
      }
      
      return NextResponse.json({
        success: true,
        data: {
          originalSize,
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          estimates,
          supportedFormats: ['jpeg', 'png', 'webp', 'avif']
        }
      })
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid image file'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Compression estimate error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
