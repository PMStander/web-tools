import { cacheRedis, redisManager } from './redis-config'
import { getCacheMetrics } from './cache'
import { ProcessingEngine, CacheMetrics } from './cache-architecture'

// Cache monitoring configuration
export interface MonitoringConfig {
  enabled: boolean
  metricsInterval: number // Collection interval in milliseconds
  alertThresholds: {
    hitRateMin: number // Minimum hit rate (%)
    responseTimeMax: number // Maximum response time (ms)
    errorRateMax: number // Maximum error rate (%)
    memoryUsageMax: number // Maximum memory usage (%)
  }
  retentionPeriod: number // How long to keep metrics (seconds)
}

// Default monitoring configuration
export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  enabled: true,
  metricsInterval: 60000, // 1 minute
  alertThresholds: {
    hitRateMin: 90, // 90% minimum hit rate
    responseTimeMax: 200, // 200ms max response time
    errorRateMax: 5, // 5% max error rate
    memoryUsageMax: 80 // 80% max memory usage
  },
  retentionPeriod: 86400 * 7 // 7 days
}

// Detailed cache metrics
export interface DetailedCacheMetrics extends CacheMetrics {
  engine?: ProcessingEngine
  tier: 'memory' | 'redis' | 'cdn'
  keyCount: number
  memoryUsageMB: number
  topKeys: Array<{
    key: string
    hits: number
    size: number
    lastAccessed: Date
  }>
  slowQueries: Array<{
    key: string
    responseTime: number
    timestamp: Date
  }>
}

// Alert types
export enum AlertType {
  LOW_HIT_RATE = 'low_hit_rate',
  HIGH_RESPONSE_TIME = 'high_response_time',
  HIGH_ERROR_RATE = 'high_error_rate',
  HIGH_MEMORY_USAGE = 'high_memory_usage',
  REDIS_CONNECTION_FAILED = 'redis_connection_failed',
  CACHE_WARMING_FAILED = 'cache_warming_failed'
}

