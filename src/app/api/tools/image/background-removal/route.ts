import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface BackgroundRemovalRequest {
  fileId: string
  method: 'auto' | 'color-based' | 'edge-detection'
  targetColor?: string // For color-based removal
  tolerance?: number // Color tolerance (0-100)
  featherEdges?: boolean // Smooth edges
  newBackground?: {
    type: 'transparent' | 'solid' | 'gradient' | 'image'
    color?: string
    gradientColors?: string[]
    imageFileId?: string
  }
  outputFormat?: 'png' | 'webp' | 'avif' // Note: JPEG doesn't support transparency
  quality?: number
  outputName?: string
}

interface BackgroundRemovalResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  method?: string
  hasTransparency?: boolean
  dimensions?: { width: number; height: number }
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
function parseColor(colorString: string): { r: number; g: number; b: number } {
  let r = 255, g = 255, b = 255
  
  if (colorString.startsWith('#')) {
    const hex = colorString.slice(1)
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
    }
  } else if (colorString.startsWith('rgb')) {
    const match = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      r = parseInt(match[1])
      g = parseInt(match[2])
      b = parseInt(match[3])
    }
  } else {
    // Named colors
    const namedColors: { [key: string]: [number, number, number] } = {
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
    }
  }
  
  return { r, g, b }
}

