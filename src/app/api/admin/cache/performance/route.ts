import { NextRequest, NextResponse } from 'next/server'
import { 
  cachePerformanceOptimizer,
  PerformanceTestConfig,
  DEFAULT_PERFORMANCE_CONFIG 
} from '@/lib/cache-performance'
import { withAPIRateLimit } from '@/lib/rate-limit-middleware'

interface PerformanceResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// Get performance test results
async function getPerformanceResults(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const latest = searchParams.get('latest') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')

    let results
    if (latest) {
      const latestResult = cachePerformanceOptimizer.getLatestResult()
      results = latestResult ? [latestResult] : []
    } else {
      results = cachePerformanceOptimizer.getTestResults().slice(-limit)
    }

    return NextResponse.json<PerformanceResponse>({
      success: true,
      data: {
        results,
        isRunning: cachePerformanceOptimizer.isRunning(),
        defaultConfig: DEFAULT_PERFORMANCE_CONFIG
      }
    })

  } catch (error) {
    console.error('Performance results error:', error)
    return NextResponse.json<PerformanceResponse>({
      success: false,
      error: 'Failed to retrieve performance results'
    }, { status: 500 })
  }
}

export const GET = withAPIRateLimit('cache-performance-results', 30)(getPerformanceResults)

// Run performance test
async function runPerformanceTest(request: NextRequest): Promise<NextResponse> {
  try {
    if (cachePerformanceOptimizer.isRunning()) {
      return NextResponse.json<PerformanceResponse>({
        success: false,
        error: 'Performance test already running'
      }, { status: 409 })
    }

    const body = await request.json()
    const {
      targetHitRate,
      targetResponseTime,
      testDuration,
      concurrentRequests,
      engines,
      operations,
      fileSizes,
      warmupRequests,
      applyOptimizations = false
    } = body

    // Validate configuration
    const config: Partial<PerformanceTestConfig> = {}
    
    if (targetHitRate !== undefined) {
      if (targetHitRate < 50 || targetHitRate > 100) {
        return NextResponse.json<PerformanceResponse>({
          success: false,
          error: 'Target hit rate must be between 50% and 100%'
        }, { status: 400 })
      }
      config.targetHitRate = targetHitRate
    }

    if (targetResponseTime !== undefined) {
      if (targetResponseTime < 10 || targetResponseTime > 5000) {
        return NextResponse.json<PerformanceResponse>({
          success: false,
          error: 'Target response time must be between 10ms and 5000ms'
        }, { status: 400 })
      }
      config.targetResponseTime = targetResponseTime
    }

    if (testDuration !== undefined) {
      if (testDuration < 30000 || testDuration > 1800000) {
        return NextResponse.json<PerformanceResponse>({
          success: false,
          error: 'Test duration must be between 30 seconds and 30 minutes'
        }, { status: 400 })
      }
      config.testDuration = testDuration
    }

    if (concurrentRequests !== undefined) {
      if (concurrentRequests < 1 || concurrentRequests > 50) {
        return NextResponse.json<PerformanceResponse>({
          success: false,
          error: 'Concurrent requests must be between 1 and 50'
        }, { status: 400 })
      }
      config.concurrentRequests = concurrentRequests
    }

    if (engines) config.engines = engines
    if (operations) config.operations = operations
    if (fileSizes) config.fileSizes = fileSizes
    if (warmupRequests !== undefined) config.warmupRequests = warmupRequests

    // Start performance test (async)
    const testPromise = cachePerformanceOptimizer.runPerformanceTest(config)
    
    // Don't wait for completion, return immediately
    testPromise.then(async (result) => {
      console.log('Performance test completed:', result.testId)
      
      // Apply optimizations if requested
      if (applyOptimizations && !result.targetsMet.hitRate || !result.targetsMet.responseTime) {
        try {
          await cachePerformanceOptimizer.applyOptimizations(result)
          console.log('Automatic optimizations applied')
        } catch (error) {
          console.error('Failed to apply optimizations:', error)
        }
      }
    }).catch((error) => {
      console.error('Performance test failed:', error)
    })

    return NextResponse.json<PerformanceResponse>({
      success: true,
      message: 'Performance test started',
      data: {
        config,
        estimatedDuration: config.testDuration || DEFAULT_PERFORMANCE_CONFIG.testDuration
      }
    })

  } catch (error) {
    console.error('Performance test start error:', error)
    return NextResponse.json<PerformanceResponse>({
      success: false,
      error: 'Failed to start performance test'
    }, { status: 500 })
  }
}

export const POST = withAPIRateLimit('cache-performance-test', 5)(runPerformanceTest)

// Apply optimizations from test result
async function applyOptimizations(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { testId, force = false } = body

    if (!testId) {
      return NextResponse.json<PerformanceResponse>({
        success: false,
        error: 'Test ID required'
      }, { status: 400 })
    }

    const results = cachePerformanceOptimizer.getTestResults()
    const testResult = results.find(r => r.testId === testId)

    if (!testResult) {
      return NextResponse.json<PerformanceResponse>({
        success: false,
        error: 'Test result not found'
      }, { status: 404 })
    }

    // Check if optimizations are needed
    if (!force && testResult.targetsMet.hitRate && testResult.targetsMet.responseTime) {
      return NextResponse.json<PerformanceResponse>({
        success: true,
        message: 'No optimizations needed - all targets met',
        data: { targetsMet: testResult.targetsMet }
      })
    }

    // Apply optimizations
    await cachePerformanceOptimizer.applyOptimizations(testResult)

    return NextResponse.json<PerformanceResponse>({
      success: true,
      message: 'Optimizations applied successfully',
      data: {
        recommendations: testResult.recommendations,
        targetsMet: testResult.targetsMet
      }
    })

  } catch (error) {
    console.error('Optimization application error:', error)
    return NextResponse.json<PerformanceResponse>({
      success: false,
      error: 'Failed to apply optimizations'
    }, { status: 500 })
  }
}

export const PUT = withAPIRateLimit('cache-performance-optimize', 10)(applyOptimizations)

// Clear performance test results
async function clearResults(request: NextRequest): Promise<NextResponse> {
  try {
    if (cachePerformanceOptimizer.isRunning()) {
      return NextResponse.json<PerformanceResponse>({
        success: false,
        error: 'Cannot clear results while test is running'
      }, { status: 409 })
    }

    cachePerformanceOptimizer.clearResults()

    return NextResponse.json<PerformanceResponse>({
      success: true,
      message: 'Performance test results cleared'
    })

  } catch (error) {
    console.error('Clear results error:', error)
    return NextResponse.json<PerformanceResponse>({
      success: false,
      error: 'Failed to clear results'
    }, { status: 500 })
  }
}

export const DELETE = withAPIRateLimit('cache-performance-clear', 5)(clearResults)
