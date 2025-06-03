import { cacheRedis } from './redis-config'
import { apiCache, fileCache, userCache } from './cache'
import { ProcessingEngine, CacheKeyGenerator } from './cache-architecture'

// Cache invalidation strategies
export enum InvalidationStrategy {
  IMMEDIATE = 'immediate',           // Invalidate immediately
  LAZY = 'lazy',                    // Mark for lazy deletion
  SCHEDULED = 'scheduled',          // Schedule for future deletion
  CASCADE = 'cascade',              // Invalidate related entries
  PATTERN = 'pattern'               // Pattern-based invalidation
}

// Invalidation rule configuration
export interface InvalidationRule {
  id: string
  name: string
  strategy: InvalidationStrategy
  pattern: string
  conditions?: {
    fileTypes?: string[]
    engines?: ProcessingEngine[]
    operations?: string[]
    maxAge?: number
    minHits?: number
  }
  schedule?: {
    interval: number // milliseconds
    maxBatchSize: number
  }
  enabled: boolean
}

// Invalidation result
export interface InvalidationResult {
  strategy: InvalidationStrategy
  pattern: string
  entriesFound: number
  entriesInvalidated: number
  errors: number
  duration: number
  timestamp: Date
}

// Cache invalidation manager
export class CacheInvalidationManager {
  private rules: Map<string, InvalidationRule> = new Map()
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map()
  private invalidationHistory: InvalidationResult[] = []
  private isRunning = false

  constructor() {
    this.initializeDefaultRules()
  }

  // Initialize default invalidation rules
  private initializeDefaultRules(): void {
    const defaultRules: InvalidationRule[] = [
      {
        id: 'expired-files',
        name: 'Expired File Cache Cleanup',
        strategy: InvalidationStrategy.SCHEDULED,
        pattern: 'cache:*:*:*',
        conditions: { maxAge: 86400000 }, // 24 hours
        schedule: { interval: 3600000, maxBatchSize: 100 }, // Every hour, max 100 entries
        enabled: true
      },
      {
        id: 'large-video-cleanup',
        name: 'Large Video File Cleanup',
        strategy: InvalidationStrategy.LAZY,
        pattern: 'cache:video:*:*',
        conditions: { engines: ['video'], maxAge: 1800000 }, // 30 minutes for videos
        enabled: true
      },
      {
        id: 'failed-processing-cleanup',
        name: 'Failed Processing Cleanup',
        strategy: InvalidationStrategy.IMMEDIATE,
        pattern: 'processing:*:failed',
        conditions: { maxAge: 300000 }, // 5 minutes for failed jobs
        enabled: true
      },
      {
        id: 'user-session-cleanup',
        name: 'User Session Cleanup',
        strategy: InvalidationStrategy.SCHEDULED,
        pattern: 'session:*',
        conditions: { maxAge: 86400000 * 7 }, // 7 days
        schedule: { interval: 86400000, maxBatchSize: 50 }, // Daily, max 50 sessions
        enabled: true
      }
    ]

    defaultRules.forEach(rule => this.rules.set(rule.id, rule))
  }

  // Start invalidation manager
  start(): void {
    if (this.isRunning) {
      console.log('Cache invalidation manager already running')
      return
    }

    console.log('Starting cache invalidation manager...')
    this.isRunning = true

    // Schedule all enabled rules
    for (const rule of this.rules.values()) {
      if (rule.enabled && rule.strategy === InvalidationStrategy.SCHEDULED) {
        this.scheduleRule(rule)
      }
    }

    console.log(`Cache invalidation manager started with ${this.scheduledJobs.size} scheduled jobs`)
  }

  // Stop invalidation manager
  stop(): void {
    if (!this.isRunning) {
      console.log('Cache invalidation manager not running')
      return
    }

    console.log('Stopping cache invalidation manager...')

    // Clear all scheduled jobs
    for (const [ruleId, timeout] of this.scheduledJobs) {
      clearTimeout(timeout)
      console.log(`Cleared scheduled job for rule: ${ruleId}`)
    }
    this.scheduledJobs.clear()

    this.isRunning = false
    console.log('Cache invalidation manager stopped')
  }

