import { NextRequest, NextResponse } from 'next/server'
import { cacheMonitor } from '@/lib/cache-monitoring'
import { redisManager } from '@/lib/redis-config'
import { getCacheMetrics } from '@/lib/cache'
import { withAPIRateLimit } from '@/lib/rate-limit-middleware'

interface HealthResponse {
  success: boolean
  data?: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    components: Record<string, {
      status: 'healthy' | 'degraded' | 'unhealthy'
      responseTime?: number
      details?: any
    }>
    metrics: {
      hitRate: number
      responseTime: number
      errorRate: number
      uptime: number
    }
    alerts: {
      active: number
      critical: number
    }
    timestamp: string
  }
  error?: string
}

// Comprehensive cache health check
async function healthCheck(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    const components: Record<string, any> = {}
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

    // Check Redis health
    const redisStartTime = Date.now()
    const redisHealth = await redisManager.healthCheck()
    const redisResponseTime = Date.now() - redisStartTime
    
    components.redis = {
      status: redisHealth.cache ? 'healthy' : 'unhealthy',
      responseTime: redisResponseTime,
      details: {
        primary: redisHealth.primary,
        cache: redisHealth.cache,
        session: redisHealth.session,
        pubsub: redisHealth.pubsub
      }
    }

    if (!redisHealth.cache) {
      overallStatus = 'unhealthy'
    }

    // Check memory cache health
    const memoryStartTime = Date.now()
    try {
      const metrics = await getCacheMetrics()
      const memoryResponseTime = Date.now() - memoryStartTime
      
      components.memory = {
        status: 'healthy',
        responseTime: memoryResponseTime,
        details: {
          hitRate: metrics.overall?.overallHitRate || 0,
          totalRequests: metrics.overall?.totalHits + metrics.overall?.totalMisses || 0
        }
      }
    } catch (error) {
      components.memory = {
        status: 'unhealthy',
        responseTime: Date.now() - memoryStartTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
      overallStatus = 'unhealthy'
    }

    // Check cache monitoring health
    const monitoringStatus = cacheMonitor.getCurrentStatus()
    const activeAlerts = cacheMonitor.getActiveAlerts()
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical')

    components.monitoring = {
      status: monitoringStatus.healthy ? 'healthy' : 'degraded',
      details: {
        lastUpdate: monitoringStatus.lastUpdate,
        activeAlerts: monitoringStatus.activeAlerts,
        hitRate: monitoringStatus.hitRate,
        responseTime: monitoringStatus.responseTime
      }
    }

    if (!monitoringStatus.healthy) {
      overallStatus = criticalAlerts.length > 0 ? 'unhealthy' : 'degraded'
    }

    // Check CDN health (simulated)
    components.cdn = {
      status: 'healthy',
      details: {
        enabled: true,
        regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1']
      }
    }

    // Calculate overall metrics
    const totalResponseTime = Date.now() - startTime
    const metrics = {
      hitRate: monitoringStatus.hitRate,
      responseTime: monitoringStatus.responseTime,
      errorRate: 0, // Would calculate from error metrics
      uptime: process.uptime()
    }

    // Alert summary
    const alertSummary = {
      active: activeAlerts.length,
      critical: criticalAlerts.length
    }

    return NextResponse.json<HealthResponse>({
      success: true,
      data: {
        status: overallStatus,
        components,
        metrics,
        alerts: alertSummary,
        timestamp: new Date().toISOString()
      }
    }, {
      status: overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503
    })

  } catch (error) {
    console.error('Cache health check error:', error)
    return NextResponse.json<HealthResponse>({
      success: false,
      error: 'Health check failed'
    }, { status: 500 })
  }
}

export const GET = withAPIRateLimit('cache-health', 60)(healthCheck)

// Detailed diagnostics
async function diagnostics(request: NextRequest): Promise<NextResponse> {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      cache: {
        metrics: await getCacheMetrics(),
        monitoring: cacheMonitor.getCurrentStatus(),
        alerts: cacheMonitor.getActiveAlerts(),
        redis: await redisManager.healthCheck()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        redisHost: process.env.REDIS_HOST || 'localhost',
        redisPort: process.env.REDIS_PORT || '6379',
        cacheEnabled: process.env.ENABLE_CACHE !== 'false'
      }
    }

    return NextResponse.json({
      success: true,
      data: diagnostics
    })

  } catch (error) {
    console.error('Cache diagnostics error:', error)
    return NextResponse.json({
      success: false,
      error: 'Diagnostics failed'
    }, { status: 500 })
  }
}

export const POST = withAPIRateLimit('cache-diagnostics', 10)(diagnostics)
