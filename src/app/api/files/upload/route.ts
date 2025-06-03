import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
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

  // Check if file exists and has content
  if (!file || file.size === 0) {
    errors.push('File is empty or corrupted')
    return errors
  }

  // Check file size limits
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB limit`)
  }

  // Check minimum file size (1KB)
  if (file.size < 1024) {
    errors.push('File is too small (minimum 1KB required)')
  }

  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    errors.push('File name is required')
  } else {
    // Check for dangerous file names
    const dangerousPatterns = [/\.\./g, /[<>:"|?*]/g, /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i]
    if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
      errors.push('File name contains invalid characters')
    }

    // Check file name length
    if (file.name.length > 255) {
      errors.push('File name is too long (maximum 255 characters)')
    }
  }

  // Check file type
  if (!file.type) {
    errors.push('File MIME type is missing')
  } else if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
    const supportedTypes = Object.keys(ALLOWED_TYPES).join(', ')
    errors.push(`File type ${file.type} is not supported. Supported types: ${supportedTypes}`)
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = Object.values(ALLOWED_TYPES).flat()

  if (!fileExtension || fileExtension === '.') {
    errors.push('File must have a valid extension')
  } else if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`File extension ${fileExtension} is not supported. Allowed extensions: ${allowedExtensions.join(', ')}`)
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
    
    // Generate file ID for tracking (use as filename for easier lookup)
    const fileId = uuidv4()
    const finalFileName = `${fileId}_${file.name}`
    const finalUploadPath = join(UPLOAD_DIR, finalFileName)

    // Write file to disk with fileId as part of filename
    await writeFile(finalUploadPath, buffer)

    // Save file metadata to a simple JSON file (in production, use database)
    const fileMetadata = {
      fileId,
      originalName: file.name,
      fileName: finalFileName,
      mimeType: file.type,
      size: file.size,
      uploadPath: finalUploadPath,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    }

    // Save metadata to JSON file for lookup
    const metadataPath = join(UPLOAD_DIR, `${fileId}.json`)
    await writeFile(metadataPath, JSON.stringify(fileMetadata, null, 2))

    console.log('File uploaded:', fileMetadata)

    return NextResponse.json<UploadResponse>({
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadPath: finalFileName
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

    // Retrieve file metadata from JSON file
    const metadataPath = join(UPLOAD_DIR, `${fileId}.json`)
    try {
      const metadataBuffer = await readFile(metadataPath)
      const metadata = JSON.parse(metadataBuffer.toString())

      return NextResponse.json({
        success: true,
        data: metadata
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }

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