  // Schedule a rule for execution
  private scheduleRule(rule: InvalidationRule): void {
    if (!rule.schedule) return

    const executeRule = async () => {
      try {
        await this.executeRule(rule)
      } catch (error) {
        console.error(`Failed to execute scheduled rule ${rule.id}:`, error)
      } finally {
        // Reschedule
        if (this.isRunning && rule.enabled) {
          const timeout = setTimeout(executeRule, rule.schedule!.interval)
          this.scheduledJobs.set(rule.id, timeout)
        }
      }
    }

    const timeout = setTimeout(executeRule, rule.schedule.interval)
    this.scheduledJobs.set(rule.id, timeout)
    console.log(`Scheduled rule ${rule.id} to run every ${rule.schedule.interval}ms`)
  }

  // Execute invalidation rule
  async executeRule(rule: InvalidationRule): Promise<InvalidationResult> {
    const startTime = Date.now()
    console.log(`Executing invalidation rule: ${rule.name}`)

    try {
      let result: InvalidationResult

      switch (rule.strategy) {
        case InvalidationStrategy.IMMEDIATE:
          result = await this.immediateInvalidation(rule)
          break
        case InvalidationStrategy.LAZY:
          result = await this.lazyInvalidation(rule)
          break
        case InvalidationStrategy.SCHEDULED:
          result = await this.scheduledInvalidation(rule)
          break
        case InvalidationStrategy.CASCADE:
          result = await this.cascadeInvalidation(rule)
          break
        case InvalidationStrategy.PATTERN:
          result = await this.patternInvalidation(rule)
          break
        default:
          throw new Error(`Unknown invalidation strategy: ${rule.strategy}`)
      }

      result.duration = Date.now() - startTime
      result.timestamp = new Date()

      // Store in history
      this.invalidationHistory.push(result)
      this.cleanupHistory()

      console.log(`Invalidation rule ${rule.name} completed:`, {
        found: result.entriesFound,
        invalidated: result.entriesInvalidated,
        errors: result.errors,
        duration: result.duration
      })

      return result

    } catch (error) {
      console.error(`Invalidation rule ${rule.name} failed:`, error)
      
      const errorResult: InvalidationResult = {
        strategy: rule.strategy,
        pattern: rule.pattern,
        entriesFound: 0,
        entriesInvalidated: 0,
        errors: 1,
        duration: Date.now() - startTime,
        timestamp: new Date()
      }

      this.invalidationHistory.push(errorResult)
      return errorResult
    }
  }

  // Immediate invalidation
  private async immediateInvalidation(rule: InvalidationRule): Promise<InvalidationResult> {
    const redis = cacheRedis()
    const keys = await redis.keys(rule.pattern)
    
    let invalidated = 0
    let errors = 0

    // Filter keys based on conditions
    const filteredKeys = await this.filterKeysByConditions(keys, rule.conditions)

    // Delete keys in batches
    const batchSize = rule.schedule?.maxBatchSize || 50
    for (let i = 0; i < filteredKeys.length; i += batchSize) {
      const batch = filteredKeys.slice(i, i + batchSize)
      
      try {
        if (batch.length > 0) {
          await redis.del(...batch)
          invalidated += batch.length
        }
      } catch (error) {
        console.error('Batch deletion error:', error)
        errors += batch.length
      }
    }

    // Also clear from memory caches
    await this.clearMemoryCaches(rule.pattern)

    return {
      strategy: rule.strategy,
      pattern: rule.pattern,
      entriesFound: keys.length,
      entriesInvalidated: invalidated,
      errors,
      duration: 0,
      timestamp: new Date()
    }
  }

