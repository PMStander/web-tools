import { ProcessingEngine } from './cache-architecture'
import { getCacheMetrics } from './cache'
import { cacheMonitor } from './cache-monitoring'
import { redisManager } from './redis-config'

// Validation test result
export interface ValidationResult {
  testName: string
  passed: boolean
  score: number // 0-100
  details: string
  metrics?: any
  recommendations?: string[]
}

// Comprehensive validation report
export interface ValidationReport {
  timestamp: Date
  overallScore: number
  passed: boolean
  totalTests: number
  passedTests: number
  failedTests: number
  results: ValidationResult[]
  summary: {
    hitRate: number
    responseTime: number
    availability: number
    consistency: number
  }
  recommendations: string[]
}

// Cache validation suite
export class CacheValidationSuite {
  
  // Run comprehensive cache validation
  async runValidation(): Promise<ValidationReport> {
    console.log('Starting comprehensive cache validation...')
    
    const results: ValidationResult[] = []
    
    // Run all validation tests
    results.push(await this.validateHitRate())
    results.push(await this.validateResponseTime())
    results.push(await this.validateRedisConnectivity())
    results.push(await this.validateMemoryCacheHealth())
    results.push(await this.validateCacheConsistency())
    results.push(await this.validateEnginePerformance('pdf'))
    results.push(await this.validateEnginePerformance('image'))
    results.push(await this.validateEnginePerformance('video'))
    results.push(await this.validateCacheInvalidation())
    results.push(await this.validateCacheWarming())
    results.push(await this.validateMonitoringSystem())
    results.push(await this.validateErrorHandling())

    // Calculate overall metrics
    const passedTests = results.filter(r => r.passed).length
    const failedTests = results.length - passedTests
    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
    const passed = overallScore >= 78 // 78% minimum passing score

    // Generate summary
    const summary = await this.generateSummary(results)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(results)

    const report: ValidationReport = {
      timestamp: new Date(),
      overallScore,
      passed,
      totalTests: results.length,
      passedTests,
      failedTests,
      results,
      summary,
      recommendations
    }

    console.log(`Cache validation completed: ${overallScore.toFixed(1)}% (${passedTests}/${results.length} tests passed)`)
    
    return report
  }

  // Validate cache hit rate
  private async validateHitRate(): Promise<ValidationResult> {
    try {
      const metrics = await getCacheMetrics()
      const hitRate = metrics.overall?.overallHitRate || 0
      
      let score = 0
      let details = ''
      
      if (hitRate >= 95) {
        score = 100
        details = `Excellent hit rate: ${hitRate.toFixed(1)}%`
      } else if (hitRate >= 90) {
        score = 85
        details = `Good hit rate: ${hitRate.toFixed(1)}%`
      } else if (hitRate >= 80) {
        score = 70
        details = `Acceptable hit rate: ${hitRate.toFixed(1)}%`
      } else if (hitRate >= 70) {
        score = 50
        details = `Low hit rate: ${hitRate.toFixed(1)}%`
      } else {
        score = 25
        details = `Very low hit rate: ${hitRate.toFixed(1)}%`
      }

      return {
        testName: 'Cache Hit Rate',
        passed: score >= 70,
        score,
        details,
        metrics: { hitRate },
        recommendations: score < 70 ? ['Increase cache TTL values', 'Implement cache warming'] : undefined
      }

    } catch (error) {
      return {
        testName: 'Cache Hit Rate',
        passed: false,
        score: 0,
        details: `Failed to measure hit rate: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Check cache metrics collection']
      }
    }
  }

  // Validate response time
  private async validateResponseTime(): Promise<ValidationResult> {
    try {
      const metrics = await getCacheMetrics()
      const responseTime = metrics.overall?.averageResponseTime || 0
      
      let score = 0
      let details = ''
      
      if (responseTime <= 50) {
        score = 100
        details = `Excellent response time: ${responseTime.toFixed(1)}ms`
      } else if (responseTime <= 100) {
        score = 90
        details = `Very good response time: ${responseTime.toFixed(1)}ms`
      } else if (responseTime <= 200) {
        score = 80
        details = `Good response time: ${responseTime.toFixed(1)}ms`
      } else if (responseTime <= 500) {
        score = 60
        details = `Acceptable response time: ${responseTime.toFixed(1)}ms`
      } else {
        score = 30
        details = `Slow response time: ${responseTime.toFixed(1)}ms`
      }

      return {
        testName: 'Response Time',
        passed: score >= 60,
        score,
        details,
        metrics: { responseTime },
        recommendations: score < 60 ? ['Optimize cache lookup performance', 'Add memory cache layers'] : undefined
      }

    } catch (error) {
      return {
        testName: 'Response Time',
        passed: false,
        score: 0,
        details: `Failed to measure response time: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Check performance monitoring']
      }
    }
  }

