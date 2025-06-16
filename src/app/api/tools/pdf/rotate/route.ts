import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import { PDFDocument, degrees } from 'pdf-lib'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface RotateRequest {
  fileId: string
  rotation: 90 | 180 | 270 | -90 | -180 | -270
  pages?: 'all' | 'first' | 'last' | 'odd' | 'even' | 'range' | number[]
  pageRange?: { start: number; end: number }
  options?: {
    autoDetectOrientation?: boolean
    preserveAspectRatio?: boolean
    centerContent?: boolean
  }
  outputName?: string
}

interface RotateResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  rotation?: number
  pagesRotated?: number
  totalPages?: number
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

// Determine which pages to rotate
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
    case 'odd':
      return Array.from({ length: totalPages }, (_, i) => i).filter(i => (i + 1) % 2 === 1)
    case 'even':
      return Array.from({ length: totalPages }, (_, i) => i).filter(i => (i + 1) % 2 === 0)
    case 'range':
      if (!pageRange) return Array.from({ length: totalPages }, (_, i) => i)
      const start = Math.max(0, pageRange.start - 1)
      const end = Math.min(totalPages - 1, pageRange.end - 1)
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    default:
      return Array.from({ length: totalPages }, (_, i) => i)
  }
}

// Normalize rotation to 0, 90, 180, or 270 degrees
function normalizeRotation(rotation: number): number {
  const normalized = ((rotation % 360) + 360) % 360
  return normalized
}

// Detect page orientation (placeholder implementation)
function detectPageOrientation(page: any): 'portrait' | 'landscape' | 'square' {
  const { width, height } = page.getSize()
  
  if (Math.abs(width - height) < 10) {
    return 'square'
  } else if (width > height) {
    return 'landscape'
  } else {
    return 'portrait'
  }
}

// Auto-detect optimal rotation (placeholder implementation)
function getOptimalRotation(page: any, options: RotateRequest['options'] = {}): number {
  if (!options.autoDetectOrientation) {
    return 0
  }
  
  const orientation = detectPageOrientation(page)
  
  // Simple heuristic: if page is landscape, suggest 90-degree rotation to make it portrait
  // In production, you would use more sophisticated content analysis
  switch (orientation) {
    case 'landscape':
      return 90 // Rotate to portrait
    case 'portrait':
      return 0 // No rotation needed
    case 'square':
      return 0 // No rotation needed
    default:
      return 0
  }
}

// Rotate PDF pages
async function rotatePDFPages(
  filePath: string,
  rotation: number,
  pageIndices: number[],
  options: RotateRequest['options'] = {}
): Promise<{ buffer: Buffer; rotatedPages: number }> {
  const fileBuffer = await readFile(filePath)
  const pdfDoc = await PDFDocument.load(fileBuffer)
  
  const normalizedRotation = normalizeRotation(rotation)
  let rotatedPages = 0
  
  for (const pageIndex of pageIndices) {
    if (pageIndex >= pdfDoc.getPageCount()) continue
    
    const page = pdfDoc.getPage(pageIndex)
    
    // Auto-detect optimal rotation if enabled
    let actualRotation = normalizedRotation
    if (options.autoDetectOrientation) {
      const optimalRotation = getOptimalRotation(page, options)
      actualRotation = normalizeRotation(normalizedRotation + optimalRotation)
    }
    
    // Apply rotation
    if (actualRotation !== 0) {
      page.setRotation(degrees(actualRotation))
      rotatedPages++
    }
  }
  
  const pdfBytes = await pdfDoc.save()
  return {
    buffer: Buffer.from(pdfBytes),
    rotatedPages
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: RotateRequest = await request.json()
    const { 
      fileId, 
      rotation, 
      pages = 'all', 
      pageRange, 
      options = {}, 
      outputName 
    } = body
    
    if (!fileId) {
      return NextResponse.json<RotateResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (rotation === undefined || rotation === null) {
      return NextResponse.json<RotateResponse>({
        success: false,
        error: 'Rotation angle is required'
      }, { status: 400 })
    }
    
    const validRotations = [90, 180, 270, -90, -180, -270]
    if (!validRotations.includes(rotation)) {
      return NextResponse.json<RotateResponse>({
        success: false,
        error: `Invalid rotation angle. Supported rotations: ${validRotations.join(', ')} degrees`
      }, { status: 400 })
    }
    
    // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
    
    // Validate PDF file
    let pdfDoc: PDFDocument
    try {
      const fileBuffer = await readFile(inputPath)
      pdfDoc = await PDFDocument.load(fileBuffer)
    } catch (error) {
      return NextResponse.json<RotateResponse>({
        success: false,
        error: 'Invalid or corrupted PDF file'
      }, { status: 400 })
    }
    
    const totalPages = pdfDoc.getPageCount()
    const pageIndices = getPageIndices(pages, pageRange, totalPages)
    
    if (pageIndices.length === 0) {
      return NextResponse.json<RotateResponse>({
        success: false,
        error: 'No valid pages specified for rotation'
      }, { status: 400 })
    }
    
    // Rotate specified pages
    const { buffer: rotatedBuffer, rotatedPages } = await rotatePDFPages(
      inputPath,
      rotation,
      pageIndices,
      options
    )
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `rotated-document.pdf`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save rotated PDF
    await writeFile(outputPath, rotatedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log rotation operation
    const rotationMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: rotatedBuffer.length,
      rotation: normalizeRotation(rotation),
      pagesRotated: rotatedPages,
      totalPages,
      pageIndices,
      options,
      processingTime,
      inputFile: fileId,
      createdAt: new Date().toISOString()
    }
    
    console.log('PDF rotation completed:', rotationMetadata)
    
    return NextResponse.json<RotateResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      rotation: normalizeRotation(rotation),
      pagesRotated: rotatedPages,
      totalPages,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF rotation error:', error)
    
    return NextResponse.json<RotateResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF rotation',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for rotation info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  
  if (!fileId) {
    return NextResponse.json({
      success: false,
      error: 'File ID is required'
    }, { status: 400 })
  }
  
  // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
  
  try {
    const fileBuffer = await readFile(inputPath)
    const pdfDoc = await PDFDocument.load(fileBuffer)
    
    // Analyze pages for orientation info
    const pageInfo = []
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i)
      const { width, height } = page.getSize()
      const currentRotation = page.getRotation()
      
      pageInfo.push({
        pageNumber: i + 1,
        width: Math.round(width),
        height: Math.round(height),
        orientation: detectPageOrientation(page),
        currentRotation: currentRotation.angle || 0
      })
    }
    
    const info = {
      pageCount: pdfDoc.getPageCount(),
      fileSize: fileBuffer.length,
      supportedRotations: [90, 180, 270, -90, -180, -270],
      pageOptions: ['all', 'first', 'last', 'odd', 'even', 'range', 'custom'],
      pages: pageInfo,
      rotationOptions: [
        'autoDetectOrientation',
        'preserveAspectRatio',
        'centerContent'
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
