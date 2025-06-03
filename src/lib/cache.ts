// Comprehensive multi-tier caching system for file processing and API responses
import { Redis } from 'ioredis'
import { createHash } from 'crypto'
import { promisify } from 'util'
import { gzip, gunzip } from 'zlib'
import LRU from 'lru-cache'

import { cacheRedis, redisManager } from './redis-config'
import {
  CacheKeyGenerator,
  getCacheStrategy,
  ProcessingEngine,
  CacheTier,
  CacheMetrics,
  categorizeFileSize,
  CACHE_ARCHITECTURE
} from './cache-architecture'

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  size?: number
  compressed?: boolean
}

// Enhanced Memory Cache with LRU eviction
class MemoryCache {
  private cache: LRU<string, CacheEntry<any>>
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout
  private metrics: {
    hits: number
    misses: number
    evictions: number
    errors: number
  }

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    this.metrics = { hits: 0, misses: 0, evictions: 0, errors: 0 }

    this.cache = new LRU({
      max: maxSize,
      ttl: 1000 * 60 * 60, // 1 hour default
      updateAgeOnGet: true,
      allowStale: false,
      dispose: () => {
        this.metrics.evictions++
      }
    })

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

// Multi-Tier Cache with Redis Integration
export class MultiTierCache {
  private memoryCache: MemoryCache
  private redisClient: Redis
  private metrics: CacheMetrics
  private compressionThreshold: number = 1024 // 1KB

  constructor(
    memoryCacheSize = 1000,
    compressionThreshold = 1024
  ) {
    this.memoryCache = new MemoryCache(memoryCacheSize)
    this.redisClient = cacheRedis()
    this.compressionThreshold = compressionThreshold
    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      redisUsage: 0,
      evictions: 0,
      errors: 0,
      lastUpdated: new Date()
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now()
    this.metrics.totalRequests++

    try {
      // L1: Check memory cache first
      const memoryResult = this.memoryCache.get<T>(key)
      if (memoryResult !== null) {
        this.metrics.hits++
        this.updateMetrics(startTime)
        return memoryResult
      }

      // L2: Check Redis cache
      const redisResult = await this.getFromRedis<T>(key)
      if (redisResult !== null) {
        // Store in memory cache for faster access
        this.memoryCache.set(key, redisResult, 3600)
        this.metrics.hits++
        this.updateMetrics(startTime)
        return redisResult
      }

      this.metrics.misses++
      this.updateMetrics(startTime)
      return null

    } catch (error) {
      this.metrics.errors++
      console.error('Cache get error:', error)
      return null
    }
  }

  async set<T>(
    key: string,
    data: T,
    ttl = 3600,
    tiers: CacheTier[] = [CacheTier.MEMORY, CacheTier.REDIS]
  ): Promise<void> {
    try {
      // Store in memory cache if requested
      if (tiers.includes(CacheTier.MEMORY)) {
        this.memoryCache.set(key, data, ttl)
      }

      // Store in Redis cache if requested
      if (tiers.includes(CacheTier.REDIS)) {
        await this.setInRedis(key, data, ttl)
      }

    } catch (error) {
      this.metrics.errors++
      console.error('Cache set error:', error)
    }
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    try {
      const result = await this.redisClient.get(key)
      if (!result) return null

      const parsed = JSON.parse(result)

      // Handle compressed data
      if (parsed.compressed) {
        const decompressed = await gunzipAsync(Buffer.from(parsed.data, 'base64'))
        return JSON.parse(decompressed.toString()) as T
      }

      return parsed.data as T

    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  private async setInRedis<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const serialized = JSON.stringify(data)
      const shouldCompress = serialized.length > this.compressionThreshold

      let payload: any = { data, compressed: false }

      if (shouldCompress) {
        const compressed = await gzipAsync(serialized)
        payload = {
          data: compressed.toString('base64'),
          compressed: true
        }
      }

      await this.redisClient.setex(key, ttl, JSON.stringify(payload))

    } catch (error) {
      console.error('Redis set error:', error)
      throw error
    }
  }

  private updateMetrics(startTime: number): void {
    const duration = Date.now() - startTime
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime + duration) / 2
    this.metrics.hitRate =
      this.metrics.hits / this.metrics.totalRequests
    this.metrics.lastUpdated = new Date()
  }

  async invalidate(pattern: string): Promise<number> {
    try {
      // Clear from memory cache
      this.memoryCache.clear()

      // Clear from Redis using pattern
      const keys = await this.redisClient.keys(pattern)
      if (keys.length > 0) {
        await this.redisClient.del(...keys)
      }

      return keys.length

    } catch (error) {
      this.metrics.errors++
      console.error('Cache invalidation error:', error)
      return 0
    }
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redisClient.ping()
      return result === 'PONG'
    } catch (error) {
      return false
    }
  }

  async destroy(): Promise<void> {
    this.memoryCache.destroy()
    // Redis client is managed by redisManager, don't close it here
  }
}