  // Lazy invalidation (mark for deletion)
  private async lazyInvalidation(rule: InvalidationRule): Promise<InvalidationResult> {
    const redis = cacheRedis()
    const keys = await redis.keys(rule.pattern)
    
    let marked = 0
    let errors = 0

    const filteredKeys = await this.filterKeysByConditions(keys, rule.conditions)

    // Mark keys for lazy deletion by setting short TTL
    for (const key of filteredKeys) {
      try {
        await redis.expire(key, 1) // Expire in 1 second
        marked++
      } catch (error) {
        errors++
      }
    }

    return {
      strategy: rule.strategy,
      pattern: rule.pattern,
      entriesFound: keys.length,
      entriesInvalidated: marked,
      errors,
      duration: 0,
      timestamp: new Date()
    }
  }

  // Scheduled invalidation
  private async scheduledInvalidation(rule: InvalidationRule): Promise<InvalidationResult> {
    // Similar to immediate but respects batch size limits
    return this.immediateInvalidation(rule)
  }

  // Cascade invalidation (invalidate related entries)
  private async cascadeInvalidation(rule: InvalidationRule): Promise<InvalidationResult> {
    const redis = cacheRedis()
    const keys = await redis.keys(rule.pattern)
    
    let invalidated = 0
    let errors = 0
    let totalFound = keys.length

    // Find related keys
    const relatedPatterns = this.generateRelatedPatterns(rule.pattern)
    const allKeys = new Set(keys)

    for (const pattern of relatedPatterns) {
      const relatedKeys = await redis.keys(pattern)
      relatedKeys.forEach(key => allKeys.add(key))
    }

    totalFound = allKeys.size

    // Filter and delete
    const filteredKeys = await this.filterKeysByConditions(Array.from(allKeys), rule.conditions)
    
    const batchSize = rule.schedule?.maxBatchSize || 50
    for (let i = 0; i < filteredKeys.length; i += batchSize) {
      const batch = filteredKeys.slice(i, i + batchSize)
      
      try {
        if (batch.length > 0) {
          await redis.del(...batch)
          invalidated += batch.length
        }
      } catch (error) {
        errors += batch.length
      }
    }

    return {
      strategy: rule.strategy,
      pattern: rule.pattern,
      entriesFound: totalFound,
      entriesInvalidated: invalidated,
      errors,
      duration: 0,
      timestamp: new Date()
    }
  }

  // Pattern invalidation
  private async patternInvalidation(rule: InvalidationRule): Promise<InvalidationResult> {
    // Use existing pattern-based invalidation from cache utilities
    const { invalidateCache } = await import('./cache')
    const result = await invalidateCache(rule.pattern)
    
    return {
      strategy: rule.strategy,
      pattern: rule.pattern,
      entriesFound: result.total,
      entriesInvalidated: result.total,
      errors: 0,
      duration: 0,
      timestamp: new Date()
    }
  }

  // Filter keys based on conditions
  private async filterKeysByConditions(
    keys: string[], 
    conditions?: InvalidationRule['conditions']
  ): Promise<string[]> {
    if (!conditions) return keys

    const redis = cacheRedis()
    const filteredKeys: string[] = []

    for (const key of keys) {
      let shouldInclude = true

      // Check max age condition
      if (conditions.maxAge) {
        try {
          const ttl = await redis.ttl(key)
          if (ttl > 0) {
            const age = Date.now() - (Date.now() - ttl * 1000)
            if (age < conditions.maxAge) {
              shouldInclude = false
            }
          }
        } catch (error) {
          // If we can't determine age, include it
        }
      }

      // Check engine condition
      if (conditions.engines && shouldInclude) {
        const hasMatchingEngine = conditions.engines.some(engine => 
          key.includes(`:${engine}:`)
        )
        if (!hasMatchingEngine) {
          shouldInclude = false
        }
      }

      // Check operations condition
      if (conditions.operations && shouldInclude) {
        const hasMatchingOperation = conditions.operations.some(operation => 
          key.includes(`:${operation}:`)
        )
        if (!hasMatchingOperation) {
          shouldInclude = false
        }
      }

      if (shouldInclude) {
        filteredKeys.push(key)
      }
    }

    return filteredKeys
  }

