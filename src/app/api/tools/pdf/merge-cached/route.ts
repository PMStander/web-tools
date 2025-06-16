import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import { PDFDocument } from 'pdf-lib'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

import { 
  withFileProcessingCache,
  withCacheAndRateLimit 
} from '@/lib/cache-middleware'
import { 
  withFileProcessingRateLimit,
  withBurstProtection 
} from '@/lib/rate-limit-middleware'
import { 
  getCachedFileResult,
  invalidateFileCache 
} from '@/lib/cache'

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
  cached?: boolean
}

// FileService handles directory paths
// FileService handles directory paths

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

// Core merge logic without caching
async function performMerge(request: NextRequest): Promise<NextResponse> {
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
    
    // Calculate total file size for cache strategy
    const filePaths = fileIds.map(fileId => join(UPLOAD_DIR, fileId))
    let totalSize = 0
    
    // Validate all PDF files exist and are valid
    for (const filePath of filePaths) {
      const isValid = await validatePDF(filePath)
      if (!isValid) {
        return NextResponse.json<MergeResponse>({
          success: false,
          error: `Invalid or corrupted PDF file: ${filePath}`
        }, { status: 400 })
      }
      
      // Get file size for cache strategy
      try {
        const stats = await import('fs/promises').then(fs => fs.stat(filePath))
        totalSize += stats.size
      } catch (error) {
        console.warn('Could not get file size:', error)
      }
    }
    
    // Use intelligent caching for merge operation
    const result = await getCachedFileResult(
      fileIds.join(','), // Use combined file IDs as cache key
      'merge',
      { outputName, fileIds },
      async () => {
        // Merge PDFs
        const mergedBuffer = await mergePDFs(filePaths)
        
        // Generate output filename
        const outputFileId = uuidv4()
        const outputFileName = `${outputFileId}_${outputName}`
        const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
        
        // Save merged PDF
        await writeFile(outputPath, mergedBuffer)
        
        return {
          outputFileId,
          outputFileName,
          downloadUrl: `/api/files/download?fileId=${outputFileId}`,
          fileSize: mergedBuffer.length,
          cached: false
        }
      },
      'pdf', // Processing engine
      totalSize // Total file size for cache strategy
    )
    
    const processingTime = Date.now() - startTime
    
    // Log processing completion
    console.log('PDF merge completed:', {
      outputFileId: result.outputFileId,
      processingTime,
      cached: result.cached || false,
      totalInputSize: totalSize
    })
    
    return NextResponse.json<MergeResponse>({
      success: true,
      outputFileId: result.outputFileId,
      outputFileName: result.outputFileName,
      downloadUrl: result.downloadUrl,
      processingTime,
      cached: result.cached || false
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

// Enhanced POST handler with caching and rate limiting
export const POST = withCacheAndRateLimit(
  {
    // Cache configuration
    ttl: 3600, // 1 hour cache for merged PDFs
    enabled: true,
    engine: 'pdf'
  },
  {
    // Rate limiting configuration
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 10, // Max 10 merge operations per minute
    enabled: true
  }
)(performMerge)

// Enhanced GET handler for status with caching
async function getStatus(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID required'
      }, { status: 400 })
    }
    
    // Use caching for status checks
    const status = await getCachedFileResult(
      jobId,
      'status',
      {},
      async () => {
        // In production, check job status from database/queue
        return {
          status: 'completed',
          progress: 100,
          message: 'PDF merge status endpoint - implement job tracking'
        }
      },
      'pdf',
      1024 // Small cache size for status
    )
    
    return NextResponse.json({
      success: true,
      ...status
    })
    
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export const GET = withFileProcessingCache('pdf', 'status', {
  ttl: 60, // Cache status for 1 minute
  enabled: true
})(getStatus)

// Cache invalidation endpoint (DELETE)
async function invalidateCache(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (fileId) {
      // Invalidate specific file cache
      const invalidated = await invalidateFileCache(fileId)
      return NextResponse.json({
        success: true,
        message: `Invalidated ${invalidated} cache entries for file: ${fileId}`
      })
    } else {
      // Invalidate all PDF merge cache
      const { invalidateEngineCache } = await import('@/lib/cache')
      const invalidated = await invalidateEngineCache('pdf')
      return NextResponse.json({
        success: true,
        message: `Invalidated ${invalidated} PDF cache entries`
      })
    }
    
  } catch (error) {
    console.error('Cache invalidation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Cache invalidation failed'
    }, { status: 500 })
  }
}

export const DELETE = withBurstProtection(5, 10000)(invalidateCache)