// Global cache instances - Enhanced with multi-tier caching
export const apiCache = new MultiTierCache(500, 1024) // API response cache
export const fileCache = new MultiTierCache(100, 2048) // File processing cache
export const userCache = new MultiTierCache(1000, 512) // User data cache

// Legacy memory-only caches for backward compatibility
export const legacyApiCache = new MemoryCache(500)
export const legacyFileCache = new MemoryCache(100)
export const legacyUserCache = new MemoryCache(1000)

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

// Intelligent File Processing Cache with Engine-Specific Strategies
export async function getCachedFileResult<T>(
  fileId: string,
  operation: string,
  params: any,
  processor: () => Promise<T>,
  engine: ProcessingEngine,
  fileSize?: number
): Promise<T> {
  const key = CacheKeyGenerator.fileProcessing(engine, operation, fileId, params)

  // Get cache strategy based on engine and file size
  const strategy = fileSize
    ? getCacheStrategy(engine, fileSize)
    : { ttl: CACHE_ARCHITECTURE[engine].defaultTTL, tiers: [CacheTier.MEMORY, CacheTier.REDIS], priority: 5, compressionEnabled: true }

  // Check cache first
  const cached = await fileCache.get<T>(key)
  if (cached !== null) {
    console.log(`File processing cache hit: ${key} (${engine}:${operation})`)

    // Track usage for cache warming
    try {
      const { cacheWarmer } = await import('./cache-warming')
      await cacheWarmer.trackUsage(engine, operation)
    } catch (error) {
      // Ignore tracking errors
    }

    return cached
  }

  // Process file
  console.log(`File processing cache miss: ${key} (${engine}:${operation})`)
  const startTime = Date.now()
  const result = await processor()
  const processingTime = Date.now() - startTime

  // Cache result with intelligent strategy
  await fileCache.set(key, result, strategy.ttl, strategy.tiers)

  // Track usage for cache warming
  try {
    const { cacheWarmer } = await import('./cache-warming')
    await cacheWarmer.trackUsage(engine, operation)
  } catch (error) {
    // Ignore tracking errors
  }

  // Log performance metrics
  console.log(`File processing completed: ${operation} in ${processingTime}ms`)

  return result
}

// Legacy function for backward compatibility
export async function getCachedFileResultLegacy<T>(
  fileId: string,
  operation: string,
  params: any,
  processor: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const key = cacheKeys.fileProcessing(fileId, operation, params)

  // Check cache first
  const cached = legacyFileCache.get<T>(key)
  if (cached !== null) {
    console.log(`File processing cache hit: ${key}`)
    return cached
  }

  // Process file
  console.log(`File processing cache miss: ${key}`)
  const result = await processor()

  // Cache result
  legacyFileCache.set(key, result, ttl)

  return result
}

// Enhanced API response caching with multi-tier support
export async function getCachedApiResponse<T>(
  endpoint: string,
  params: any,
  fetcher: () => Promise<T>,
  ttl = 300 // 5 minutes default for API responses
): Promise<T> {
  const key = CacheKeyGenerator.apiResponse(endpoint, 'GET', params)

  // Check cache first
  const cached = await apiCache.get<T>(key)
  if (cached !== null) {
    console.log(`API cache hit: ${key}`)
    return cached
  }

  // Fetch data
  console.log(`API cache miss: ${key}`)
  const startTime = Date.now()
  const result = await fetcher()
  const fetchTime = Date.now() - startTime

  // Cache result in both memory and Redis
  await apiCache.set(key, result, ttl, [CacheTier.MEMORY, CacheTier.REDIS])

  console.log(`API response cached: ${endpoint} (${fetchTime}ms)`)
  return result
}

// Enhanced Cache warming with intelligent strategies
export async function warmCache() {
  console.log('Warming up multi-tier cache...')

  try {
    // Import cache warmer dynamically to avoid circular dependency
    const { cacheWarmer } = await import('./cache-warming')

    // Trigger intelligent cache warming
    await cacheWarmer.triggerWarming()

    console.log('Multi-tier cache warming completed successfully')
  } catch (error) {
    console.error('Cache warming failed:', error)

    // Fallback to basic warming
    await basicCacheWarming()
  }
}