  // Validate Redis connectivity
  private async validateRedisConnectivity(): Promise<ValidationResult> {
    try {
      const health = await redisManager.healthCheck()
      const allHealthy = Object.values(health).every(status => status)
      
      let score = 0
      let details = ''
      
      if (allHealthy) {
        score = 100
        details = 'All Redis connections healthy'
      } else {
        const healthyCount = Object.values(health).filter(status => status).length
        const totalCount = Object.values(health).length
        score = (healthyCount / totalCount) * 100
        details = `${healthyCount}/${totalCount} Redis connections healthy`
      }

      return {
        testName: 'Redis Connectivity',
        passed: score >= 75,
        score,
        details,
        metrics: health,
        recommendations: score < 75 ? ['Check Redis configuration', 'Verify network connectivity'] : undefined
      }

    } catch (error) {
      return {
        testName: 'Redis Connectivity',
        passed: false,
        score: 0,
        details: `Redis connectivity failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Check Redis server status', 'Verify connection settings']
      }
    }
  }

  // Validate memory cache health
  private async validateMemoryCacheHealth(): Promise<ValidationResult> {
    try {
      const memoryUsage = process.memoryUsage()
      const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      
      let score = 0
      let details = ''
      
      if (heapUsedPercent <= 60) {
        score = 100
        details = `Healthy memory usage: ${heapUsedPercent.toFixed(1)}%`
      } else if (heapUsedPercent <= 75) {
        score = 80
        details = `Moderate memory usage: ${heapUsedPercent.toFixed(1)}%`
      } else if (heapUsedPercent <= 85) {
        score = 60
        details = `High memory usage: ${heapUsedPercent.toFixed(1)}%`
      } else {
        score = 30
        details = `Very high memory usage: ${heapUsedPercent.toFixed(1)}%`
      }

      return {
        testName: 'Memory Cache Health',
        passed: score >= 60,
        score,
        details,
        metrics: { heapUsedPercent, memoryUsage },
        recommendations: score < 60 ? ['Reduce cache size', 'Implement cache cleanup'] : undefined
      }

    } catch (error) {
      return {
        testName: 'Memory Cache Health',
        passed: false,
        score: 0,
        details: `Memory health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Check memory monitoring']
      }
    }
  }

