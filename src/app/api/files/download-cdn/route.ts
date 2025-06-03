import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { 
  withCDNCache,
  getCDNConfig,
  generateETag,
  generateStrongETag,
  isNotModified,
  createNotModifiedResponse,
  addCDNHeaders,
  supportsConditionalCaching
} from '@/lib/cdn-cache'
import { ProcessingEngine, categorizeFileSize } from '@/lib/cache-architecture'

interface DownloadResponse {
  success: boolean
  error?: string
  message?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

// Get MIME type from filename
function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop()
  
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'svg': 'image/svg+xml',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'aac': 'audio/aac',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // Text
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript'
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

// Determine processing engine from MIME type
function getEngineFromMimeType(mimeType: string): ProcessingEngine | undefined {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('video/')) return 'video'
  return undefined
}

// Validate file access (implement proper auth in production)
async function validateFileAccess(fileId: string): Promise<boolean> {
  // In production, check user permissions, file ownership, etc.
  return true
}

// Find file by ID (implement database lookup in production)
async function findFile(fileId: string): Promise<{ filePath: string; fileName: string } | null> {
  // Try uploads directory first
  const uploadPath = join(UPLOAD_DIR, fileId)
  try {
    await stat(uploadPath)
    return { filePath: uploadPath, fileName: fileId }
  } catch {}
  
  // Try outputs directory
  const outputPath = join(OUTPUT_DIR, fileId)
  try {
    await stat(outputPath)
    return { filePath: outputPath, fileName: fileId }
  } catch {}
  
  // Try with common extensions
  const extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm']
  for (const ext of extensions) {
    const pathWithExt = join(OUTPUT_DIR, `${fileId}${ext}`)
    try {
      await stat(pathWithExt)
      return { filePath: pathWithExt, fileName: `${fileId}${ext}` }
    } catch {}
  }
  
  return null
}

// Core download handler
async function handleDownload(request: NextRequest): Promise<NextResponse> {
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
    
    // Validate file access
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
    
    // Get file stats
    const fileStats = await stat(filePath)
    
    if (!fileStats.isFile()) {
      return NextResponse.json<DownloadResponse>({
        success: false,
        error: 'Invalid file'
      }, { status: 400 })
    }
    
    // Get file metadata
    const mimeType = getMimeType(fileName)
    const engine = getEngineFromMimeType(mimeType)
    const fileSize = fileStats.size
    const lastModified = fileStats.mtime
    
    // Generate ETags
    const weakETag = generateETag(filePath, fileSize, lastModified, true)
    
    // Get CDN configuration
    const cdnConfig = getCDNConfig(mimeType, engine, fileSize)
    
    // Check conditional requests
    if (supportsConditionalCaching(request)) {
      if (isNotModified(request, weakETag, lastModified)) {
        console.log(`CDN cache hit (304): ${fileId}`)
        return createNotModifiedResponse(weakETag, lastModified, cdnConfig)
      }
    }
    
    // Read file content
    const fileBuffer = await readFile(filePath)
    
    // Generate strong ETag for content integrity
    const strongETag = await generateStrongETag(fileBuffer)
    
    // Extract original filename
    const originalFileName = fileName.includes('_') 
      ? fileName.split('_').slice(1).join('_')
      : fileName
    
    // Create response headers
    const headers = new Headers({
      'Content-Type': mimeType,
      'Content-Length': fileSize.toString(),
      'X-File-Size': fileSize.toString(),
      'X-File-Type': mimeType,
      'X-Processing-Engine': engine || 'unknown',
      'X-File-Category': categorizeFileSize(fileSize)
    })
    
    // Set download headers if requested
    if (download) {
      headers.set('Content-Disposition', `attachment; filename="${originalFileName}"`)
    } else {
      headers.set('Content-Disposition', `inline; filename="${originalFileName}"`)
    }
    
    // Create response
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers
    })
    
    // Add CDN headers
    addCDNHeaders(response, cdnConfig, strongETag, lastModified, fileSize)
    
    // Log download activity
    console.log('CDN file download:', {
      fileId,
      fileName: originalFileName,
      size: fileSize,
      mimeType,
      engine,
      downloadMode: download,
      cacheConfig: cdnConfig,
      timestamp: new Date().toISOString()
    })
    
    return response
    
  } catch (error) {
    console.error('CDN download error:', error)
    return NextResponse.json<DownloadResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Enhanced GET handler with CDN caching
export const GET = withCDNCache()(handleDownload)

// Enhanced HEAD handler for metadata
async function handleHead(request: NextRequest): Promise<NextResponse> {
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
    const fileStats = await stat(filePath)
    const mimeType = getMimeType(fileName)
    const engine = getEngineFromMimeType(mimeType)
    
    // Generate ETag
    const etag = generateETag(filePath, fileStats.size, fileStats.mtime, true)
    
    // Get CDN configuration
    const cdnConfig = getCDNConfig(mimeType, engine, fileStats.size)
    
    // Check conditional requests
    if (supportsConditionalCaching(request)) {
      if (isNotModified(request, etag, fileStats.mtime)) {
        return createNotModifiedResponse(etag, fileStats.mtime, cdnConfig)
      }
    }
    
    // Create headers-only response
    const headers = new Headers({
      'Content-Type': mimeType,
      'Content-Length': fileStats.size.toString(),
      'X-File-Size': fileStats.size.toString(),
      'X-File-Type': mimeType,
      'X-Processing-Engine': engine || 'unknown',
      'Last-Modified': fileStats.mtime.toUTCString()
    })
    
    const response = new NextResponse(null, {
      status: 200,
      headers
    })
    
    // Add CDN headers
    addCDNHeaders(response, cdnConfig, etag, fileStats.mtime, fileStats.size)
    
    return response
    
  } catch (error) {
    console.error('CDN HEAD request error:', error)
    return new NextResponse(null, { status: 500 })
  }
}

export const HEAD = withCDNCache()(handleHead)
