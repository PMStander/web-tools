import { REDIS_TTL, REDIS_PREFIXES } from './redis-config'

// Processing engine types
export type ProcessingEngine = 'pdf' | 'image' | 'video'

// File size categories for tiered caching
export enum FileSizeCategory {
  TINY = 'tiny',        // < 1MB
  SMALL = 'small',      // 1MB - 10MB
  MEDIUM = 'medium',    // 10MB - 50MB
  LARGE = 'large',      // 50MB - 100MB
  XLARGE = 'xlarge'     // > 100MB
}

// Cache tier levels
export enum CacheTier {
  MEMORY = 'memory',    // L1: In-memory cache (fastest)
  REDIS = 'redis',      // L2: Redis cache (fast)
  CDN = 'cdn',          // L3: CDN cache (global)
  STORAGE = 'storage'   // L4: Persistent storage (slowest)
}

// Cache strategy configuration for each engine
export interface EngineConfig {
  engine: ProcessingEngine
  defaultTTL: number
  maxMemorySize: number
  compressionEnabled: boolean
  sizeTiers: Record<FileSizeCategory, {
    ttl: number
    tier: CacheTier[]
    priority: number
  }>
}

// Hybrid cache architecture configuration
export const CACHE_ARCHITECTURE: Record<ProcessingEngine, EngineConfig> = {
  pdf: {
    engine: 'pdf',
    defaultTTL: REDIS_TTL.LONG,
    maxMemorySize: 50, // 50MB max in memory
    compressionEnabled: true,
    sizeTiers: {
      [FileSizeCategory.TINY]: {
        ttl: REDIS_TTL.VERY_LONG,
        tier: [CacheTier.MEMORY, CacheTier.REDIS, CacheTier.CDN],
        priority: 10
      },
      [FileSizeCategory.SMALL]: {
        ttl: REDIS_TTL.LONG,
        tier: [CacheTier.MEMORY, CacheTier.REDIS, CacheTier.CDN],
        priority: 8
      },
      [FileSizeCategory.MEDIUM]: {
        ttl: REDIS_TTL.MEDIUM,
        tier: [CacheTier.REDIS, CacheTier.CDN],
        priority: 6
      },
      [FileSizeCategory.LARGE]: {
        ttl: REDIS_TTL.SHORT,
        tier: [CacheTier.REDIS, CacheTier.CDN],
        priority: 4
      },
      [FileSizeCategory.XLARGE]: {
        ttl: REDIS_TTL.VERY_SHORT,
        tier: [CacheTier.CDN],
        priority: 2
      }
    }
  },
  image: {
    engine: 'image',
    defaultTTL: REDIS_TTL.MEDIUM,
    maxMemorySize: 100, // 100MB max in memory
    compressionEnabled: true,
    sizeTiers: {
      [FileSizeCategory.TINY]: {
        ttl: REDIS_TTL.WEEK,
        tier: [CacheTier.MEMORY, CacheTier.REDIS, CacheTier.CDN],
        priority: 10
      },
      [FileSizeCategory.SMALL]: {
        ttl: REDIS_TTL.VERY_LONG,
        tier: [CacheTier.MEMORY, CacheTier.REDIS, CacheTier.CDN],
        priority: 9
      },
      [FileSizeCategory.MEDIUM]: {
        ttl: REDIS_TTL.LONG,
        tier: [CacheTier.REDIS, CacheTier.CDN],
        priority: 7
      },
      [FileSizeCategory.LARGE]: {
        ttl: REDIS_TTL.MEDIUM,
        tier: [CacheTier.REDIS, CacheTier.CDN],
        priority: 5
      },
      [FileSizeCategory.XLARGE]: {
        ttl: REDIS_TTL.SHORT,
        tier: [CacheTier.CDN],
        priority: 3
      }
    }
  },
  video: {
    engine: 'video',
    defaultTTL: REDIS_TTL.SHORT,
    maxMemorySize: 25, // 25MB max in memory (videos are large)
    compressionEnabled: false, // Videos already compressed
    sizeTiers: {
      [FileSizeCategory.TINY]: {
        ttl: REDIS_TTL.LONG,
        tier: [CacheTier.MEMORY, CacheTier.REDIS, CacheTier.CDN],
        priority: 8
      },
      [FileSizeCategory.SMALL]: {
        ttl: REDIS_TTL.MEDIUM,
        tier: [CacheTier.REDIS, CacheTier.CDN],
        priority: 6
      },
      [FileSizeCategory.MEDIUM]: {
        ttl: REDIS_TTL.SHORT,
        tier: [CacheTier.REDIS, CacheTier.CDN],
        priority: 4
      },
      [FileSizeCategory.LARGE]: {
        ttl: REDIS_TTL.VERY_SHORT,
        tier: [CacheTier.CDN],
        priority: 2
      },
      [FileSizeCategory.XLARGE]: {
        ttl: REDIS_TTL.VERY_SHORT,
        tier: [CacheTier.CDN],
        priority: 1
      }
    }
  }
}

