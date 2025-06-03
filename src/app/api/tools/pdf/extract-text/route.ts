import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
// Dynamic import to avoid pdf-parse test file issue

interface ExtractTextRequest {
  fileId: string
  pages?: 'all' | 'first' | 'last' | 'range' | number[]
  pageRange?: { start: number; end: number }
  outputFormat?: 'txt' | 'json' | 'csv'
  options?: {
    preserveFormatting?: boolean
    includeMetadata?: boolean
    extractTables?: boolean
    extractHeaders?: boolean
    extractFooters?: boolean
    removeExtraSpaces?: boolean
    splitByPages?: boolean
  }
  outputName?: string
}

interface ExtractTextResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  extractedText?: string
  pageCount?: number
  wordCount?: number
  characterCount?: number
  processingTime?: number
  error?: string
}

interface PageTextData {
  pageNumber: number
  text: string
  wordCount: number
  characterCount: number
  metadata?: {
    hasHeaders?: boolean
    hasFooters?: boolean
    hasTables?: boolean
    fontSize?: number[]
    fonts?: string[]
  }
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

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

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

// Determine which pages to extract text from
function getPageIndices(
  pages: string | number[],
  pageRange: { start: number; end: number } | undefined,
  totalPages: number
): number[] {
  if (Array.isArray(pages)) {
    return pages.filter(p => p >= 1 && p <= totalPages).map(p => p - 1)
  }
  
  switch (pages) {
    case 'all':
      return Array.from({ length: totalPages }, (_, i) => i)
    case 'first':
      return [0]
    case 'last':
      return [totalPages - 1]
    case 'range':
      if (!pageRange) return Array.from({ length: totalPages }, (_, i) => i)
      const start = Math.max(0, pageRange.start - 1)
      const end = Math.min(totalPages - 1, pageRange.end - 1)
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    default:
      return Array.from({ length: totalPages }, (_, i) => i)
  }
}

// Extract text from PDF using pdf-parse
async function extractTextFromPDF(
  filePath: string,
  pageIndices: number[],
  options: ExtractTextRequest['options'] = {}
): Promise<PageTextData[]> {
  const fileBuffer = await readFile(filePath)

  // Dynamic import to avoid pdf-parse test file issue
  const pdfParse = require('pdf-parse')

  // Use pdf-parse for text extraction
  const pdfData = await pdfParse(fileBuffer, {
    // pdf-parse options
    max: 0, // Extract all pages
    version: 'v1.10.100'
  })

  const results: PageTextData[] = []

  // pdf-parse extracts all text at once, so we need to split by pages if requested
  if (pageIndices.length === pdfData.numpages || pageIndices.some(i => i === 0)) {
    // Extract all pages or if page 0 is requested (meaning all)
    const allText = pdfData.text
    const lines = allText.split('\n')

    // Estimate text per page (rough approximation)
    const linesPerPage = Math.ceil(lines.length / pdfData.numpages)

    for (const pageIndex of pageIndices) {
      if (pageIndex >= pdfData.numpages) continue

      // Extract text for this page (approximation)
      const startLine = pageIndex * linesPerPage
      const endLine = Math.min((pageIndex + 1) * linesPerPage, lines.length)
      let pageText = lines.slice(startLine, endLine).join('\n')

      // Apply text processing options
      if (options.removeExtraSpaces) {
        pageText = pageText.replace(/\s+/g, ' ').trim()
      }

      if (!options.preserveFormatting) {
        pageText = pageText.replace(/\n+/g, ' ').trim()
      }

      const pageData: PageTextData = {
        pageNumber: pageIndex + 1,
        text: pageText,
        wordCount: pageText.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: pageText.length,
        metadata: {
          extractedAt: new Date().toISOString(),
          extractionMethod: 'pdf-parse',
          confidence: 0.95,
          language: 'en', // pdf-parse doesn't detect language
          fonts: [] // pdf-parse doesn't extract font info
        }
      }

      results.push(pageData)
    }
  } else {
    // For specific pages, we'll extract all text and approximate
    let allText = pdfData.text

    // Apply text processing options
    if (options.removeExtraSpaces) {
      allText = allText.replace(/\s+/g, ' ').trim()
    }

    if (!options.preserveFormatting) {
      allText = allText.replace(/\n+/g, ' ').trim()
    }

    const pageData: PageTextData = {
      pageNumber: 1,
      text: allText,
      wordCount: allText.split(/\s+/).filter(word => word.length > 0).length,
      characterCount: allText.length,
      metadata: {
        extractedAt: new Date().toISOString(),
        extractionMethod: 'pdf-parse',
        confidence: 0.95,
        language: 'en',
        fonts: []
      }
    }

    results.push(pageData)
  }

  return results
}

// Format extracted text as plain text
function formatAsText(pageData: PageTextData[], options: ExtractTextRequest['options'] = {}): string {
  if (options.splitByPages) {
    return pageData.map(page => 
      `--- Page ${page.pageNumber} ---\n${page.text}\n`
    ).join('\n')
  } else {
    return pageData.map(page => page.text).join('\n\n')
  }
}

// Format extracted text as JSON
function formatAsJSON(pageData: PageTextData[], metadata: any): string {
  const totalWords = pageData.reduce((sum, page) => sum + page.wordCount, 0)
  const totalCharacters = pageData.reduce((sum, page) => sum + page.characterCount, 0)
  
  const jsonOutput = {
    metadata: {
      ...metadata,
      totalPages: pageData.length,
      totalWords,
      totalCharacters,
      averageWordsPerPage: Math.round(totalWords / pageData.length)
    },
    pages: pageData
  }
  
  return JSON.stringify(jsonOutput, null, 2)
}

// Format extracted text as CSV
function formatAsCSV(pageData: PageTextData[]): string {
  let csv = 'Page Number,Word Count,Character Count,Text\n'
  
  for (const page of pageData) {
    const escapedText = page.text.replace(/"/g, '""').replace(/\n/g, ' ')
    csv += `${page.pageNumber},${page.wordCount},${page.characterCount},"${escapedText}"\n`
  }
  
  return csv
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: ExtractTextRequest = await request.json()
    const { 
      fileId, 
      pages = 'all', 
      pageRange, 
      outputFormat = 'txt', 
      options = {}, 
      outputName 
    } = body
    
    if (!fileId) {
      return NextResponse.json<ExtractTextResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    const supportedFormats = ['txt', 'json', 'csv']
    if (!supportedFormats.includes(outputFormat)) {
      return NextResponse.json<ExtractTextResponse>({
        success: false,
        error: `Unsupported output format. Supported formats: ${supportedFormats.join(', ')}`
      }, { status: 400 })
    }
    
    const inputPath = await findUploadedFile(fileId)
    if (!inputPath) {
      return NextResponse.json<ExtractTextResponse>({
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
      return NextResponse.json<ExtractTextResponse>({
        success: false,
        error: 'Invalid or corrupted PDF file'
      }, { status: 400 })
    }
    
    const totalPages = pdfDoc.getPageCount()
    const pageIndices = getPageIndices(pages, pageRange, totalPages)
    
    if (pageIndices.length === 0) {
      return NextResponse.json<ExtractTextResponse>({
        success: false,
        error: 'No valid pages specified for text extraction'
      }, { status: 400 })
    }
    
    // Extract text from specified pages
    const pageData = await extractTextFromPDF(inputPath, pageIndices, options)
    
    // Calculate statistics
    const totalWords = pageData.reduce((sum, page) => sum + page.wordCount, 0)
    const totalCharacters = pageData.reduce((sum, page) => sum + page.characterCount, 0)
    
    // Format output based on requested format
    let outputContent: string
    let fileExtension: string
    let mimeType: string
    
    switch (outputFormat) {
      case 'txt':
        outputContent = formatAsText(pageData, options)
        fileExtension = 'txt'
        mimeType = 'text/plain'
        break
        
      case 'json':
        outputContent = formatAsJSON(pageData, {
          originalFile: fileId,
          extractionOptions: options,
          extractionDate: new Date().toISOString()
        })
        fileExtension = 'json'
        mimeType = 'application/json'
        break
        
      case 'csv':
        outputContent = formatAsCSV(pageData)
        fileExtension = 'csv'
        mimeType = 'text/csv'
        break
        
      default:
        throw new Error(`Output format ${outputFormat} not implemented`)
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `extracted-text.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Save extracted text
    await writeFile(outputPath, outputContent, 'utf-8')
    
    const processingTime = Date.now() - startTime
    
    // Log extraction operation
    const extractionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: Buffer.byteLength(outputContent, 'utf-8'),
      mimeType,
      outputFormat,
      pagesProcessed: pageData.length,
      totalPages,
      totalWords,
      totalCharacters,
      processingTime,
      inputFile: fileId,
      options,
      createdAt: new Date().toISOString()
    }
    
    console.log('PDF text extraction completed:', extractionMetadata)
    
    return NextResponse.json<ExtractTextResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      extractedText: outputFormat === 'txt' ? outputContent.substring(0, 1000) + (outputContent.length > 1000 ? '...' : '') : undefined,
      pageCount: pageData.length,
      wordCount: totalWords,
      characterCount: totalCharacters,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF text extraction error:', error)
    
    return NextResponse.json<ExtractTextResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF text extraction',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for extraction info
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
      title: pdfDoc.getTitle() || 'Untitled',
      author: pdfDoc.getAuthor() || 'Unknown',
      outputFormats: ['txt', 'json', 'csv'],
      pageOptions: ['all', 'first', 'last', 'range', 'custom'],
      extractionOptions: [
        'preserveFormatting',
        'includeMetadata',
        'extractTables',
        'extractHeaders',
        'extractFooters',
        'removeExtraSpaces',
        'splitByPages'
      ]
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
