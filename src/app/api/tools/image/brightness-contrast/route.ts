import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface BrightnessContrastRequest {
  fileId: string
  brightness?: number // -100 to 100
  contrast?: number // -100 to 100
  gamma?: number // 0.1 to 3.0
  exposure?: number // -2.0 to 2.0
  highlights?: number // -100 to 100
  shadows?: number // -100 to 100
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface BrightnessContrastResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  adjustments?: {
    brightness?: number
    contrast?: number
    gamma?: number
    exposure?: number
    highlights?: number
    shadows?: number
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

// Adjust brightness and contrast
async function adjustBrightnessContrast(
  inputPath: string,
  options: BrightnessContrastRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo }> {
  const image = sharp(inputPath)
  const metadata = await image.metadata()
  
  let pipeline = image

  // Apply brightness and contrast adjustments
  const brightness = options.brightness || 0
  const contrast = options.contrast || 0
  
  // Convert percentage values to multipliers
  const brightnessMultiplier = brightness / 100
  const contrastMultiplier = 1 + (contrast / 100)
  
  // Apply linear transformation for brightness and contrast
  // Formula: output = (input * contrast) + brightness
  if (brightness !== 0 || contrast !== 0) {
    pipeline = pipeline.linear(contrastMultiplier, brightnessMultiplier * 255)
  }

  // Apply gamma correction
  if (options.gamma && options.gamma !== 1.0) {
    const gamma = Math.max(0.1, Math.min(3.0, options.gamma))
    pipeline = pipeline.gamma(gamma)
  }

  // Apply exposure adjustment (simulated)
  if (options.exposure && options.exposure !== 0) {
    const exposureMultiplier = Math.pow(2, options.exposure)
    pipeline = pipeline.linear(exposureMultiplier, 0)
  }

  // Apply highlights and shadows adjustments using modulate
  if (options.highlights !== undefined || options.shadows !== undefined) {
    const highlights = options.highlights || 0
    const shadows = options.shadows || 0
    
    // Simulate highlights/shadows adjustment with brightness modulation
    const brightnessAdjust = 1 + ((highlights - shadows) / 200)
    pipeline = pipeline.modulate({
      brightness: Math.max(0.1, Math.min(2.0, brightnessAdjust))
    })
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
    
    const body: BrightnessContrastRequest = await request.json()
    const { fileId, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<BrightnessContrastResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    // Validate adjustment ranges
    if (body.brightness !== undefined && (body.brightness < -100 || body.brightness > 100)) {
      return NextResponse.json<BrightnessContrastResponse>({
        success: false,
        error: 'Brightness must be between -100 and 100'
      }, { status: 400 })
    }
    
    if (body.contrast !== undefined && (body.contrast < -100 || body.contrast > 100)) {
      return NextResponse.json<BrightnessContrastResponse>({
        success: false,
        error: 'Contrast must be between -100 and 100'
      }, { status: 400 })
    }
    
    if (body.gamma !== undefined && (body.gamma < 0.1 || body.gamma > 3.0)) {
      return NextResponse.json<BrightnessContrastResponse>({
        success: false,
        error: 'Gamma must be between 0.1 and 3.0'
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
      return NextResponse.json<BrightnessContrastResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Apply brightness/contrast adjustments
    const { buffer: adjustedBuffer, metadata: adjustedMetadata } = await adjustBrightnessContrast(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : (outputFormat || originalMetadata.format || 'png')
    const baseOutputName = outputName || `adjusted-image.${fileExtension}`
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
        brightness: body.brightness,
        contrast: body.contrast,
        gamma: body.gamma,
        exposure: body.exposure,
        highlights: body.highlights,
        shadows: body.shadows
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
    
    console.log('Brightness/contrast adjustment completed:', adjustmentMetadata)
    
    return NextResponse.json<BrightnessContrastResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      adjustments: {
        brightness: body.brightness,
        contrast: body.contrast,
        gamma: body.gamma,
        exposure: body.exposure,
        highlights: body.highlights,
        shadows: body.shadows
      },
      dimensions: {
        width: adjustedMetadata.width || 0,
        height: adjustedMetadata.height || 0
      },
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Brightness/contrast adjustment error:', error)
    
    return NextResponse.json<BrightnessContrastResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during brightness/contrast adjustment',
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
        { name: 'brightness', range: [-100, 100], default: 0, description: 'Adjust image brightness' },
        { name: 'contrast', range: [-100, 100], default: 0, description: 'Adjust image contrast' },
        { name: 'gamma', range: [0.1, 3.0], default: 1.0, description: 'Adjust gamma correction' },
        { name: 'exposure', range: [-2.0, 2.0], default: 0, description: 'Adjust exposure' },
        { name: 'highlights', range: [-100, 100], default: 0, description: 'Adjust highlights' },
        { name: 'shadows', range: [-100, 100], default: 0, description: 'Adjust shadows' }
      ],
      outputFormats: ['jpeg', 'png', 'webp', 'avif'],
      features: ['realTimePreview', 'preciseControl', 'multipleAdjustments']
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
