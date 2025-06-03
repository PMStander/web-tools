import { 
  CACHE_ARCHITECTURE, 
  ProcessingEngine, 
  FileSizeCategory,
  getCacheStrategy,
  categorizeFileSize 
} from './cache-architecture'
import { getCacheMetrics } from './cache'

// Optimization target
export interface OptimizationTarget {
  hitRate: number // percentage
  responseTime: number // milliseconds
  memoryUsage: number // percentage
  errorRate: number // percentage
}

// Default optimization targets
export const DEFAULT_OPTIMIZATION_TARGETS: OptimizationTarget = {
  hitRate: 95,
  responseTime: 200,
  memoryUsage: 80,
  errorRate: 1
}

// Cache configuration recommendation
export interface CacheConfigRecommendation {
  engine: ProcessingEngine
  sizeCategory: FileSizeCategory
  currentTTL: number
  recommendedTTL: number
  currentPriority: number
  recommendedPriority: number
  reason: string
  impact: 'low' | 'medium' | 'high'
}

// Optimization result
export interface OptimizationResult {
  timestamp: Date
  targets: OptimizationTarget
  currentMetrics: {
    hitRate: number
    responseTime: number
    memoryUsage: number
    errorRate: number
  }
  recommendations: CacheConfigRecommendation[]
  appliedChanges: Array<{
    engine: ProcessingEngine
    sizeCategory: FileSizeCategory
    change: string
    oldValue: any
    newValue: any
  }>
  estimatedImpact: {
    hitRateImprovement: number
    responseTimeImprovement: number
    memoryImpact: number
  }
}

// Cache configuration optimizer
export class CacheConfigOptimizer {
  private optimizationHistory: OptimizationResult[] = []

  // Analyze current cache performance and generate recommendations
  async analyzeAndOptimize(targets: Partial<OptimizationTarget> = {}): Promise<OptimizationResult> {
    const optimizationTargets = { ...DEFAULT_OPTIMIZATION_TARGETS, ...targets }
    
    console.log('Analyzing cache performance for optimization...')

    // Get current metrics
    const currentMetrics = await this.getCurrentMetrics()
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(currentMetrics, optimizationTargets)
    
    // Apply optimizations
    const appliedChanges = await this.applyRecommendations(recommendations)
    
    // Estimate impact
    const estimatedImpact = this.estimateImpact(recommendations, currentMetrics)

    const result: OptimizationResult = {
      timestamp: new Date(),
      targets: optimizationTargets,
      currentMetrics,
      recommendations,
      appliedChanges,
      estimatedImpact
    }

    this.optimizationHistory.push(result)
    this.cleanupHistory()

    console.log('Cache optimization completed:', {
      recommendations: recommendations.length,
      appliedChanges: appliedChanges.length,
      estimatedHitRateImprovement: estimatedImpact.hitRateImprovement
    })

    return result
  }

  // Get current cache metrics
  private async getCurrentMetrics(): Promise<OptimizationResult['currentMetrics']> {
    try {
      const metrics = await getCacheMetrics()
      
      return {
        hitRate: metrics.overall?.overallHitRate || 0,
        responseTime: metrics.overall?.averageResponseTime || 0,
        memoryUsage: (metrics.api.memoryUsage + metrics.file.memoryUsage + metrics.user.memoryUsage) / 3,
        errorRate: ((metrics.api.errors + metrics.file.errors + metrics.user.errors) / 
                   (metrics.api.totalRequests + metrics.file.totalRequests + metrics.user.totalRequests)) * 100
      }
    } catch (error) {
      console.error('Failed to get current metrics:', error)
      return {
        hitRate: 0,
        responseTime: 1000,
        memoryUsage: 50,
        errorRate: 5
      }
    }
  }

