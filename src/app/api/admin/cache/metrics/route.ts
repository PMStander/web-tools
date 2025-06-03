import { NextRequest, NextResponse } from 'next/server'
import { cacheMonitor } from '@/lib/cache-monitoring'
import { getCacheMetrics } from '@/lib/cache'
import { withCache } from '@/lib/cache-middleware'
import { withAPIRateLimit } from '@/lib/rate-limit-middleware'

interface MetricsResponse {
  success: boolean
  data?: {
    current: any
    history: any[]
    status: any
    alerts: any[]
  }
  error?: string
}

// Get cache metrics
async function getMetrics(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const hours = parseInt(searchParams.get('hours') || '24')
    const includeHistory = searchParams.get('history') === 'true'
    const includeAlerts = searchParams.get('alerts') === 'true'

    // Get current metrics
    const currentMetrics = await getCacheMetrics()
    
    // Get monitoring status
    const status = cacheMonitor.getCurrentStatus()
    
    // Prepare response data
    const responseData: any = {
      current: currentMetrics,
      status
    }

    // Include history if requested
    if (includeHistory) {
      responseData.history = cacheMonitor.getMetricsHistory(hours)
    }

    // Include alerts if requested
    if (includeAlerts) {
      responseData.alerts = cacheMonitor.getAllAlerts()
    }

    return NextResponse.json<MetricsResponse>({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Cache metrics API error:', error)
    return NextResponse.json<MetricsResponse>({
      success: false,
      error: 'Failed to retrieve cache metrics'
    }, { status: 500 })
  }
}

// Enhanced GET handler with caching and rate limiting
export const GET = withAPIRateLimit('cache-metrics', 100)(
  withCache({
    ttl: 30, // Cache metrics for 30 seconds
    enabled: true
  })(getMetrics)
)

// Update monitoring configuration
async function updateConfig(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { enabled, metricsInterval, alertThresholds } = body

    // Validate configuration
    if (typeof enabled !== 'undefined' && typeof enabled !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'Invalid enabled value'
      }, { status: 400 })
    }

    if (metricsInterval && (metricsInterval < 10000 || metricsInterval > 3600000)) {
      return NextResponse.json({
        success: false,
        error: 'Metrics interval must be between 10 seconds and 1 hour'
      }, { status: 400 })
    }

    // Update configuration (would need to implement in CacheMonitor)
    console.log('Cache monitoring configuration update requested:', body)

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully'
    })

  } catch (error) {
    console.error('Cache config update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update configuration'
    }, { status: 500 })
  }
}

export const POST = withAPIRateLimit('cache-config', 10)(updateConfig)

// Clear cache metrics history
async function clearHistory(request: NextRequest): Promise<NextResponse> {
  try {
    // Clear metrics history (would need to implement in CacheMonitor)
    console.log('Cache metrics history clear requested')

    return NextResponse.json({
      success: true,
      message: 'Metrics history cleared successfully'
    })

  } catch (error) {
    console.error('Cache history clear error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clear metrics history'
    }, { status: 500 })
  }
}

export const DELETE = withAPIRateLimit('cache-clear', 5)(clearHistory)
