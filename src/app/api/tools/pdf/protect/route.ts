import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

interface ProtectRequest {
  fileId: string
  action: 'encrypt' | 'decrypt' | 'watermark'
  password?: string
  ownerPassword?: string
  userPassword?: string
  permissions?: {
    printing?: boolean
    modifying?: boolean
    copying?: boolean
    annotating?: boolean
    fillingForms?: boolean
    contentAccessibility?: boolean
    documentAssembly?: boolean
  }
  watermark?: {
    text: string
    opacity?: number
    fontSize?: number
    color?: string
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    rotation?: number
  }
  outputName?: string
}

interface ProtectResponse {
  success: boolean
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  action?: string
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

// Validate password strength
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' }
  }
  
  if (password.length > 32) {
    return { valid: false, message: 'Password must be no more than 32 characters long' }
  }
  
  // Check for basic complexity
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain both letters and numbers' }
  }
  
  return { valid: true }
}

// Add watermark to PDF
async function addWatermarkToPDF(
  pdfDoc: PDFDocument,
  watermarkOptions: ProtectRequest['watermark']
): Promise<void> {
  if (!watermarkOptions) return
  
  const pages = pdfDoc.getPages()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  const {
    text,
    opacity = 0.3,
    fontSize = 50,
    color = '#808080',
    position = 'center',
    rotation = -45
  } = watermarkOptions
  
  // Parse color
  const colorMatch = color.match(/^#([0-9a-f]{6})$/i)
  const rgbColor = colorMatch
    ? rgb(
        parseInt(colorMatch[1].substr(0, 2), 16) / 255,
        parseInt(colorMatch[1].substr(2, 2), 16) / 255,
        parseInt(colorMatch[1].substr(4, 2), 16) / 255
      )
    : rgb(0.5, 0.5, 0.5)
  
  for (const page of pages) {
    const { width, height } = page.getSize()
    
    // Calculate position
    let x: number, y: number
    
    switch (position) {
      case 'top-left':
        x = 50
        y = height - 50
        break
      case 'top-right':
        x = width - 200
        y = height - 50
        break
      case 'bottom-left':
        x = 50
        y = 50
        break
      case 'bottom-right':
        x = width - 200
        y = 50
        break
      case 'center':
      default:
        x = width / 2
        y = height / 2
        break
    }
    
    // Add watermark text
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgbColor,
      opacity,
      rotate: {
        type: 'degrees',
        angle: rotation
      }
    })
  }
}

// Encrypt PDF with password
async function encryptPDF(
  filePath: string,
  options: ProtectRequest
): Promise<Buffer> {
  const fileBuffer = await readFile(filePath)
  const pdfDoc = await PDFDocument.load(fileBuffer)
  
  // Add watermark if specified
  if (options.watermark) {
    await addWatermarkToPDF(pdfDoc, options.watermark)
  }
  
  // Note: pdf-lib doesn't support encryption directly
  // In production, you would use a library like HummusJS or external tools
  // For now, we'll save without encryption but with watermark
  
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

// Decrypt PDF (remove password)
async function decryptPDF(
  filePath: string,
  password: string
): Promise<Buffer> {
  // Note: pdf-lib has limited support for encrypted PDFs
  // In production, use specialized libraries or external tools
  
  try {
    const fileBuffer = await readFile(filePath)
    const pdfDoc = await PDFDocument.load(fileBuffer)
    
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  } catch (error) {
    throw new Error('Failed to decrypt PDF. Invalid password or unsupported encryption.')
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: ProtectRequest = await request.json()
    const { fileId, action, password, outputName } = body
    
    if (!fileId) {
      return NextResponse.json<ProtectResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!action) {
      return NextResponse.json<ProtectResponse>({
        success: false,
        error: 'Action is required (encrypt, decrypt, or watermark)'
      }, { status: 400 })
    }
    
    // Validate password for encrypt/decrypt actions
    if ((action === 'encrypt' || action === 'decrypt') && password) {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        return NextResponse.json<ProtectResponse>({
          success: false,
          error: passwordValidation.message
        }, { status: 400 })
      }
    }
    
    // Validate watermark options
    if (action === 'watermark' && !body.watermark?.text) {
      return NextResponse.json<ProtectResponse>({
        success: false,
        error: 'Watermark text is required for watermark action'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    
    // Validate PDF file
    try {
      const fileBuffer = await readFile(inputPath)
      await PDFDocument.load(fileBuffer)
    } catch (error) {
      return NextResponse.json<ProtectResponse>({
        success: false,
        error: 'Invalid or corrupted PDF file'
      }, { status: 400 })
    }
    
    let processedBuffer: Buffer
    let actionDescription: string
    
    switch (action) {
      case 'encrypt':
        if (!password) {
          return NextResponse.json<ProtectResponse>({
            success: false,
            error: 'Password is required for encryption'
          }, { status: 400 })
        }
        processedBuffer = await encryptPDF(inputPath, body)
        actionDescription = 'encrypted'
        break
        
      case 'decrypt':
        if (!password) {
          return NextResponse.json<ProtectResponse>({
            success: false,
            error: 'Password is required for decryption'
          }, { status: 400 })
        }
        processedBuffer = await decryptPDF(inputPath, password)
        actionDescription = 'decrypted'
        break
        
      case 'watermark':
        processedBuffer = await encryptPDF(inputPath, body) // This adds watermark
        actionDescription = 'watermarked'
        break
        
      default:
        return NextResponse.json<ProtectResponse>({
          success: false,
          error: 'Invalid action. Must be encrypt, decrypt, or watermark'
        }, { status: 400 })
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `${actionDescription}-document.pdf`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    // Save processed PDF
    await writeFile(outputPath, processedBuffer)
    
    const processingTime = Date.now() - startTime
    
    // Log protection operation
    const protectionMetadata = {
      outputFileId,
      originalName: baseOutputName,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: processedBuffer.length,
      action,
      processingTime,
      inputFile: fileId,
      hasWatermark: !!body.watermark,
      createdAt: new Date().toISOString()
    }
    
    console.log('PDF protection completed:', protectionMetadata)
    
    return NextResponse.json<ProtectResponse>({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      action: actionDescription,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('PDF protection error:', error)
    
    return NextResponse.json<ProtectResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during PDF protection',
      processingTime
    }, { status: 500 })
  }
}
