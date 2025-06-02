// Simple in-memory rate limiter
// In production, use Redis or similar distributed cache

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private cache = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.resetTime <= now) {
        this.cache.delete(key)
      }
    }
  }

  async limit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    totalRequests: number
  }> {
    const now = Date.now()
    const resetTime = now + windowMs
    
    let entry = this.cache.get(identifier)
    
    // If no entry exists or the window has expired, create a new one
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 1,
        resetTime
      }
      this.cache.set(identifier, entry)
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime,
        totalRequests: 1
      }
    }
    
    // Increment the count
    entry.count++
    
    const allowed = entry.count <= maxRequests
    const remaining = Math.max(0, maxRequests - entry.count)
    
    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      totalRequests: entry.count
    }
  }

  // Get current status without incrementing
  getStatus(identifier: string): {
    requests: number
    remaining: number
    resetTime: number
  } | null {
    const entry = this.cache.get(identifier)
    
    if (!entry || entry.resetTime <= Date.now()) {
      return null
    }
    
    return {
      requests: entry.count,
      remaining: Math.max(0, entry.count),
      resetTime: entry.resetTime
    }
  }

  // Reset rate limit for a specific identifier
  reset(identifier: string): void {
    this.cache.delete(identifier)
  }

  // Get all active rate limits (for monitoring)
  getAllLimits(): Array<{
    identifier: string
    requests: number
    resetTime: number
  }> {
    const now = Date.now()
    const results: Array<{
      identifier: string
      requests: number
      resetTime: number
    }> = []
    
    for (const [identifier, entry] of this.cache.entries()) {
      if (entry.resetTime > now) {
        results.push({
          identifier,
          requests: entry.count,
          resetTime: entry.resetTime
        })
      }
    }
    
    return results
  }

  // Clear all rate limits
  clear(): void {
    this.cache.clear()
  }

  // Destroy the rate limiter and cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter()

// Main rate limiting function
export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  const result = await rateLimiter.limit(identifier, maxRequests, windowMs)
  
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetTime: result.resetTime
  }
}

// Specialized rate limiters for different use cases

// File upload rate limiter
export async function rateLimitUpload(
  identifier: string
): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  return rateLimit(identifier, 10, 60 * 1000) // 10 uploads per minute
}

// API request rate limiter
export async function rateLimitApi(
  identifier: string
): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  return rateLimit(identifier, 100, 60 * 1000) // 100 requests per minute
}

// Processing rate limiter (for heavy operations)
export async function rateLimitProcessing(
  identifier: string
): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  return rateLimit(identifier, 5, 60 * 1000) // 5 processing jobs per minute
}

// Download rate limiter
export async function rateLimitDownload(
  identifier: string
): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  return rateLimit(identifier, 50, 60 * 1000) // 50 downloads per minute
}

// Premium user rate limiter (higher limits)
export async function rateLimitPremium(
  identifier: string,
  operation: 'upload' | 'api' | 'processing' | 'download'
): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  const limits = {
    upload: { max: 50, window: 60 * 1000 }, // 50 uploads per minute
    api: { max: 500, window: 60 * 1000 }, // 500 requests per minute
    processing: { max: 20, window: 60 * 1000 }, // 20 processing jobs per minute
    download: { max: 200, window: 60 * 1000 } // 200 downloads per minute
  }
  
  const config = limits[operation]
  return rateLimit(`premium_${identifier}`, config.max, config.window)
}

// Enterprise rate limiter (highest limits)
export async function rateLimitEnterprise(
  identifier: string,
  operation: 'upload' | 'api' | 'processing' | 'download'
): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  const limits = {
    upload: { max: 200, window: 60 * 1000 }, // 200 uploads per minute
    api: { max: 2000, window: 60 * 1000 }, // 2000 requests per minute
    processing: { max: 100, window: 60 * 1000 }, // 100 processing jobs per minute
    download: { max: 1000, window: 60 * 1000 } // 1000 downloads per minute
  }
  
  const config = limits[operation]
  return rateLimit(`enterprise_${identifier}`, config.max, config.window)
}

// Get rate limit status without incrementing
export function getRateLimitStatus(identifier: string) {
  return rateLimiter.getStatus(identifier)
}

// Reset rate limit for identifier
export function resetRateLimit(identifier: string): void {
  rateLimiter.reset(identifier)
}

// Get all active rate limits (for monitoring)
export function getAllRateLimits() {
  return rateLimiter.getAllLimits()
}

// Clear all rate limits
export function clearAllRateLimits(): void {
  rateLimiter.clear()
}

// Rate limit middleware helper
export function createRateLimitHeaders(result: {
  allowed: boolean
  remaining: number
  resetTime: number
}): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'X-RateLimit-Limit': '100', // Default limit
  }
}

// Exponential backoff calculator
export function calculateBackoffDelay(
  attempt: number,
  baseDelay = 1000,
  maxDelay = 30000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay
  return Math.floor(delay + jitter)
}

// Rate limit error class
export class RateLimitError extends Error {
  constructor(
    message: string,
    public remaining: number,
    public resetTime: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

// Cleanup function for graceful shutdown
export function cleanup(): void {
  rateLimiter.destroy()
}

// Export the rate limiter instance for advanced usage
export { rateLimiter }
