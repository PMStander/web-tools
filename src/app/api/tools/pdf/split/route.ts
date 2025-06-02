import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface SplitRequest {
  fileId: string
  splitType: 'pages' | 'range' | 'size'
  pages?: number[] // Specific page numbers
  ranges?: Array<{ start: number; end: number }> // Page ranges
  pagesPerFile?: number // For size-based splitting
  outputPrefix?: string
}

interface SplitResponse {
  success: boolean
  outputFiles?: Array<{
    fileId: string
    fileName: string
    downloadUrl: string
    pageRange: string
  }>
  totalFiles?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

async function ensureOutputDir() {
  try {
    const { mkdir } = await import('fs/promises')
    await mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create output directory:', error)
  }
}

async function splitPDF(filePath: string, options: SplitRequest): Promise<Array<{
  buffer: Buffer
  fileName: string
  pageRange: string
}>> {
  const fileBuffer = await readFile(filePath)
  const sourcePdf = await PDFDocument.load(fileBuffer)
  const totalPages = sourcePdf.getPageCount()
  
  const results: Array<{
    buffer: Buffer
    fileName: string
    pageRange: string
  }> = []
  
  const prefix = options.outputPrefix || 'split-document'
  
  switch (options.splitType) {
    case 'pages':
      if (!options.pages || options.pages.length === 0) {
        throw new Error('Page numbers are required for page-based splitting')
      }
      
      for (const pageNum of options.pages) {
        if (pageNum < 1 || pageNum > totalPages) {
          throw new Error(`Page ${pageNum} is out of range (1-${totalPages})`)
        }
        
        const newPdf = await PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1])
        newPdf.addPage(copiedPage)
        
        const pdfBytes = await newPdf.save()
        results.push({
          buffer: Buffer.from(pdfBytes),
          fileName: `${prefix}_page_${pageNum}.pdf`,
          pageRange: `Page ${pageNum}`
        })
      }
      break
      
    case 'range':
      if (!options.ranges || options.ranges.length === 0) {
        throw new Error('Page ranges are required for range-based splitting')
      }
      
      for (let i = 0; i < options.ranges.length; i++) {
        const range = options.ranges[i]
        
        if (range.start < 1 || range.end > totalPages || range.start > range.end) {
          throw new Error(`Invalid range ${range.start}-${range.end}`)
        }
        
        const newPdf = await PDFDocument.create()
        const pageIndices = Array.from(
          { length: range.end - range.start + 1 },
          (_, idx) => range.start - 1 + idx
        )
        
        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices)
        copiedPages.forEach(page => newPdf.addPage(page))
        
        const pdfBytes = await newPdf.save()
        results.push({
          buffer: Buffer.from(pdfBytes),
          fileName: `${prefix}_pages_${range.start}-${range.end}.pdf`,
          pageRange: `Pages ${range.start}-${range.end}`
        })
      }
      break
      
    case 'size':
      const pagesPerFile = options.pagesPerFile || 1
      
      if (pagesPerFile < 1) {
        throw new Error('Pages per file must be at least 1')
      }
      
      for (let startPage = 0; startPage < totalPages; startPage += pagesPerFile) {
        const endPage = Math.min(startPage + pagesPerFile - 1, totalPages - 1)
        
        const newPdf = await PDFDocument.create()
        const pageIndices = Array.from(
          { length: endPage - startPage + 1 },
          (_, idx) => startPage + idx
        )
        
        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices)
        copiedPages.forEach(page => newPdf.addPage(page))
        
        const pdfBytes = await newPdf.save()
        const fileNumber = Math.floor(startPage / pagesPerFile) + 1
        
        results.push({
          buffer: Buffer.from(pdfBytes),
          fileName: `${prefix}_part_${fileNumber}.pdf`,
          pageRange: `Pages ${startPage + 1}-${endPage + 1}`
        })
      }
      break
      
    default:
      throw new Error(`Unsupported split type: ${options.splitType}`)
  }
  
  return results
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: SplitRequest = await request.json()
    const { fileId } = body
    
    if (!fileId) {
      return NextResponse.json<SplitResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!body.splitType) {
      return NextResponse.json<SplitResponse>({
        success: false,
        error: 'Split type is required'
      }, { status: 400 })
    }
    
    // Validate split parameters
    if (body.splitType === 'pages' && (!body.pages || body.pages.length === 0)) {
      return NextResponse.json<SplitResponse>({
        success: false,
        error: 'Page numbers are required for page-based splitting'
      }, { status: 400 })
    }
    
    if (body.splitType === 'range' && (!body.ranges || body.ranges.length === 0)) {
      return NextResponse.json<SplitResponse>({
        success: false,
        error: 'Page ranges are required for range-based splitting'
      }, { status: 400 })
    }
    
    if (body.splitType === 'size' && (!body.pagesPerFile || body.pagesPerFile < 1)) {
      return NextResponse.json<SplitResponse>({
        success: false,
        error: 'Valid pages per file count is required for size-based splitting'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate PDF file
    try {
      const fileBuffer = await readFile(inputPath)
      await PDFDocument.load(fileBuffer)
    } catch (error) {
      return NextResponse.json<SplitResponse>({
        success: false,
        error: 'Invalid or corrupted PDF file'
      }, { status: 400 })
    }
    
    // Split PDF
    const splitResults = await splitPDF(inputPath, body)
    
    // Save split files and create response
    const outputFiles: SplitResponse['outputFiles'] = []
    
    for (const result of splitResults) {
      const outputFileId = uuidv4()
      const outputFileName = `${outputFileId}_${result.fileName}`
      const outputPath = join(OUTPUT_DIR, outputFileName)
      
      await writeFile(outputPath, result.buffer)
      
      outputFiles.push({
        fileId: outputFileId,
        fileName: result.fileName,
        downloadUrl: `/api/files/download?fileId=${outputFileId}`,
        pageRange: result.pageRange
      })
    }
    
    const processingTime = Date.now() - startTime
    
    console.log('PDF split completed:', {
      inputFile: fileId,
      splitType: body.splitType,
      outputFiles: outputFiles.length,
      processingTime
    })
    
    return NextResponse.json<SplitResponse>({
      success: true,
      outputFiles,
      totalFiles: outputFiles.length,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF split error:', error)
    
    return NextResponse.json<SplitResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF split',
      processingTime
    }, { status: 500 })
  }
}
