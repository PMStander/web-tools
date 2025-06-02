import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface CompressRequest {
  fileId: string
  compressionLevel: 'low' | 'medium' | 'high' | 'maximum'
  optimizeImages?: boolean
  removeMetadata?: boolean
  outputName?: string
}

interface CompressResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  originalSize?: number
  compressedSize?: number
  compressionRatio?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

// Compression settings based on level
const COMPRESSION_SETTINGS = {
  low: {
    imageQuality: 0.9,
    removeUnusedObjects: false,
    compressStreams: false,
    removeMetadata: false
  },
  medium: {
    imageQuality: 0.8,
    removeUnusedObjects: true,
    compressStreams: true,
    removeMetadata: false
  },
  high: {
    imageQuality: 0.7,
    removeUnusedObjects: true,
    compressStreams: true,
    removeMetadata: true
  },
  maximum: {
    imageQuality: 0.6,
    removeUnusedObjects: true,
    compressStreams: true,
    removeMetadata: true
  }
}

async function ensureOutputDir() {
  try {
    const { mkdir } = await import('fs/promises')
    await mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create output directory:', error)
  }
}

async function compressPDF(
  filePath: string,
  options: CompressRequest
): Promise<{ buffer: Buffer; metadata: any }> {
  const fileBuffer = await readFile(filePath)
  const pdfDoc = await PDFDocument.load(fileBuffer)
  
  const settings = COMPRESSION_SETTINGS[options.compressionLevel]
  
  // Remove metadata if requested
  if (options.removeMetadata || settings.removeMetadata) {
    try {
      // Remove document info
      pdfDoc.setTitle('')
      pdfDoc.setAuthor('')
      pdfDoc.setSubject('')
      pdfDoc.setKeywords([])
      pdfDoc.setProducer('')
      pdfDoc.setCreator('')
      pdfDoc.setCreationDate(new Date())
      pdfDoc.setModificationDate(new Date())
    } catch (error) {
      console.warn('Could not remove all metadata:', error)
    }
  }
  
  // Get compression options
  const saveOptions: any = {
    useObjectStreams: settings.compressStreams,
    addDefaultPage: false
  }
  
  // Apply compression
  const compressedBytes = await pdfDoc.save(saveOptions)
  
  const metadata = {
    originalSize: fileBuffer.length,
    compressedSize: compressedBytes.length,
    compressionLevel: options.compressionLevel,
    settings: settings
  }
  
  return {
    buffer: Buffer.from(compressedBytes),
    metadata
  }
}

// Alternative compression using external tools (for better compression)
async function advancedCompressPDF(
  filePath: string,
  options: CompressRequest
): Promise<{ buffer: Buffer; metadata: any }> {
  // This would integrate with tools like Ghostscript for better compression
  // For now, fall back to basic compression
  return compressPDF(filePath, options)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: CompressRequest = await request.json()
    const { fileId, compressionLevel, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!compressionLevel) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'Compression level is required'
      }, { status: 400 })
    }
    
    if (!['low', 'medium', 'high', 'maximum'].includes(compressionLevel)) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'Invalid compression level. Must be: low, medium, high, or maximum'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate PDF file
    try {
      const fileBuffer = await readFile(inputPath)
      await PDFDocument.load(fileBuffer)
    } catch (error) {
      return NextResponse.json<CompressResponse>({
        success: false,
        error: 'Invalid or corrupted PDF file'
      }, { status: 400 })
    }
    
    // Get original file size
    const originalStats = await import('fs/promises').then(fs => fs.stat(inputPath))
    const originalSize = originalStats.size
    
    // Compress PDF
    const { buffer: compressedBuffer, metadata } = compressionLevel === 'maximum'
      ? await advancedCompressPDF(inputPath, body)
      : await compressPDF(inputPath, body)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || 'compressed-document.pdf'
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Save compressed PDF
    await writeFile(outputPath, compressedBuffer)
    
    const compressedSize = compressedBuffer.length
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100
    const processingTime = Date.now() - startTime
    
    // Log compression results
    const compressionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      originalSize,
      compressedSize,
      compressionRatio,
      compressionLevel,
      processingTime,
      inputFile: fileId,
      settings: COMPRESSION_SETTINGS[compressionLevel],
      createdAt: new Date().toISOString()
    }
    
    console.log('PDF compression completed:', compressionMetadata)
    
    return NextResponse.json<CompressResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF compression error:', error)
    
    return NextResponse.json<CompressResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF compression',
      processingTime
    }, { status: 500 })
  }
}

// Get compression info/preview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID required'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    try {
      const fileBuffer = await readFile(inputPath)
      const pdfDoc = await PDFDocument.load(fileBuffer)
      
      const info = {
        pageCount: pdfDoc.getPageCount(),
        originalSize: fileBuffer.length,
        title: pdfDoc.getTitle() || 'Untitled',
        author: pdfDoc.getAuthor() || 'Unknown',
        estimatedCompression: {
          low: Math.round(fileBuffer.length * 0.9),
          medium: Math.round(fileBuffer.length * 0.7),
          high: Math.round(fileBuffer.length * 0.5),
          maximum: Math.round(fileBuffer.length * 0.3)
        }
      }
      
      return NextResponse.json({
        success: true,
        data: info
      })
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid PDF file'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('PDF info error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
