import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface MergeRequest {
  fileIds: string[]
  outputName?: string
}

interface MergeResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  error?: string
  processingTime?: number
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    const { mkdir } = await import('fs/promises')
    await mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create output directory:', error)
  }
}

// Validate PDF file
async function validatePDF(filePath: string): Promise<boolean> {
  try {
    const fileBuffer = await readFile(filePath)
    await PDFDocument.load(fileBuffer)
    return true
  } catch (error) {
    console.error('PDF validation failed:', error)
    return false
  }
}

// Merge PDF files
async function mergePDFs(filePaths: string[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create()
  
  for (const filePath of filePaths) {
    try {
      const fileBuffer = await readFile(filePath)
      const pdf = await PDFDocument.load(fileBuffer)
      const pageCount = pdf.getPageCount()
      
      // Copy all pages from source PDF
      const pageIndices = Array.from({ length: pageCount }, (_, i) => i)
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices)
      
      // Add pages to merged PDF
      copiedPages.forEach((page) => mergedPdf.addPage(page))
      
    } catch (error) {
      console.error(`Failed to process PDF: ${filePath}`, error)
      throw new Error(`Failed to process PDF file: ${filePath}`)
    }
  }
  
  const pdfBytes = await mergedPdf.save()
  return Buffer.from(pdfBytes)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: MergeRequest = await request.json()
    const { fileIds, outputName = 'merged-document.pdf' } = body
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length < 2) {
      return NextResponse.json<MergeResponse>({
        success: false,
        error: 'At least 2 file IDs are required for merging'
      }, { status: 400 })
    }
    
    if (fileIds.length > 10) {
      return NextResponse.json<MergeResponse>({
        success: false,
        error: 'Maximum 10 files can be merged at once'
      }, { status: 400 })
    }
    
    // In production, resolve file IDs to actual file paths from database
    // For now, assume file IDs are the secure filenames
    const filePaths = fileIds.map(fileId => join(UPLOAD_DIR, fileId))
    
    // Validate all PDF files exist and are valid
    for (const filePath of filePaths) {
      const isValid = await validatePDF(filePath)
      if (!isValid) {
        return NextResponse.json<MergeResponse>({
          success: false,
          error: `Invalid or corrupted PDF file: ${filePath}`
        }, { status: 400 })
      }
    }
    
    // Merge PDFs
    const mergedBuffer = await mergePDFs(filePaths)
    
    // Generate output filename
    const outputFileId = uuidv4()
    const outputFileName = `${outputFileId}_${outputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Save merged PDF
    await writeFile(outputPath, mergedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // In production, save output metadata to database
    const outputMetadata = {
      outputFileId,
      originalName: outputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: mergedBuffer.length,
      mimeType: 'application/pdf',
      createdAt: new Date().toISOString(),
      processingTime,
      inputFiles: fileIds
    }
    
    console.log('PDF merge completed:', outputMetadata)
    
    return NextResponse.json<MergeResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF merge error:', error)
    
    return NextResponse.json<MergeResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF merge',
      processingTime
    }, { status: 500 })
  }
}

// Get merge status/progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID required'
      }, { status: 400 })
    }
    
    // In production, check job status from database/queue
    return NextResponse.json({
      success: true,
      status: 'completed',
      progress: 100,
      message: 'PDF merge status endpoint - implement job tracking'
    })
    
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
