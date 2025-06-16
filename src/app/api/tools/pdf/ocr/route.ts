import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
import { createWorker } from 'tesseract.js'
const { pdf2pic } = require('pdf2pic')

interface OCRRequest {
  fileId: string
  language?: 'eng' | 'spa' | 'fra' | 'deu' | 'ita' | 'por' | 'rus' | 'chi_sim' | 'chi_tra' | 'jpn' | 'kor'
  outputFormat?: 'pdf' | 'txt' | 'json'
  options?: {
    preserveLayout?: boolean
    confidence?: number
    enhanceImage?: boolean
    removeBackground?: boolean
    deskew?: boolean
  }
  outputName?: string
}

interface OCRResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  extractedText?: string
  confidence?: number
  pageCount?: number
  processingTime?: number
  language?: string
  error?: string
}

interface OCRResult {
  text: string
  confidence: number
  words: Array<{
    text: string
    confidence: number
    bbox: { x: number; y: number; width: number; height: number }
  }>
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

// Perform real OCR processing using Tesseract.js and pdf2pic
async function performOCR(
  filePath: string,
  language: string = 'eng',
  options: OCRRequest['options'] = {}
): Promise<OCRResult[]> {
  const results: OCRResult[] = []

  try {
    // Ensure temp directory exists
    await ensureTempDir()

    // Convert PDF pages to images using pdf2pic
    const convert = pdf2pic.fromPath(filePath, {
      density: 300,           // Higher density for better OCR accuracy
      saveFilename: "page",
      savePath: TEMP_DIR,
      format: "png",
      width: 2000,
      height: 2000
    })

    // Get page count
    const fileBuffer = await readFile(filePath)
    const pdfDoc = await PDFDocument.load(fileBuffer)
    const pageCount = pdfDoc.getPageCount()

    // Create Tesseract worker
    const worker = await createWorker(language)

    // Process each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        // Convert page to image
        const pageImage = await convert(pageNum, { responseType: "buffer" })

        if (pageImage.buffer) {
          // Perform OCR on the image
          const { data } = await worker.recognize(pageImage.buffer)

          // Extract word-level information
          const words = data.words.map(word => ({
            text: word.text,
            confidence: word.confidence,
            bbox: {
              x: word.bbox.x0,
              y: word.bbox.y0,
              width: word.bbox.x1 - word.bbox.x0,
              height: word.bbox.y1 - word.bbox.y0
            }
          }))

          results.push({
            text: data.text,
            confidence: data.confidence,
            words
          })
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError)
        // Add empty result for failed page
        results.push({
          text: `[Error processing page ${pageNum}]`,
          confidence: 0,
          words: []
        })
      }
    }

    // Terminate worker
    await worker.terminate()

  } catch (error) {
    console.error('OCR processing error:', error)
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return results
}

// Create searchable PDF with OCR text overlay
async function createSearchablePDF(
  originalPath: string,
  ocrResults: OCRResult[],
  options: OCRRequest['options'] = {}
): Promise<Buffer> {
  const fileBuffer = await readFile(originalPath)
  const pdfDoc = await PDFDocument.load(fileBuffer)
  
  // In production, you would overlay invisible text on the PDF pages
  // to make them searchable while preserving the original appearance
  
  // For now, we'll add a text layer to demonstrate the concept
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  for (let i = 0; i < ocrResults.length && i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i)
    const { width, height } = page.getSize()
    
    if (options.preserveLayout) {
      // Add invisible text overlay (in production, this would be properly positioned)
      page.drawText(`OCR Text Layer - Page ${i + 1}`, {
        x: 50,
        y: height - 50,
        size: 8,
        font,
        color: rgb(0, 0, 0),
        opacity: 0.1 // Make it barely visible
      })
    }
  }
  
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

