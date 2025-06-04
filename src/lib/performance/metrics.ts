/**
 * Performance Metrics Collection and Analysis
 * Comprehensive monitoring for Next.js Web Tools Platform
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  category: 'api' | 'cache' | 'file-processing' | 'ui' | 'system';
  metadata?: Record<string, any>;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  activeConnections: number;
  queueSize: number;
}

export interface ProcessingMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  queueWaitTime: number;
  throughput: number; // jobs per minute
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  memoryUsage: number;
  redisConnections: number;
  averageResponseTime: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private metricsBuffer: Map<string, PerformanceMetric[]> = new Map();
  private readonly MAX_BUFFER_SIZE = 1000;

  /**
   * Record a performance metric
   */
  record(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    // Add to main metrics array
    this.metrics.push(fullMetric);

    // Add to categorized buffer
    const categoryKey = metric.category;
    if (!this.metricsBuffer.has(categoryKey)) {
      this.metricsBuffer.set(categoryKey, []);
    }
    
    const buffer = this.metricsBuffer.get(categoryKey)!;
    buffer.push(fullMetric);

    // Maintain buffer size
    if (buffer.length > this.MAX_BUFFER_SIZE) {
      buffer.shift();
    }

    // Cleanup main metrics array
    if (this.metrics.length > this.MAX_BUFFER_SIZE * 5) {
      this.metrics = this.metrics.slice(-this.MAX_BUFFER_SIZE * 3);
    }
  }

  /**
   * Get metrics by category and time range
   */
  getMetrics(
    category?: string,
    startTime?: number,
    endTime?: number
  ): PerformanceMetric[] {
    let metricsToFilter = category 
      ? this.metricsBuffer.get(category) || []
      : this.metrics;

    if (startTime || endTime) {
      metricsToFilter = metricsToFilter.filter(metric => {
        if (startTime && metric.timestamp < startTime) return false;
        if (endTime && metric.timestamp > endTime) return false;
        return true;
      });
    }

    return metricsToFilter;
  }

  /**
   * Calculate performance statistics
   */
  getStats(metricName: string, category?: string): {
    average: number;
    min: number;
    max: number;
    count: number;
    percentile95: number;
    percentile99: number;
  } {
    const metrics = this.getMetrics(category).filter(m => m.name === metricName);
    
    if (metrics.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0, percentile95: 0, percentile99: 0 };
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      average: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      count: values.length,
      percentile95: values[Math.floor(values.length * 0.95)] || 0,
      percentile99: values[Math.floor(values.length * 0.99)] || 0
    };
  }

  /**
   * Get system health score (0-100)
   */
  getHealthScore(): number {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Get recent metrics
    const recentMetrics = this.getMetrics(undefined, fiveMinutesAgo, now);
    
    if (recentMetrics.length === 0) return 100;

    let score = 100;

    // Check API response times
    const apiMetrics = recentMetrics.filter(m => m.category === 'api' && m.name === 'response_time');
    if (apiMetrics.length > 0) {
      const avgResponseTime = apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length;
      if (avgResponseTime > 1000) score -= 20;
      else if (avgResponseTime > 500) score -= 10;
      else if (avgResponseTime > 200) score -= 5;
    }

    // Check cache hit rate
    const cacheMetrics = recentMetrics.filter(m => m.category === 'cache' && m.name === 'hit_rate');
    if (cacheMetrics.length > 0) {
      const avgHitRate = cacheMetrics.reduce((sum, m) => sum + m.value, 0) / cacheMetrics.length;
      if (avgHitRate < 80) score -= 15;
      else if (avgHitRate < 90) score -= 10;
      else if (avgHitRate < 95) score -= 5;
    }

    // Check error rates
    const errorMetrics = recentMetrics.filter(m => m.name === 'error_rate');
    if (errorMetrics.length > 0) {
      const avgErrorRate = errorMetrics.reduce((sum, m) => sum + m.value, 0) / errorMetrics.length;
      if (avgErrorRate > 5) score -= 25;
      else if (avgErrorRate > 2) score -= 15;
      else if (avgErrorRate > 1) score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'name', 'value', 'unit', 'category', 'metadata'];
      const rows = this.metrics.map(m => [
        m.timestamp,
        m.name,
        m.value,
        m.unit,
        m.category,
        JSON.stringify(m.metadata || {})
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Clear old metrics
   */
  cleanup(olderThan: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThan;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    for (const [category, buffer] of this.metricsBuffer.entries()) {
      this.metricsBuffer.set(category, buffer.filter(m => m.timestamp > cutoff));
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance timing decorator for async functions
 */
export function measurePerformance<T extends (...args: any[]) => Promise<any>>(
  category: PerformanceMetric['category'],
  metricName: string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const endTime = performance.now();
        
        performanceMonitor.record({
          name: metricName,
          value: endTime - startTime,
          unit: 'ms',
          category,
          metadata: { success: true, method: propertyKey }
        });
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        
        performanceMonitor.record({
          name: metricName,
          value: endTime - startTime,
          unit: 'ms',
          category,
          metadata: { success: false, error: error instanceof Error ? error.message : 'Unknown error', method: propertyKey }
        });
        
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Simple performance timer utility
 */
export class PerformanceTimer {
  private startTime: number;
  private endTime?: number;

  constructor(private name: string, private category: PerformanceMetric['category']) {
    this.startTime = performance.now();
  }

  end(metadata?: Record<string, any>): number {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;

    performanceMonitor.record({
      name: this.name,
      value: duration,
      unit: 'ms',
      category: this.category,
      metadata
    });

    return duration;
  }
}
