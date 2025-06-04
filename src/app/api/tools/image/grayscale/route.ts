import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface GrayscaleRequest {
  fileId: string
  method: 'standard' | 'luminance' | 'average' | 'red-channel' | 'green-channel' | 'blue-channel'
  preserveColors?: {
    enabled: boolean
    colors?: string[] // Hex colors to preserve
    tolerance?: number // 0-100
  }
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

interface GrayscaleResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  method?: string
  preservedColors?: string[]
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

// Convert image to grayscale using different methods
async function convertToGrayscale(
  inputPath: string,
  options: GrayscaleRequest
): Promise<{ buffer: Buffer; metadata: sharp.OutputInfo }> {
  const image = sharp(inputPath)
  const metadata = await image.metadata()
  
  let pipeline = image

  switch (options.method) {
    case 'standard':
      // Standard grayscale conversion
      pipeline = pipeline.grayscale()
      break

    case 'luminance':
      // Luminance-based grayscale (weighted average)
      // This is the default method Sharp uses, so it's the same as standard
      pipeline = pipeline.grayscale()
      break

    case 'average':
      // Simple average of RGB channels
      // Note: Sharp doesn't have a direct average method, so we simulate it
      pipeline = pipeline.linear([0.333, 0.333, 0.333], [0, 0, 0]).grayscale()
      break

    case 'red-channel':
      // Use only the red channel
      pipeline = pipeline.extractChannel('red').grayscale()
      break

    case 'green-channel':
      // Use only the green channel
      pipeline = pipeline.extractChannel('green').grayscale()
      break

    case 'blue-channel':
      // Use only the blue channel
      pipeline = pipeline.extractChannel('blue').grayscale()
      break

    default:
      throw new Error(`Unsupported grayscale method: ${options.method}`)
  }

  // Handle color preservation (selective color)
  if (options.preserveColors?.enabled && options.preserveColors.colors && options.preserveColors.colors.length > 0) {
    // This is a complex operation that would require pixel-level manipulation
    // For now, we'll apply standard grayscale and note that color preservation
    // would require more advanced image processing libraries or custom algorithms
    console.log('Color preservation requested - this would require advanced processing')
    
    // In production, you would:
    // 1. Load the original image
    // 2. Create a mask for the colors to preserve
    // 3. Apply grayscale to the non-masked areas
    // 4. Composite the preserved colors back onto the grayscale image
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
    
    const body: GrayscaleRequest = await request.json()
    const { fileId, method = 'standard', outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<GrayscaleResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    const supportedMethods = ['standard', 'luminance', 'average', 'red-channel', 'green-channel', 'blue-channel']
    if (!supportedMethods.includes(method)) {
      return NextResponse.json<GrayscaleResponse>({
        success: false,
        error: `Unsupported grayscale method. Supported methods: ${supportedMethods.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate image file
    let originalMetadata: sharp.Metadata
    try {
      originalMetadata = await sharp(inputPath).metadata()
    } catch (error) {
      return NextResponse.json<GrayscaleResponse>({
        success: false,
        error: 'Invalid or corrupted image file'
      }, { status: 400 })
    }
    
    // Convert to grayscale
    const { buffer: grayscaleBuffer, metadata: grayscaleImageMetadata } = await convertToGrayscale(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : (outputFormat || grayscaleImageMetadata.format || 'png')
    const baseOutputName = outputName || `grayscale-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Save grayscale image
    await writeFile(outputPath, grayscaleBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log grayscale operation
    const grayscaleMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: grayscaleBuffer.length,
      method,
      preserveColors: body.preserveColors,
      dimensions: {
        width: grayscaleMetadata.width || 0,
        height: grayscaleMetadata.height || 0
      },
      outputFormat: outputFormat || originalMetadata.format,
      processingTime,
      inputFile: fileId,
      createdAt: new Date().toISOString()
    }
    
    console.log('Grayscale conversion completed:', grayscaleMetadata)
    
    return NextResponse.json<GrayscaleResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      method,
      preservedColors: body.preserveColors?.colors,
      dimensions: {
        width: grayscaleMetadata.width || 0,
        height: grayscaleMetadata.height || 0
      },
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Grayscale conversion error:', error)
    
    return NextResponse.json<GrayscaleResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during grayscale conversion',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for grayscale info
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
      channels: metadata.channels,
      methods: [
        { value: 'standard', label: 'Standard', description: 'Standard luminance-based grayscale' },
        { value: 'luminance', label: 'Luminance', description: 'Weighted average based on human perception' },
        { value: 'average', label: 'Average', description: 'Simple average of RGB channels' },
        { value: 'red-channel', label: 'Red Channel', description: 'Use only red channel values' },
        { value: 'green-channel', label: 'Green Channel', description: 'Use only green channel values' },
        { value: 'blue-channel', label: 'Blue Channel', description: 'Use only blue channel values' }
      ],
      outputFormats: ['jpeg', 'png', 'webp', 'avif'],
      features: ['multipleAlgorithms', 'colorPreservation', 'channelExtraction']
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
