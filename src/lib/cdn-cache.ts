import { NextRequest, NextResponse } from 'next/server'
import { ProcessingEngine, categorizeFileSize, getCacheStrategy } from './cache-architecture'

// CDN cache configuration
export interface CDNConfig {
  maxAge: number // Cache duration in seconds
  sMaxAge?: number // Shared cache duration (CDN)
  staleWhileRevalidate?: number // Serve stale content while revalidating
  staleIfError?: number // Serve stale content on error
  mustRevalidate?: boolean
  noCache?: boolean
  noStore?: boolean
  public?: boolean
  private?: boolean
  immutable?: boolean
}

// File type specific CDN configurations
export const CDN_CONFIGS: Record<string, CDNConfig> = {
  // Images - Long cache with stale-while-revalidate
  'image/jpeg': {
    maxAge: 86400 * 30, // 30 days
    sMaxAge: 86400 * 365, // 1 year for CDN
    staleWhileRevalidate: 86400 * 7, // 7 days
    staleIfError: 86400 * 30, // 30 days
    public: true,
    immutable: false
  },
  'image/png': {
    maxAge: 86400 * 30,
    sMaxAge: 86400 * 365,
    staleWhileRevalidate: 86400 * 7,
    staleIfError: 86400 * 30,
    public: true,
    immutable: false
  },
  'image/webp': {
    maxAge: 86400 * 30,
    sMaxAge: 86400 * 365,
    staleWhileRevalidate: 86400 * 7,
    staleIfError: 86400 * 30,
    public: true,
    immutable: false
  },
  'image/avif': {
    maxAge: 86400 * 30,
    sMaxAge: 86400 * 365,
    staleWhileRevalidate: 86400 * 7,
    staleIfError: 86400 * 30,
    public: true,
    immutable: false
  },

  // PDFs - Medium cache duration
  'application/pdf': {
    maxAge: 86400 * 7, // 7 days
    sMaxAge: 86400 * 30, // 30 days for CDN
    staleWhileRevalidate: 86400 * 3, // 3 days
    staleIfError: 86400 * 7, // 7 days
    public: true,
    immutable: false
  },

  // Videos - Shorter cache due to size
  'video/mp4': {
    maxAge: 86400 * 3, // 3 days
    sMaxAge: 86400 * 14, // 14 days for CDN
    staleWhileRevalidate: 86400, // 1 day
    staleIfError: 86400 * 3, // 3 days
    public: true,
    immutable: false
  },
  'video/webm': {
    maxAge: 86400 * 3,
    sMaxAge: 86400 * 14,
    staleWhileRevalidate: 86400,
    staleIfError: 86400 * 3,
    public: true,
    immutable: false
  },

  // Default for other files
  'default': {
    maxAge: 86400, // 1 day
    sMaxAge: 86400 * 7, // 7 days for CDN
    staleWhileRevalidate: 3600, // 1 hour
    staleIfError: 86400, // 1 day
    public: true,
    immutable: false
  }
}

// Generate ETag for file using simple hash
export function generateETag(
  filePath: string,
  fileSize: number,
  lastModified: Date,
  weak = true
): string {
  // Simple hash function for browser compatibility
  const data = `${filePath}:${fileSize}:${lastModified.getTime()}`
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  const hashString = Math.abs(hash).toString(16).padStart(8, '0')
  return weak ? `W/"${hashString}"` : `"${hashString}"`
}

// Generate strong ETag from file content
export async function generateStrongETag(fileBuffer: Buffer): Promise<string> {
  // Use Web Crypto API for strong hash generation
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return `"${hashHex.substring(0, 16)}"`
    } catch (error) {
      console.warn('Web Crypto API not available, falling back to simple hash')
    }
  }

  // Fallback to simple hash for compatibility
  const data = fileBuffer.toString('base64')
  let hash = 0
  for (let i = 0; i < Math.min(data.length, 1000); i++) { // Limit for performance
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  const hashString = Math.abs(hash).toString(16).padStart(8, '0')
  return `"${hashString}"`
}

// Build Cache-Control header
export function buildCacheControlHeader(config: CDNConfig): string {
  const directives: string[] = []

  if (config.noCache) {
    directives.push('no-cache')
  }
  
  if (config.noStore) {
    directives.push('no-store')
  }
  
  if (config.public) {
    directives.push('public')
  } else if (config.private) {
    directives.push('private')
  }
  
  if (config.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`)
  }
  
  if (config.sMaxAge !== undefined) {
    directives.push(`s-maxage=${config.sMaxAge}`)
  }
  
  if (config.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`)
  }
  
  if (config.staleIfError !== undefined) {
    directives.push(`stale-if-error=${config.staleIfError}`)
  }
  
  if (config.mustRevalidate) {
    directives.push('must-revalidate')
  }
  
  if (config.immutable) {
    directives.push('immutable')
  }

  return directives.join(', ')
}