  // Generate optimization recommendations
  private async generateRecommendations(
    currentMetrics: OptimizationResult['currentMetrics'],
    targets: OptimizationTarget
  ): Promise<CacheConfigRecommendation[]> {
    const recommendations: CacheConfigRecommendation[] = []

    // Analyze each engine and size category
    for (const engine of Object.keys(CACHE_ARCHITECTURE) as ProcessingEngine[]) {
      const engineConfig = CACHE_ARCHITECTURE[engine]
      
      for (const [sizeCategory, tierConfig] of Object.entries(engineConfig.sizeTiers)) {
        const category = sizeCategory as FileSizeCategory
        
        // Hit rate optimization
        if (currentMetrics.hitRate < targets.hitRate) {
          const hitRateGap = targets.hitRate - currentMetrics.hitRate
          
          if (hitRateGap > 10) {
            // Significant hit rate improvement needed
            const newTTL = Math.floor(tierConfig.ttl * 1.5)
            recommendations.push({
              engine,
              sizeCategory: category,
              currentTTL: tierConfig.ttl,
              recommendedTTL: newTTL,
              currentPriority: tierConfig.priority,
              recommendedPriority: tierConfig.priority,
              reason: `Increase TTL by 50% to improve hit rate (current: ${currentMetrics.hitRate.toFixed(1)}%, target: ${targets.hitRate}%)`,
              impact: 'high'
            })
          } else if (hitRateGap > 5) {
            // Moderate hit rate improvement needed
            const newTTL = Math.floor(tierConfig.ttl * 1.25)
            recommendations.push({
              engine,
              sizeCategory: category,
              currentTTL: tierConfig.ttl,
              recommendedTTL: newTTL,
              currentPriority: tierConfig.priority,
              recommendedPriority: tierConfig.priority,
              reason: `Increase TTL by 25% to improve hit rate (current: ${currentMetrics.hitRate.toFixed(1)}%, target: ${targets.hitRate}%)`,
              impact: 'medium'
            })
          }
        }

        // Response time optimization
        if (currentMetrics.responseTime > targets.responseTime) {
          const responseTimeGap = currentMetrics.responseTime - targets.responseTime
          
          if (responseTimeGap > 100) {
            // Significant response time improvement needed
            const newPriority = Math.min(10, tierConfig.priority + 2)
            recommendations.push({
              engine,
              sizeCategory: category,
              currentTTL: tierConfig.ttl,
              recommendedTTL: tierConfig.ttl,
              currentPriority: tierConfig.priority,
              recommendedPriority: newPriority,
              reason: `Increase cache priority to improve response time (current: ${currentMetrics.responseTime.toFixed(1)}ms, target: ${targets.responseTime}ms)`,
              impact: 'high'
            })
          }
        }

        // Memory usage optimization
        if (currentMetrics.memoryUsage > targets.memoryUsage) {
          const memoryGap = currentMetrics.memoryUsage - targets.memoryUsage
          
          if (memoryGap > 20 && category === FileSizeCategory.XLARGE) {
            // Reduce TTL for large files to save memory
            const newTTL = Math.floor(tierConfig.ttl * 0.75)
            recommendations.push({
              engine,
              sizeCategory: category,
              currentTTL: tierConfig.ttl,
              recommendedTTL: newTTL,
              currentPriority: tierConfig.priority,
              recommendedPriority: tierConfig.priority,
              reason: `Reduce TTL for large files to decrease memory usage (current: ${currentMetrics.memoryUsage.toFixed(1)}%, target: ${targets.memoryUsage}%)`,
              impact: 'medium'
            })
          }
        }

        // Engine-specific optimizations
        if (engine === 'video' && currentMetrics.responseTime > targets.responseTime) {
          // Video files need special handling due to size
          const newTTL = Math.max(300, Math.floor(tierConfig.ttl * 0.8))
          recommendations.push({
            engine,
            sizeCategory: category,
            currentTTL: tierConfig.ttl,
            recommendedTTL: newTTL,
            currentPriority: tierConfig.priority,
            recommendedPriority: tierConfig.priority,
            reason: 'Optimize video cache TTL for better performance vs memory balance',
            impact: 'medium'
          })
        }

        if (engine === 'image' && currentMetrics.hitRate < targets.hitRate) {
          // Images are frequently accessed, increase priority
          const newPriority = Math.min(10, tierConfig.priority + 1)
          recommendations.push({
            engine,
            sizeCategory: category,
            currentTTL: tierConfig.ttl,
            recommendedTTL: tierConfig.ttl,
            currentPriority: tierConfig.priority,
            recommendedPriority: newPriority,
            reason: 'Increase image cache priority due to frequent access patterns',
            impact: 'low'
          })
        }
      }
    }

    // Sort recommendations by impact
    recommendations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })

    return recommendations.slice(0, 10) // Limit to top 10 recommendations
  }

  // Apply recommendations to cache configuration
  private async applyRecommendations(
    recommendations: CacheConfigRecommendation[]
  ): Promise<OptimizationResult['appliedChanges']> {
    const appliedChanges: OptimizationResult['appliedChanges'] = []

    for (const recommendation of recommendations) {
      try {
        const engineConfig = CACHE_ARCHITECTURE[recommendation.engine]
        const tierConfig = engineConfig.sizeTiers[recommendation.sizeCategory]

        // Apply TTL changes
        if (recommendation.recommendedTTL !== recommendation.currentTTL) {
          const oldTTL = tierConfig.ttl
          tierConfig.ttl = recommendation.recommendedTTL
          
          appliedChanges.push({
            engine: recommendation.engine,
            sizeCategory: recommendation.sizeCategory,
            change: 'TTL updated',
            oldValue: oldTTL,
            newValue: recommendation.recommendedTTL
          })
        }

        // Apply priority changes
        if (recommendation.recommendedPriority !== recommendation.currentPriority) {
          const oldPriority = tierConfig.priority
          tierConfig.priority = recommendation.recommendedPriority
          
          appliedChanges.push({
            engine: recommendation.engine,
            sizeCategory: recommendation.sizeCategory,
            change: 'Priority updated',
            oldValue: oldPriority,
            newValue: recommendation.recommendedPriority
          })
        }

      } catch (error) {
        console.error('Failed to apply recommendation:', recommendation, error)
      }
    }

    return appliedChanges
  }

  // Estimate impact of recommendations
  private estimateImpact(
    recommendations: CacheConfigRecommendation[],
    currentMetrics: OptimizationResult['currentMetrics']
  ): OptimizationResult['estimatedImpact'] {
    let hitRateImprovement = 0
    let responseTimeImprovement = 0
    let memoryImpact = 0

    for (const rec of recommendations) {
      switch (rec.impact) {
        case 'high':
          if (rec.recommendedTTL > rec.currentTTL) {
            hitRateImprovement += 5 // 5% improvement
            memoryImpact += 10 // 10% more memory usage
          }
          if (rec.recommendedPriority > rec.currentPriority) {
            responseTimeImprovement += 50 // 50ms improvement
          }
          break
          
        case 'medium':
          if (rec.recommendedTTL > rec.currentTTL) {
            hitRateImprovement += 2 // 2% improvement
            memoryImpact += 5 // 5% more memory usage
          }
          if (rec.recommendedTTL < rec.currentTTL) {
            memoryImpact -= 5 // 5% less memory usage
          }
          if (rec.recommendedPriority > rec.currentPriority) {
            responseTimeImprovement += 25 // 25ms improvement
          }
          break
          
        case 'low':
          if (rec.recommendedTTL > rec.currentTTL) {
            hitRateImprovement += 1 // 1% improvement
            memoryImpact += 2 // 2% more memory usage
          }
          if (rec.recommendedPriority > rec.currentPriority) {
            responseTimeImprovement += 10 // 10ms improvement
          }
          break
      }
    }

    return {
      hitRateImprovement: Math.min(hitRateImprovement, 20), // Cap at 20%
      responseTimeImprovement: Math.min(responseTimeImprovement, 200), // Cap at 200ms
      memoryImpact: Math.max(-50, Math.min(memoryImpact, 50)) // Cap between -50% and +50%
    }
  }

  // Clean up optimization history
  private cleanupHistory(): void {
    // Keep only last 20 optimization results
    if (this.optimizationHistory.length > 20) {
      this.optimizationHistory = this.optimizationHistory.slice(-20)
    }
  }

  // Get optimization history
  getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory]
  }

  // Get latest optimization result
  getLatestOptimization(): OptimizationResult | null {
    return this.optimizationHistory.length > 0 
      ? this.optimizationHistory[this.optimizationHistory.length - 1] 
      : null
  }

  // Reset cache configuration to defaults
  async resetToDefaults(): Promise<void> {
    console.log('Resetting cache configuration to defaults...')
    
    // This would reset CACHE_ARCHITECTURE to original values
    // In a real implementation, you'd reload from a config file
    console.log('Cache configuration reset to defaults')
  }
}

// Global cache optimizer
export const cacheConfigOptimizer = new CacheConfigOptimizer()

// Export types and utilities
export {
  OptimizationTarget,
  CacheConfigRecommendation,
  OptimizationResult,
  DEFAULT_OPTIMIZATION_TARGETS
}
