// Comprehensive caching system for file processing and API responses

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  set<T>(key: string, data: T, ttl = 3600): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
      hits: 0
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Increment hit counter
    entry.hits++
    
    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private evictOldest(): void {
    // Find least recently used entry (lowest hits)
    let oldestKey: string | null = null
    let lowestHits = Infinity
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < lowestHits) {
        lowestHits = entry.hits
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  getStats() {
    const now = Date.now()
    let totalHits = 0
    let expiredCount = 0
    
    for (const entry of this.cache.values()) {
      totalHits += entry.hits
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++
      }
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      expiredCount,
      hitRate: totalHits > 0 ? totalHits / this.cache.size : 0
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }
}

// Global cache instances
export const apiCache = new MemoryCache(500) // API response cache
export const fileCache = new MemoryCache(100) // File processing cache
export const userCache = new MemoryCache(1000) // User data cache

// Cache key generators
export const cacheKeys = {
  fileProcessing: (fileId: string, operation: string, params: any) => 
    `file:${fileId}:${operation}:${JSON.stringify(params)}`,
  
  apiResponse: (endpoint: string, params: any) => 
    `api:${endpoint}:${JSON.stringify(params)}`,
  
  userSession: (userId: string) => 
    `user:${userId}:session`,
  
  toolUsage: (userId: string, toolId: string) => 
    `usage:${userId}:${toolId}`,
  
  fileMetadata: (fileId: string) => 
    `metadata:${fileId}`,
}

// Cache decorators and utilities
export function withCache<T>(
  cache: MemoryCache,
  keyGenerator: (...args: any[]) => string,
  ttl = 3600
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]): Promise<T> {
      const key = keyGenerator(...args)
      
      // Try to get from cache first
      const cached = cache.get<T>(key)
      if (cached !== null) {
        console.log(`Cache hit for key: ${key}`)
        return cached
      }

      // Execute original method
      console.log(`Cache miss for key: ${key}`)
      const result = await method.apply(this, args)
      
      // Store in cache
      cache.set(key, result, ttl)
      
      return result
    }
  }
}

// File processing cache utilities
export async function getCachedFileResult<T>(
  fileId: string,
  operation: string,
  params: any,
  processor: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const key = cacheKeys.fileProcessing(fileId, operation, params)
  
  // Check cache first
  const cached = fileCache.get<T>(key)
  if (cached !== null) {
    console.log(`File processing cache hit: ${key}`)
    return cached
  }

  // Process file
  console.log(`File processing cache miss: ${key}`)
  const result = await processor()
  
  // Cache result
  fileCache.set(key, result, ttl)
  
  return result
}

// API response caching
export async function getCachedApiResponse<T>(
  endpoint: string,
  params: any,
  fetcher: () => Promise<T>,
  ttl = 300 // 5 minutes default for API responses
): Promise<T> {
  const key = cacheKeys.apiResponse(endpoint, params)
  
  // Check cache first
  const cached = apiCache.get<T>(key)
  if (cached !== null) {
    console.log(`API cache hit: ${key}`)
    return cached
  }

  // Fetch data
  console.log(`API cache miss: ${key}`)
  const result = await fetcher()
  
  // Cache result
  apiCache.set(key, result, ttl)
  
  return result
}

// Cache warming utilities
export async function warmCache() {
  console.log('Warming up cache...')
  
  // Pre-load common API responses
  try {
    // Warm up tool metadata
    await getCachedApiResponse(
      'tools/metadata',
      {},
      async () => {
        // Simulate loading tool metadata
        return {
          tools: ['pdf-merge', 'image-convert', 'video-convert'],
          categories: ['PDF', 'Image', 'Video', 'AI'],
          lastUpdated: new Date().toISOString()
        }
      },
      3600 // 1 hour
    )
    
    console.log('Cache warming completed')
  } catch (error) {
    console.error('Cache warming failed:', error)
  }
}

// Cache monitoring and metrics
export function getCacheMetrics() {
  return {
    api: apiCache.getStats(),
    file: fileCache.getStats(),
    user: userCache.getStats(),
    timestamp: new Date().toISOString()
  }
}

// Cache cleanup for graceful shutdown
export function cleanupCaches() {
  console.log('Cleaning up caches...')
  apiCache.destroy()
  fileCache.destroy()
  userCache.destroy()
}

// Browser-side caching utilities
export const browserCache = {
  set: (key: string, data: any, ttl = 3600) => {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000
    }
    
    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set browser cache:', error)
    }
  },
  
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`cache:${key}`)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      
      // Check if expired
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`cache:${key}`)
        return null
      }
      
      return parsed.data as T
    } catch (error) {
      console.warn('Failed to get browser cache:', error)
      return null
    }
  },
  
  clear: () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache:'))
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear browser cache:', error)
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  
  startTimer(operation: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, [])
      }
      
      const times = this.metrics.get(operation)!
      times.push(duration)
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift()
      }
      
      console.log(`${operation} completed in ${duration.toFixed(2)}ms`)
    }
  }
  
  getMetrics(operation: string) {
    const times = this.metrics.get(operation) || []
    
    if (times.length === 0) {
      return null
    }
    
    const sorted = [...times].sort((a, b) => a - b)
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length
    
    return {
      count: times.length,
      average: avg,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      min: sorted[0],
      max: sorted[sorted.length - 1]
    }
  }
  
  getAllMetrics() {
    const result: Record<string, any> = {}
    
    for (const [operation, times] of this.metrics.entries()) {
      result[operation] = this.getMetrics(operation)
    }
    
    return result
  }
}

export const performanceMonitor = new PerformanceMonitor()