// Cache key structure generator
export class CacheKeyGenerator {
  static fileProcessing(
    engine: ProcessingEngine,
    operation: string,
    fileId: string,
    params: Record<string, any>
  ): string {
    const paramsHash = this.hashParams(params)
    return `${REDIS_PREFIXES.CACHE}${engine}:${operation}:${fileId}:${paramsHash}`
  }

  static apiResponse(
    endpoint: string,
    method: string,
    params: Record<string, any>
  ): string {
    const paramsHash = this.hashParams(params)
    return `${REDIS_PREFIXES.CACHE}api:${method}:${endpoint}:${paramsHash}`
  }

  static fileMetadata(fileId: string): string {
    return `${REDIS_PREFIXES.FILE}metadata:${fileId}`
  }

  static processingJob(jobId: string): string {
    return `${REDIS_PREFIXES.PROCESSING}job:${jobId}`
  }

  static userSession(userId: string): string {
    return `${REDIS_PREFIXES.SESSION}${userId}`
  }

  static rateLimitKey(identifier: string, window: string): string {
    return `${REDIS_PREFIXES.RATE_LIMIT}${identifier}:${window}`
  }

  static lockKey(resource: string): string {
    return `${REDIS_PREFIXES.LOCK}${resource}`
  }

  private static hashParams(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as Record<string, any>)
    
    return Buffer.from(JSON.stringify(sortedParams))
      .toString('base64')
      .replace(/[+/=]/g, '')
      .substring(0, 16)
  }
}

// File size categorization
export function categorizeFileSize(sizeInBytes: number): FileSizeCategory {
  const sizeInMB = sizeInBytes / (1024 * 1024)
  
  if (sizeInMB < 1) return FileSizeCategory.TINY
  if (sizeInMB < 10) return FileSizeCategory.SMALL
  if (sizeInMB < 50) return FileSizeCategory.MEDIUM
  if (sizeInMB < 100) return FileSizeCategory.LARGE
  return FileSizeCategory.XLARGE
}

// Cache strategy selector
export function getCacheStrategy(
  engine: ProcessingEngine,
  fileSize: number
): {
  ttl: number
  tiers: CacheTier[]
  priority: number
  compressionEnabled: boolean
} {
  const config = CACHE_ARCHITECTURE[engine]
  const sizeCategory = categorizeFileSize(fileSize)
  const tierConfig = config.sizeTiers[sizeCategory]
  
  return {
    ttl: tierConfig.ttl,
    tiers: tierConfig.tier,
    priority: tierConfig.priority,
    compressionEnabled: config.compressionEnabled
  }
}

// Cache eviction policies
export enum EvictionPolicy {
  LRU = 'lru',           // Least Recently Used
  LFU = 'lfu',           // Least Frequently Used
  TTL = 'ttl',           // Time To Live
  SIZE = 'size',         // Size-based eviction
  PRIORITY = 'priority'  // Priority-based eviction
}

// Cache metrics interface
export interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  totalRequests: number
  averageResponseTime: number
  memoryUsage: number
  redisUsage: number
  evictions: number
  errors: number
  lastUpdated: Date
}

// Cache warming configuration
export interface CacheWarmingConfig {
  enabled: boolean
  interval: number // in milliseconds
  popularOperations: Array<{
    engine: ProcessingEngine
    operation: string
    priority: number
    params: Record<string, any>
  }>
  maxConcurrentWarmups: number
  warmupOnStartup: boolean
}

export const DEFAULT_CACHE_WARMING: CacheWarmingConfig = {
  enabled: true,
  interval: 3600000, // 1 hour
  popularOperations: [
    { engine: 'pdf', operation: 'merge', priority: 10, params: {} },
    { engine: 'pdf', operation: 'split', priority: 9, params: {} },
    { engine: 'image', operation: 'resize', priority: 10, params: { width: 800, height: 600 } },
    { engine: 'image', operation: 'convert', priority: 9, params: { format: 'webp' } },
    { engine: 'video', operation: 'compress', priority: 8, params: { quality: 'medium' } },
    { engine: 'video', operation: 'convert', priority: 7, params: { format: 'mp4' } }
  ],
  maxConcurrentWarmups: 3,
  warmupOnStartup: true
}

// Export cache architecture utilities
export {
  REDIS_TTL,
  REDIS_PREFIXES
}
