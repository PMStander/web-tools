import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface BorderRequest {
  fileId: string
  borderType: 'solid' | 'gradient' | 'pattern' | 'shadow'
  width: number // Border width in pixels
  color?: string // Border color (hex, rgb, or named)
  gradientColors?: string[] // For gradient borders
  style?: 'inside' | 'outside' | 'center'
  cornerRadius?: number // For rounded corners
  shadowOptions?: {
    offsetX: number
    offsetY: number
    blur: number
    color: string
  }
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface BorderResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  borderType?: string
  originalDimensions?: { width: number; height: number }
  newDimensions?: { width: number; height: number }
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
  let r = 0, g = 0, b = 0, alpha = 1
  
  if (colorString.startsWith('#')) {
    const hex = colorString.slice(1)
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
    }
  } else if (colorString.startsWith('rgb')) {
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
      'black': [0, 0, 0],
      'white': [255, 255, 255],
      'red': [255, 0, 0],
      'green': [0, 255, 0],
      'blue': [0, 0, 255],
      'gray': [128, 128, 128],
      'grey': [128, 128, 128]
    }
    
    const color = namedColors[colorString.toLowerCase()]
    if (color) {
      [r, g, b] = color
    }
  }
  
  return { r, g, b, alpha }
}

// Add border to image
async function addBorder(
  inputPath: string,
  options: BorderRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo; originalDimensions: { width: number; height: number } }> {
  const image = sharp(inputPath)
  const metadata = await image.metadata()
  
  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to determine image dimensions')
  }

  const originalDimensions = {
    width: metadata.width,
    height: metadata.height
  }

  const borderWidth = Math.max(1, options.width)
  let pipeline = image

  switch (options.borderType) {
    case 'solid':
      const color = parseColor(options.color || '#000000')
      
      if (options.style === 'outside') {
        // Add border outside the image (increases dimensions)
        pipeline = pipeline.extend({
          top: borderWidth,
          bottom: borderWidth,
          left: borderWidth,
          right: borderWidth,
          background: { r: color.r, g: color.g, b: color.b, alpha: (color.alpha || 1) * 255 }
        })
      } else if (options.style === 'inside') {
        // Add border inside the image (overlay on existing content)
        const borderSvg = `
          <svg width="${metadata.width}" height="${metadata.height}">
            <rect x="0" y="0" width="${metadata.width}" height="${metadata.height}" 
                  fill="none" stroke="rgb(${color.r},${color.g},${color.b})" 
                  stroke-width="${borderWidth * 2}" />
          </svg>
        `
        
        pipeline = pipeline.composite([{
          input: Buffer.from(borderSvg),
          blend: 'over'
        }])
      } else {
        // Center style (default to outside)
        pipeline = pipeline.extend({
          top: Math.floor(borderWidth / 2),
          bottom: Math.ceil(borderWidth / 2),
          left: Math.floor(borderWidth / 2),
          right: Math.ceil(borderWidth / 2),
          background: { r: color.r, g: color.g, b: color.b, alpha: (color.alpha || 1) * 255 }
        })
      }
      break

    case 'gradient':
      if (options.gradientColors && options.gradientColors.length >= 2) {
        const color1 = parseColor(options.gradientColors[0])
        const color2 = parseColor(options.gradientColors[1])
        
        const gradientSvg = `
          <svg width="${metadata.width + borderWidth * 2}" height="${metadata.height + borderWidth * 2}">
            <defs>
              <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(${color1.r},${color1.g},${color1.b});stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(${color2.r},${color2.g},${color2.b});stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#borderGradient)" />
          </svg>
        `
        
        pipeline = sharp(Buffer.from(gradientSvg))
          .composite([{
            input: await image.toBuffer(),
            left: borderWidth,
            top: borderWidth,
            blend: 'over'
          }])
      } else {
        throw new Error('Gradient border requires at least 2 colors')
      }
      break

    case 'pattern':
      // Simple pattern border (checkerboard)
      const patternColor = parseColor(options.color || '#000000')
      const patternSvg = `
        <svg width="${metadata.width + borderWidth * 2}" height="${metadata.height + borderWidth * 2}">
          <defs>
            <pattern id="checkerboard" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="5" height="5" fill="rgb(${patternColor.r},${patternColor.g},${patternColor.b})" />
              <rect x="5" y="5" width="5" height="5" fill="rgb(${patternColor.r},${patternColor.g},${patternColor.b})" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#checkerboard)" />
        </svg>
      `
      
      pipeline = sharp(Buffer.from(patternSvg))
        .composite([{
          input: await image.toBuffer(),
          left: borderWidth,
          top: borderWidth,
          blend: 'over'
        }])
      break

    case 'shadow':
      if (options.shadowOptions) {
        const { offsetX, offsetY, blur, color: shadowColor } = options.shadowOptions
        const shadowColorParsed = parseColor(shadowColor)
        
        // Create shadow effect
        const shadowWidth = metadata.width + Math.abs(offsetX) + blur * 2
        const shadowHeight = metadata.height + Math.abs(offsetY) + blur * 2
        
        const shadowSvg = `
          <svg width="${shadowWidth}" height="${shadowHeight}">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="${offsetX}" dy="${offsetY}" stdDeviation="${blur}" 
                             flood-color="rgb(${shadowColorParsed.r},${shadowColorParsed.g},${shadowColorParsed.b})" />
              </filter>
            </defs>
            <rect width="${metadata.width}" height="${metadata.height}" 
                  x="${Math.max(0, -offsetX) + blur}" y="${Math.max(0, -offsetY) + blur}"
                  fill="white" filter="url(#shadow)" />
          </svg>
        `
        
        pipeline = sharp(Buffer.from(shadowSvg))
          .composite([{
            input: await image.toBuffer(),
            left: Math.max(0, -offsetX) + blur,
            top: Math.max(0, -offsetY) + blur,
            blend: 'over'
          }])
      } else {
        throw new Error('Shadow border requires shadow options')
      }
      break

    default:
      throw new Error(`Unsupported border type: ${options.borderType}`)
  }

  // Apply corner radius if specified
  if (options.cornerRadius && options.cornerRadius > 0) {
    const currentMetadata = await pipeline.metadata()
    const radius = Math.min(options.cornerRadius, Math.min(currentMetadata.width || 0, currentMetadata.height || 0) / 2)
    
    const maskSvg = `
      <svg width="${currentMetadata.width}" height="${currentMetadata.height}">
        <rect x="0" y="0" width="${currentMetadata.width}" height="${currentMetadata.height}" 
              rx="${radius}" ry="${radius}" fill="white" />
      </svg>
    `
    
    pipeline = pipeline.composite([{
      input: Buffer.from(maskSvg),
      blend: 'dest-in'
    }])
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
    metadata: info,
    originalDimensions
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: BorderRequest = await request.json()
    const { fileId, borderType, width, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<BorderResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!borderType) {
      return NextResponse.json<BorderResponse>({
        success: false,
        error: 'Border type is required'
      }, { status: 400 })
    }
    
    if (!width || width < 1 || width > 100) {
      return NextResponse.json<BorderResponse>({
        success: false,
        error: 'Border width must be between 1 and 100 pixels'
      }, { status: 400 })
    }
    
    const supportedTypes = ['solid', 'gradient', 'pattern', 'shadow']
    if (!supportedTypes.includes(borderType)) {
      return NextResponse.json<BorderResponse>({
        success: false,
        error: `Unsupported border type. Supported types: ${supportedTypes.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate image file
    let originalMetadata: sharp.Metadata
    try {
      originalMetadata = await sharp(inputPath).metadata()
    } catch (error) {
      return NextResponse.json<BorderResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Add border to image
    const { buffer: borderedBuffer, metadata: borderedMetadata, originalDimensions } = await addBorder(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : (outputFormat || originalMetadata.format || 'png')
    const baseOutputName = outputName || `bordered-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Save bordered image
    await writeFile(outputPath, borderedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log border operation
    const borderMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: borderedBuffer.length,
      borderType,
      borderWidth: width,
      originalDimensions,
      newDimensions: {
        width: borderedMetadata.width || 0,
        height: borderedMetadata.height || 0
      },
      outputFormat: outputFormat || originalMetadata.format,
      processingTime,
      inputFile: fileId,
      options: body,
      createdAt: new Date().toISOString()
    }
    
    console.log('Border addition completed:', borderMetadata)
    
    return NextResponse.json<BorderResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      borderType,
      originalDimensions,
      newDimensions: {
        width: borderedMetadata.width || 0,
        height: borderedMetadata.height || 0
      },
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Border addition error:', error)
    
    return NextResponse.json<BorderResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during border addition',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for border info
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
      borderTypes: [
        { value: 'solid', label: 'Solid Border', description: 'Single color border' },
        { value: 'gradient', label: 'Gradient Border', description: 'Gradient color border' },
        { value: 'pattern', label: 'Pattern Border', description: 'Patterned border' },
        { value: 'shadow', label: 'Drop Shadow', description: 'Shadow effect border' }
      ],
      styles: ['inside', 'outside', 'center'],
      outputFormats: ['jpeg', 'png', 'webp', 'avif'],
      features: ['solidColors', 'gradients', 'patterns', 'shadows', 'roundedCorners']
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
