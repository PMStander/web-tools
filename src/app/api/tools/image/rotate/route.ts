import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface RotateRequest {
  fileId: string
  angle: number // Rotation angle in degrees
  backgroundColor?: string // Background color for areas exposed by rotation
  autoTrim?: boolean // Automatically trim transparent/background areas
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface RotateResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalDimensions?: { width: number; height: number }
  rotatedDimensions?: { width: number; height: number }
  rotationAngle?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

// Parse color string to RGB values
function parseColor(colorString: string): { r: number; g: number; b: number; alpha?: number } {
  // Default to white if parsing fails
  let r = 255, g = 255, b = 255, alpha = 1
  
  if (colorString.startsWith('#')) {
    // Hex color
    const hex = colorString.slice(1)
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
    } else if (hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
      alpha = parseInt(hex.slice(6, 8), 16) / 255
    }
  } else if (colorString.startsWith('rgb')) {
    // RGB/RGBA color
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (match) {
      r = parseInt(match[1])
      g = parseInt(match[2])
      b = parseInt(match[3])
      alpha = match[4] ? parseFloat(match[4]) : 1
    }
  } else {
    // Named colors
    const namedColors: { [key: string]: [number, number, number] } = {
      'transparent': [0, 0, 0],
      'white': [255, 255, 255],
      'black': [0, 0, 0],
      'red': [255, 0, 0],
      'green': [0, 255, 0],
      'blue': [0, 0, 255],
      'gray': [128, 128, 128],
      'grey': [128, 128, 128]
    }
    
    const color = namedColors[colorString.toLowerCase()]
    if (color) {
      [r, g, b] = color
      if (colorString.toLowerCase() === 'transparent') {
        alpha = 0
      }
    }
  }
  
  return { r, g, b, alpha }
}

// Rotate image
async function rotateImage(
  inputPath: string,
  options: RotateRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo; originalDimensions: { width: number; height: number } }> {
  const image = sharp(inputPath)
  const originalMetadata = await image.metadata()
  
  if (!originalMetadata.width || !originalMetadata.height) {
    throw new Error('Unable to determine image dimensions')
  }

  const originalDimensions = {
    width: originalMetadata.width,
    height: originalMetadata.height
  }

  // Normalize angle to 0-360 range
  let normalizedAngle = ((options.angle % 360) + 360) % 360

  let pipeline = image

  // Apply rotation
  if (normalizedAngle !== 0) {
    const { r, g, b, alpha } = parseColor(options.backgroundColor || 'white')
    
    pipeline = pipeline.rotate(normalizedAngle, {
      background: alpha !== undefined && alpha < 1 
        ? { r, g, b, alpha: Math.round(alpha * 255) }
        : { r, g, b }
    })
  }

  // Auto-trim if requested
  if (options.autoTrim) {
    pipeline = pipeline.trim()
  }

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
    metadata: info,
    originalDimensions
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: RotateRequest = await request.json()
    const { fileId, angle, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<RotateResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (angle === undefined || angle === null) {
      return NextResponse.json<RotateResponse>({
        success: false,
        error: 'Rotation angle is required'
      }, { status: 400 })
    }
    
    if (typeof angle !== 'number' || angle < -360 || angle > 360) {
      return NextResponse.json<RotateResponse>({
        success: false,
        error: 'Rotation angle must be a number between -360 and 360 degrees'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate image file
    let originalMetadata: sharp.Metadata
    try {
      originalMetadata = await sharp(inputPath).metadata()
    } catch (error) {
      return NextResponse.json<RotateResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Rotate image
    const { buffer: rotatedBuffer, metadata: rotatedMetadata, originalDimensions } = await rotateImage(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : (outputFormat || originalMetadata.format || 'png')
    const baseOutputName = outputName || `rotated-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Save rotated image
    await writeFile(outputPath, rotatedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log rotation operation
    const rotationMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: rotatedBuffer.length,
      rotationAngle: angle,
      originalDimensions,
      rotatedDimensions: {
        width: rotatedMetadata.width || 0,
        height: rotatedMetadata.height || 0
      },
      outputFormat: outputFormat || originalMetadata.format,
      processingTime,
      inputFile: fileId,
      options: {
        backgroundColor: body.backgroundColor,
        autoTrim: body.autoTrim,
        quality: body.quality
      },
      createdAt: new Date().toISOString()
    }
    
    console.log('Image rotation completed:', rotationMetadata)
    
    return NextResponse.json<RotateResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalDimensions,
      rotatedDimensions: {
        width: rotatedMetadata.width || 0,
        height: rotatedMetadata.height || 0
      },
      rotationAngle: angle,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image rotation error:', error)
    
    return NextResponse.json<RotateResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during image rotation',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for rotation info
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
    const metadata = await sharp(inputPath).metadata()
    
    const info = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      orientation: metadata.orientation,
      commonAngles: [0, 90, 180, 270, -90, -180, -270],
      backgroundColors: ['white', 'black', 'transparent', 'gray'],
      outputFormats: ['jpeg', 'png', 'webp', 'avif'],
      features: ['autoTrim', 'customBackground', 'qualityControl']
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
