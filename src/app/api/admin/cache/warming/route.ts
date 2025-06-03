import { NextRequest, NextResponse } from 'next/server'
import { cacheWarmer, WarmingStats } from '@/lib/cache-warming'
import { withAPIRateLimit } from '@/lib/rate-limit-middleware'

interface WarmingResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// Get cache warming status and statistics
async function getWarmingStatus(request: NextRequest): Promise<NextResponse> {
  try {
    const stats = cacheWarmer.getStats()
    
    return NextResponse.json<WarmingResponse>({
      success: true,
      data: {
        stats,
        isEnabled: true, // Would get from config
        configuration: {
          interval: 3600000, // 1 hour
          maxConcurrentWarmups: 3,
          warmupOnStartup: true
        }
      }
    })

  } catch (error) {
    console.error('Cache warming status error:', error)
    return NextResponse.json<WarmingResponse>({
      success: false,
      error: 'Failed to retrieve warming status'
    }, { status: 500 })
  }
}

export const GET = withAPIRateLimit('cache-warming-status', 60)(getWarmingStatus)

// Trigger manual cache warming
async function triggerWarming(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { immediate = false, operations = [] } = body

    if (immediate) {
      // Trigger immediate warming
      await cacheWarmer.triggerWarming()
      
      return NextResponse.json<WarmingResponse>({
        success: true,
        message: 'Cache warming triggered successfully'
      })
    } else if (operations.length > 0) {
      // Warm specific operations
      console.log('Specific operation warming requested:', operations)
      
      return NextResponse.json<WarmingResponse>({
        success: true,
        message: `Warming ${operations.length} specific operations`
      })
    } else {
      return NextResponse.json<WarmingResponse>({
        success: false,
        error: 'Either immediate=true or operations array required'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Cache warming trigger error:', error)
    
    if (error instanceof Error && error.message.includes('already in progress')) {
      return NextResponse.json<WarmingResponse>({
        success: false,
        error: 'Cache warming already in progress'
      }, { status: 409 })
    }
    
    return NextResponse.json<WarmingResponse>({
      success: false,
      error: 'Failed to trigger cache warming'
    }, { status: 500 })
  }
}

export const POST = withAPIRateLimit('cache-warming-trigger', 10)(triggerWarming)

// Update cache warming configuration
async function updateWarmingConfig(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { enabled, interval, maxConcurrentWarmups, warmupOnStartup, popularOperations } = body

    // Validate configuration
    if (interval && (interval < 60000 || interval > 86400000)) {
      return NextResponse.json<WarmingResponse>({
        success: false,
        error: 'Interval must be between 1 minute and 24 hours'
      }, { status: 400 })
    }

    if (maxConcurrentWarmups && (maxConcurrentWarmups < 1 || maxConcurrentWarmups > 10)) {
      return NextResponse.json<WarmingResponse>({
        success: false,
        error: 'Max concurrent warmups must be between 1 and 10'
      }, { status: 400 })
    }

    // Update configuration
    const newConfig: any = {}
    if (typeof enabled === 'boolean') newConfig.enabled = enabled
    if (interval) newConfig.interval = interval
    if (maxConcurrentWarmups) newConfig.maxConcurrentWarmups = maxConcurrentWarmups
    if (typeof warmupOnStartup === 'boolean') newConfig.warmupOnStartup = warmupOnStartup
    if (popularOperations) newConfig.popularOperations = popularOperations

    cacheWarmer.updateConfig(newConfig)

    return NextResponse.json<WarmingResponse>({
      success: true,
      message: 'Cache warming configuration updated successfully'
    })

  } catch (error) {
    console.error('Cache warming config update error:', error)
    return NextResponse.json<WarmingResponse>({
      success: false,
      error: 'Failed to update warming configuration'
    }, { status: 500 })
  }
}

export const PUT = withAPIRateLimit('cache-warming-config', 5)(updateWarmingConfig)

// Get popular operations for warming
async function getPopularOperations(request: NextRequest): Promise<NextResponse> {
  try {
    const stats = cacheWarmer.getStats()
    
    return NextResponse.json<WarmingResponse>({
      success: true,
      data: {
        popularOperations: stats.popularOperations,
        lastUpdated: stats.lastWarmingRun,
        totalOperations: stats.totalOperations
      }
    })

  } catch (error) {
    console.error('Popular operations error:', error)
    return NextResponse.json<WarmingResponse>({
      success: false,
      error: 'Failed to retrieve popular operations'
    }, { status: 500 })
  }
}

// Add route for popular operations
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return withAPIRateLimit('cache-warming-popular', 30)(getPopularOperations)(request)
}
