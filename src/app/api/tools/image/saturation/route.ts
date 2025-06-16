import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface SaturationRequest {
  fileId: string
  saturation?: number // -100 to 100 (percentage change)
  vibrance?: number // -100 to 100 (smart saturation)
  hue?: number // -180 to 180 (hue shift in degrees)
  colorBalance?: {
    red?: number // -100 to 100
    green?: number // -100 to 100
    blue?: number // -100 to 100
  }
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface SaturationResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  adjustments?: {
    saturation?: number
    vibrance?: number
    hue?: number
    colorBalance?: {
      red?: number
      green?: number
      blue?: number
    }
  }
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

// Adjust color saturation and related properties
async function adjustSaturation(
  inputPath: string,
  options: SaturationRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo }> {
  const image = sharp(inputPath)
  const metadata = await image.metadata()
  
  let pipeline = image

  // Apply saturation, vibrance, and hue adjustments using modulate
  const saturation = options.saturation || 0
  const hue = options.hue || 0
  
  // Convert percentage to multiplier for saturation
  const saturationMultiplier = 1 + (saturation / 100)
  
  // Apply modulation if any color adjustments are needed
  if (saturation !== 0 || hue !== 0) {
    pipeline = pipeline.modulate({
      saturation: Math.max(0, saturationMultiplier),
      hue: hue
    })
  }

  // Apply vibrance (smart saturation) - simulated with selective saturation
  if (options.vibrance && options.vibrance !== 0) {
    const vibranceMultiplier = 1 + (options.vibrance / 200) // More subtle than regular saturation
    pipeline = pipeline.modulate({
      saturation: Math.max(0, vibranceMultiplier)
    })
  }

  // Apply color balance adjustments
  if (options.colorBalance) {
    const { red = 0, green = 0, blue = 0 } = options.colorBalance
    
    if (red !== 0 || green !== 0 || blue !== 0) {
      // Convert percentage adjustments to linear multipliers
      const redMultiplier = 1 + (red / 100)
      const greenMultiplier = 1 + (green / 100)
      const blueMultiplier = 1 + (blue / 100)
      
      // Apply color channel adjustments
      // Note: This is a simplified implementation
      // In production, you might use more sophisticated color grading
      pipeline = pipeline.linear(
        [redMultiplier, greenMultiplier, blueMultiplier],
        [0, 0, 0]
      )
    }
  }

  // Apply output format and quality
  const outputFormat = options.outputFormat || metadata.format as any || 'png'
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
    
    const body: SaturationRequest = await request.json()
    const { fileId, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<SaturationResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    // Validate adjustment ranges
    if (body.saturation !== undefined && (body.saturation < -100 || body.saturation > 100)) {
      return NextResponse.json<SaturationResponse>({
        success: false,
        error: 'Saturation must be between -100 and 100'
      }, { status: 400 })
    }
    
    if (body.vibrance !== undefined && (body.vibrance < -100 || body.vibrance > 100)) {
      return NextResponse.json<SaturationResponse>({
        success: false,
        error: 'Vibrance must be between -100 and 100'
      }, { status: 400 })
    }
    
    if (body.hue !== undefined && (body.hue < -180 || body.hue > 180)) {
      return NextResponse.json<SaturationResponse>({
        success: false,
        error: 'Hue must be between -180 and 180 degrees'
      }, { status: 400 })
    }
    
    // Validate color balance ranges
    if (body.colorBalance) {
      const { red, green, blue } = body.colorBalance
      if ((red !== undefined && (red < -100 || red > 100)) ||
          (green !== undefined && (green < -100 || green > 100)) ||
          (blue !== undefined && (blue < -100 || blue > 100))) {
        return NextResponse.json<SaturationResponse>({
          success: false,
          error: 'Color balance values must be between -100 and 100'
        }, { status: 400 })
      }
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
      return NextResponse.json<SaturationResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Apply saturation adjustments
    const { buffer: adjustedBuffer, metadata: adjustedMetadata } = await adjustSaturation(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : (outputFormat || originalMetadata.format || 'png')
    const baseOutputName = outputName || `color-adjusted-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save adjusted image
    await writeFile(outputPath, adjustedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log adjustment operation
    const adjustmentMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: adjustedBuffer.length,
      adjustments: {
        saturation: body.saturation,
        vibrance: body.vibrance,
        hue: body.hue,
        colorBalance: body.colorBalance
      },
      dimensions: {
        width: adjustedMetadata.width || 0,
        height: adjustedMetadata.height || 0
      },
      outputFormat: outputFormat || originalMetadata.format,
      processingTime,
      inputFile: fileId,
      createdAt: new Date().toISOString()
    }
    
    console.log('Color saturation adjustment completed:', adjustmentMetadata)
    
    return NextResponse.json<SaturationResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      adjustments: {
        saturation: body.saturation,
        vibrance: body.vibrance,
        hue: body.hue,
        colorBalance: body.colorBalance
      },
      dimensions: {
        width: adjustedMetadata.width || 0,
        height: adjustedMetadata.height || 0
      },
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Color saturation adjustment error:', error)
    
    return NextResponse.json<SaturationResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during color adjustment',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for adjustment info
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
      adjustments: [
        { name: 'saturation', range: [-100, 100], default: 0, description: 'Adjust color saturation' },
        { name: 'vibrance', range: [-100, 100], default: 0, description: 'Smart saturation adjustment' },
        { name: 'hue', range: [-180, 180], default: 0, description: 'Shift hue (color wheel rotation)' },
        { name: 'colorBalance', type: 'object', description: 'Adjust individual color channels' }
      ],
      colorChannels: ['red', 'green', 'blue'],
      outputFormats: ['jpeg', 'png', 'webp', 'avif'],
      features: ['realTimePreview', 'preciseControl', 'colorBalance', 'vibranceControl']
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
