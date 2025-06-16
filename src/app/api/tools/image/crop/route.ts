import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface CropRequest {
  fileId: string
  cropType: 'custom' | 'square' | 'circle' | 'aspect-ratio'
  x?: number
  y?: number
  width?: number
  height?: number
  aspectRatio?: string // e.g., '16:9', '4:3', '1:1'
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface CropResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalDimensions?: { width: number; height: number }
  croppedDimensions?: { width: number; height: number }
  cropArea?: { x: number; y: number; width: number; height: number }
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

// Parse aspect ratio string to numbers
function parseAspectRatio(aspectRatio: string): { width: number; height: number } {
  const [w, h] = aspectRatio.split(':').map(Number)
  return { width: w || 1, height: h || 1 }
}

// Calculate crop dimensions based on aspect ratio
function calculateAspectRatioCrop(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: string,
  position: string = 'center'
): { x: number; y: number; width: number; height: number } {
  const { width: ratioW, height: ratioH } = parseAspectRatio(aspectRatio)
  const targetRatio = ratioW / ratioH
  const imageRatio = imageWidth / imageHeight

  let cropWidth: number
  let cropHeight: number

  if (imageRatio > targetRatio) {
    // Image is wider than target ratio
    cropHeight = imageHeight
    cropWidth = Math.round(cropHeight * targetRatio)
  } else {
    // Image is taller than target ratio
    cropWidth = imageWidth
    cropHeight = Math.round(cropWidth / targetRatio)
  }

  // Calculate position
  let x: number
  let y: number

  switch (position) {
    case 'top':
      x = Math.round((imageWidth - cropWidth) / 2)
      y = 0
      break
    case 'bottom':
      x = Math.round((imageWidth - cropWidth) / 2)
      y = imageHeight - cropHeight
      break
    case 'left':
      x = 0
      y = Math.round((imageHeight - cropHeight) / 2)
      break
    case 'right':
      x = imageWidth - cropWidth
      y = Math.round((imageHeight - cropHeight) / 2)
      break
    case 'top-left':
      x = 0
      y = 0
      break
    case 'top-right':
      x = imageWidth - cropWidth
      y = 0
      break
    case 'bottom-left':
      x = 0
      y = imageHeight - cropHeight
      break
    case 'bottom-right':
      x = imageWidth - cropWidth
      y = imageHeight - cropHeight
      break
    case 'center':
    default:
      x = Math.round((imageWidth - cropWidth) / 2)
      y = Math.round((imageHeight - cropHeight) / 2)
      break
  }

  return { x, y, width: cropWidth, height: cropHeight }
}

// Crop image
async function cropImage(
  inputPath: string,
  options: CropRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo; cropArea: { x: number; y: number; width: number; height: number } }> {
  const image = sharp(inputPath)
  const metadata = await image.metadata()
  
  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to determine image dimensions')
  }

  let cropArea: { x: number; y: number; width: number; height: number }

  switch (options.cropType) {
    case 'custom':
      if (!options.x || !options.y || !options.width || !options.height) {
        throw new Error('Custom crop requires x, y, width, and height parameters')
      }
      cropArea = {
        x: Math.max(0, options.x),
        y: Math.max(0, options.y),
        width: Math.min(options.width, metadata.width - options.x),
        height: Math.min(options.height, metadata.height - options.y)
      }
      break

    case 'square':
      const size = Math.min(metadata.width, metadata.height)
      cropArea = {
        x: Math.round((metadata.width - size) / 2),
        y: Math.round((metadata.height - size) / 2),
        width: size,
        height: size
      }
      break

    case 'circle':
      // For circle crop, we'll create a square crop and then apply circular mask
      const circleSize = Math.min(metadata.width, metadata.height)
      cropArea = {
        x: Math.round((metadata.width - circleSize) / 2),
        y: Math.round((metadata.height - circleSize) / 2),
        width: circleSize,
        height: circleSize
      }
      break

    case 'aspect-ratio':
      if (!options.aspectRatio) {
        throw new Error('Aspect ratio crop requires aspectRatio parameter')
      }
      cropArea = calculateAspectRatioCrop(
        metadata.width,
        metadata.height,
        options.aspectRatio,
        options.position
      )
      break

    default:
      throw new Error(`Unsupported crop type: ${options.cropType}`)
  }

  let pipeline = image.extract(cropArea)

  // Apply circular mask for circle crop
  if (options.cropType === 'circle') {
    const radius = Math.floor(cropArea.width / 2)
    const circleBuffer = Buffer.from(
      `<svg width="${cropArea.width}" height="${cropArea.height}">
        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/>
      </svg>`
    )
    
    pipeline = pipeline.composite([{
      input: circleBuffer,
      blend: 'dest-in'
    }])
  }

  // Apply output format and quality
  const outputFormat = options.outputFormat || 'png'
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
    metadata: info,
    cropArea
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: CropRequest = await request.json()
    const { fileId, cropType, outputFormat = 'png', outputName } = body
    
    if (!fileId) {
      return NextResponse.json<CropResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!cropType) {
      return NextResponse.json<CropResponse>({
        success: false,
        error: 'Crop type is required'
      }, { status: 400 })
    }
    
    const supportedCropTypes = ['custom', 'square', 'circle', 'aspect-ratio']
    if (!supportedCropTypes.includes(cropType)) {
      return NextResponse.json<CropResponse>({
        success: false,
        error: `Unsupported crop type. Supported types: ${supportedCropTypes.join(', ')}`
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
      return NextResponse.json<CropResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Crop image
    const { buffer: croppedBuffer, metadata: croppedMetadata, cropArea } = await cropImage(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : outputFormat
    const baseOutputName = outputName || `cropped-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save cropped image
    await writeFile(outputPath, croppedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log crop operation
    const cropMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: croppedBuffer.length,
      cropType,
      cropArea,
      originalDimensions: {
        width: originalMetadata.width || 0,
        height: originalMetadata.height || 0
      },
      croppedDimensions: {
        width: croppedMetadata.width || 0,
        height: croppedMetadata.height || 0
      },
      outputFormat,
      processingTime,
      inputFile: fileId,
      createdAt: new Date().toISOString()
    }
    
    console.log('Image crop completed:', cropMetadata)
    
    return NextResponse.json<CropResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalDimensions: {
        width: originalMetadata.width || 0,
        height: originalMetadata.height || 0
      },
      croppedDimensions: {
        width: croppedMetadata.width || 0,
        height: croppedMetadata.height || 0
      },
      cropArea,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image crop error:', error)
    
    return NextResponse.json<CropResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during image cropping',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for crop info
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
      cropTypes: ['custom', 'square', 'circle', 'aspect-ratio'],
      aspectRatios: ['1:1', '4:3', '3:2', '16:9', '21:9', '9:16', '3:4', '2:3'],
      positions: ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
      outputFormats: ['jpeg', 'png', 'webp', 'avif']
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