// Remove background using different methods
async function removeBackground(
  inputPath: string,
  options: BackgroundRemovalRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo; hasTransparency: boolean }> {
  const image = sharp(inputPath)
  const metadata = await image.metadata()
  
  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to determine image dimensions')
  }

  let pipeline = image
  let hasTransparency = true

  switch (options.method) {
    case 'auto':
      // Placeholder for AI-based background removal
      // In production, you would integrate with services like:
      // - Remove.bg API
      // - Stability AI
      // - Custom ML models
      
      // For now, we'll simulate by creating a simple edge-based mask
      console.log('Auto background removal - using edge detection simulation')
      
      // Create a simple mask (this is a placeholder)
      const maskSvg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <defs>
            <radialGradient id="mask" cx="50%" cy="50%" r="40%">
              <stop offset="0%" style="stop-color:white;stop-opacity:1" />
              <stop offset="70%" style="stop-color:white;stop-opacity:1" />
              <stop offset="100%" style="stop-color:black;stop-opacity:1" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#mask)" />
        </svg>
      `
      
      pipeline = pipeline.composite([{
        input: Buffer.from(maskSvg),
        blend: 'dest-in'
      }])
      break

    case 'color-based':
      if (!options.targetColor) {
        throw new Error('Target color is required for color-based background removal')
      }
      
      const { r, g, b } = parseColor(options.targetColor)
      const tolerance = options.tolerance || 10
      
      // Create a mask based on color similarity
      // This is a simplified implementation
      // In production, you would use more sophisticated color matching
      
      const colorMaskSvg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <rect width="100%" height="100%" fill="white" />
        </svg>
      `
      
      // Note: This is a placeholder implementation
      // Real color-based removal would require pixel-level analysis
      pipeline = pipeline.composite([{
        input: Buffer.from(colorMaskSvg),
        blend: 'dest-in'
      }])
      break

    case 'edge-detection':
      // Simple edge-based background removal
      // Create a center-focused mask
      const edgeMaskSvg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <defs>
            <radialGradient id="edgeMask" cx="50%" cy="50%" r="45%">
              <stop offset="0%" style="stop-color:white;stop-opacity:1" />
              <stop offset="80%" style="stop-color:white;stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:black;stop-opacity:1" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#edgeMask)" />
        </svg>
      `
      
      pipeline = pipeline.composite([{
        input: Buffer.from(edgeMaskSvg),
        blend: 'dest-in'
      }])
      break

    default:
      throw new Error(`Unsupported background removal method: ${options.method}`)
  }

  // Apply feather edges if requested
  if (options.featherEdges) {
    // Blur the alpha channel slightly for smoother edges
    pipeline = pipeline.blur(0.5)
  }

  // Apply new background if specified
  if (options.newBackground) {
    switch (options.newBackground.type) {
      case 'solid':
        if (options.newBackground.color) {
          const bgColor = parseColor(options.newBackground.color)
          const backgroundSvg = `
            <svg width="${metadata.width}" height="${metadata.height}">
              <rect width="100%" height="100%" fill="rgb(${bgColor.r},${bgColor.g},${bgColor.b})" />
            </svg>
          `
          
          pipeline = sharp(Buffer.from(backgroundSvg))
            .composite([{ input: await pipeline.png().toBuffer(), blend: 'over' }])
          hasTransparency = false
        }
        break

      case 'gradient':
        if (options.newBackground.gradientColors && options.newBackground.gradientColors.length >= 2) {
          const color1 = parseColor(options.newBackground.gradientColors[0])
          const color2 = parseColor(options.newBackground.gradientColors[1])
          
          const gradientSvg = `
            <svg width="${metadata.width}" height="${metadata.height}">
              <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:rgb(${color1.r},${color1.g},${color1.b});stop-opacity:1" />
                  <stop offset="100%" style="stop-color:rgb(${color2.r},${color2.g},${color2.b});stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#bg)" />
            </svg>
          `
          
          pipeline = sharp(Buffer.from(gradientSvg))
            .composite([{ input: await pipeline.png().toBuffer(), blend: 'over' }])
          hasTransparency = false
        }
        break

      case 'image':
        // Placeholder for image background replacement
        // In production, you would load and composite the background image
        console.log('Image background replacement - placeholder implementation')
        break

      case 'transparent':
      default:
        // Keep transparent background
        break
    }
  }

  // Apply output format and quality
  const outputFormat = options.outputFormat || 'png'
  const quality = options.quality || 90

  switch (outputFormat) {
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
    hasTransparency
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: BackgroundRemovalRequest = await request.json()
    const { fileId, method, outputFormat = 'png', outputName } = body
    
    if (!fileId) {
      return NextResponse.json<BackgroundRemovalResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!method) {
      return NextResponse.json<BackgroundRemovalResponse>({
        success: false,
        error: 'Background removal method is required'
      }, { status: 400 })
    }
    
    const supportedMethods = ['auto', 'color-based', 'edge-detection']
    if (!supportedMethods.includes(method)) {
      return NextResponse.json<BackgroundRemovalResponse>({
        success: false,
        error: `Unsupported method. Supported methods: ${supportedMethods.join(', ')}`
      }, { status: 400 })
    }
    
    // Validate output format for transparency support
    if (body.newBackground?.type === 'transparent' && outputFormat === 'jpeg') {
      return NextResponse.json<BackgroundRemovalResponse>({
        success: false,
        error: 'JPEG format does not support transparency. Use PNG, WebP, or AVIF for transparent backgrounds.'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate image file
    let originalMetadata: sharp.Metadata
    try {
      originalMetadata = await sharp(inputPath).metadata()
    } catch (error) {
      return NextResponse.json<BackgroundRemovalResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Remove background
    const { buffer: processedBuffer, metadata: processedMetadata, hasTransparency } = await removeBackground(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat
    const baseOutputName = outputName || `background-removed.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Save processed image
    await writeFile(outputPath, processedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log background removal operation
    const removalMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: processedBuffer.length,
      method,
      hasTransparency,
      dimensions: {
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0
      },
      outputFormat,
      processingTime,
      inputFile: fileId,
      options: body,
      createdAt: new Date().toISOString()
    }
    
    console.log('Background removal completed:', removalMetadata)
    
    return NextResponse.json<BackgroundRemovalResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      method,
      hasTransparency,
      dimensions: {
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0
      },
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Background removal error:', error)
    
    return NextResponse.json<BackgroundRemovalResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during background removal',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for background removal info
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
      hasAlpha: metadata.hasAlpha,
      methods: [
        { value: 'auto', label: 'AI Auto-Detection', description: 'Automatically detect and remove background using AI' },
        { value: 'color-based', label: 'Color-Based', description: 'Remove background based on color similarity' },
        { value: 'edge-detection', label: 'Edge Detection', description: 'Remove background using edge detection' }
      ],
      backgroundTypes: ['transparent', 'solid', 'gradient', 'image'],
      outputFormats: ['png', 'webp', 'avif'],
      features: ['featherEdges', 'colorTolerance', 'customBackground']
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