// Get CDN configuration for file type
export function getCDNConfig(
  mimeType: string,
  engine?: ProcessingEngine,
  fileSize?: number
): CDNConfig {
  // Get base config for mime type
  let config = CDN_CONFIGS[mimeType] || CDN_CONFIGS['default']

  // Adjust based on processing engine and file size
  if (engine && fileSize) {
    const strategy = getCacheStrategy(engine, fileSize)
    const sizeCategory = categorizeFileSize(fileSize)
    
    // Adjust cache duration based on file size
    switch (sizeCategory) {
      case 'tiny':
        config = {
          ...config,
          maxAge: config.maxAge * 2, // Double cache time for tiny files
          sMaxAge: (config.sMaxAge || config.maxAge) * 2
        }
        break
      case 'xlarge':
        config = {
          ...config,
          maxAge: Math.floor(config.maxAge / 2), // Half cache time for large files
          sMaxAge: Math.floor((config.sMaxAge || config.maxAge) / 2)
        }
        break
    }
  }

  return config
}

// Check if request supports conditional caching
export function supportsConditionalCaching(req: NextRequest): boolean {
  return !!(
    req.headers.get('if-none-match') ||
    req.headers.get('if-modified-since') ||
    req.headers.get('if-unmodified-since') ||
    req.headers.get('if-match')
  )
}

// Check if file is not modified
export function isNotModified(
  req: NextRequest,
  etag: string,
  lastModified: Date
): boolean {
  const ifNoneMatch = req.headers.get('if-none-match')
  const ifModifiedSince = req.headers.get('if-modified-since')

  // Check ETag
  if (ifNoneMatch) {
    const clientETags = ifNoneMatch.split(',').map(tag => tag.trim())
    if (clientETags.includes('*') || clientETags.includes(etag)) {
      return true
    }
  }

  // Check Last-Modified
  if (ifModifiedSince && !ifNoneMatch) {
    const clientDate = new Date(ifModifiedSince)
    const serverDate = new Date(Math.floor(lastModified.getTime() / 1000) * 1000)
    if (serverDate <= clientDate) {
      return true
    }
  }

  return false
}

// Add CDN headers to response
export function addCDNHeaders(
  response: NextResponse,
  config: CDNConfig,
  etag: string,
  lastModified: Date,
  fileSize?: number
): NextResponse {
  // Cache-Control
  response.headers.set('Cache-Control', buildCacheControlHeader(config))
  
  // ETag
  response.headers.set('ETag', etag)
  
  // Last-Modified
  response.headers.set('Last-Modified', lastModified.toUTCString())
  
  // Vary headers for better caching
  response.headers.set('Vary', 'Accept-Encoding, Accept')
  
  // Content length if available
  if (fileSize) {
    response.headers.set('Content-Length', fileSize.toString())
  }
  
  // CDN-specific headers
  response.headers.set('X-CDN-Cache', 'ENABLED')
  response.headers.set('X-Cache-Strategy', 'CDN')
  
  return response
}

// Create 304 Not Modified response
export function createNotModifiedResponse(
  etag: string,
  lastModified: Date,
  config: CDNConfig
): NextResponse {
  const response = new NextResponse(null, { status: 304 })
  
  // Add required headers for 304 response
  response.headers.set('Cache-Control', buildCacheControlHeader(config))
  response.headers.set('ETag', etag)
  response.headers.set('Last-Modified', lastModified.toUTCString())
  response.headers.set('Vary', 'Accept-Encoding, Accept')
  response.headers.set('X-Cache', 'NOT_MODIFIED')
  
  return response
}

