import { ProcessingEngine, getCacheStrategy, CACHE_ARCHITECTURE } from './cache-architecture'
import { getCachedFileResult, getCachedApiResponse } from './cache'
import { cacheMonitor } from './cache-monitoring'

// Performance test configuration
export interface PerformanceTestConfig {
  targetHitRate: number // percentage
  targetResponseTime: number // milliseconds
  testDuration: number // milliseconds
  concurrentRequests: number
  engines: ProcessingEngine[]
  operations: string[]
  fileSizes: number[] // bytes
  warmupRequests: number
}

// Default performance test configuration
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceTestConfig = {
  targetHitRate: 95, // 95%
  targetResponseTime: 200, // 200ms
  testDuration: 300000, // 5 minutes
  concurrentRequests: 10,
  engines: ['pdf', 'image', 'video'],
  operations: ['convert', 'compress', 'merge', 'resize', 'extract'],
  fileSizes: [1024, 10240, 102400, 1048576, 10485760], // 1KB to 10MB
  warmupRequests: 100
}

// Performance test result
export interface PerformanceTestResult {
  testId: string
  config: PerformanceTestConfig
  startTime: Date
  endTime: Date
  duration: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cacheHits: number
  cacheMisses: number
  hitRate: number
  averageResponseTime: number
  medianResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  requestsPerSecond: number
  errorsPerSecond: number
  targetsMet: {
    hitRate: boolean
    responseTime: boolean
  }
  engineResults: Record<ProcessingEngine, {
    requests: number
    hitRate: number
    averageResponseTime: number
  }>
  recommendations: string[]
}

// Performance optimizer
export class CachePerformanceOptimizer {
  private testResults: PerformanceTestResult[] = []
  private isTestRunning = false

  // Run comprehensive performance test
  async runPerformanceTest(config: Partial<PerformanceTestConfig> = {}): Promise<PerformanceTestResult> {
    if (this.isTestRunning) {
      throw new Error('Performance test already running')
    }

    const testConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...config }
    const testId = `perf-test-${Date.now()}`
    
    console.log(`Starting performance test: ${testId}`)
    this.isTestRunning = true

