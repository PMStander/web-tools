import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { createReadStream } from 'fs'

const OUTPUT_DIR = join(process.cwd(), 'outputs')
const UPLOAD_DIR = join(process.cwd(), 'uploads')

interface DownloadResponse {
  success: boolean
  error?: string
}

// Get MIME type from file extension
function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop()
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'tiff': 'image/tiff',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv'
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

// Validate file access permissions
async function validateFileAccess(fileId: string, userSession?: any): Promise<boolean> {
  // In production, implement proper access control
  // Check if user has permission to access this file
  // For now, allow all access (development only)
  return true
}

// Find file in output or upload directories
async function findFile(fileId: string): Promise<{ filePath: string; fileName: string } | null> {
  // Try output directory first (processed files)
  try {
    const outputFiles = await import('fs').then(fs => 
      fs.promises.readdir(OUTPUT_DIR).catch(() => [])
    )
    
    for (const fileName of outputFiles) {
      if (fileName.startsWith(fileId)) {
        const filePath = join(OUTPUT_DIR, fileName)
        return { filePath, fileName }
      }
    }
  } catch (error) {
    console.error('Error searching output directory:', error)
  }
  
  // Try upload directory (original files)
  try {
    const uploadFiles = await import('fs').then(fs => 
      fs.promises.readdir(UPLOAD_DIR).catch(() => [])
    )
    
    for (const fileName of uploadFiles) {
      if (fileName.startsWith(fileId) || fileName === fileId) {
        const filePath = join(UPLOAD_DIR, fileName)
        return { filePath, fileName }
      }
    }
  } catch (error) {
    console.error('Error searching upload directory:', error)
  }
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const download = searchParams.get('download') === 'true'
    
    if (!fileId) {
      return NextResponse.json<DownloadResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    // Validate file access (implement proper auth in production)
    const hasAccess = await validateFileAccess(fileId)
    if (!hasAccess) {
      return NextResponse.json<DownloadResponse>({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }
    
    // Find the file
    const fileInfo = await findFile(fileId)
    if (!fileInfo) {
      return NextResponse.json<DownloadResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }
    
    const { filePath, fileName } = fileInfo
    
    // Check if file exists and get stats
    try {
      const fileStats = await stat(filePath)
      
      if (!fileStats.isFile()) {
        return NextResponse.json<DownloadResponse>({
          success: false,
          error: 'Invalid file'
        }, { status: 400 })
      }
      
      // Read file content
      const fileBuffer = await readFile(filePath)
      const mimeType = getMimeType(fileName)
      
      // Extract original filename (remove UUID prefix)
      const originalFileName = fileName.includes('_') 
        ? fileName.split('_').slice(1).join('_')
        : fileName
      
      // Set response headers
      const headers = new Headers({
        'Content-Type': mimeType,
        'Content-Length': fileStats.size.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
        'X-File-Size': fileStats.size.toString(),
        'X-File-Type': mimeType
      })
      
      // Set download headers if requested
      if (download) {
        headers.set('Content-Disposition', `attachment; filename="${originalFileName}"`)
      } else {
        headers.set('Content-Disposition', `inline; filename="${originalFileName}"`)
      }
      
      // Log download activity (for analytics)
      console.log('File download:', {
        fileId,
        fileName: originalFileName,
        size: fileStats.size,
        mimeType,
        downloadMode: download,
        timestamp: new Date().toISOString()
      })
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers
      })
      
    } catch (fileError) {
      console.error('File access error:', fileError)
      return NextResponse.json<DownloadResponse>({
        success: false,
        error: 'File access error'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json<DownloadResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Handle HEAD requests for file info without downloading
export async function HEAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return new NextResponse(null, { status: 400 })
    }
    
    // Validate file access
    const hasAccess = await validateFileAccess(fileId)
    if (!hasAccess) {
      return new NextResponse(null, { status: 403 })
    }
    
    // Find the file
    const fileInfo = await findFile(fileId)
    if (!fileInfo) {
      return new NextResponse(null, { status: 404 })
    }
    
    const { filePath, fileName } = fileInfo
    
    try {
      const fileStats = await stat(filePath)
      const mimeType = getMimeType(fileName)
      
      const headers = new Headers({
        'Content-Type': mimeType,
        'Content-Length': fileStats.size.toString(),
        'X-File-Size': fileStats.size.toString(),
        'X-File-Type': mimeType,
        'Last-Modified': fileStats.mtime.toUTCString()
      })
      
      return new NextResponse(null, {
        status: 200,
        headers
      })
      
    } catch (fileError) {
      return new NextResponse(null, { status: 500 })
    }
    
  } catch (error) {
    console.error('HEAD request error:', error)
    return new NextResponse(null, { status: 500 })
  }
}