// Alert interface
export interface CacheAlert {
  id: string
  type: AlertType
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

// Cache monitoring class
export class CacheMonitor {
  private config: MonitoringConfig
  private metricsInterval?: NodeJS.Timeout
  private alerts: Map<string, CacheAlert> = new Map()
  private metricsHistory: Array<{
    timestamp: Date
    metrics: DetailedCacheMetrics[]
  }> = []

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_MONITORING_CONFIG, ...config }
  }

  // Start monitoring
  start(): void {
    if (!this.config.enabled) {
      console.log('Cache monitoring disabled')
      return
    }

    console.log('Starting cache monitoring...')
    
    this.metricsInterval = setInterval(async () => {
      await this.collectMetrics()
    }, this.config.metricsInterval)

    // Initial metrics collection
    this.collectMetrics()
  }

  // Stop monitoring
  stop(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = undefined
    }
    console.log('Cache monitoring stopped')
  }

  // Collect comprehensive metrics
  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = new Date()
      const metrics: DetailedCacheMetrics[] = []

      // Get basic cache metrics
      const basicMetrics = await getCacheMetrics()

      // Collect detailed metrics for each cache tier
      const memoryMetrics = await this.collectMemoryMetrics()
      const redisMetrics = await this.collectRedisMetrics()

      metrics.push(memoryMetrics, redisMetrics)

      // Store metrics history
      this.metricsHistory.push({ timestamp, metrics })

      // Clean old metrics
      this.cleanOldMetrics()

      // Check for alerts
      await this.checkAlerts(metrics)

      // Log summary
      console.log('Cache metrics collected:', {
        timestamp: timestamp.toISOString(),
        overallHitRate: basicMetrics.overall?.overallHitRate || 0,
        averageResponseTime: basicMetrics.overall?.averageResponseTime || 0,
        activeAlerts: this.getActiveAlerts().length
      })

    } catch (error) {
      console.error('Failed to collect cache metrics:', error)
      await this.createAlert(AlertType.HIGH_ERROR_RATE, 'critical', 'Metrics collection failed', 100, 0)
    }
  }

  // Collect memory cache metrics
  private async collectMemoryMetrics(): Promise<DetailedCacheMetrics> {
    const basicMetrics = await getCacheMetrics()
    
    return {
      ...basicMetrics.api,
      tier: 'memory',
      keyCount: 0, // Would need to implement in MemoryCache
      memoryUsageMB: process.memoryUsage().heapUsed / 1024 / 1024,
      topKeys: [], // Would need to implement key tracking
      slowQueries: []
    }
  }

  // Collect Redis cache metrics
  private async collectRedisMetrics(): Promise<DetailedCacheMetrics> {
    try {
      const redis = cacheRedis()
      const info = await redis.info('memory')
      const keyCount = await redis.dbsize()
      
      // Parse memory info
      const memoryUsed = this.parseRedisInfo(info, 'used_memory')
      const memoryUsageMB = memoryUsed ? parseInt(memoryUsed) / 1024 / 1024 : 0

      return {
        hits: 0, // Would need to track in Redis
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        memoryUsage: memoryUsageMB,
        redisUsage: memoryUsageMB,
        evictions: 0,
        errors: 0,
        lastUpdated: new Date(),
        tier: 'redis',
        keyCount,
        memoryUsageMB,
        topKeys: [],
        slowQueries: []
      }
    } catch (error) {
      console.error('Failed to collect Redis metrics:', error)
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        memoryUsage: 0,
        redisUsage: 0,
        evictions: 0,
        errors: 1,
        lastUpdated: new Date(),
        tier: 'redis',
        keyCount: 0,
        memoryUsageMB: 0,
        topKeys: [],
        slowQueries: []
      }
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

  // Check for alert conditions
  private async checkAlerts(metrics: DetailedCacheMetrics[]): Promise<void> {
    for (const metric of metrics) {
      // Check hit rate
      if (metric.hitRate < this.config.alertThresholds.hitRateMin) {
        await this.createAlert(
          AlertType.LOW_HIT_RATE,
          'high',
          `Cache hit rate below threshold: ${metric.hitRate.toFixed(2)}%`,
          metric.hitRate,
          this.config.alertThresholds.hitRateMin
        )
      }

      // Check response time
      if (metric.averageResponseTime > this.config.alertThresholds.responseTimeMax) {
        await this.createAlert(
          AlertType.HIGH_RESPONSE_TIME,
          'medium',
          `Cache response time above threshold: ${metric.averageResponseTime.toFixed(2)}ms`,
          metric.averageResponseTime,
          this.config.alertThresholds.responseTimeMax
        )
      }

      // Check memory usage
      if (metric.memoryUsageMB > this.config.alertThresholds.memoryUsageMax) {
        await this.createAlert(
          AlertType.HIGH_MEMORY_USAGE,
          'high',
          `Memory usage above threshold: ${metric.memoryUsageMB.toFixed(2)}MB`,
          metric.memoryUsageMB,
          this.config.alertThresholds.memoryUsageMax
        )
      }
    }

    // Check Redis connection
    const redisHealth = await redisManager.healthCheck()
    if (!redisHealth.cache) {
      await this.createAlert(
        AlertType.REDIS_CONNECTION_FAILED,
        'critical',
        'Redis cache connection failed',
        0,
        1
      )
    }
  }

  // Create alert
  private async createAlert(
    type: AlertType,
    severity: CacheAlert['severity'],
    message: string,
    value: number,
    threshold: number
  ): Promise<void> {
    const alertId = `${type}_${Date.now()}`
    
    const alert: CacheAlert = {
      id: alertId,
      type,
      severity,
      message,
      value,
      threshold,
      timestamp: new Date(),
      resolved: false
    }

    this.alerts.set(alertId, alert)
    
    console.warn('Cache alert created:', alert)

    // Store alert in Redis for persistence
    try {
      const redis = cacheRedis()
      await redis.setex(
        `alert:${alertId}`,
        this.config.retentionPeriod,
        JSON.stringify(alert)
      )
    } catch (error) {
      console.error('Failed to store alert in Redis:', error)
    }
  }

  // Get active alerts
  getActiveAlerts(): CacheAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved)
  }

  // Get all alerts
  getAllAlerts(): CacheAlert[] {
    return Array.from(this.alerts.values())
  }

  // Resolve alert
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId)
    if (!alert) return false

    alert.resolved = true
    alert.resolvedAt = new Date()

    // Update in Redis
    try {
      const redis = cacheRedis()
      await redis.setex(
        `alert:${alertId}`,
        this.config.retentionPeriod,
        JSON.stringify(alert)
      )
    } catch (error) {
      console.error('Failed to update alert in Redis:', error)
    }

    console.log('Alert resolved:', alertId)
    return true
  }

  // Get metrics history
  getMetricsHistory(hours = 24): Array<{ timestamp: Date; metrics: DetailedCacheMetrics[] }> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.metricsHistory.filter(entry => entry.timestamp >= cutoff)
  }

  // Clean old metrics
  private cleanOldMetrics(): void {
    const cutoff = new Date(Date.now() - this.config.retentionPeriod * 1000)
    this.metricsHistory = this.metricsHistory.filter(entry => entry.timestamp >= cutoff)
  }

  // Get current status
  getCurrentStatus(): {
    healthy: boolean
    hitRate: number
    responseTime: number
    activeAlerts: number
    lastUpdate: Date
  } {
    const latest = this.metricsHistory[this.metricsHistory.length - 1]
    const activeAlerts = this.getActiveAlerts().length
    
    if (!latest) {
      return {
        healthy: false,
        hitRate: 0,
        responseTime: 0,
        activeAlerts,
        lastUpdate: new Date()
      }
    }

    const avgHitRate = latest.metrics.reduce((sum, m) => sum + m.hitRate, 0) / latest.metrics.length
    const avgResponseTime = latest.metrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / latest.metrics.length

    return {
      healthy: activeAlerts === 0 && avgHitRate >= this.config.alertThresholds.hitRateMin,
      hitRate: avgHitRate,
      responseTime: avgResponseTime,
      activeAlerts,
      lastUpdate: latest.timestamp
    }
  }
}

// Global cache monitor instance
export const cacheMonitor = new CacheMonitor()

// Export types and utilities
export {
  MonitoringConfig,
  DetailedCacheMetrics,
  AlertType,
  CacheAlert,
  DEFAULT_MONITORING_CONFIG
}