// Basic cache warming fallback
async function basicCacheWarming() {
  try {
    // Warm up tool metadata
    await getCachedApiResponse(
      'tools/metadata',
      {},
      async () => {
        return {
          tools: [
            // PDF Tools
            'pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-protect', 'pdf-convert',
            'pdf-ocr', 'pdf-watermark', 'pdf-extract-text', 'pdf-rotate',
            // Image Tools
            'image-resize', 'image-convert', 'image-compress', 'image-crop', 'image-rotate',
            'image-flip', 'image-background-removal', 'image-enhance', 'image-blur',
            'image-brightness-contrast', 'image-saturation', 'image-grayscale', 'image-border',
            'image-sepia', 'image-negative', 'image-sharpen', 'image-noise-reduction',
            'image-watermark', 'image-metadata', 'image-format-convert',
            // Video Tools
            'video-convert', 'video-compress', 'video-trim', 'video-extract-audio',
            'video-merge', 'video-split', 'video-thumbnail', 'video-watermark',
            'video-speed', 'video-rotate', 'video-mute', 'video-optimize'
          ],
          categories: ['PDF', 'Image', 'Video', 'AI'],
          engines: {
            pdf: { tools: 9, status: 'active' },
            image: { tools: 20, status: 'active' },
            video: { tools: 12, status: 'active' }
          },
          lastUpdated: new Date().toISOString()
        }
      },
      3600 // 1 hour
    )

    // Warm up popular processing configurations
    const popularConfigs = [
      { engine: 'pdf' as ProcessingEngine, operation: 'merge', params: {} },
      { engine: 'image' as ProcessingEngine, operation: 'resize', params: { width: 800, height: 600 } },
      { engine: 'video' as ProcessingEngine, operation: 'compress', params: { quality: 'medium' } }
    ]

    for (const config of popularConfigs) {
      const key = CacheKeyGenerator.fileProcessing(
        config.engine,
        config.operation,
        'warmup',
        config.params
      )

      // Pre-cache common configurations
      await fileCache.set(
        key,
        { warmed: true, config },
        CACHE_ARCHITECTURE[config.engine].defaultTTL,
        [CacheTier.MEMORY, CacheTier.REDIS]
      )
    }

    console.log('Basic cache warming completed')
  } catch (error) {
    console.error('Basic cache warming failed:', error)
  }
}

// Enhanced cache monitoring and metrics
export async function getCacheMetrics() {
  const [apiMetrics, fileMetrics, userMetrics] = await Promise.all([
    apiCache.getMetrics(),
    fileCache.getMetrics(),
    userCache.getMetrics()
  ])

  const [apiHealth, fileHealth, userHealth] = await Promise.all([
    apiCache.healthCheck(),
    fileCache.healthCheck(),
    userCache.healthCheck()
  ])

  return {
    api: { ...apiMetrics, healthy: apiHealth },
    file: { ...fileMetrics, healthy: fileHealth },
    user: { ...userMetrics, healthy: userHealth },
    redis: await redisManager.healthCheck(),
    timestamp: new Date().toISOString(),
    overall: {
      totalHits: apiMetrics.hits + fileMetrics.hits + userMetrics.hits,
      totalMisses: apiMetrics.misses + fileMetrics.misses + userMetrics.misses,
      overallHitRate: (apiMetrics.hits + fileMetrics.hits + userMetrics.hits) /
                     (apiMetrics.totalRequests + fileMetrics.totalRequests + userMetrics.totalRequests),
      averageResponseTime: (apiMetrics.averageResponseTime + fileMetrics.averageResponseTime + userMetrics.averageResponseTime) / 3
    }
  }
}

// Cache cleanup for graceful shutdown
export async function cleanupCaches() {
  console.log('Cleaning up multi-tier caches...')

  try {
    await Promise.all([
      apiCache.destroy(),
      fileCache.destroy(),
      userCache.destroy()
    ])

    // Cleanup legacy caches
    legacyApiCache.destroy()
    legacyFileCache.destroy()
    legacyUserCache.destroy()

    console.log('Cache cleanup completed')
  } catch (error) {
    console.error('Cache cleanup error:', error)
  }
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

// Request deduplication for concurrent identical requests
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()

  async deduplicate<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Check if request is already in progress
    if (this.pendingRequests.has(key)) {
      console.log(`Request deduplication: ${key}`)
      return this.pendingRequests.get(key) as Promise<T>
    }

    // Start new request
    const promise = fetcher().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  clear(): void {
    this.pendingRequests.clear()
  }

  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      keys: Array.from(this.pendingRequests.keys())
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator()

// Cache invalidation utilities
export async function invalidateCache(pattern: string): Promise<{
  api: number
  file: number
  user: number
  total: number
}> {
  const [apiInvalidated, fileInvalidated, userInvalidated] = await Promise.all([
    apiCache.invalidate(pattern),
    fileCache.invalidate(pattern),
    userCache.invalidate(pattern)
  ])

  const total = apiInvalidated + fileInvalidated + userInvalidated

  console.log(`Cache invalidation completed: ${total} entries removed for pattern: ${pattern}`)

  return {
    api: apiInvalidated,
    file: fileInvalidated,
    user: userInvalidated,
    total
  }
}

// Engine-specific cache invalidation
export async function invalidateEngineCache(engine: ProcessingEngine): Promise<number> {
  const pattern = `*${engine}:*`
  const result = await invalidateCache(pattern)
  return result.total
}

// File-specific cache invalidation
export async function invalidateFileCache(fileId: string): Promise<number> {
  const pattern = `*:${fileId}:*`
  const result = await invalidateCache(pattern)
  return result.total
}

// Export enhanced cache utilities
export {
  CacheKeyGenerator,
  getCacheStrategy,
  categorizeFileSize,
  CACHE_ARCHITECTURE,
  CacheTier,
  ProcessingEngine
}
