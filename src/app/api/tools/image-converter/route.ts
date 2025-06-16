import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface ConvertRequest {
  fileId: string
  outputFormat: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'bmp' | 'tiff'
  quality?: number
  lossless?: boolean
  outputName?: string
}

interface ConvertResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalFormat?: string
  outputFormat?: string
  compressionRatio?: number
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

// Helper function to find uploaded file by ID
async function findUploadedFile(fileId: string): Promise<string | null> {
  // First try to find metadata file
  const metadataPath = join(UPLOAD_DIR, `${fileId}.json`)
  try {
    const metadataBuffer = await readFile(metadataPath)
    const metadata = JSON.parse(metadataBuffer.toString())
    return metadata.uploadPath
  } catch (error) {
    // Fallback: search for file starting with fileId
    try {
      const { readdir } = await import('fs/promises')
      const files = await readdir(UPLOAD_DIR)
      const matchingFile = files.find(file => file.startsWith(fileId))
      if (matchingFile) {
        return join(UPLOAD_DIR, matchingFile)
      }
    } catch (dirError) {
      console.error('Error reading upload directory:', dirError)
    }
  }
  return null
}

// Get image format from file path
function getImageFormat(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg'
    case 'png':
      return 'png'
    case 'webp':
      return 'webp'
    case 'gif':
      return 'gif'
    case 'bmp':
      return 'bmp'
    case 'tiff':
    case 'tif':
      return 'tiff'
    case 'avif':
      return 'avif'
    default:
      return 'unknown'
  }
}

// Convert image using Sharp
async function convertImage(
  inputPath: string,
  outputFormat: string,
  options: Pick<ConvertRequest, 'quality' | 'lossless'>
): Promise<{ buffer: Buffer; originalFormat: string }> {
  // Dynamic import to avoid test file issue
  const sharp = require('sharp')
  
  const originalFormat = getImageFormat(inputPath)
  const inputBuffer = await readFile(inputPath)
  
  let sharpInstance = sharp(inputBuffer)
  
  // Apply format-specific options
  switch (outputFormat) {
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ 
        quality: options.quality || 90,
        progressive: true
      })
      break
      
    case 'png':
      sharpInstance = sharpInstance.png({ 
        quality: options.quality || 90,
        compressionLevel: options.lossless ? 0 : 6
      })
      break
      
    case 'webp':
      sharpInstance = sharpInstance.webp({ 
        quality: options.quality || 90,
        lossless: options.lossless || false
      })
      break
      
    case 'avif':
      sharpInstance = sharpInstance.avif({ 
        quality: options.quality || 90,
        lossless: options.lossless || false
      })
      break
      
    case 'gif':
      // For GIF, convert to PNG first then use external library if needed
      sharpInstance = sharpInstance.png({ quality: options.quality || 90 })
      break
      
    case 'bmp':
      // Sharp doesn't support BMP output, convert to PNG
      sharpInstance = sharpInstance.png({ quality: options.quality || 90 })
      break
      
    case 'tiff':
      sharpInstance = sharpInstance.tiff({ 
        quality: options.quality || 90,
        compression: options.lossless ? 'lzw' : 'jpeg'
      })
      break
      
    default:
      throw new Error(`Unsupported output format: ${outputFormat}`)
  }
  
  const outputBuffer = await sharpInstance.toBuffer()
  
  return {
    buffer: outputBuffer,
    originalFormat
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: ConvertRequest = await request.json()
    const { fileId, outputFormat, quality = 90, lossless = false, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!outputFormat) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: 'Output format is required'
      }, { status: 400 })
    }
    
    const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff']
    if (!supportedFormats.includes(outputFormat)) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: `Unsupported output format. Supported formats: ${supportedFormats.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = await findUploadedFile(fileId)
    if (!inputPath) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }

    // Get original file size for compression ratio calculation
    const originalBuffer = await readFile(inputPath)
    const originalSize = originalBuffer.length
    
    // Convert image
    const { buffer: convertedBuffer, originalFormat } = await convertImage(inputPath, outputFormat, {
      quality,
      lossless
    })
    
    // Calculate compression ratio
    const compressionRatio = Math.round((1 - convertedBuffer.length / originalSize) * 100)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `converted-image.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save converted file
    await writeFile(outputPath, convertedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Get MIME type
    const mimeTypes: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif',
      bmp: 'image/bmp',
      tiff: 'image/tiff'
    }
    
    // Log conversion operation
    const conversionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: convertedBuffer.length,
      originalSize,
      mimeType: mimeTypes[outputFormat] || 'application/octet-stream',
      originalFormat,
      outputFormat,
      quality,
      lossless,
      compressionRatio,
      processingTime,
      inputFile: fileId,
      createdAt: new Date().toISOString()
    }
    
    console.log('Image conversion completed:', conversionMetadata)
    
    return NextResponse.json<ConvertResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalFormat,
      outputFormat,
      compressionRatio,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Image conversion error:', error)
    
    return NextResponse.json<ConvertResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during image conversion',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for image info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  
  if (!fileId) {
    return NextResponse.json({
      success: false,
      error: 'File ID is required'
    }, { status: 400 })
  }
  
  const inputPath = await findUploadedFile(fileId)
  if (!inputPath) {
    return NextResponse.json({
      success: false,
      error: 'File not found'
    }, { status: 404 })
  }

  try {
    // Dynamic import to avoid test file issue
    const sharp = require('sharp')
    const inputBuffer = await readFile(inputPath)
    const metadata = await sharp(inputBuffer).metadata()
    
    const info = {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      size: inputBuffer.length,
      supportedOutputFormats: ['jpeg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff']
    }
    
    return NextResponse.json({
      success: true,
      data: info
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid image file or unsupported format'
    }, { status: 400 })
  }
}