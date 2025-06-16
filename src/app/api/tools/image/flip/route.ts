import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface FlipRequest {
  fileId: string
  flipType: 'horizontal' | 'vertical' | 'both'
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface FlipResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  flipType?: string
  dimensions?: { width: number; height: number }
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

// Flip image
async function flipImage(
  inputPath: string,
  options: FlipRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo }> {
  let pipeline = sharp(inputPath)
  
  // Apply flip transformations
  switch (options.flipType) {
    case 'horizontal':
      pipeline = pipeline.flop()
      break
    case 'vertical':
      pipeline = pipeline.flip()
      break
    case 'both':
      pipeline = pipeline.flip().flop()
      break
    default:
      throw new Error(`Unsupported flip type: ${options.flipType}`)
  }

  // Get original metadata to determine default format
  const originalMetadata = await sharp(inputPath).metadata()
  
  // Apply output format and quality
  const outputFormat = options.outputFormat || originalMetadata.format as any || 'png'
  const quality = options.quality || 90

  switch (outputFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality })
      break
    case 'png':
      pipeline = pipeline.png({ quality })
      break
    case 'webp':
      pipeline = pipeline.webp({ quality })
      break
    case 'avif':
      pipeline = pipeline.avif({ quality })
      break
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
  
  return {
    buffer: data,
    metadata: info
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: FlipRequest = await request.json()
    const { fileId, flipType, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<FlipResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!flipType) {
      return NextResponse.json<FlipResponse>({
        success: false,
        error: 'Flip type is required'
      }, { status: 400 })
    }
    
    const supportedFlipTypes = ['horizontal', 'vertical', 'both']
    if (!supportedFlipTypes.includes(flipType)) {
      return NextResponse.json<FlipResponse>({
        success: false,
        error: `Unsupported flip type. Supported types: ${supportedFlipTypes.join(', ')}`
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
    
    // Validate image file
    let originalMetadata: sharp.Metadata
    try {
      originalMetadata = await sharp(inputPath).metadata()
    } catch (error) {
      return NextResponse.json<FlipResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Flip image
    const { buffer: flippedBuffer, metadata: flippedMetadata } = await flipImage(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : (outputFormat || originalMetadata.format || 'png')
    const baseOutputName = outputName || `flipped-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save flipped image
    await writeFile(outputPath, flippedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log flip operation
    const flipMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: flippedBuffer.length,
      flipType,
      dimensions: {
        width: flippedMetadata.width || 0,
        height: flippedMetadata.height || 0
      },
      outputFormat: outputFormat || originalMetadata.format,
      processingTime,
      inputFile: fileId,
      options: {
        quality: body.quality
      },
      createdAt: new Date().toISOString()
    }
    
    console.log('Image flip completed:', flipMetadata)
    
    return NextResponse.json<FlipResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      flipType,
      dimensions: {
        width: flippedMetadata.width || 0,
        height: flippedMetadata.height || 0
      },
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image flip error:', error)
    
    return NextResponse.json<FlipResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during image flipping',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for flip info
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
    const metadata = await sharp(inputPath).metadata()
    
    const info = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      flipTypes: [
        { value: 'horizontal', label: 'Horizontal (Mirror)', description: 'Flip image left to right' },
        { value: 'vertical', label: 'Vertical', description: 'Flip image top to bottom' },
        { value: 'both', label: 'Both', description: 'Flip both horizontally and vertically (180° rotation)' }
      ],
      outputFormats: ['jpeg', 'png', 'webp', 'avif'],
      features: ['qualityControl', 'formatConversion', 'instantPreview']
    }
    
    return NextResponse.json({
      success: true,
      data: info
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid image file'
    }, { status: 400 })
  }
}
