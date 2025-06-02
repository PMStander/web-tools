import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// File validation configuration
const ALLOWED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'video/mp4': ['.mp4'],
  'video/avi': ['.avi'],
  'video/mov': ['.mov'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv']
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const UPLOAD_DIR = join(process.cwd(), 'uploads')

interface UploadResponse {
  success: boolean
  fileId?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  uploadPath?: string
  error?: string
  validationErrors?: string[]
}

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create upload directory:', error)
  }
}

// Validate file type and size
function validateFile(file: File): string[] {
  const errors: string[] = []
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }
  
  // Check file type
  if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
    errors.push(`File type ${file.type} is not supported`)
  }
  
  // Check for empty files
  if (file.size === 0) {
    errors.push('File is empty')
  }
  
  return errors
}

// Generate secure file path
function generateSecureFileName(originalName: string, mimeType: string): string {
  const fileId = uuidv4()
  const timestamp = Date.now()
  const hash = crypto.createHash('md5').update(originalName + timestamp).digest('hex').substring(0, 8)
  
  const extensions = ALLOWED_TYPES[mimeType as keyof typeof ALLOWED_TYPES]
  const extension = extensions ? extensions[0] : '.bin'
  
  return `${fileId}_${hash}${extension}`
}

// Scan file for malware (basic implementation)
async function scanFile(buffer: Buffer): Promise<boolean> {
  // Basic malware detection - check for suspicious patterns
  const suspiciousPatterns = [
    Buffer.from('MZ'), // PE executable header
    Buffer.from('PK'), // ZIP header (could contain malware)
  ]
  
  // For production, integrate with actual antivirus API
  // This is a simplified check
  for (const pattern of suspiciousPatterns) {
    if (buffer.includes(pattern) && buffer.length < 1000) {
      return false // Suspicious
    }
  }
  
  return true // Safe
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json<UploadResponse>({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }
    
    // Validate file
    const validationErrors = validateFile(file)
    if (validationErrors.length > 0) {
      return NextResponse.json<UploadResponse>({
        success: false,
        error: 'File validation failed',
        validationErrors
      }, { status: 400 })
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Scan for malware
    const isSafe = await scanFile(buffer)
    if (!isSafe) {
      return NextResponse.json<UploadResponse>({
        success: false,
        error: 'File failed security scan'
      }, { status: 400 })
    }
    
    // Generate secure filename
    const secureFileName = generateSecureFileName(file.name, file.type)
    const uploadPath = join(UPLOAD_DIR, secureFileName)
    
    // Write file to disk
    await writeFile(uploadPath, buffer)
    
    // Generate file ID for tracking
    const fileId = uuidv4()
    
    // In production, save file metadata to database
    const fileMetadata = {
      fileId,
      originalName: file.name,
      secureFileName,
      mimeType: file.type,
      size: file.size,
      uploadPath,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    }
    
    console.log('File uploaded:', fileMetadata)
    
    return NextResponse.json<UploadResponse>({
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadPath: secureFileName
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json<UploadResponse>({
      success: false,
      error: 'Internal server error during upload'
    }, { status: 500 })
  }
}

// Handle file download/retrieval
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID required'
      }, { status: 400 })
    }
    
    // In production, retrieve file metadata from database
    // For now, return placeholder response
    return NextResponse.json({
      success: true,
      message: 'File retrieval endpoint - implement database lookup'
    })
    
  } catch (error) {
    console.error('File retrieval error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID required'
      }, { status: 400 })
    }
    
    // In production, delete file from storage and database
    // Implement cleanup logic here
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
    
  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
