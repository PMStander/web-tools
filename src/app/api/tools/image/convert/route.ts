import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { FileService, AppError } from '@/lib/file-service'

interface ConvertRequest {
  fileId: string
  outputFormat: 'jpeg' | 'png' | 'webp' | 'gif' | 'avif' | 'tiff'
  quality?: number
  width?: number
  height?: number
  maintainAspectRatio?: boolean
  outputName?: string
}

interface ConvertResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalSize?: number
  outputSize?: number
  compressionRatio?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

// Format-specific options
const FORMAT_OPTIONS = {
  jpeg: { quality: 85, progressive: true },
  png: { compressionLevel: 6, progressive: true },
  webp: { quality: 85, effort: 4 },
  gif: { colors: 256 },
  avif: { quality: 85, effort: 4 },
  tiff: { compression: 'lzw' }
}

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    const { mkdir } = await import('fs/promises')
    await mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create output directory:', error)
  }
}

// Validate image file
async function validateImage(filePath: string): Promise<{ isValid: boolean; metadata?: sharp.Metadata }> {
  try {
    const metadata = await sharp(filePath).metadata()
    return { isValid: true, metadata }
  } catch (error) {
    console.error('Image validation failed:', error)
    return { isValid: false }
  }
}

// Convert image
async function convertImage(
  inputPath: string,
  outputPath: string,
  options: ConvertRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo }> {
  let pipeline = sharp(inputPath)
  
  // Resize if dimensions provided
  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: options.maintainAspectRatio ? 'inside' : 'fill',
      withoutEnlargement: true
    })
  }
  
  // Apply format-specific conversion
  switch (options.outputFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({
        quality: options.quality || FORMAT_OPTIONS.jpeg.quality,
        progressive: FORMAT_OPTIONS.jpeg.progressive
      })
      break
      
    case 'png':
      pipeline = pipeline.png({
        compressionLevel: FORMAT_OPTIONS.png.compressionLevel,
        progressive: FORMAT_OPTIONS.png.progressive
      })
      break
      
    case 'webp':
      pipeline = pipeline.webp({
        quality: options.quality || FORMAT_OPTIONS.webp.quality,
        effort: FORMAT_OPTIONS.webp.effort
      })
      break
      
    case 'gif':
      pipeline = pipeline.gif({
        colors: FORMAT_OPTIONS.gif.colors
      })
      break
      
    case 'avif':
      pipeline = pipeline.avif({
        quality: options.quality || FORMAT_OPTIONS.avif.quality,
        effort: FORMAT_OPTIONS.avif.effort
      })
      break
      
    case 'tiff':
      pipeline = pipeline.tiff({
        compression: FORMAT_OPTIONS.tiff.compression
      })
      break
      
    default:
      throw new Error(`Unsupported output format: ${options.outputFormat}`)
  }
  
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
  await writeFile(outputPath, data)
  
  return { buffer: data, metadata: info }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: ConvertRequest = await request.json()
    const {
      fileId,
      outputFormat,
      quality,
      width,
      height,
      maintainAspectRatio = true,
      outputName
    } = body
    
    if (!fileId) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!outputFormat) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: 'Output format is required'
      }, { status: 400 })
    }
    
    // Validate quality parameter
    if (quality !== undefined && (quality < 1 || quality > 100)) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: 'Quality must be between 1 and 100'
      }, { status: 400 })
    }
    
    // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId)
    if (!inputPath) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }
    
    // Validate input image
    const { isValid, metadata: inputMetadata } = await validateImage(inputPath)
    if (!isValid) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Generate output filename using FileService
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `converted-image.${outputFormat}`
    const outputPath = FileService.generateOutputPath(outputFileId, baseOutputName, '-converted')
    
    // Convert image
    const { buffer, metadata: outputMetadata } = await convertImage(inputPath, outputPath, body)
    
    const processingTime = Date.now() - startTime
    const originalSize = inputMetadata?.size || 0
    const outputSize = buffer.length
    const compressionRatio = originalSize > 0 ? ((originalSize - outputSize) / originalSize) * 100 : 0
    
    // Get output filename from path
    const outputFileName = outputPath.split('/').pop() || `${outputFileId}_${baseOutputName}`
    
    // In production, save output metadata to database
    const conversionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: outputSize,
      mimeType: `image/${outputFormat}`,
      createdAt: new Date().toISOString(),
      processingTime,
      inputFile: fileId,
      inputMetadata,
      outputMetadata,
      compressionRatio,
      conversionOptions: body
    }
    
    console.log('Image conversion completed:', conversionMetadata)
    
    return NextResponse.json<ConvertResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalSize,
      outputSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image conversion error:', error)
    
    return NextResponse.json<ConvertResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during image conversion',
      processingTime
    }, { status: 500 })
  }
}

// Get conversion status/progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID required'
      }, { status: 400 })
    }
    
    // In production, check job status from database/queue
    return NextResponse.json({
      success: true,
      status: 'completed',
      progress: 100,
      message: 'Image conversion status endpoint - implement job tracking'
    })
    
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