// CDN middleware for file serving
export function withCDNCache(
  engine?: ProcessingEngine,
  customConfig?: Partial<CDNConfig>
) {
  return function cdnCacheMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function cdnCachedHandler(req: NextRequest): Promise<NextResponse> {
      try {
        // Only apply CDN caching to GET requests
        if (req.method !== 'GET') {
          return handler(req)
        }

        // Get file info from request (this would typically come from database)
        const { searchParams } = new URL(req.url)
        const fileId = searchParams.get('fileId')
        
        if (!fileId) {
          return handler(req)
        }

        // Execute handler to get file response
        const response = await handler(req)
        
        // Only apply CDN headers to successful responses
        if (response.status !== 200) {
          return response
        }

        // Get file metadata from response headers
        const mimeType = response.headers.get('content-type') || 'application/octet-stream'
        const contentLength = response.headers.get('content-length')
        const fileSize = contentLength ? parseInt(contentLength) : undefined
        
        // Get CDN configuration
        const config = {
          ...getCDNConfig(mimeType, engine, fileSize),
          ...customConfig
        }

        // Generate ETag and last modified
        const now = new Date()
        const etag = generateETag(fileId, fileSize || 0, now)
        
        // Check if client has cached version
        if (supportsConditionalCaching(req) && isNotModified(req, etag, now)) {
          return createNotModifiedResponse(etag, now, config)
        }

        // Add CDN headers to response
        return addCDNHeaders(response, config, etag, now, fileSize)

      } catch (error) {
        console.error('CDN cache middleware error:', error)
        return handler(req)
      }
    }
  }
}

// Static assets configuration for Next.js
export const STATIC_ASSETS_CONFIG = {
  // JavaScript and CSS
  'application/javascript': {
    maxAge: 86400 * 365, // 1 year
    sMaxAge: 86400 * 365,
    public: true,
    immutable: true
  },
  'text/css': {
    maxAge: 86400 * 365,
    sMaxAge: 86400 * 365,
    public: true,
    immutable: true
  },

  // Fonts
  'font/woff2': {
    maxAge: 86400 * 365,
    sMaxAge: 86400 * 365,
    public: true,
    immutable: true
  },
  'font/woff': {
    maxAge: 86400 * 365,
    sMaxAge: 86400 * 365,
    public: true,
    immutable: true
  },

  // Icons and favicons
  'image/x-icon': {
    maxAge: 86400 * 30, // 30 days
    sMaxAge: 86400 * 365,
    public: true,
    immutable: false
  },
  'image/svg+xml': {
    maxAge: 86400 * 30,
    sMaxAge: 86400 * 365,
    public: true,
    immutable: false
  }
}

// Next.js middleware for static assets
export function createStaticAssetsMiddleware() {
  return function staticAssetsMiddleware(req: NextRequest) {
    const { pathname } = new URL(req.url)

    // Check if it's a static asset
    if (
      pathname.startsWith('/_next/static/') ||
      pathname.startsWith('/static/') ||
      pathname.match(/\.(js|css|woff2?|ico|svg|png|jpg|jpeg|gif|webp)$/)
    ) {
      // Get file extension
      const ext = pathname.split('.').pop()?.toLowerCase()

      // Determine MIME type
      let mimeType = 'application/octet-stream'
      if (ext === 'js') mimeType = 'application/javascript'
      else if (ext === 'css') mimeType = 'text/css'
      else if (ext === 'woff2') mimeType = 'font/woff2'
      else if (ext === 'woff') mimeType = 'font/woff'
      else if (ext === 'ico') mimeType = 'image/x-icon'
      else if (ext === 'svg') mimeType = 'image/svg+xml'

      // Get configuration
      const config = STATIC_ASSETS_CONFIG[mimeType] || CDN_CONFIGS['default']

      // Add cache headers
      const response = NextResponse.next()
      response.headers.set('Cache-Control', buildCacheControlHeader(config))
      response.headers.set('X-Static-Asset', 'true')

      return response
    }

    return NextResponse.next()
  }
}

// Preload hints for critical resources
export function addPreloadHints(response: NextResponse, criticalResources: string[]): NextResponse {
  const preloadLinks = criticalResources.map(resource => {
    const ext = resource.split('.').pop()?.toLowerCase()
    let asType = 'fetch'

    if (ext === 'css') asType = 'style'
    else if (ext === 'js') asType = 'script'
    else if (ext === 'woff2' || ext === 'woff') asType = 'font'
    else if (['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext || '')) asType = 'image'

    return `<${resource}>; rel=preload; as=${asType}${asType === 'font' ? '; crossorigin' : ''}`
  }).join(', ')

  if (preloadLinks) {
    response.headers.set('Link', preloadLinks)
  }

  return response
}

// Export utility functions
export {
  CDN_CONFIGS,
  buildCacheControlHeader,
  getCDNConfig,
  generateETag,
  generateStrongETag,
  supportsConditionalCaching,
  isNotModified,
  addCDNHeaders,
  createNotModifiedResponse,
  STATIC_ASSETS_CONFIG,
  createStaticAssetsMiddleware,
  addPreloadHints
}