  // Generate related patterns for cascade invalidation
  private generateRelatedPatterns(pattern: string): string[] {
    const patterns: string[] = []
    
    // If it's a file processing pattern, also invalidate metadata
    if (pattern.includes('cache:') && pattern.includes(':*:')) {
      const parts = pattern.split(':')
      if (parts.length >= 3) {
        patterns.push(`file:metadata:${parts[2]}`)
        patterns.push(`processing:job:${parts[2]}`)
      }
    }

    // If it's a user pattern, also invalidate sessions
    if (pattern.includes('user:')) {
      patterns.push(pattern.replace('user:', 'session:'))
    }

    return patterns
  }

  // Clear memory caches
  private async clearMemoryCaches(pattern: string): Promise<void> {
    try {
      // Clear relevant memory caches based on pattern
      if (pattern.includes('cache:')) {
        // Would need to implement pattern-based clearing in memory caches
        console.log(`Memory cache clearing for pattern: ${pattern}`)
      }
    } catch (error) {
      console.error('Memory cache clearing error:', error)
    }
  }

  // Clean up invalidation history
  private cleanupHistory(): void {
    // Keep only last 100 entries
    if (this.invalidationHistory.length > 100) {
      this.invalidationHistory = this.invalidationHistory.slice(-100)
    }
  }

  // Manual invalidation methods
  async invalidateByEngine(engine: ProcessingEngine): Promise<InvalidationResult> {
    const rule: InvalidationRule = {
      id: 'manual-engine',
      name: `Manual ${engine} invalidation`,
      strategy: InvalidationStrategy.IMMEDIATE,
      pattern: `cache:${engine}:*:*`,
      enabled: true
    }

    return this.executeRule(rule)
  }

  async invalidateByOperation(engine: ProcessingEngine, operation: string): Promise<InvalidationResult> {
    const rule: InvalidationRule = {
      id: 'manual-operation',
      name: `Manual ${engine}:${operation} invalidation`,
      strategy: InvalidationStrategy.IMMEDIATE,
      pattern: `cache:${engine}:${operation}:*`,
      enabled: true
    }

    return this.executeRule(rule)
  }

  async invalidateByFileId(fileId: string): Promise<InvalidationResult> {
    const rule: InvalidationRule = {
      id: 'manual-file',
      name: `Manual file ${fileId} invalidation`,
      strategy: InvalidationStrategy.CASCADE,
      pattern: `*:*:${fileId}:*`,
      enabled: true
    }

    return this.executeRule(rule)
  }

  // Get invalidation statistics
  getStats(): {
    rulesCount: number
    scheduledJobs: number
    recentInvalidations: InvalidationResult[]
    totalInvalidated: number
  } {
    const recentInvalidations = this.invalidationHistory.slice(-10)
    const totalInvalidated = this.invalidationHistory.reduce(
      (sum, result) => sum + result.entriesInvalidated, 0
    )

    return {
      rulesCount: this.rules.size,
      scheduledJobs: this.scheduledJobs.size,
      recentInvalidations,
      totalInvalidated
    }
  }

  // Add custom rule
  addRule(rule: InvalidationRule): void {
    this.rules.set(rule.id, rule)
    
    if (rule.enabled && rule.strategy === InvalidationStrategy.SCHEDULED && this.isRunning) {
      this.scheduleRule(rule)
    }
  }

  // Remove rule
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId)
    
    if (this.scheduledJobs.has(ruleId)) {
      clearTimeout(this.scheduledJobs.get(ruleId)!)
      this.scheduledJobs.delete(ruleId)
    }

    return removed
  }

  // Get all rules
  getRules(): InvalidationRule[] {
    return Array.from(this.rules.values())
  }
}

// Global cache invalidation manager
export const cacheInvalidationManager = new CacheInvalidationManager()

// Export types and utilities
export {
  InvalidationStrategy,
  InvalidationRule,
  InvalidationResult
}
