import { NextRequest, NextResponse } from 'next/server'
import { 
  createStaticAssetsMiddleware,
  buildCacheControlHeader,
  CDN_CONFIGS,
  STATIC_ASSETS_CONFIG
} from './src/lib/cdn-cache'

// Global middleware for WebTools Pro
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Apply static assets caching
  if (isStaticAsset(pathname)) {
    return handleStaticAssets(request)
  }
  
  // Apply API caching headers
  if (pathname.startsWith('/api/')) {
    return handleAPIRoutes(request)
  }
  
  // Apply page caching
  if (isPageRoute(pathname)) {
    return handlePageRoutes(request)
  }
  
  return NextResponse.next()
}

// Check if path is a static asset
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/public/') ||
    pathname.match(/\.(js|css|woff2?|ico|svg|png|jpg|jpeg|gif|webp|avif|mp4|webm|pdf)$/) !== null
  )
}

// Check if path is a page route
function isPageRoute(pathname: string): boolean {
  return !pathname.startsWith('/api/') && !isStaticAsset(pathname)
}

// Handle static assets with CDN caching
function handleStaticAssets(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // Get file extension
  const ext = pathname.split('.').pop()?.toLowerCase()
  
  // Determine MIME type and cache configuration
  let mimeType = 'application/octet-stream'
  let config = CDN_CONFIGS['default']
  
  // Map extensions to MIME types
  const mimeTypeMap: Record<string, string> = {
    'js': 'application/javascript',
    'css': 'text/css',
    'woff2': 'font/woff2',
    'woff': 'font/woff',
    'ico': 'image/x-icon',
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'pdf': 'application/pdf'
  }
  
  if (ext && mimeTypeMap[ext]) {
    mimeType = mimeTypeMap[ext]
    config = STATIC_ASSETS_CONFIG[mimeType] || CDN_CONFIGS[mimeType] || CDN_CONFIGS['default']
  }
  
  // Add cache headers
  response.headers.set('Cache-Control', buildCacheControlHeader(config))
  response.headers.set('X-Static-Asset', 'true')
  response.headers.set('X-Content-Type', mimeType)
  
  // Add security headers for static assets
  if (pathname.startsWith('/_next/static/')) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }
  
  // Add CORS headers for fonts
  if (mimeType.startsWith('font/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET')
  }
  
  return response
}

// Handle API routes with appropriate caching
function handleAPIRoutes(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // Different caching strategies for different API endpoints
  if (pathname.startsWith('/api/files/download')) {
    // File downloads - handled by route-specific middleware
    return response
  }
  
  if (pathname.startsWith('/api/tools/')) {
    // Processing tools - short cache for GET requests
    if (request.method === 'GET') {
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600') // 5 min / 10 min
    } else {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  }
  
  if (pathname.includes('/status') || pathname.includes('/health')) {
    // Status endpoints - very short cache
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120') // 1 min / 2 min
  }
  
  // Add API-specific headers
  response.headers.set('X-API-Route', 'true')
  response.headers.set('X-RateLimit-Policy', 'standard')
  
  return response
}

// Handle page routes with appropriate caching
function handlePageRoutes(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // Different caching for different page types
  if (pathname === '/' || pathname === '/home') {
    // Homepage - medium cache
    response.headers.set('Cache-Control', 'public, max-age=1800, s-maxage=3600') // 30 min / 1 hour
  } else if (pathname.startsWith('/tools/')) {
    // Tool pages - longer cache
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200') // 1 hour / 2 hours
  } else if (pathname.startsWith('/docs/') || pathname.startsWith('/help/')) {
    // Documentation - long cache
    response.headers.set('Cache-Control', 'public, max-age=7200, s-maxage=14400') // 2 hours / 4 hours
  } else {
    // Other pages - default cache
    response.headers.set('Cache-Control', 'public, max-age=900, s-maxage=1800') // 15 min / 30 min
  }
  
  // Add page-specific headers
  response.headers.set('X-Page-Route', 'true')
  response.headers.set('Vary', 'Accept-Encoding, Accept-Language')
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

// Export middleware utilities for use in API routes
export {
  isStaticAsset,
  isPageRoute,
  handleStaticAssets,
  handleAPIRoutes,
  handlePageRoutes
}
