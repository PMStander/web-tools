import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface WatermarkRequest {
  fileId: string
  watermarkType: 'text' | 'image'
  text?: string
  imageFileId?: string
  options?: {
    opacity?: number
    fontSize?: number
    color?: string
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
    rotation?: number
    repeat?: boolean
    layer?: 'background' | 'foreground'
    pages?: 'all' | 'first' | 'last' | 'odd' | 'even' | number[]
  }
  outputName?: string
}

interface WatermarkResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  watermarkType?: string
  pagesProcessed?: number
  processingTime?: number
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

// Parse color string to RGB values
function parseColor(colorString: string): { r: number; g: number; b: number } {
  // Default to black if parsing fails
  let r = 0, g = 0, b = 0
  
  if (colorString.startsWith('#')) {
    // Hex color
    const hex = colorString.slice(1)
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16) / 255
      g = parseInt(hex.slice(2, 4), 16) / 255
      b = parseInt(hex.slice(4, 6), 16) / 255
    }
  } else if (colorString.startsWith('rgb')) {
    // RGB color
    const match = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      r = parseInt(match[1]) / 255
      g = parseInt(match[2]) / 255
      b = parseInt(match[3]) / 255
    }
  } else {
    // Named colors
    const namedColors: { [key: string]: [number, number, number] } = {
      'black': [0, 0, 0],
      'white': [1, 1, 1],
      'red': [1, 0, 0],
      'green': [0, 1, 0],
      'blue': [0, 0, 1],
      'gray': [0.5, 0.5, 0.5],
      'grey': [0.5, 0.5, 0.5]
    }
    
    const color = namedColors[colorString.toLowerCase()]
    if (color) {
      [r, g, b] = color
    }
  }
  
  return { r, g, b }
}

// Calculate position coordinates
function calculatePosition(
  position: string,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  textHeight: number
): { x: number; y: number } {
  const margin = 50
  
  switch (position) {
    case 'center':
      return {
        x: (pageWidth - textWidth) / 2,
        y: (pageHeight - textHeight) / 2
      }
    case 'top-left':
      return { x: margin, y: pageHeight - margin - textHeight }
    case 'top-right':
      return { x: pageWidth - margin - textWidth, y: pageHeight - margin - textHeight }
    case 'top-center':
      return { x: (pageWidth - textWidth) / 2, y: pageHeight - margin - textHeight }
    case 'bottom-left':
      return { x: margin, y: margin }
    case 'bottom-right':
      return { x: pageWidth - margin - textWidth, y: margin }
    case 'bottom-center':
      return { x: (pageWidth - textWidth) / 2, y: margin }
    default:
      return { x: (pageWidth - textWidth) / 2, y: (pageHeight - textHeight) / 2 }
  }
}

// Determine which pages to watermark
function getPageIndices(pages: string | number[], totalPages: number): number[] {
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
    default:
      return Array.from({ length: totalPages }, (_, i) => i)
  }
}

// Add text watermark to PDF
async function addTextWatermark(
  filePath: string,
  options: WatermarkRequest
): Promise<Buffer> {
  const fileBuffer = await readFile(filePath)
  const pdfDoc = await PDFDocument.load(fileBuffer)
  
  const {
    text = 'WATERMARK',
    options: {
      opacity = 0.3,
      fontSize = 48,
      color = '#808080',
      position = 'center',
      rotation = 0,
      repeat = false,
      layer = 'foreground',
      pages = 'all'
    } = {}
  } = options
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const { r, g, b } = parseColor(color)
  const pageIndices = getPageIndices(pages, pdfDoc.getPageCount())
  
  for (const pageIndex of pageIndices) {
    const page = pdfDoc.getPage(pageIndex)
    const { width, height } = page.getSize()
    
    const textWidth = font.widthOfTextAtSize(text, fontSize)
    const textHeight = fontSize
    
    if (repeat) {
      // Add repeated watermarks across the page
      const spacingX = textWidth + 100
      const spacingY = textHeight + 50
      const cols = Math.ceil(width / spacingX)
      const rows = Math.ceil(height / spacingY)
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacingX
          const y = row * spacingY
          
          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(rotation)
          })
        }
      }
    } else {
      // Add single watermark at specified position
      const { x, y } = calculatePosition(position, width, height, textWidth, textHeight)
      
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(rotation)
      })
    }
  }
  
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