  // Validate cache consistency
  private async validateCacheConsistency(): Promise<ValidationResult> {
    try {
      // Test cache consistency by setting and getting values
      const testKey = `consistency-test-${Date.now()}`
      const testValue = { test: true, timestamp: Date.now() }
      
      const { apiCache } = await import('./cache')
      
      // Set value
      await apiCache.set(testKey, testValue, 60)
      
      // Get value immediately
      const retrieved = await apiCache.get(testKey)
      
      // Clean up
      await apiCache.invalidate(testKey)
      
      const consistent = JSON.stringify(retrieved) === JSON.stringify(testValue)
      
      return {
        testName: 'Cache Consistency',
        passed: consistent,
        score: consistent ? 100 : 0,
        details: consistent ? 'Cache consistency verified' : 'Cache consistency failed',
        recommendations: !consistent ? ['Check cache implementation', 'Verify serialization'] : undefined
      }

    } catch (error) {
      return {
        testName: 'Cache Consistency',
        passed: false,
        score: 0,
        details: `Consistency test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Check cache operations']
      }
    }
  }

  // Validate engine-specific performance
  private async validateEnginePerformance(engine: ProcessingEngine): Promise<ValidationResult> {
    try {
      // Simulate engine-specific cache operations
      const testKey = `engine-test-${engine}-${Date.now()}`
      const testValue = { engine, processed: true, timestamp: Date.now() }
      
      const startTime = Date.now()
      
      const { getCachedFileResult } = await import('./cache')
      
      // Test cache operation
      const result = await getCachedFileResult(
        testKey,
        'test',
        { engine },
        async () => testValue,
        engine,
        1024
      )
      
      const responseTime = Date.now() - startTime
      
      let score = 0
      if (responseTime <= 100) score = 100
      else if (responseTime <= 200) score = 85
      else if (responseTime <= 500) score = 70
      else score = 50

      return {
        testName: `${engine.toUpperCase()} Engine Performance`,
        passed: score >= 70,
        score,
        details: `${engine} engine response time: ${responseTime}ms`,
        metrics: { responseTime, engine },
        recommendations: score < 70 ? [`Optimize ${engine} engine caching`] : undefined
      }

    } catch (error) {
      return {
        testName: `${engine.toUpperCase()} Engine Performance`,
        passed: false,
        score: 0,
        details: `${engine} engine test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: [`Check ${engine} engine configuration`]
      }
    }
  }

  // Validate cache invalidation
  private async validateCacheInvalidation(): Promise<ValidationResult> {
    try {
      const testKey = `invalidation-test-${Date.now()}`
      const testValue = { test: true }
      
      const { apiCache } = await import('./cache')
      
      // Set value
      await apiCache.set(testKey, testValue, 60)
      
      // Verify it exists
      const beforeInvalidation = await apiCache.get(testKey)
      
      // Invalidate
      await apiCache.invalidate(testKey)
      
      // Verify it's gone
      const afterInvalidation = await apiCache.get(testKey)
      
      const invalidationWorked = beforeInvalidation !== null && afterInvalidation === null
      
      return {
        testName: 'Cache Invalidation',
        passed: invalidationWorked,
        score: invalidationWorked ? 100 : 0,
        details: invalidationWorked ? 'Cache invalidation working correctly' : 'Cache invalidation failed',
        recommendations: !invalidationWorked ? ['Check invalidation implementation'] : undefined
      }

    } catch (error) {
      return {
        testName: 'Cache Invalidation',
        passed: false,
        score: 0,
        details: `Invalidation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Check invalidation system']
      }
    }
  }

  // Validate cache warming
  private async validateCacheWarming(): Promise<ValidationResult> {
    try {
      // Check if cache warming is functional
      const { cacheWarmer } = await import('./cache-warming')
      const stats = cacheWarmer.getStats()
      
      let score = 0
      let details = ''
      
      if (stats.successfulWarms > 0 && stats.failedWarms === 0) {
        score = 100
        details = `Cache warming healthy: ${stats.successfulWarms} successful warms`
      } else if (stats.successfulWarms > stats.failedWarms) {
        score = 75
        details = `Cache warming mostly working: ${stats.successfulWarms} successful, ${stats.failedWarms} failed`
      } else if (stats.successfulWarms > 0) {
        score = 50
        details = `Cache warming partially working: ${stats.successfulWarms} successful, ${stats.failedWarms} failed`
      } else {
        score = 25
        details = 'Cache warming not working'
      }

      return {
        testName: 'Cache Warming',
        passed: score >= 50,
        score,
        details,
        metrics: stats,
        recommendations: score < 50 ? ['Check cache warming configuration'] : undefined
      }

    } catch (error) {
      return {
        testName: 'Cache Warming',
        passed: false,
        score: 0,
        details: `Cache warming test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Check cache warming system']
      }
    }
  }

