import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { 
  apiCache, 
  getCachedApiResponse, 
  requestDeduplicator,
  CacheKeyGenerator,
  ProcessingEngine,
  getCacheStrategy,
  categorizeFileSize
} from './cache'

// Cache middleware configuration
export interface CacheConfig {
  ttl?: number
  enabled?: boolean
  varyBy?: string[]
  skipCache?: (req: NextRequest) => boolean
  keyGenerator?: (req: NextRequest) => string
  engine?: ProcessingEngine
  fileSize?: number
}

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 300, // 5 minutes
  enabled: true,
  varyBy: ['user-agent', 'accept-encoding'],
  skipCache: (req) => req.method !== 'GET' && req.method !== 'POST'
}

// Cache middleware for API routes
export function withCache(config: CacheConfig = {}) {
  const finalConfig = { ...DEFAULT_CACHE_CONFIG, ...config }

  return function cacheMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function cachedHandler(req: NextRequest): Promise<NextResponse> {
      // Skip caching if disabled or conditions not met
      if (!finalConfig.enabled || finalConfig.skipCache?.(req)) {
        return handler(req)
      }

      // Generate cache key
      const cacheKey = finalConfig.keyGenerator 
        ? finalConfig.keyGenerator(req)
        : generateCacheKey(req, finalConfig.varyBy || [])

      try {
        // Use request deduplication for concurrent requests
        return await requestDeduplicator.deduplicate(
          cacheKey,
          async () => {
            // Check cache first
            const cached = await apiCache.get<{
              status: number
              headers: Record<string, string>
              body: any
            }>(cacheKey)

            if (cached) {
              console.log(`API cache hit: ${cacheKey}`)
              
              // Return cached response
              return new NextResponse(
                JSON.stringify(cached.body),
                {
                  status: cached.status,
                  headers: {
                    ...cached.headers,
                    'X-Cache': 'HIT',
                    'X-Cache-Key': cacheKey.substring(0, 16)
                  }
                }
              )
            }

            console.log(`API cache miss: ${cacheKey}`)
            
            // Execute original handler
            const response = await handler(req)
            
            // Cache successful responses
            if (response.status >= 200 && response.status < 300) {
              const responseBody = await response.text()
              
              // Determine TTL based on engine strategy if provided
              let ttl = finalConfig.ttl || 300
              if (finalConfig.engine && finalConfig.fileSize) {
                const strategy = getCacheStrategy(finalConfig.engine, finalConfig.fileSize)
                ttl = strategy.ttl
              }

              // Cache the response
              await apiCache.set(
                cacheKey,
                {
                  status: response.status,
                  headers: Object.fromEntries(response.headers.entries()),
                  body: responseBody ? JSON.parse(responseBody) : null
                },
                ttl
              )

              // Return response with cache headers
              return new NextResponse(responseBody, {
                status: response.status,
                headers: {
                  ...Object.fromEntries(response.headers.entries()),
                  'X-Cache': 'MISS',
                  'X-Cache-Key': cacheKey.substring(0, 16),
                  'X-Cache-TTL': ttl.toString()
                }
              })
            }

            // Don't cache error responses
            return response
          }
        )

      } catch (error) {
        console.error('Cache middleware error:', error)
        // Fallback to original handler on cache errors
        return handler(req)
      }
    }
  }
}

// Generate cache key from request
function generateCacheKey(req: NextRequest, varyBy: string[]): string {
  const url = new URL(req.url)
  const method = req.method
  const pathname = url.pathname
  const searchParams = url.searchParams.toString()
  
  // Include headers that affect response
  const varyHeaders: Record<string, string> = {}
  for (const header of varyBy) {
    const value = req.headers.get(header)
    if (value) {
      varyHeaders[header] = value
    }
  }

  // Create hash of request components
  const keyData = {
    method,
    pathname,
    searchParams,
    varyHeaders
  }

  const hash = createHash('sha256')
    .update(JSON.stringify(keyData))
    .digest('hex')
    .substring(0, 16)

  return `api:${method}:${pathname}:${hash}`
}

// File processing cache middleware
export function withFileProcessingCache(
  engine: ProcessingEngine,
  operation: string,
  config: Partial<CacheConfig> = {}
) {
  return withCache({
    ...config,
    engine,
    keyGenerator: (req) => {
      const body = req.body ? JSON.stringify(req.body) : ''
      const params = new URL(req.url).searchParams
      const fileId = params.get('fileId') || 'unknown'
      
      return CacheKeyGenerator.fileProcessing(
        engine,
        operation,
        fileId,
        { body, params: Object.fromEntries(params.entries()) }
      )
    },
    ttl: config.ttl || getCacheStrategy(engine, 1024 * 1024).ttl // Default 1MB file
  })
}

// Conditional cache middleware based on request size
export function withConditionalCache(
  getConfig: (req: NextRequest) => CacheConfig
) {
  return function conditionalCacheMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function conditionalCachedHandler(req: NextRequest): Promise<NextResponse> {
      const config = getConfig(req)
      return withCache(config)(handler)(req)
    }
  }
}

// Cache warming middleware for popular endpoints
export function withCacheWarming(
  warmupData: () => Promise<any>,
  config: CacheConfig = {}
) {
  return function cacheWarmingMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function warmedHandler(req: NextRequest): Promise<NextResponse> {
      // Warm cache on first request if not already warmed
      const cacheKey = generateCacheKey(req, config.varyBy || [])
      const cached = await apiCache.get(cacheKey)
      
      if (!cached) {
        try {
          const warmData = await warmupData()
          await apiCache.set(cacheKey, {
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: warmData
          }, config.ttl || 3600)
          
          console.log(`Cache warmed for: ${cacheKey}`)
        } catch (error) {
          console.error('Cache warming failed:', error)
        }
      }

      return withCache(config)(handler)(req)
    }
  }
}

// Cache invalidation middleware
export function withCacheInvalidation(
  getInvalidationPattern: (req: NextRequest) => string | null
) {
  return function cacheInvalidationMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function invalidatingHandler(req: NextRequest): Promise<NextResponse> {
      const response = await handler(req)
      
      // Invalidate cache on successful mutations
      if (
        (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') &&
        response.status >= 200 && response.status < 300
      ) {
        const pattern = getInvalidationPattern(req)
        if (pattern) {
          try {
            const invalidated = await apiCache.invalidate(pattern)
            console.log(`Cache invalidated: ${invalidated} entries for pattern: ${pattern}`)
            
            // Add invalidation info to response headers
            response.headers.set('X-Cache-Invalidated', invalidated.toString())
            response.headers.set('X-Cache-Pattern', pattern)
          } catch (error) {
            console.error('Cache invalidation failed:', error)
          }
        }
      }

      return response
    }
  }
}

// Export utility functions
export {
  generateCacheKey,
  DEFAULT_CACHE_CONFIG
}
