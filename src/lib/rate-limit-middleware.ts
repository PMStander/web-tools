import { NextRequest, NextResponse } from 'next/server'
import { cacheRedis } from './redis-config'
import { CacheKeyGenerator } from './cache-architecture'

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  onLimitReached?: (req: NextRequest) => NextResponse
  enabled?: boolean
}

// Default rate limit configuration
const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  enabled: true
}

// Rate limiting middleware
export function withRateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config }

  return function rateLimitMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function rateLimitedHandler(req: NextRequest): Promise<NextResponse> {
      if (!finalConfig.enabled) {
        return handler(req)
      }

      try {
        // Generate rate limit key
        const key = finalConfig.keyGenerator 
          ? finalConfig.keyGenerator(req)
          : generateRateLimitKey(req)

        // Check current request count
        const redis = cacheRedis()
        const current = await redis.get(key)
        const requestCount = current ? parseInt(current) : 0

        // Check if limit exceeded
        if (requestCount >= finalConfig.maxRequests) {
          console.log(`Rate limit exceeded for key: ${key}`)
          
          if (finalConfig.onLimitReached) {
            return finalConfig.onLimitReached(req)
          }

          return new NextResponse(
            JSON.stringify({
              success: false,
              error: 'Rate limit exceeded',
              retryAfter: Math.ceil(finalConfig.windowMs / 1000)
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': (Date.now() + finalConfig.windowMs).toString(),
                'Retry-After': Math.ceil(finalConfig.windowMs / 1000).toString()
              }
            }
          )
        }

        // Execute handler
        const response = await handler(req)

        // Update rate limit counter based on response
        const shouldCount = (
          (!finalConfig.skipSuccessfulRequests || response.status >= 400) &&
          (!finalConfig.skipFailedRequests || response.status < 400)
        )

        if (shouldCount) {
          const newCount = requestCount + 1
          await redis.setex(
            key, 
            Math.ceil(finalConfig.windowMs / 1000), 
            newCount.toString()
          )

          // Add rate limit headers
          response.headers.set('X-RateLimit-Limit', finalConfig.maxRequests.toString())
          response.headers.set('X-RateLimit-Remaining', (finalConfig.maxRequests - newCount).toString())
          response.headers.set('X-RateLimit-Reset', (Date.now() + finalConfig.windowMs).toString())
        }

        return response

      } catch (error) {
        console.error('Rate limit middleware error:', error)
        // Continue without rate limiting on Redis errors
        return handler(req)
      }
    }
  }
}

// Generate rate limit key from request
function generateRateLimitKey(req: NextRequest): string {
  // Try to get IP from various headers
  const ip = getClientIP(req)
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const endpoint = new URL(req.url).pathname

  return CacheKeyGenerator.rateLimitKey(
    `${ip}:${endpoint}`,
    Date.now().toString().slice(0, -5) // 5-minute windows
  )
}

// Extract client IP from request
function getClientIP(req: NextRequest): string {
  // Check various headers for real IP
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback to connection remote address
  return req.ip || 'unknown'
}

// File processing specific rate limiting
export function withFileProcessingRateLimit(
  maxFilesPerMinute = 10,
  maxFileSizeMB = 100
) {
  return withRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: maxFilesPerMinute,
    keyGenerator: (req) => {
      const ip = getClientIP(req)
      return CacheKeyGenerator.rateLimitKey(
        `file-processing:${ip}`,
        Date.now().toString().slice(0, -5)
      )
    },
    onLimitReached: (req) => {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'File processing rate limit exceeded',
          message: `Maximum ${maxFilesPerMinute} files per minute allowed`,
          retryAfter: 60
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      )
    }
  })
}

// API endpoint specific rate limiting
export function withAPIRateLimit(
  endpoint: string,
  maxRequestsPerHour = 1000
) {
  return withRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: maxRequestsPerHour,
    keyGenerator: (req) => {
      const ip = getClientIP(req)
      return CacheKeyGenerator.rateLimitKey(
        `api:${endpoint}:${ip}`,
        Date.now().toString().slice(0, -8) // Hour windows
      )
    }
  })
}

// Burst protection rate limiting
export function withBurstProtection(
  maxBurstRequests = 20,
  burstWindowMs = 10000 // 10 seconds
) {
  return withRateLimit({
    windowMs: burstWindowMs,
    maxRequests: maxBurstRequests,
    keyGenerator: (req) => {
      const ip = getClientIP(req)
      return CacheKeyGenerator.rateLimitKey(
        `burst:${ip}`,
        Date.now().toString().slice(0, -4) // 10-second windows
      )
    },
    onLimitReached: (req) => {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Burst limit exceeded',
          message: 'Too many requests in a short time period',
          retryAfter: Math.ceil(burstWindowMs / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(burstWindowMs / 1000).toString()
          }
        }
      )
    }
  })
}

// Combined middleware for cache + rate limiting
export function withCacheAndRateLimit(
  cacheConfig: any,
  rateLimitConfig: Partial<RateLimitConfig> = {}
) {
  return function combinedMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    // Apply rate limiting first, then caching
    const rateLimited = withRateLimit(rateLimitConfig)(handler)
    
    // Import cache middleware dynamically to avoid circular dependency
    return async (req: NextRequest) => {
      const { withCache } = await import('./cache-middleware')
      return withCache(cacheConfig)(rateLimited)(req)
    }
  }
}

// Rate limit status check
export async function getRateLimitStatus(
  req: NextRequest,
  config: Partial<RateLimitConfig> = {}
): Promise<{
  limit: number
  remaining: number
  reset: number
  exceeded: boolean
}> {
  const finalConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config }
  const key = finalConfig.keyGenerator 
    ? finalConfig.keyGenerator(req)
    : generateRateLimitKey(req)

  try {
    const redis = cacheRedis()
    const current = await redis.get(key)
    const requestCount = current ? parseInt(current) : 0
    const remaining = Math.max(0, finalConfig.maxRequests - requestCount)

    return {
      limit: finalConfig.maxRequests,
      remaining,
      reset: Date.now() + finalConfig.windowMs,
      exceeded: requestCount >= finalConfig.maxRequests
    }
  } catch (error) {
    console.error('Rate limit status check failed:', error)
    return {
      limit: finalConfig.maxRequests,
      remaining: finalConfig.maxRequests,
      reset: Date.now() + finalConfig.windowMs,
      exceeded: false
    }
  }
}

export {
  generateRateLimitKey,
  getClientIP,
  DEFAULT_RATE_LIMIT_CONFIG
}
