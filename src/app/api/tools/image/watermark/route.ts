import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface WatermarkRequest {
  fileId: string
  watermarkType: 'text' | 'image'
  text?: string
  watermarkImageId?: string
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom'
  customPosition?: { x: number; y: number }
  opacity?: number
  fontSize?: number
  fontColor?: string
  fontFamily?: string
  rotation?: number
  scale?: number
  margin?: number
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface WatermarkResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  processingTime?: number
  error?: string
}

// FileService handles directory paths
// FileService handles directory paths

async function ensureOutputDir() {
  try {
    const { mkdir } = await import('fs/promises')
    await mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create output directory:', error)
  }
}

// Parse color string to RGB values
function parseColor(color: string): { r: number; g: number; b: number } {
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
  
  // Handle rgb colors
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    }
  }
  
  // Default to black
  return { r: 0, g: 0, b: 0 }
}

// Calculate position based on image dimensions and watermark size
function calculatePosition(
  imageWidth: number,
  imageHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: string,
  customPosition?: { x: number; y: number },
  margin: number = 20
): { left: number; top: number } {
  switch (position) {
    case 'top-left':
      return { left: margin, top: margin }
    case 'top-right':
      return { left: imageWidth - watermarkWidth - margin, top: margin }
    case 'bottom-left':
      return { left: margin, top: imageHeight - watermarkHeight - margin }
    case 'bottom-right':
      return { left: imageWidth - watermarkWidth - margin, top: imageHeight - watermarkHeight - margin }
    case 'center':
      return { 
        left: Math.round((imageWidth - watermarkWidth) / 2), 
        top: Math.round((imageHeight - watermarkHeight) / 2) 
      }
    case 'custom':
      if (customPosition) {
        return { left: customPosition.x, top: customPosition.y }
      }
      // Fall back to center if custom position not provided
      return { 
        left: Math.round((imageWidth - watermarkWidth) / 2), 
        top: Math.round((imageHeight - watermarkHeight) / 2) 
      }
    default:
      return { 
        left: Math.round((imageWidth - watermarkWidth) / 2), 
        top: Math.round((imageHeight - watermarkHeight) / 2) 
      }
  }
}

// Create text watermark as SVG
function createTextWatermark(
  text: string,
  fontSize: number,
  color: string,
  fontFamily: string,
  rotation: number
): Buffer {
  const colorRgb = parseColor(color)
  const fillColor = `rgb(${colorRgb.r},${colorRgb.g},${colorRgb.b})`
  
  // Estimate text dimensions (rough calculation)
  const textWidth = text.length * fontSize * 0.6
  const textHeight = fontSize * 1.2
  
  const svg = `
    <svg width="${textWidth}" height="${textHeight}" xmlns="http://www.w3.org/2000/svg">
      <text 
        x="50%" 
        y="50%" 
        font-family="${fontFamily}" 
        font-size="${fontSize}" 
        fill="${fillColor}" 
        text-anchor="middle" 
        dominant-baseline="middle"
        transform="rotate(${rotation} ${textWidth/2} ${textHeight/2})"
      >
        ${text}
      </text>
    </svg>
  `
  
  return Buffer.from(svg)
}