// Add image watermark to PDF (placeholder implementation)
async function addImageWatermark(
  filePath: string,
  imageFileId: string,
  options: WatermarkRequest
): Promise<Buffer> {
  const fileBuffer = await readFile(filePath)
  const pdfDoc = await PDFDocument.load(fileBuffer)
  
  // Note: This is a placeholder implementation
  // In production, you would:
  // 1. Load the image file using the imageFileId
  // 2. Embed the image in the PDF using pdfDoc.embedPng() or pdfDoc.embedJpg()
  // 3. Draw the image on the specified pages
  
  const {
    options: {
      opacity = 0.3,
      position = 'center',
      rotation = 0,
      pages = 'all'
    } = {}
  } = options
  
  const pageIndices = getPageIndices(pages, pdfDoc.getPageCount())
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  // Placeholder: Add text indicating where image would be placed
  for (const pageIndex of pageIndices) {
    const page = pdfDoc.getPage(pageIndex)
    const { width, height } = page.getSize()
    
    const placeholderText = '[IMAGE WATERMARK]'
    const textWidth = font.widthOfTextAtSize(placeholderText, 24)
    const { x, y } = calculatePosition(position, width, height, textWidth, 24)
    
    page.drawText(placeholderText, {
      x,
      y,
      size: 24,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(rotation)
    })
  }
  
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: WatermarkRequest = await request.json()
    const { fileId, watermarkType, text, imageFileId, options = {}, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!watermarkType || !['text', 'image'].includes(watermarkType)) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'Watermark type must be either "text" or "image"'
      }, { status: 400 })
    }
    
    if (watermarkType === 'text' && !text) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'Text is required for text watermarks'
      }, { status: 400 })
    }
    
    if (watermarkType === 'image' && !imageFileId) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'Image file ID is required for image watermarks'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate PDF file
    let pdfDoc: PDFDocument
    try {
      const fileBuffer = await readFile(inputPath)
      pdfDoc = await PDFDocument.load(fileBuffer)
    } catch (error) {
      return NextResponse.json<WatermarkResponse>({
        success: false,
        error: 'Invalid or corrupted PDF file'
      }, { status: 400 })
    }
    
    const totalPages = pdfDoc.getPageCount()
    
    // Apply watermark
    let watermarkedBuffer: Buffer
    
    if (watermarkType === 'text') {
      watermarkedBuffer = await addTextWatermark(inputPath, { ...body, text })
    } else {
      watermarkedBuffer = await addImageWatermark(inputPath, imageFileId!, body)
    }
    
    // Calculate pages processed
    const pageIndices = getPageIndices(options.pages || 'all', totalPages)
    const pagesProcessed = pageIndices.length
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `watermarked-document.pdf`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Save watermarked PDF
    await writeFile(outputPath, watermarkedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log watermark operation
    const watermarkMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: watermarkedBuffer.length,
      watermarkType,
      text: watermarkType === 'text' ? text : undefined,
      imageFileId: watermarkType === 'image' ? imageFileId : undefined,
      pagesProcessed,
      totalPages,
      options,
      processingTime,
      inputFile: fileId,
      createdAt: new Date().toISOString()
    }
    
    console.log('PDF watermark completed:', watermarkMetadata)
    
    return NextResponse.json<WatermarkResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      watermarkType,
      pagesProcessed,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF watermark error:', error)
    
    return NextResponse.json<WatermarkResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF watermarking',
      processingTime
    }, { status: 500 })
  }
}

// GET endpoint for watermark options
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  
  if (!fileId) {
    return NextResponse.json({
      success: false,
      error: 'File ID is required'
    }, { status: 400 })
  }
  
  const inputPath = join(UPLOAD_DIR, fileId)
  
  try {
    const fileBuffer = await readFile(inputPath)
    const pdfDoc = await PDFDocument.load(fileBuffer)
    
    const info = {
      pageCount: pdfDoc.getPageCount(),
      fileSize: fileBuffer.length,
      watermarkTypes: ['text', 'image'],
      positions: ['center', 'top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center'],
      pageOptions: ['all', 'first', 'last', 'odd', 'even', 'custom'],
      supportedColors: ['black', 'white', 'red', 'green', 'blue', 'gray', 'custom'],
      maxFontSize: 200,
      minFontSize: 8
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
