import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
// Dynamic imports to avoid test file issues

interface ConvertRequest {
  fileId: string
  outputFormat: 'docx' | 'txt' | 'html' | 'images' | 'excel' | 'pptx'
  options?: {
    imageFormat?: 'png' | 'jpg' | 'webp'
    imageQuality?: number
    extractImages?: boolean
    preserveFormatting?: boolean
    includeMetadata?: boolean
  }
  outputName?: string
}

interface ConvertResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  outputFormat?: string
  pageCount?: number
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

// Convert PDF to text using pdf-parse
async function convertPDFToText(filePath: string, options: ConvertRequest['options'] = {}): Promise<Buffer> {
  const fileBuffer = await readFile(filePath)

  // Dynamic import to avoid test file issue
  const pdfParse = require('pdf-parse')

  // Use pdf-parse for actual text extraction
  const pdfData = await pdfParse(fileBuffer)

  let extractedText = ''

  if (options.includeMetadata) {
    const pdfDoc = await PDFDocument.load(fileBuffer)
    extractedText += `Document Title: ${pdfDoc.getTitle() || 'Untitled'}\n`
    extractedText += `Author: ${pdfDoc.getAuthor() || 'Unknown'}\n`
    extractedText += `Pages: ${pdfData.numpages}\n`
    extractedText += `Created: ${pdfDoc.getCreationDate()?.toISOString() || 'Unknown'}\n\n`
  }

  // Add extracted text
  extractedText += pdfData.text

  return Buffer.from(extractedText, 'utf-8')
}

// Convert PDF to HTML using pdf-parse
async function convertPDFToHTML(filePath: string, options: ConvertRequest['options'] = {}): Promise<Buffer> {
  const fileBuffer = await readFile(filePath)

  // Dynamic import to avoid test file issue
  const pdfParse = require('pdf-parse')
  const pdfData = await pdfParse(fileBuffer)
  const pdfDoc = await PDFDocument.load(fileBuffer)

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pdfDoc.getTitle() || 'Converted PDF'}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .content { margin-bottom: 40px; padding: 20px; border: 1px solid #ddd; }
        ${options.preserveFormatting ? '.formatted { white-space: pre-wrap; }' : ''}
    </style>
</head>
<body>
`

  if (options.includeMetadata) {
    html += `    <div class="metadata">
        <h1>${pdfDoc.getTitle() || 'Untitled Document'}</h1>
        <p><strong>Author:</strong> ${pdfDoc.getAuthor() || 'Unknown'}</p>
        <p><strong>Pages:</strong> ${pdfData.numpages}</p>
        <p><strong>Created:</strong> ${pdfDoc.getCreationDate()?.toISOString() || 'Unknown'}</p>
    </div>
`
  }

  // Convert text to HTML paragraphs
  const textContent = pdfData.text
  const paragraphs = textContent.split('\n\n').filter(p => p.trim().length > 0)

  html += `    <div class="content">
        <div class="${options.preserveFormatting ? 'formatted' : ''}">
`

  for (const paragraph of paragraphs) {
    const cleanParagraph = paragraph.replace(/\n/g, '<br>').trim()
    if (cleanParagraph) {
      html += `            <p>${cleanParagraph}</p>\n`
    }
  }

  html += `        </div>
    </div>
</body>
</html>`

  return Buffer.from(html, 'utf-8')
}

// Convert PDF to images using pdf2pic
async function convertPDFToImages(filePath: string, options: ConvertRequest['options'] = {}): Promise<Buffer> {
  await ensureTempDir()

  const fileBuffer = await readFile(filePath)
  const pdfDoc = await PDFDocument.load(fileBuffer)
  const pageCount = pdfDoc.getPageCount()

  // Dynamic import to avoid test file issue
  const { pdf2pic } = require('pdf2pic')
  const archiver = require('archiver')

  // Convert PDF pages to images using pdf2pic
  const convert = pdf2pic.fromPath(filePath, {
    density: 300,
    saveFilename: "page",
    savePath: TEMP_DIR,
    format: options.imageFormat === 'jpg' ? 'jpeg' : (options.imageFormat || 'png'),
    width: 2000,
    height: 2000
  })

  // Create a ZIP file containing all images
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

  return Buffer.concat(chunks)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: ConvertRequest = await request.json()
    const { fileId, outputFormat, options = {}, outputName } = body
    
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
    
    const supportedFormats = ['docx', 'txt', 'html', 'images', 'excel', 'pptx']
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

    // Validate PDF file
    let pdfDoc: PDFDocument
    try {
      const fileBuffer = await readFile(inputPath)
      pdfDoc = await PDFDocument.load(fileBuffer)
    } catch (error) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: 'Invalid or corrupted PDF file'
      }, { status: 400 })
    }
    
    const pageCount = pdfDoc.getPageCount()
    let convertedBuffer: Buffer
    let fileExtension: string
    let mimeType: string
    
    // Convert based on output format
    switch (outputFormat) {
      case 'txt':
        convertedBuffer = await convertPDFToText(inputPath, options)
        fileExtension = 'txt'
        mimeType = 'text/plain'
        break
        
      case 'html':
        convertedBuffer = await convertPDFToHTML(inputPath, options)
        fileExtension = 'html'
        mimeType = 'text/html'
        break
        
      case 'images':
        // Convert to images and create ZIP file
        convertedBuffer = await convertPDFToImages(inputPath, options)
        fileExtension = 'zip'
        mimeType = 'application/zip'
        break
        
      case 'docx':
      case 'excel':
      case 'pptx':
        // Placeholder for Office format conversions
        // In production, you would use libraries like officegen or mammoth
        const placeholderContent = `Converted from PDF to ${outputFormat.toUpperCase()}\n\nThis is a placeholder implementation.\nIn production, use specialized libraries for ${outputFormat.toUpperCase()} conversion.`
        convertedBuffer = Buffer.from(placeholderContent, 'utf-8')
        fileExtension = outputFormat
        mimeType = `application/vnd.openxmlformats-officedocument.${outputFormat === 'docx' ? 'wordprocessingml.document' : outputFormat === 'excel' ? 'spreadsheetml.sheet' : 'presentationml.presentation'}`
        break
        
      default:
        throw new Error(`Conversion to ${outputFormat} not implemented`)
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `converted-document.${fileExtension}`
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
      mimeType,
      outputFormat,
      pageCount,
      processingTime,
      inputFile: fileId,
      options,
      createdAt: new Date().toISOString()
    }
    
    console.log('PDF conversion completed:', conversionMetadata)
    
    return NextResponse.json<ConvertResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      outputFormat,
      pageCount,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF conversion error:', error)
    
    return NextResponse.json<ConvertResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF conversion',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for conversion info
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
      supportedFormats: ['txt', 'html', 'images', 'docx', 'excel', 'pptx'],
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
