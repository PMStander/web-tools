import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import { PDFDocument } from 'pdf-lib'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface ToImagesRequest {
  fileId: string
  imageFormat?: 'png' | 'jpg' | 'webp'
  quality?: number
  density?: number
  outputAs?: 'zip' | 'individual'
  outputName?: string
}

interface ToImagesResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  imageCount?: number
  processingTime?: number
  error?: string
}

// FileService handles directory paths
// FileService handles directory paths
const TEMP_DIR = join(process.cwd(), 'temp')

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

async function ensureTempDir() {
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true })
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

// Convert PDF to images using pdf2pic
async function convertPDFToImages(
  filePath: string, 
  options: Pick<ToImagesRequest, 'imageFormat' | 'quality' | 'density' | 'outputAs'>
): Promise<{ buffer: Buffer; imageCount: number }> {
  await ensureTempDir()

  const fileBuffer = await readFile(filePath)
  const pdfDoc = await PDFDocument.load(fileBuffer)
  const pageCount = pdfDoc.getPageCount()

  // Dynamic import to avoid test file issue
  const { pdf2pic } = require('pdf2pic')
  const archiver = require('archiver')

  // Convert PDF pages to images using pdf2pic
  const convert = pdf2pic.fromPath(filePath, {
    density: options.density || 300,
    saveFilename: "page",
    savePath: TEMP_DIR,
    format: options.imageFormat === 'jpg' ? 'jpeg' : (options.imageFormat || 'png'),
    width: 2000,
    height: 2000,
    quality: options.quality || 90
  })

  if (options.outputAs === 'individual' && pageCount === 1) {
    // Single page, return just the image
    const pageImage = await convert(1, { responseType: "buffer" })
    if (pageImage.buffer) {
      return { buffer: pageImage.buffer, imageCount: 1 }
    }
  }

  // Multiple pages or zip requested - create a ZIP file containing all images
  const archive = archiver('zip', { zlib: { level: 9 } })
  const chunks: Buffer[] = []

  archive.on('data', (chunk) => chunks.push(chunk))

  // Convert each page and add to ZIP
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    try {
      const pageImage = await convert(pageNum, { responseType: "buffer" })

      if (pageImage.buffer) {
        const fileName = `page-${pageNum.toString().padStart(3, '0')}.${options.imageFormat || 'png'}`
        archive.append(pageImage.buffer, { name: fileName })
      }
    } catch (pageError) {
      console.error(`Error converting page ${pageNum}:`, pageError)
      // Add error placeholder
      const errorText = `Error converting page ${pageNum}`
      archive.append(Buffer.from(errorText), { name: `page-${pageNum.toString().padStart(3, '0')}-error.txt` })
    }
  }

  // Finalize the archive
  await archive.finalize()

  return { buffer: Buffer.concat(chunks), imageCount: pageCount }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: ToImagesRequest = await request.json()
    const { fileId, imageFormat = 'png', quality = 90, density = 300, outputAs = 'zip', outputName } = body
    
    if (!fileId) {
      return NextResponse.json<ToImagesResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    const supportedFormats = ['png', 'jpg', 'webp']
    if (!supportedFormats.includes(imageFormat)) {
      return NextResponse.json<ToImagesResponse>({
        success: false,
        error: `Unsupported image format. Supported formats: ${supportedFormats.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = await findUploadedFile(fileId)
    if (!inputPath) {
      return NextResponse.json<ToImagesResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }

    // Validate PDF file
    let pdfDoc: PDFDocument
    try {
      const fileBuffer = await readFile(inputPath)
      pdfDoc = await PDFDocument.load(fileBuffer)
    } catch (error) {
      return NextResponse.json<ToImagesResponse>({
        success: false,
        error: 'Invalid or corrupted PDF file'
      }, { status: 400 })
    }
    
    const pageCount = pdfDoc.getPageCount()
    
    // Convert PDF to images
    const { buffer: convertedBuffer, imageCount } = await convertPDFToImages(inputPath, {
      imageFormat,
      quality,
      density,
      outputAs
    })
    
    // Generate output filename
    const outputFileId = uuidv4()
    const fileExtension = outputAs === 'zip' || pageCount > 1 ? 'zip' : imageFormat
    const baseOutputName = outputName || `pdf-images.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save converted file
    await writeFile(outputPath, convertedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log conversion operation
    const conversionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: convertedBuffer.length,
      mimeType: fileExtension === 'zip' ? 'application/zip' : `image/${imageFormat}`,
      imageCount,
      imageFormat,
      quality,
      density,
      processingTime,
      inputFile: fileId,
      createdAt: new Date().toISOString()
    }
    
    console.log('PDF to images conversion completed:', conversionMetadata)
    
    return NextResponse.json<ToImagesResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      imageCount,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF to images conversion error:', error)
    
    return NextResponse.json<ToImagesResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF to images conversion',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for PDF info
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
    const fileBuffer = await readFile(inputPath)
    const pdfDoc = await PDFDocument.load(fileBuffer)
    
    const info = {
      pageCount: pdfDoc.getPageCount(),
      title: pdfDoc.getTitle() || 'Untitled',
      author: pdfDoc.getAuthor() || 'Unknown',
      creationDate: pdfDoc.getCreationDate()?.toISOString() || null,
      modificationDate: pdfDoc.getModificationDate()?.toISOString() || null,
      supportedFormats: ['png', 'jpg', 'webp'],
      maxDensity: 600,
      fileSize: fileBuffer.length
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
}