async function addWatermark(
  inputPath: string,
  options: WatermarkRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo }> {
  const baseImage = sharp(inputPath)
  const imageMetadata = await baseImage.metadata()
  
  const imageWidth = imageMetadata.width || 0
  const imageHeight = imageMetadata.height || 0
  
  let watermarkBuffer: Buffer
  let watermarkMetadata: sharp.Metadata
  
  if (options.watermarkType === 'text') {
    if (!options.text) {
      throw new Error('Text is required for text watermark')
    }
    
    const fontSize = options.fontSize || 48
    const fontColor = options.fontColor || '#000000'
    const fontFamily = options.fontFamily || 'Arial, sans-serif'
    const rotation = options.rotation || 0
    
    watermarkBuffer = createTextWatermark(options.text, fontSize, fontColor, fontFamily, rotation)
    
    // Convert SVG to PNG for processing
    const textWatermark = sharp(watermarkBuffer)
    watermarkMetadata = await textWatermark.metadata()
    watermarkBuffer = await textWatermark.png().toBuffer()
    
  } else if (options.watermarkType === 'image') {
    if (!options.watermarkImageId) {
      throw new Error('Watermark image ID is required for image watermark')
    }
    
    const watermarkPath = join(UPLOAD_DIR, options.watermarkImageId)
    watermarkBuffer = await readFile(watermarkPath)
    watermarkMetadata = await sharp(watermarkBuffer).metadata()
    
    // Scale watermark if needed
    if (options.scale && options.scale !== 1) {
      const scaledWidth = Math.round((watermarkMetadata.width || 0) * options.scale)
      const scaledHeight = Math.round((watermarkMetadata.height || 0) * options.scale)
      
      watermarkBuffer = await sharp(watermarkBuffer)
        .resize(scaledWidth, scaledHeight)
        .toBuffer()
      
      watermarkMetadata = await sharp(watermarkBuffer).metadata()
    }
    
  } else {
    throw new Error('Invalid watermark type. Must be "text" or "image"')
  }
  
  // Calculate position
  const watermarkWidth = watermarkMetadata.width || 0
  const watermarkHeight = watermarkMetadata.height || 0
  const margin = options.margin || 20
  
  const position = calculatePosition(
    imageWidth,
    imageHeight,
    watermarkWidth,
    watermarkHeight,
    options.position,
    options.customPosition,
    margin
  )
  
  // Apply opacity to watermark
  const opacity = Math.round((options.opacity || 0.5) * 255)
  const watermarkWithOpacity = await sharp(watermarkBuffer)
    .ensureAlpha()
    .modulate({ alpha: options.opacity || 0.5 })
    .toBuffer()
  
  // Composite watermark onto base image
  let pipeline = baseImage.composite([{
    input: watermarkWithOpacity,
    left: position.left,
    top: position.top,
    blend: 'over'
  }])
  
  // Apply output format
  const outputFormat = options.outputFormat || imageMetadata.format as any || 'jpeg'
  const quality = options.quality || 90
  
  switch (outputFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true })
      break
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 6 })
      break
    case 'webp':
      pipeline = pipeline.webp({ quality })
      break
    case 'avif':
      pipeline = pipeline.avif({ quality })
      break
  }
  
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
  
  return { buffer: data, metadata: info }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: WatermarkRequest = await request.json()
    const { fileId, watermarkType, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!watermarkType) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'Watermark type is required (text or image)'
      }, { status: 400 })
    }
    
    // Validate watermark-specific requirements
    if (watermarkType === 'text' && !body.text) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'Text is required for text watermark'
      }, { status: 400 })
    }
    
    if (watermarkType === 'image' && !body.watermarkImageId) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'Watermark image ID is required for image watermark'
      }, { status: 400 })
    }
    
    // Validate opacity
    if (body.opacity !== undefined && (body.opacity < 0 || body.opacity > 1)) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'Opacity must be between 0 and 1'
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
    
    // Validate input image
    try {
      await sharp(inputPath).metadata()
    } catch (error) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Add watermark
    const { buffer } = await addWatermark(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const outputFormat = body.outputFormat || 'jpeg'
    const baseOutputName = outputName || `watermarked-image.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save watermarked image
    await writeFile(outputPath, buffer)
    
    const processingTime = Date.now() - startTime
    
    console.log('Image watermark completed:', {
      outputFileId,
      fileName: outputFileName,
      watermarkType,
      position: body.position,
      processingTime
    })
    
    return NextResponse.json<WatermarkResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image watermark error:', error)
    
    return NextResponse.json<WatermarkResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during watermark addition',
      processingTime
    }, { status: 500 })
  }
}