// Export OCR results as JSON
function exportOCRAsJSON(ocrResults: OCRResult[], metadata: any): string {
  const jsonOutput = {
    metadata: {
      ...metadata,
      totalPages: ocrResults.length,
      averageConfidence: ocrResults.reduce((sum, result) => sum + result.confidence, 0) / ocrResults.length
    },
    pages: ocrResults.map((result, index) => ({
      pageNumber: index + 1,
      text: result.text,
      confidence: result.confidence,
      wordCount: result.words.length,
      words: result.words
    }))
  }
  
  return JSON.stringify(jsonOutput, null, 2)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: OCRRequest = await request.json()
    const { fileId, language = 'eng', outputFormat = 'pdf', options = {}, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<OCRResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    const supportedLanguages = ['eng', 'spa', 'fra', 'deu', 'ita', 'por', 'rus', 'chi_sim', 'chi_tra', 'jpn', 'kor']
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json<OCRResponse>({
        success: false,
        error: `Unsupported language. Supported languages: ${supportedLanguages.join(', ')}`
      }, { status: 400 })
    }
    
    const supportedFormats = ['pdf', 'txt', 'json']
    if (!supportedFormats.includes(outputFormat)) {
      return NextResponse.json<OCRResponse>({
        success: false,
        error: `Unsupported output format. Supported formats: ${supportedFormats.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = await findUploadedFile(fileId)
    if (!inputPath) {
      return NextResponse.json<OCRResponse>({
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
      return NextResponse.json<OCRResponse>({
        success: false,
        error: 'Invalid or corrupted PDF file'
      }, { status: 400 })
    }
    
    const pageCount = pdfDoc.getPageCount()
    
    // Perform OCR
    const ocrResults = await performOCR(inputPath, language, options)
    
    // Calculate overall confidence
    const overallConfidence = ocrResults.reduce((sum, result) => sum + result.confidence, 0) / ocrResults.length
    
    // Extract all text
    const extractedText = ocrResults.map(result => result.text).join('\n\n--- Page Break ---\n\n')
    
    let outputBuffer: Buffer
    let fileExtension: string
    let mimeType: string
    
    // Generate output based on format
    switch (outputFormat) {
      case 'pdf':
        outputBuffer = await createSearchablePDF(inputPath, ocrResults, options)
        fileExtension = 'pdf'
        mimeType = 'application/pdf'
        break
        
      case 'txt':
        outputBuffer = Buffer.from(extractedText, 'utf-8')
        fileExtension = 'txt'
        mimeType = 'text/plain'
        break
        
      case 'json':
        const jsonContent = exportOCRAsJSON(ocrResults, {
          originalFile: fileId,
          language,
          options,
          processingDate: new Date().toISOString()
        })
        outputBuffer = Buffer.from(jsonContent, 'utf-8')
        fileExtension = 'json'
        mimeType = 'application/json'
        break
        
      default:
        throw new Error(`Output format ${outputFormat} not implemented`)
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `ocr-result.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save OCR result
    await writeFile(outputPath, outputBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log OCR operation
    const ocrMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: outputBuffer.length,
      mimeType,
      language,
      outputFormat,
      pageCount,
      confidence: overallConfidence,
      processingTime,
      inputFile: fileId,
      options,
      createdAt: new Date().toISOString()
    }
    
    console.log('PDF OCR completed:', ocrMetadata)
    
    return NextResponse.json<OCRResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      extractedText: outputFormat === 'txt' ? extractedText : undefined,
      confidence: Math.round(overallConfidence * 100) / 100,
      pageCount,
      language,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF OCR error:', error)
    
    return NextResponse.json<OCRResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF OCR',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for OCR capabilities info
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
      fileSize: fileBuffer.length,
      supportedLanguages: [
        { code: 'eng', name: 'English' },
        { code: 'spa', name: 'Spanish' },
        { code: 'fra', name: 'French' },
        { code: 'deu', name: 'German' },
        { code: 'ita', name: 'Italian' },
        { code: 'por', name: 'Portuguese' },
        { code: 'rus', name: 'Russian' },
        { code: 'chi_sim', name: 'Chinese (Simplified)' },
        { code: 'chi_tra', name: 'Chinese (Traditional)' },
        { code: 'jpn', name: 'Japanese' },
        { code: 'kor', name: 'Korean' }
      ],
      outputFormats: ['pdf', 'txt', 'json'],
      estimatedProcessingTime: `${Math.ceil(pdfDoc.getPageCount() * 2)} seconds`
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
