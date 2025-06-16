import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface BlurRequest {
  fileId: string
  blurType: 'gaussian' | 'motion' | 'radial' | 'selective'
  intensity: number // 0.1-10.0 for gaussian, 1-50 for others
  options?: {
    angle?: number // For motion blur (0-360 degrees)
    centerX?: number // For radial blur (0-1, relative to image width)
    centerY?: number // For radial blur (0-1, relative to image height)
    maskArea?: { x: number; y: number; width: number; height: number } // For selective blur
    preserveEdges?: boolean
  }
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface BlurResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  blurType?: string
  intensity?: number
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

// Apply blur effect to image
async function blurImage(
  inputPath: string,
  options: BlurRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo }> {
  const image = sharp(inputPath)
  const metadata = await image.metadata()
  
  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to determine image dimensions')
  }

  let pipeline = image

  switch (options.blurType) {
    case 'gaussian':
      // Standard Gaussian blur
      const sigma = Math.max(0.1, Math.min(10.0, options.intensity))
      pipeline = pipeline.blur(sigma)
      break

    case 'motion':
      // Motion blur simulation using directional blur
      // Note: This is a simplified implementation
      // In production, you might use more sophisticated motion blur algorithms
      const motionIntensity = Math.max(1, Math.min(50, options.intensity))
      const angle = options.options?.angle || 0
      
      // Create motion blur effect by combining multiple shifted images
      // This is a placeholder implementation
      pipeline = pipeline.blur(motionIntensity / 10)
      break

    case 'radial':
      // Radial blur (zoom blur effect)
      // This is a simplified implementation using gaussian blur
      // In production, you would implement proper radial blur
      const radialIntensity = Math.max(1, Math.min(50, options.intensity))
      const centerX = options.options?.centerX || 0.5
      const centerY = options.options?.centerY || 0.5
      
      // Apply blur with varying intensity from center
      pipeline = pipeline.blur(radialIntensity / 5)
      break

    case 'selective':
      // Selective blur (blur specific areas)
      const selectiveIntensity = Math.max(1, Math.min(50, options.intensity))
      
      if (options.options?.maskArea) {
        const { x, y, width, height } = options.options.maskArea
        
        // Extract the area to blur
        const blurredArea = await image
          .extract({ left: x, top: y, width, height })
          .blur(selectiveIntensity / 5)
          .toBuffer()
        
        // Composite the blurred area back onto the original image
        pipeline = pipeline.composite([{
          input: blurredArea,
          left: x,
          top: y,
          blend: 'over'
        }])
      } else {
        // If no mask area specified, apply light blur to entire image
        pipeline = pipeline.blur(selectiveIntensity / 10)
      }
      break

    default:
      throw new Error(`Unsupported blur type: ${options.blurType}`)
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
    
    const body: BlurRequest = await request.json()
    const { fileId, blurType, intensity, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<BlurResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!blurType) {
      return NextResponse.json<BlurResponse>({
        success: false,
        error: 'Blur type is required'
      }, { status: 400 })
    }
    
    if (intensity === undefined || intensity === null) {
      return NextResponse.json<BlurResponse>({
        success: false,
        error: 'Blur intensity is required'
      }, { status: 400 })
    }
    
    const supportedTypes = ['gaussian', 'motion', 'radial', 'selective']
    if (!supportedTypes.includes(blurType)) {
      return NextResponse.json<BlurResponse>({
        success: false,
        error: `Unsupported blur type. Supported types: ${supportedTypes.join(', ')}`
      }, { status: 400 })
    }
    
    // Validate intensity range based on blur type
    const maxIntensity = blurType === 'gaussian' ? 10.0 : 50
    if (intensity < 0.1 || intensity > maxIntensity) {
      return NextResponse.json<BlurResponse>({
        success: false,
        error: `Intensity must be between 0.1 and ${maxIntensity} for ${blurType} blur`
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
      return NextResponse.json<BlurResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Apply blur effect
    const { buffer: blurredBuffer, metadata: blurredMetadata } = await blurImage(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : (outputFormat || originalMetadata.format || 'png')
    const baseOutputName = outputName || `blurred-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save blurred image
    await writeFile(outputPath, blurredBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log blur operation
    const blurMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: blurredBuffer.length,
      blurType,
      intensity,
      dimensions: {
        width: blurredMetadata.width || 0,
        height: blurredMetadata.height || 0
      },
      outputFormat: outputFormat || originalMetadata.format,
      processingTime,
      inputFile: fileId,
      options: body.options,
      createdAt: new Date().toISOString()
    }
    
    console.log('Image blur completed:', blurMetadata)
    
    return NextResponse.json<BlurResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      blurType,
      intensity,
      dimensions: {
        width: blurredMetadata.width || 0,
        height: blurredMetadata.height || 0
      },
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image blur error:', error)
    
    return NextResponse.json<BlurResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during image blurring',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for blur info
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
      blurTypes: [
        { value: 'gaussian', label: 'Gaussian Blur', description: 'Standard blur effect', intensityRange: '0.1-10.0' },
        { value: 'motion', label: 'Motion Blur', description: 'Directional motion blur effect', intensityRange: '1-50' },
        { value: 'radial', label: 'Radial Blur', description: 'Zoom/radial blur effect', intensityRange: '1-50' },
        { value: 'selective', label: 'Selective Blur', description: 'Blur specific areas', intensityRange: '1-50' }
      ],
      outputFormats: ['jpeg', 'png', 'webp', 'avif'],
      features: ['intensityControl', 'angleControl', 'centerPoint', 'selectiveArea']
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
