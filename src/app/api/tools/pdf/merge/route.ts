import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { readFile, writeFile } from 'fs/promises'
import { FileService } from '@/lib/services/FileService'
import { AppError } from '@/lib/errors/AppError'

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

// Validate PDF file
async function validatePDF(filePath: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const fileBuffer = await readFile(filePath)
    await PDFDocument.load(fileBuffer)
    return { valid: true }
  } catch (error) {
    console.error('PDF validation failed:', error)
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return { valid: false, error: 'File not found' }
    }
    return { valid: false, error: 'Invalid or corrupted PDF file' }
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
    
    // Resolve file paths using FileService
    const filePaths: string[] = []
    const fileValidationErrors: string[] = []
    
    for (const fileId of fileIds) {
      try {
        const filePath = await FileService.resolveFilePath(fileId)
        
        // Validate the PDF file
        const validation = await validatePDF(filePath)
        if (!validation.valid) {
          fileValidationErrors.push(`${fileId}: ${validation.error}`)
          continue
        }
        
        filePaths.push(filePath)
      } catch (error) {
        if (error instanceof AppError) {
          fileValidationErrors.push(`${fileId}: ${error.message}`)
        } else {
          fileValidationErrors.push(`${fileId}: Failed to resolve file`)
        }
      }
    }
    
    // Check if we have enough valid files to merge
    if (filePaths.length < 2) {
      return NextResponse.json<MergeResponse>({
        success: false,
        error: fileValidationErrors.length > 0 
          ? `Failed to process files: ${fileValidationErrors.join(', ')}`
          : 'Not enough valid PDF files to merge'
      }, { status: 400 })
    }
    
    // If some files failed validation but we have at least 2 valid files, log warnings
    if (fileValidationErrors.length > 0) {
      console.warn('Some files failed validation:', fileValidationErrors)
    }
    
    // Merge PDFs
    const mergedBuffer = await mergePDFs(filePaths)
    
    // Generate output path using FileService
    const outputPath = await FileService.generateOutputPath(outputName, 'pdf')
    
    // Save merged PDF
    await writeFile(outputPath.fullPath, mergedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // In production, save output metadata to database
    const outputMetadata = {
      outputFileId: outputPath.fileId,
      originalName: outputName,
      fileName: outputPath.fileName,
      filePath: outputPath.fullPath,
      fileSize: mergedBuffer.length,
      mimeType: 'application/pdf',
      createdAt: new Date().toISOString(),
      processingTime,
      inputFiles: fileIds,
      validatedFiles: filePaths.length,
      failedFiles: fileValidationErrors.length
    }
    
    console.log('PDF merge completed:', outputMetadata)
    
    return NextResponse.json<MergeResponse>({
      success: true,
      outputFileId: outputPath.fileId,
      outputFileName: outputPath.fileName,
      downloadUrl: `/api/files/download?fileId=${outputPath.fileId}`,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF merge error:', error)
    
    if (error instanceof AppError) {
      return NextResponse.json<MergeResponse>({
        success: false,
        error: error.message,
        processingTime
      }, { status: error.statusCode || 500 })
    }
    
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
