import { cacheRedis } from './redis-config'
import { cacheInvalidationManager } from './cache-invalidation'

// Cache cleanup configuration
export interface CleanupConfig {
  enabled: boolean
  interval: number // milliseconds
  maxMemoryUsage: number // percentage
  maxRedisMemory: number // bytes
  orphanedKeyTTL: number // seconds
  batchSize: number
  dryRun: boolean
}

// Default cleanup configuration
export const DEFAULT_CLEANUP_CONFIG: CleanupConfig = {
  enabled: true,
  interval: 3600000, // 1 hour
  maxMemoryUsage: 80, // 80%
  maxRedisMemory: 1024 * 1024 * 1024, // 1GB
  orphanedKeyTTL: 86400, // 24 hours
  batchSize: 100,
  dryRun: false
}

// Cleanup statistics
export interface CleanupStats {
  lastRun: Date
  nextRun: Date
  totalRuns: number
  keysScanned: number
  keysRemoved: number
  memoryFreed: number
  errors: number
  averageRunTime: number
}

// Cache cleanup manager
export class CacheCleanupManager {
  private config: CleanupConfig
  private cleanupInterval?: NodeJS.Timeout
  private isRunning = false
  private isCleanupInProgress = false
  private stats: CleanupStats

  constructor(config: Partial<CleanupConfig> = {}) {
    this.config = { ...DEFAULT_CLEANUP_CONFIG, ...config }
    this.stats = {
      lastRun: new Date(),
      nextRun: new Date(Date.now() + this.config.interval),
      totalRuns: 0,
      keysScanned: 0,
      keysRemoved: 0,
      memoryFreed: 0,
      errors: 0,
      averageRunTime: 0
    }
  }

  // Start cleanup scheduler
  start(): void {
    if (!this.config.enabled) {
      console.log('Cache cleanup disabled')
      return
    }

    if (this.isRunning) {
      console.log('Cache cleanup already running')
      return
    }

    console.log('Starting cache cleanup scheduler...')
    this.isRunning = true

    // Schedule regular cleanup
    this.cleanupInterval = setInterval(async () => {
      await this.performCleanup()
    }, this.config.interval)

    // Initial cleanup after 30 seconds
    setTimeout(() => this.performCleanup(), 30000)

    console.log(`Cache cleanup scheduled every ${this.config.interval / 1000} seconds`)
  }

  // Stop cleanup scheduler
  stop(): void {
    if (!this.isRunning) {
      console.log('Cache cleanup not running')
      return
    }

    console.log('Stopping cache cleanup scheduler...')

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }

