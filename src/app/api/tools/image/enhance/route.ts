import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface EnhanceRequest {
  fileId: string
  enhancementType: 'auto' | 'denoise' | 'upscale' | 'sharpen' | 'color-correction' | 'low-light'
  intensity?: number // 1-100, enhancement intensity
  options?: {
    preserveDetails?: boolean
    enhanceColors?: boolean
    reduceNoise?: boolean
    improveSharpness?: boolean
    upscaleFactor?: number // 2x, 4x, etc.
    targetSize?: { width: number; height: number }
  }
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface EnhanceResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  enhancementType?: string
  originalDimensions?: { width: number; height: number }
  enhancedDimensions?: { width: number; height: number }
  improvementScore?: number
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

// Enhance image using different methods
async function enhanceImage(
  inputPath: string,
  options: EnhanceRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo; originalDimensions: { width: number; height: number }; improvementScore: number }> {
  const image = sharp(inputPath)
  const originalMetadata = await image.metadata()
  
  if (!originalMetadata.width || !originalMetadata.height) {
    throw new Error('Unable to determine image dimensions')
  }

  const originalDimensions = {
    width: originalMetadata.width,
    height: originalMetadata.height
  }

  let pipeline = image
  const intensity = (options.intensity || 50) / 100 // Convert to 0-1 range
  let improvementScore = 0

  switch (options.enhancementType) {
    case 'auto':
      // Auto enhancement combines multiple techniques
      console.log('Applying auto enhancement...')
      
      // Normalize the image
      pipeline = pipeline.normalize()
      improvementScore += 20
      
      // Enhance contrast
      pipeline = pipeline.linear(1 + (intensity * 0.3), -(intensity * 10))
      improvementScore += 15
      
      // Sharpen slightly
      pipeline = pipeline.sharpen(1 + intensity, 1, 2)
      improvementScore += 15
      
      // Enhance colors if requested
      if (options.options?.enhanceColors) {
        pipeline = pipeline.modulate({
          saturation: 1 + (intensity * 0.2),
          brightness: 1 + (intensity * 0.1)
        })
        improvementScore += 20
      }
      
      // Reduce noise if requested
      if (options.options?.reduceNoise) {
        pipeline = pipeline.median(Math.ceil(intensity * 3))
        improvementScore += 10
      }
      break

    case 'denoise':
      // Noise reduction using median filter and blur
      console.log('Applying noise reduction...')
      
      const medianSize = Math.max(1, Math.ceil(intensity * 5))
      pipeline = pipeline.median(medianSize)
      
      // Light gaussian blur for additional noise reduction
      if (intensity > 0.5) {
        pipeline = pipeline.blur(intensity * 0.5)
      }
      
      improvementScore = Math.round(intensity * 80)
      break

    case 'upscale':
      // Image upscaling
      console.log('Applying upscaling...')
      
      const upscaleFactor = options.options?.upscaleFactor || 2
      const newWidth = originalDimensions.width * upscaleFactor
      const newHeight = originalDimensions.height * upscaleFactor
      
      // Use Lanczos resampling for better quality
      pipeline = pipeline.resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill'
      })
      
      // Apply sharpening after upscaling
      pipeline = pipeline.sharpen(1 + intensity, 1, 2)
      
      improvementScore = Math.round(upscaleFactor * 25)
      break

    case 'sharpen':
      // Image sharpening
      console.log('Applying sharpening...')
      
      const sigma = 1 + (intensity * 2)
      const flat = 1
      const jagged = 2 + (intensity * 3)
      
      pipeline = pipeline.sharpen(sigma, flat, jagged)
      
      improvementScore = Math.round(intensity * 70)
      break

    case 'color-correction':
      // Color correction and enhancement
      console.log('Applying color correction...')
      
      // Normalize colors
      pipeline = pipeline.normalize()
      
      // Enhance saturation and brightness
      pipeline = pipeline.modulate({
        saturation: 1 + (intensity * 0.3),
        brightness: 1 + (intensity * 0.1),
        hue: 0 // Keep hue unchanged
      })
      
      // Adjust contrast
      pipeline = pipeline.linear(1 + (intensity * 0.2), -(intensity * 5))
      
      improvementScore = Math.round(intensity * 75)
      break

    case 'low-light':
      // Low-light enhancement
      console.log('Applying low-light enhancement...')
      
      // Brighten the image
      pipeline = pipeline.modulate({
        brightness: 1 + (intensity * 0.5)
      })
      
      // Enhance contrast
      pipeline = pipeline.linear(1 + (intensity * 0.4), -(intensity * 15))
      
      // Reduce noise that might be amplified
      if (intensity > 0.3) {
        pipeline = pipeline.median(2)
      }
      
      // Enhance shadows
      pipeline = pipeline.gamma(1 - (intensity * 0.2))
      
      improvementScore = Math.round(intensity * 85)
      break

    default:
      throw new Error(`Unsupported enhancement type: ${options.enhancementType}`)
  }

  // Apply target size if specified
  if (options.options?.targetSize) {
    const { width, height } = options.options.targetSize
    pipeline = pipeline.resize(width, height, {
      kernel: sharp.kernel.lanczos3,
      fit: 'inside',
      withoutEnlargement: false
    })
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
    originalDimensions,
    improvementScore: Math.min(100, improvementScore)
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: EnhanceRequest = await request.json()
    const { fileId, enhancementType, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<EnhanceResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!enhancementType) {
      return NextResponse.json<EnhanceResponse>({
        success: false,
        error: 'Enhancement type is required'
      }, { status: 400 })
    }
    
    const supportedTypes = ['auto', 'denoise', 'upscale', 'sharpen', 'color-correction', 'low-light']
    if (!supportedTypes.includes(enhancementType)) {
      return NextResponse.json<EnhanceResponse>({
        success: false,
        error: `Unsupported enhancement type. Supported types: ${supportedTypes.join(', ')}`
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
      return NextResponse.json<EnhanceResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Enhance image
    const { 
      buffer: enhancedBuffer, 
      metadata: enhancedMetadata, 
      originalDimensions,
      improvementScore 
    } = await enhanceImage(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : (outputFormat || originalMetadata.format || 'png')
    const baseOutputName = outputName || `enhanced-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save enhanced image
    await writeFile(outputPath, enhancedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log enhancement operation
    const enhancementMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: enhancedBuffer.length,
      enhancementType,
      intensity: body.intensity,
      originalDimensions,
      enhancedDimensions: {
        width: enhancedMetadata.width || 0,
        height: enhancedMetadata.height || 0
      },
      improvementScore,
      outputFormat: outputFormat || originalMetadata.format,
      processingTime,
      inputFile: fileId,
      options: body.options,
      createdAt: new Date().toISOString()
    }
    
    console.log('Image enhancement completed:', enhancementMetadata)
    
    return NextResponse.json<EnhanceResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      enhancementType,
      originalDimensions,
      enhancedDimensions: {
        width: enhancedMetadata.width || 0,
        height: enhancedMetadata.height || 0
      },
      improvementScore,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image enhancement error:', error)
    
    return NextResponse.json<EnhanceResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during image enhancement',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for enhancement info
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
      enhancementTypes: [
        { value: 'auto', label: 'Auto Enhancement', description: 'Automatically enhance image quality' },
        { value: 'denoise', label: 'Noise Reduction', description: 'Remove noise and grain from images' },
        { value: 'upscale', label: 'Upscale', description: 'Increase image resolution' },
        { value: 'sharpen', label: 'Sharpen', description: 'Enhance image sharpness and details' },
        { value: 'color-correction', label: 'Color Correction', description: 'Improve colors and contrast' },
        { value: 'low-light', label: 'Low-Light Enhancement', description: 'Enhance dark or underexposed images' }
      ],
      upscaleFactors: [2, 3, 4],
      outputFormats: ['jpeg', 'png', 'webp', 'avif'],
      features: ['intensityControl', 'preserveDetails', 'enhanceColors', 'reduceNoise']
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