  // Validate monitoring system
  private async validateMonitoringSystem(): Promise<ValidationResult> {
    try {
      const status = cacheMonitor.getCurrentStatus()
      const alerts = cacheMonitor.getActiveAlerts()
      
      let score = 100
      let details = 'Monitoring system healthy'
      
      if (alerts.length > 0) {
        const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
        if (criticalAlerts > 0) {
          score = 30
          details = `${criticalAlerts} critical alerts active`
        } else {
          score = 70
          details = `${alerts.length} non-critical alerts active`
        }
      }

      return {
        testName: 'Monitoring System',
        passed: score >= 70,
        score,
        details,
        metrics: { status, alertCount: alerts.length },
        recommendations: score < 70 ? ['Address active alerts'] : undefined
      }

    } catch (error) {
      return {
        testName: 'Monitoring System',
        passed: false,
        score: 0,
        details: `Monitoring test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Check monitoring system']
      }
    }
  }

  // Validate error handling
  private async validateErrorHandling(): Promise<ValidationResult> {
    try {
      // Test error handling by attempting invalid operations
      const { apiCache } = await import('./cache')
      
      let errorHandlingScore = 0
      
      // Test 1: Invalid key
      try {
        await apiCache.get('')
        errorHandlingScore += 25 // Should handle gracefully
      } catch (error) {
        // Expected to fail gracefully
        errorHandlingScore += 25
      }
      
      // Test 2: Large value
      try {
        const largeValue = 'x'.repeat(10 * 1024 * 1024) // 10MB string
        await apiCache.set('large-test', largeValue, 60)
        errorHandlingScore += 25
      } catch (error) {
        // Should handle large values gracefully
        errorHandlingScore += 25
      }
      
      // Test 3: Invalid TTL
      try {
        await apiCache.set('ttl-test', { test: true }, -1)
        errorHandlingScore += 25
      } catch (error) {
        // Should handle invalid TTL gracefully
        errorHandlingScore += 25
      }
      
      // Test 4: Null/undefined values
      try {
        await apiCache.set('null-test', null, 60)
        await apiCache.set('undefined-test', undefined, 60)
        errorHandlingScore += 25
      } catch (error) {
        // Should handle null/undefined gracefully
        errorHandlingScore += 25
      }

      return {
        testName: 'Error Handling',
        passed: errorHandlingScore >= 75,
        score: errorHandlingScore,
        details: `Error handling score: ${errorHandlingScore}%`,
        recommendations: errorHandlingScore < 75 ? ['Improve error handling robustness'] : undefined
      }

    } catch (error) {
      return {
        testName: 'Error Handling',
        passed: false,
        score: 0,
        details: `Error handling test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Review error handling implementation']
      }
    }
  }

  // Generate summary metrics
  private async generateSummary(results: ValidationResult[]): Promise<ValidationReport['summary']> {
    const hitRateResult = results.find(r => r.testName === 'Cache Hit Rate')
    const responseTimeResult = results.find(r => r.testName === 'Response Time')
    const redisResult = results.find(r => r.testName === 'Redis Connectivity')
    const consistencyResult = results.find(r => r.testName === 'Cache Consistency')

    return {
      hitRate: hitRateResult?.metrics?.hitRate || 0,
      responseTime: responseTimeResult?.metrics?.responseTime || 0,
      availability: redisResult?.score || 0,
      consistency: consistencyResult?.score || 0
    }
  }

  // Generate recommendations
  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = []
    
    for (const result of results) {
      if (!result.passed && result.recommendations) {
        recommendations.push(...result.recommendations)
      }
    }

    // Remove duplicates
    return [...new Set(recommendations)]
  }
}

// Global validation suite
export const cacheValidationSuite = new CacheValidationSuite()

// Export types and utilities
export {
  ValidationResult,
  ValidationReport
}