    this.isRunning = false
    console.log('Cache cleanup scheduler stopped')
  }

  // Perform comprehensive cache cleanup
  async performCleanup(): Promise<void> {
    if (this.isCleanupInProgress) {
      console.log('Cache cleanup already in progress, skipping...')
      return
    }

    this.isCleanupInProgress = true
    const startTime = Date.now()

    console.log('Starting cache cleanup cycle...')

    try {
      // Check memory usage first
      const memoryCheck = await this.checkMemoryUsage()
      if (!memoryCheck.needsCleanup) {
        console.log('Memory usage within limits, skipping cleanup')
        return
      }

      // Perform different cleanup operations
      await this.cleanupExpiredKeys()
      await this.cleanupOrphanedKeys()
      await this.cleanupLargeValues()
      await this.cleanupFailedJobs()
      await this.optimizeMemoryUsage()

      // Update statistics
      const runTime = Date.now() - startTime
      this.stats.totalRuns++
      this.stats.lastRun = new Date()
      this.stats.nextRun = new Date(Date.now() + this.config.interval)
      this.stats.averageRunTime = (this.stats.averageRunTime + runTime) / 2

      console.log(`Cache cleanup completed in ${runTime}ms`)

    } catch (error) {
      console.error('Cache cleanup failed:', error)
      this.stats.errors++
    } finally {
      this.isCleanupInProgress = false
    }
  }

  // Check memory usage
  private async checkMemoryUsage(): Promise<{ needsCleanup: boolean; details: any }> {
    try {
      const redis = cacheRedis()
      const info = await redis.info('memory')
      
      // Parse Redis memory info
      const usedMemory = this.parseRedisInfo(info, 'used_memory')
      const maxMemory = this.parseRedisInfo(info, 'maxmemory')
      
      const usedMemoryBytes = usedMemory ? parseInt(usedMemory) : 0
      const maxMemoryBytes = maxMemory ? parseInt(maxMemory) : this.config.maxRedisMemory
      
      const memoryUsagePercent = maxMemoryBytes > 0 
        ? (usedMemoryBytes / maxMemoryBytes) * 100 
        : 0

      // Check Node.js memory usage
      const nodeMemory = process.memoryUsage()
      const nodeMemoryPercent = (nodeMemory.heapUsed / nodeMemory.heapTotal) * 100

      const needsCleanup = 
        memoryUsagePercent > this.config.maxMemoryUsage ||
        nodeMemoryPercent > this.config.maxMemoryUsage ||
        usedMemoryBytes > this.config.maxRedisMemory

      return {
        needsCleanup,
        details: {
          redis: {
            usedMemoryBytes,
            maxMemoryBytes,
            usagePercent: memoryUsagePercent
          },
          node: {
            heapUsed: nodeMemory.heapUsed,
            heapTotal: nodeMemory.heapTotal,
            usagePercent: nodeMemoryPercent
          }
        }
      }

    } catch (error) {
      console.error('Memory usage check failed:', error)
      return { needsCleanup: true, details: { error: error instanceof Error ? error.message : 'Unknown error' } }
    }
  }

  // Clean up expired keys
  private async cleanupExpiredKeys(): Promise<void> {
    try {
      const redis = cacheRedis()
      
      // Get keys that are about to expire (TTL < 60 seconds)
      const allKeys = await redis.keys('*')
      const expiredKeys: string[] = []

      for (const key of allKeys.slice(0, this.config.batchSize)) {
        const ttl = await redis.ttl(key)
        if (ttl > 0 && ttl < 60) { // Expires in less than 1 minute
          expiredKeys.push(key)
        }
      }

      if (expiredKeys.length > 0 && !this.config.dryRun) {
        await redis.del(...expiredKeys)
        this.stats.keysRemoved += expiredKeys.length
        console.log(`Cleaned up ${expiredKeys.length} expired keys`)
      }

      this.stats.keysScanned += Math.min(allKeys.length, this.config.batchSize)

    } catch (error) {
      console.error('Expired keys cleanup failed:', error)
      this.stats.errors++
    }
  }

  // Clean up orphaned keys (keys without proper TTL)
  private async cleanupOrphanedKeys(): Promise<void> {
    try {
      const redis = cacheRedis()
      const allKeys = await redis.keys('cache:*')
      const orphanedKeys: string[] = []

      for (const key of allKeys.slice(0, this.config.batchSize)) {
        const ttl = await redis.ttl(key)
        if (ttl === -1) { // No expiration set
          orphanedKeys.push(key)
        }
      }

      if (orphanedKeys.length > 0) {
        if (this.config.dryRun) {
          console.log(`Would set TTL for ${orphanedKeys.length} orphaned keys`)
        } else {
          // Set TTL for orphaned keys
          for (const key of orphanedKeys) {
            await redis.expire(key, this.config.orphanedKeyTTL)
          }
          console.log(`Set TTL for ${orphanedKeys.length} orphaned keys`)
        }
      }

    } catch (error) {
      console.error('Orphaned keys cleanup failed:', error)
      this.stats.errors++
    }
  }

  // Clean up large values
  private async cleanupLargeValues(): Promise<void> {
    try {
      const redis = cacheRedis()
      const allKeys = await redis.keys('*')
      const largeKeys: Array<{ key: string; size: number }> = []

      // Sample keys to check size
      const sampleKeys = allKeys.slice(0, this.config.batchSize)
      
      for (const key of sampleKeys) {
        try {
          const value = await redis.get(key)
          if (value) {
            const size = Buffer.byteLength(value, 'utf8')
            if (size > 1024 * 1024) { // Larger than 1MB
              largeKeys.push({ key, size })
            }
          }
        } catch (error) {
          // Skip keys that can't be read
        }
      }

      // Sort by size and remove largest keys if needed
      largeKeys.sort((a, b) => b.size - a.size)
      const keysToRemove = largeKeys.slice(0, 10) // Remove top 10 largest

      if (keysToRemove.length > 0) {
        if (this.config.dryRun) {
          console.log(`Would remove ${keysToRemove.length} large keys`)
        } else {
          const keys = keysToRemove.map(item => item.key)
          await redis.del(...keys)
          
          const freedMemory = keysToRemove.reduce((sum, item) => sum + item.size, 0)
          this.stats.keysRemoved += keys.length
          this.stats.memoryFreed += freedMemory
          
          console.log(`Removed ${keys.length} large keys, freed ${freedMemory} bytes`)
        }
      }

    } catch (error) {
      console.error('Large values cleanup failed:', error)
      this.stats.errors++
    }
  }

  // Clean up failed processing jobs
  private async cleanupFailedJobs(): Promise<void> {
    try {
      const redis = cacheRedis()
      const failedJobKeys = await redis.keys('processing:*:failed')
      
      if (failedJobKeys.length > 0) {
        if (this.config.dryRun) {
          console.log(`Would remove ${failedJobKeys.length} failed job keys`)
        } else {
          await redis.del(...failedJobKeys)
          this.stats.keysRemoved += failedJobKeys.length
          console.log(`Cleaned up ${failedJobKeys.length} failed job keys`)
        }
      }

    } catch (error) {
      console.error('Failed jobs cleanup failed:', error)
      this.stats.errors++
    }
  }

  // Optimize memory usage
  private async optimizeMemoryUsage(): Promise<void> {
    try {
      // Trigger Redis memory optimization
      const redis = cacheRedis()
      
      // Run MEMORY PURGE if available (Redis 4.0+)
      try {
        await redis.call('MEMORY', 'PURGE')
        console.log('Redis memory purge completed')
      } catch (error) {
        // MEMORY PURGE not available, skip
      }

      // Force garbage collection in Node.js if available
      if (global.gc) {
        global.gc()
        console.log('Node.js garbage collection triggered')
      }

    } catch (error) {
      console.error('Memory optimization failed:', error)
      this.stats.errors++
    }
  }

  // Parse Redis INFO output
  private parseRedisInfo(info: string, key: string): string | null {
    const lines = info.split('\r\n')
    for (const line of lines) {
      if (line.startsWith(`${key}:`)) {
        return line.split(':')[1]
      }
    }
    return null
  }

  // Manual cleanup trigger
  async triggerCleanup(): Promise<void> {
    if (this.isCleanupInProgress) {
      throw new Error('Cleanup already in progress')
    }
    
    await this.performCleanup()
  }

  // Get cleanup statistics
  getStats(): CleanupStats {
    return { ...this.stats }
  }

  // Update configuration
  updateConfig(newConfig: Partial<CleanupConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart scheduler if interval changed
    if (newConfig.interval && this.cleanupInterval) {
      this.stop()
      this.start()
    }
  }

  // Get current configuration
  getConfig(): CleanupConfig {
    return { ...this.config }
  }
}

// Global cache cleanup manager
export const cacheCleanupManager = new CacheCleanupManager()

// Export types and utilities
export {
  CleanupConfig,
  CleanupStats,
  DEFAULT_CLEANUP_CONFIG
}
