import { cacheWarmer } from './cache-warming'
import { cacheMonitor } from './cache-monitoring'
import { cacheInvalidationManager } from './cache-invalidation'
import { cacheCleanupManager } from './cache-cleanup'
import { warmCache } from './cache'

// Cache system startup configuration
export interface CacheStartupConfig {
  enableWarming: boolean
  enableMonitoring: boolean
  enableInvalidation: boolean
  enableCleanup: boolean
  warmOnStartup: boolean
  monitoringInterval: number
  warmingInterval: number
  startupDelay: number
}

// Default startup configuration
export const DEFAULT_STARTUP_CONFIG: CacheStartupConfig = {
  enableWarming: true,
  enableMonitoring: true,
  enableInvalidation: true,
  enableCleanup: true,
  warmOnStartup: true,
  monitoringInterval: 60000, // 1 minute
  warmingInterval: 3600000, // 1 hour
  startupDelay: 5000 // 5 seconds
}

// Cache system startup manager
export class CacheStartupManager {
  private config: CacheStartupConfig
  private isInitialized = false
  private startupPromise: Promise<void> | null = null

  constructor(config: Partial<CacheStartupConfig> = {}) {
    this.config = { ...DEFAULT_STARTUP_CONFIG, ...config }
  }

  // Initialize cache system
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Cache system already initialized')
      return
    }

    if (this.startupPromise) {
      return this.startupPromise
    }

    this.startupPromise = this.performInitialization()
    return this.startupPromise
  }

  private async performInitialization(): Promise<void> {
    console.log('Initializing WebTools Pro cache system...')
    
    try {
      // Wait for startup delay
      if (this.config.startupDelay > 0) {
        console.log(`Waiting ${this.config.startupDelay}ms before cache initialization...`)
        await new Promise(resolve => setTimeout(resolve, this.config.startupDelay))
      }

      // Initialize monitoring first
      if (this.config.enableMonitoring) {
        console.log('Starting cache monitoring...')
        cacheMonitor.start()
      }

      // Initialize invalidation manager
      if (this.config.enableInvalidation) {
        console.log('Starting cache invalidation manager...')
        cacheInvalidationManager.start()
      }

      // Initialize cleanup manager
      if (this.config.enableCleanup) {
        console.log('Starting cache cleanup manager...')
        cacheCleanupManager.start()
      }

      // Initialize cache warming
      if (this.config.enableWarming) {
        console.log('Starting cache warming scheduler...')
        cacheWarmer.start()
      }

      // Perform initial cache warming if enabled
      if (this.config.warmOnStartup) {
        console.log('Performing initial cache warming...')
        await warmCache()
      }

      this.isInitialized = true
      console.log('Cache system initialization completed successfully')

      // Log system status
      await this.logSystemStatus()

    } catch (error) {
      console.error('Cache system initialization failed:', error)
      throw error
    }
  }

  // Shutdown cache system gracefully
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      console.log('Cache system not initialized, nothing to shutdown')
      return
    }

    console.log('Shutting down cache system...')

    try {
      // Stop cache warming
      cacheWarmer.stop()
      console.log('Cache warming stopped')

      // Stop invalidation manager
      cacheInvalidationManager.stop()
      console.log('Cache invalidation stopped')

      // Stop cleanup manager
      cacheCleanupManager.stop()
      console.log('Cache cleanup stopped')

      // Stop monitoring
      cacheMonitor.stop()
      console.log('Cache monitoring stopped')

      // Cleanup caches
      const { cleanupCaches } = await import('./cache')
      await cleanupCaches()
      console.log('Cache cleanup completed')

      this.isInitialized = false
      console.log('Cache system shutdown completed')

    } catch (error) {
      console.error('Cache system shutdown error:', error)
      throw error
    }
  }

  // Log current system status
  private async logSystemStatus(): Promise<void> {
    try {
      const { getCacheMetrics } = await import('./cache')
      const metrics = await getCacheMetrics()
      const warmingStats = cacheWarmer.getStats()
      const monitoringStatus = cacheMonitor.getCurrentStatus()

      console.log('Cache System Status:', {
        initialized: this.isInitialized,
        monitoring: {
          enabled: this.config.enableMonitoring,
          healthy: monitoringStatus.healthy,
          activeAlerts: monitoringStatus.activeAlerts
        },
        warming: {
          enabled: this.config.enableWarming,
          lastRun: warmingStats.lastWarmingRun,
          successfulWarms: warmingStats.successfulWarms,
          failedWarms: warmingStats.failedWarms
        },
        performance: {
          overallHitRate: metrics.overall?.overallHitRate || 0,
          averageResponseTime: metrics.overall?.averageResponseTime || 0,
          totalRequests: (metrics.overall?.totalHits || 0) + (metrics.overall?.totalMisses || 0)
        }
      })

    } catch (error) {
      console.error('Failed to log system status:', error)
    }
  }

  // Health check
  async healthCheck(): Promise<{
    healthy: boolean
    components: {
      warming: boolean
      monitoring: boolean
      redis: boolean
    }
    details: any
  }> {
    try {
      const { redisManager } = await import('./redis-config')
      const redisHealth = await redisManager.healthCheck()
      const monitoringStatus = cacheMonitor.getCurrentStatus()
      const warmingStats = cacheWarmer.getStats()

      const components = {
        warming: this.config.enableWarming && warmingStats.failedWarms < warmingStats.successfulWarms,
        monitoring: this.config.enableMonitoring && monitoringStatus.healthy,
        redis: redisHealth.cache
      }

      const healthy = Object.values(components).every(status => status)

      return {
        healthy,
        components,
        details: {
          initialized: this.isInitialized,
          config: this.config,
          warming: warmingStats,
          monitoring: monitoringStatus,
          redis: redisHealth
        }
      }

    } catch (error) {
      console.error('Cache health check failed:', error)
      return {
        healthy: false,
        components: {
          warming: false,
          monitoring: false,
          redis: false
        },
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<CacheStartupConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('Cache startup configuration updated:', newConfig)
  }

  // Get current configuration
  getConfig(): CacheStartupConfig {
    return { ...this.config }
  }

  // Check if initialized
  isReady(): boolean {
    return this.isInitialized
  }
}

// Global cache startup manager
export const cacheStartup = new CacheStartupManager()

// Convenience functions for Next.js integration
export async function initializeCacheSystem(config?: Partial<CacheStartupConfig>): Promise<void> {
  if (config) {
    cacheStartup.updateConfig(config)
  }
  await cacheStartup.initialize()
}

export async function shutdownCacheSystem(): Promise<void> {
  await cacheStartup.shutdown()
}

// Process event handlers for graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down cache system...')
    try {
      await shutdownCacheSystem()
      process.exit(0)
    } catch (error) {
      console.error('Error during cache system shutdown:', error)
      process.exit(1)
    }
  })

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down cache system...')
    try {
      await shutdownCacheSystem()
      process.exit(0)
    } catch (error) {
      console.error('Error during cache system shutdown:', error)
      process.exit(1)
    }
  })

  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception, shutting down cache system:', error)
    try {
      await shutdownCacheSystem()
    } catch (shutdownError) {
      console.error('Error during emergency shutdown:', shutdownError)
    }
    process.exit(1)
  })
}

// Export types and utilities
export {
  CacheStartupConfig,
  DEFAULT_STARTUP_CONFIG
}
