import { cacheRedis } from './redis-config'
import { 
  apiCache, 
  fileCache, 
  getCachedFileResult,
  getCachedApiResponse 
} from './cache'
import { 
  ProcessingEngine, 
  CacheKeyGenerator,
  DEFAULT_CACHE_WARMING,
  CacheWarmingConfig,
  getCacheStrategy
} from './cache-architecture'

// Cache warming statistics
export interface WarmingStats {
  totalOperations: number
  successfulWarms: number
  failedWarms: number
  averageWarmTime: number
  lastWarmingRun: Date
  nextScheduledRun: Date
  popularOperations: Array<{
    engine: ProcessingEngine
    operation: string
    hits: number
    lastUsed: Date
  }>
}

// Cache warming scheduler
export class CacheWarmer {
  private config: CacheWarmingConfig
  private warmingInterval?: NodeJS.Timeout
  private isWarming = false
  private stats: WarmingStats
  private usageTracker = new Map<string, { hits: number; lastUsed: Date }>()

  constructor(config: Partial<CacheWarmingConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_WARMING, ...config }
    this.stats = {
      totalOperations: 0,
      successfulWarms: 0,
      failedWarms: 0,
      averageWarmTime: 0,
      lastWarmingRun: new Date(),
      nextScheduledRun: new Date(Date.now() + this.config.interval),
      popularOperations: []
    }
  }

  // Start cache warming scheduler
  start(): void {
    if (!this.config.enabled) {
      console.log('Cache warming disabled')
      return
    }

    console.log('Starting cache warming scheduler...')

    // Initial warming on startup
    if (this.config.warmupOnStartup) {
      setTimeout(() => this.performWarming(), 5000) // Wait 5 seconds after startup
    }

    // Schedule regular warming
    this.warmingInterval = setInterval(async () => {
      await this.performWarming()
    }, this.config.interval)

    console.log(`Cache warming scheduled every ${this.config.interval / 1000} seconds`)
  }

  // Stop cache warming
  stop(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval)
      this.warmingInterval = undefined
    }
    console.log('Cache warming scheduler stopped')
  }

  // Perform cache warming
  async performWarming(): Promise<void> {
    if (this.isWarming) {
      console.log('Cache warming already in progress, skipping...')
      return
    }

    this.isWarming = true
    const startTime = Date.now()
    
    console.log('Starting cache warming cycle...')

    try {
      // Update popular operations from usage tracking
      await this.updatePopularOperations()

      // Warm popular operations
      await this.warmPopularOperations()

      // Warm API metadata
      await this.warmAPIMetadata()

      // Warm tool configurations
      await this.warmToolConfigurations()

      // Update statistics
      const warmTime = Date.now() - startTime
      this.stats.lastWarmingRun = new Date()
      this.stats.nextScheduledRun = new Date(Date.now() + this.config.interval)
      this.stats.averageWarmTime = (this.stats.averageWarmTime + warmTime) / 2

      console.log(`Cache warming completed in ${warmTime}ms`)

    } catch (error) {
      console.error('Cache warming failed:', error)
      this.stats.failedWarms++
    } finally {
      this.isWarming = false
    }
  }

  // Update popular operations based on usage tracking
  private async updatePopularOperations(): Promise<void> {
    try {
      const redis = cacheRedis()
      
      // Get usage statistics from Redis
      const usageKeys = await redis.keys('usage:*')
      const usageData: Array<{ key: string; hits: number; lastUsed: Date }> = []

      for (const key of usageKeys.slice(0, 100)) { // Limit to top 100
        const data = await redis.hgetall(key)
        if (data.hits && data.lastUsed) {
          usageData.push({
            key: key.replace('usage:', ''),
            hits: parseInt(data.hits),
            lastUsed: new Date(data.lastUsed)
          })
        }
      }

      // Sort by hits and recency
      usageData.sort((a, b) => {
        const aScore = a.hits * (1 + (Date.now() - a.lastUsed.getTime()) / (1000 * 60 * 60 * 24))
        const bScore = b.hits * (1 + (Date.now() - b.lastUsed.getTime()) / (1000 * 60 * 60 * 24))
        return bScore - aScore
      })

      // Update popular operations
      this.stats.popularOperations = usageData.slice(0, 20).map(item => {
        const [engine, operation] = item.key.split(':')
        return {
          engine: engine as ProcessingEngine,
          operation,
          hits: item.hits,
          lastUsed: item.lastUsed
        }
      })

    } catch (error) {
      console.error('Failed to update popular operations:', error)
    }
  }

  // Warm popular operations
  private async warmPopularOperations(): Promise<void> {
    const operations = [
      ...this.config.popularOperations,
      ...this.stats.popularOperations.map(op => ({
        engine: op.engine,
        operation: op.operation,
        priority: Math.min(10, Math.floor(op.hits / 10)),
        params: {}
      }))
    ]

    // Sort by priority
    operations.sort((a, b) => b.priority - a.priority)

    // Warm operations with concurrency limit
    const chunks = this.chunkArray(operations, this.config.maxConcurrentWarmups)
    
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(op => this.warmOperation(op.engine, op.operation, op.params))
      )
    }
  }

  // Warm specific operation
  private async warmOperation(
    engine: ProcessingEngine,
    operation: string,
    params: Record<string, any>
  ): Promise<void> {
    try {
      const key = CacheKeyGenerator.fileProcessing(engine, operation, 'warmup', params)
      
      // Check if already cached
      const cached = await fileCache.get(key)
      if (cached) {
        return // Already warmed
      }

      // Generate warm data
      const warmData = await this.generateWarmData(engine, operation, params)
      
      // Get cache strategy
      const strategy = getCacheStrategy(engine, 1024) // Default 1KB for warm data
      
      // Cache the warm data
      await fileCache.set(key, warmData, strategy.ttl, strategy.tiers)
      
      this.stats.successfulWarms++
      console.log(`Warmed cache for ${engine}:${operation}`)

    } catch (error) {
      console.error(`Failed to warm ${engine}:${operation}:`, error)
      this.stats.failedWarms++
    }
  }

  // Generate warm data for operation
  private async generateWarmData(
    engine: ProcessingEngine,
    operation: string,
    params: Record<string, any>
  ): Promise<any> {
    // Generate mock/template data for warming
    const baseData = {
      warmed: true,
      engine,
      operation,
      params,
      timestamp: new Date().toISOString(),
      template: true
    }

    switch (engine) {
      case 'pdf':
        return {
          ...baseData,
          supportedFormats: ['pdf'],
          maxFileSize: '100MB',
          processingTime: '1-5 seconds',
          features: this.getPDFFeatures(operation)
        }

      case 'image':
        return {
          ...baseData,
          supportedFormats: ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
          maxFileSize: '50MB',
          processingTime: '0.5-3 seconds',
          features: this.getImageFeatures(operation)
        }

      case 'video':
        return {
          ...baseData,
          supportedFormats: ['mp4', 'webm', 'avi', 'mov', 'wmv'],
          maxFileSize: '500MB',
          processingTime: '5-30 seconds',
          features: this.getVideoFeatures(operation)
        }

      default:
        return baseData
    }
  }

  // Get PDF operation features
  private getPDFFeatures(operation: string): Record<string, any> {
    const features: Record<string, any> = {
      merge: { description: 'Combine multiple PDF files', maxFiles: 10 },
      split: { description: 'Split PDF into separate pages', outputFormat: 'individual PDFs' },
      compress: { description: 'Reduce PDF file size', compressionLevels: ['low', 'medium', 'high'] },
      convert: { description: 'Convert PDF to other formats', outputFormats: ['jpg', 'png', 'docx'] },
      protect: { description: 'Add password protection', encryptionLevel: 'AES-256' },
      watermark: { description: 'Add text or image watermark', positions: ['center', 'corner'] }
    }
    return features[operation] || { description: 'PDF processing operation' }
  }

  // Get Image operation features
  private getImageFeatures(operation: string): Record<string, any> {
    const features: Record<string, any> = {
      resize: { description: 'Change image dimensions', maintainAspectRatio: true },
      convert: { description: 'Change image format', qualityControl: true },
      compress: { description: 'Reduce image file size', lossless: true },
      crop: { description: 'Remove parts of image', presets: ['square', 'circle'] },
      enhance: { description: 'Improve image quality', autoAdjust: true },
      watermark: { description: 'Add watermark to image', transparency: true }
    }
    return features[operation] || { description: 'Image processing operation' }
  }

  // Get Video operation features
  private getVideoFeatures(operation: string): Record<string, any> {
    const features: Record<string, any> = {
      convert: { description: 'Change video format', codecOptions: ['h264', 'h265'] },
      compress: { description: 'Reduce video file size', qualityPresets: ['low', 'medium', 'high'] },
      trim: { description: 'Cut video segments', precisionCutting: true },
      merge: { description: 'Combine video files', transitionEffects: true },
      extract: { description: 'Extract audio from video', audioFormats: ['mp3', 'wav'] },
      thumbnail: { description: 'Generate video thumbnails', multipleFrames: true }
    }
    return features[operation] || { description: 'Video processing operation' }
  }

  // Warm API metadata
  private async warmAPIMetadata(): Promise<void> {
    try {
      await getCachedApiResponse(
        'tools/metadata',
        {},
        async () => ({
          engines: {
            pdf: { tools: 9, status: 'active', version: '1.0.0' },
            image: { tools: 20, status: 'active', version: '1.0.0' },
            video: { tools: 12, status: 'active', version: '1.0.0' }
          },
          totalTools: 41,
          categories: ['PDF', 'Image', 'Video', 'AI'],
          lastUpdated: new Date().toISOString(),
          warmed: true
        }),
        3600 // 1 hour cache
      )

      this.stats.successfulWarms++
    } catch (error) {
      console.error('Failed to warm API metadata:', error)
      this.stats.failedWarms++
    }
  }

  // Warm tool configurations
  private async warmToolConfigurations(): Promise<void> {
    const engines: ProcessingEngine[] = ['pdf', 'image', 'video']
    
    for (const engine of engines) {
      try {
        await getCachedApiResponse(
          `tools/${engine}/config`,
          {},
          async () => ({
            engine,
            maxFileSize: engine === 'video' ? '500MB' : engine === 'pdf' ? '100MB' : '50MB',
            supportedFormats: this.getSupportedFormats(engine),
            processingLimits: {
              concurrent: 5,
              queueSize: 100,
              timeout: engine === 'video' ? 300000 : 60000
            },
            warmed: true,
            timestamp: new Date().toISOString()
          }),
          1800 // 30 minutes cache
        )

        this.stats.successfulWarms++
      } catch (error) {
        console.error(`Failed to warm ${engine} config:`, error)
        this.stats.failedWarms++
      }
    }
  }

  // Get supported formats for engine
  private getSupportedFormats(engine: ProcessingEngine): string[] {
    switch (engine) {
      case 'pdf': return ['pdf']
      case 'image': return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg']
      case 'video': return ['mp4', 'webm', 'avi', 'mov', 'wmv', 'flv', 'mkv']
      default: return []
    }
  }

  // Track operation usage
  async trackUsage(engine: ProcessingEngine, operation: string): Promise<void> {
    try {
      const redis = cacheRedis()
      const key = `usage:${engine}:${operation}`
      
      await redis.hincrby(key, 'hits', 1)
      await redis.hset(key, 'lastUsed', new Date().toISOString())
      await redis.expire(key, 86400 * 30) // Keep for 30 days

    } catch (error) {
      console.error('Failed to track usage:', error)
    }
  }

  // Utility: chunk array
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  // Get warming statistics
  getStats(): WarmingStats {
    return { ...this.stats }
  }

  // Manual cache warming trigger
  async triggerWarming(): Promise<void> {
    if (this.isWarming) {
      throw new Error('Cache warming already in progress')
    }
    
    await this.performWarming()
  }

  // Update configuration
  updateConfig(newConfig: Partial<CacheWarmingConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart scheduler if interval changed
    if (newConfig.interval && this.warmingInterval) {
      this.stop()
      this.start()
    }
  }
}

// Global cache warmer instance
export const cacheWarmer = new CacheWarmer()

// Export utilities
export {
  CacheWarmingConfig,
  WarmingStats,
  DEFAULT_CACHE_WARMING
}
