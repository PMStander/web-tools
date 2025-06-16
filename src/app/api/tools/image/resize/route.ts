import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { FileService, AppError } from '@/lib/file-service'

interface ResizeRequest {
  fileId: string
  width?: number
  height?: number
  maintainAspectRatio?: boolean
  resizeMode?: 'fit' | 'fill' | 'cover' | 'contain' | 'inside' | 'outside'
  background?: string
  quality?: number
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  outputName?: string
}

interface ResizeResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalDimensions?: { width: number; height: number }
  newDimensions?: { width: number; height: number }
  originalSize?: number
  newSize?: number
  compressionRatio?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

async function ensureOutputDir() {
  try {
    const { mkdir } = await import('fs/promises')
    await mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create output directory:', error)
  }
}

// Parse background color
function parseBackgroundColor(color?: string): { r: number; g: number; b: number; alpha?: number } {
  if (!color) return { r: 255, g: 255, b: 255 } // Default white
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      }
    }
  }
  
  // Handle rgba/rgb colors
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      alpha: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : undefined
    }
  }
  
  // Default to white if parsing fails
  return { r: 255, g: 255, b: 255 }
}

async function resizeImage(
  inputPath: string,
  options: ResizeRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo; originalMetadata: sharp.Metadata }> {
  const originalMetadata = await sharp(inputPath).metadata()
  
  let pipeline = sharp(inputPath)
  
  // Apply resize if dimensions provided
  if (options.width || options.height) {
    const resizeOptions: sharp.ResizeOptions = {
      width: options.width,
      height: options.height,
      fit: options.resizeMode as sharp.FitEnum || 'inside',
      withoutEnlargement: false
    }
    
    // Add background color for certain fit modes
    if (options.resizeMode === 'contain' || options.resizeMode === 'fill') {
      const bgColor = parseBackgroundColor(options.background)
      resizeOptions.background = bgColor
    }
    
    pipeline = pipeline.resize(resizeOptions)
  }
  
  // Apply output format and quality
  const outputFormat = options.outputFormat || 'jpeg'
  const quality = options.quality || 85
  
  switch (outputFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true })
      break
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 6, progressive: true })
      break
    case 'webp':
      pipeline = pipeline.webp({ quality, effort: 4 })
      break
    case 'avif':
      pipeline = pipeline.avif({ quality, effort: 4 })
      break
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
    
    const body: ResizeRequest = await request.json()
    const {
      fileId,
      width,
      height,
      maintainAspectRatio = true,
      resizeMode = 'inside',
      outputFormat = 'jpeg',
      quality = 85,
      outputName
    } = body
    
    if (!fileId) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!width && !height) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'At least width or height must be specified'
      }, { status: 400 })
    }
    
    // Validate dimensions
    if (width && (width < 1 || width > 10000)) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'Width must be between 1 and 10000 pixels'
      }, { status: 400 })
    }
    
    if (height && (height < 1 || height > 10000)) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'Height must be between 1 and 10000 pixels'
      }, { status: 400 })
    }
    
    // Validate quality
    if (quality < 1 || quality > 100) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'Quality must be between 1 and 100'
      }, { status: 400 })
    }
    
    // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId)
    if (!inputPath) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }
    
    // Validate input image
    try {
      await sharp(inputPath).metadata()
    } catch (error) {
      return NextResponse.json<ResizeResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Resize image
    const { buffer, metadata, originalMetadata } = await resizeImage(inputPath, body)
    
    // Generate output filename using FileService
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `resized-image.${outputFormat}`
    const outputPath = FileService.generateOutputPath(outputFileId, baseOutputName, '-resized')
    
    // Save resized image
    await writeFile(outputPath, buffer)
    
    const processingTime = Date.now() - startTime
    const originalSize = originalMetadata.size || 0
    const newSize = buffer.length
    const compressionRatio = originalSize > 0 ? ((originalSize - newSize) / originalSize) * 100 : 0
    
    // Get output filename from path
    const outputFileName = outputPath.split('/').pop() || `${outputFileId}_${baseOutputName}`
    
    // Create response metadata
    const resizeMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: newSize,
      mimeType: `image/${outputFormat}`,
      createdAt: new Date().toISOString(),
      processingTime,
      inputFile: fileId,
      originalDimensions: {
        width: originalMetadata.width || 0,
        height: originalMetadata.height || 0
      },
      newDimensions: {
        width: metadata.width,
        height: metadata.height
      },
      resizeOptions: body,
      compressionRatio
    }
    
    console.log('Image resize completed:', resizeMetadata)
    
    return NextResponse.json<ResizeResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalDimensions: {
        width: originalMetadata.width || 0,
        height: originalMetadata.height || 0
      },
      newDimensions: {
        width: metadata.width,
        height: metadata.height
      },
      originalSize,
      newSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image resize error:', error)
    
    return NextResponse.json<ResizeResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during image resize',
      processingTime
    }, { status: 500 })
  }
}

// Get image info without processing
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
      
      return NextResponse.json({
        success: true,
        data: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: metadata.size,
          channels: metadata.channels,
          hasAlpha: metadata.hasAlpha,
          density: metadata.density
        }
      })
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid image file'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Image info error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