    try {
      const result = await this.executePerformanceTest(testId, testConfig)
      this.testResults.push(result)
      
      // Generate optimization recommendations
      result.recommendations = this.generateRecommendations(result)
      
      console.log(`Performance test completed: ${testId}`)
      console.log(`Hit Rate: ${result.hitRate.toFixed(2)}% (Target: ${testConfig.targetHitRate}%)`)
      console.log(`Avg Response Time: ${result.averageResponseTime.toFixed(2)}ms (Target: ${testConfig.targetResponseTime}ms)`)
      
      return result

    } finally {
      this.isTestRunning = false
    }
  }

  // Execute performance test
  private async executePerformanceTest(
    testId: string, 
    config: PerformanceTestConfig
  ): Promise<PerformanceTestResult> {
    const startTime = new Date()
    const responseTimes: number[] = []
    const engineStats: Record<ProcessingEngine, { requests: number; hits: number; responseTimes: number[] }> = {
      pdf: { requests: 0, hits: 0, responseTimes: [] },
      image: { requests: 0, hits: 0, responseTimes: [] },
      video: { requests: 0, hits: 0, responseTimes: [] }
    }

    let totalRequests = 0
    let successfulRequests = 0
    let failedRequests = 0
    let cacheHits = 0
    let cacheMisses = 0

    // Warmup phase
    console.log('Starting warmup phase...')
    await this.runWarmupRequests(config.warmupRequests, config)

    // Main test phase
    console.log('Starting main test phase...')
    const testEndTime = Date.now() + config.testDuration
    
    while (Date.now() < testEndTime) {
      // Run concurrent requests
      const promises = Array.from({ length: config.concurrentRequests }, () => 
        this.executeTestRequest(config, engineStats)
      )

      const results = await Promise.allSettled(promises)
      
      for (const result of results) {
        totalRequests++
        
        if (result.status === 'fulfilled') {
          successfulRequests++
          responseTimes.push(result.value.responseTime)
          
          if (result.value.cacheHit) {
            cacheHits++
          } else {
            cacheMisses++
          }
        } else {
          failedRequests++
        }
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()

    // Calculate statistics
    responseTimes.sort((a, b) => a - b)
    const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0

    const medianResponseTime = responseTimes.length > 0 
      ? responseTimes[Math.floor(responseTimes.length / 2)] 
      : 0

    const p95ResponseTime = responseTimes.length > 0 
      ? responseTimes[Math.floor(responseTimes.length * 0.95)] 
      : 0

    const p99ResponseTime = responseTimes.length > 0 
      ? responseTimes[Math.floor(responseTimes.length * 0.99)] 
      : 0

    const requestsPerSecond = totalRequests / (duration / 1000)
    const errorsPerSecond = failedRequests / (duration / 1000)

    // Calculate engine-specific results
    const engineResults: Record<ProcessingEngine, any> = {} as any
    for (const [engine, stats] of Object.entries(engineStats)) {
      const engineHitRate = stats.requests > 0 ? (stats.hits / stats.requests) * 100 : 0
      const engineAvgResponseTime = stats.responseTimes.length > 0
        ? stats.responseTimes.reduce((sum, time) => sum + time, 0) / stats.responseTimes.length
        : 0

      engineResults[engine as ProcessingEngine] = {
        requests: stats.requests,
        hitRate: engineHitRate,
        averageResponseTime: engineAvgResponseTime
      }
    }

    return {
      testId,
      config,
      startTime,
      endTime,
      duration,
      totalRequests,
      successfulRequests,
      failedRequests,
      cacheHits,
      cacheMisses,
      hitRate,
      averageResponseTime,
      medianResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      minResponseTime: responseTimes.length > 0 ? responseTimes[0] : 0,
      maxResponseTime: responseTimes.length > 0 ? responseTimes[responseTimes.length - 1] : 0,
      requestsPerSecond,
      errorsPerSecond,
      targetsMet: {
        hitRate: hitRate >= config.targetHitRate,
        responseTime: averageResponseTime <= config.targetResponseTime
      },
      engineResults,
      recommendations: []
    }
  }

  // Execute single test request
  private async executeTestRequest(
    config: PerformanceTestConfig,
    engineStats: Record<ProcessingEngine, { requests: number; hits: number; responseTimes: number[] }>
  ): Promise<{ responseTime: number; cacheHit: boolean }> {
    const engine = config.engines[Math.floor(Math.random() * config.engines.length)]
    const operation = config.operations[Math.floor(Math.random() * config.operations.length)]
    const fileSize = config.fileSizes[Math.floor(Math.random() * config.fileSizes.length)]
    
    const startTime = Date.now()
    let cacheHit = false

    try {
      // Simulate file processing request
      const result = await getCachedFileResult(
        `test-file-${Math.floor(Math.random() * 1000)}`,
        operation,
        { fileSize, testMode: true },
        async () => {
          // Simulate processing time based on file size and engine
          const processingTime = this.calculateProcessingTime(engine, fileSize)
          await new Promise(resolve => setTimeout(resolve, processingTime))
          return { processed: true, engine, operation, fileSize }
        },
        engine,
        fileSize
      )

      cacheHit = result.cached || false
      
    } catch (error) {
      console.error('Test request failed:', error)
    }

    const responseTime = Date.now() - startTime
    
    // Update engine statistics
    engineStats[engine].requests++
    engineStats[engine].responseTimes.push(responseTime)
    if (cacheHit) {
      engineStats[engine].hits++
    }

    return { responseTime, cacheHit }
  }

  // Run warmup requests
  private async runWarmupRequests(count: number, config: PerformanceTestConfig): Promise<void> {
    const promises = Array.from({ length: count }, () => {
      const engine = config.engines[Math.floor(Math.random() * config.engines.length)]
      const operation = config.operations[Math.floor(Math.random() * config.operations.length)]
      const fileSize = config.fileSizes[Math.floor(Math.random() * config.fileSizes.length)]
      
      return getCachedFileResult(
        `warmup-file-${Math.floor(Math.random() * 100)}`,
        operation,
        { fileSize, warmup: true },
        async () => {
          const processingTime = this.calculateProcessingTime(engine, fileSize)
          await new Promise(resolve => setTimeout(resolve, processingTime))
          return { warmed: true, engine, operation }
        },
        engine,
        fileSize
      )
    })

    await Promise.allSettled(promises)
    console.log(`Warmup completed: ${count} requests`)
  }

  // Calculate simulated processing time
  private calculateProcessingTime(engine: ProcessingEngine, fileSize: number): number {
    const baseTime = {
      pdf: 100,    // 100ms base
      image: 50,   // 50ms base
      video: 500   // 500ms base
    }

    const sizeMultiplier = Math.log10(fileSize / 1024) // Log scale based on KB
    return Math.max(10, baseTime[engine] + (sizeMultiplier * 20))
  }

  // Generate optimization recommendations
  private generateRecommendations(result: PerformanceTestResult): string[] {
    const recommendations: string[] = []

    // Hit rate recommendations
    if (result.hitRate < result.config.targetHitRate) {
      recommendations.push(`Increase cache TTL values - current hit rate ${result.hitRate.toFixed(1)}% is below target ${result.config.targetHitRate}%`)
      
      if (result.hitRate < 80) {
        recommendations.push('Consider implementing cache warming for popular operations')
        recommendations.push('Review cache key generation strategy for better cache utilization')
      }
    }

    // Response time recommendations
    if (result.averageResponseTime > result.config.targetResponseTime) {
      recommendations.push(`Optimize cache lookup performance - current avg response time ${result.averageResponseTime.toFixed(1)}ms exceeds target ${result.config.targetResponseTime}ms`)
      
      if (result.averageResponseTime > 500) {
        recommendations.push('Consider adding more memory cache layers')
        recommendations.push('Implement request deduplication for concurrent identical requests')
      }
    }

    // Engine-specific recommendations
    for (const [engine, stats] of Object.entries(result.engineResults)) {
      if (stats.hitRate < 90) {
        recommendations.push(`Optimize ${engine} engine caching - hit rate ${stats.hitRate.toFixed(1)}% is low`)
      }
      
      if (stats.averageResponseTime > result.config.targetResponseTime * 1.5) {
        recommendations.push(`Review ${engine} engine cache strategy - response time ${stats.averageResponseTime.toFixed(1)}ms is high`)
      }
    }

    // P95/P99 recommendations
    if (result.p95ResponseTime > result.config.targetResponseTime * 2) {
      recommendations.push('High P95 response time indicates cache misses or slow operations - review cache warming strategy')
    }

    // Error rate recommendations
    if (result.errorsPerSecond > 0.1) {
      recommendations.push('High error rate detected - review error handling and cache fallback mechanisms')
    }

    return recommendations
  }

  // Apply automatic optimizations
  async applyOptimizations(result: PerformanceTestResult): Promise<void> {
    console.log('Applying automatic optimizations...')

    // Optimize TTL values based on hit rates
    for (const [engine, stats] of Object.entries(result.engineResults)) {
      if (stats.hitRate < 90) {
        const currentConfig = CACHE_ARCHITECTURE[engine as ProcessingEngine]
        console.log(`Increasing TTL for ${engine} engine due to low hit rate`)
        
        // Increase TTL by 50%
        Object.values(currentConfig.sizeTiers).forEach(tier => {
          tier.ttl = Math.floor(tier.ttl * 1.5)
        })
      }
    }

    // Trigger cache warming if hit rate is low
    if (result.hitRate < 85) {
      console.log('Triggering cache warming due to low overall hit rate')
      try {
        const { cacheWarmer } = await import('./cache-warming')
        await cacheWarmer.triggerWarming()
      } catch (error) {
        console.error('Cache warming failed:', error)
      }
    }

    console.log('Optimizations applied')
  }

  // Get test results
  getTestResults(): PerformanceTestResult[] {
    return [...this.testResults]
  }

  // Get latest test result
  getLatestResult(): PerformanceTestResult | null {
    return this.testResults.length > 0 ? this.testResults[this.testResults.length - 1] : null
  }

  // Clear test results
  clearResults(): void {
    this.testResults = []
  }

  // Check if test is running
  isRunning(): boolean {
    return this.isTestRunning
  }
}

// Global performance optimizer
export const cachePerformanceOptimizer = new CachePerformanceOptimizer()

// Export types and utilities
export {
  PerformanceTestConfig,
  PerformanceTestResult,
  DEFAULT_PERFORMANCE_CONFIG
}
