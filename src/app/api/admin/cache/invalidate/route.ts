import { NextRequest, NextResponse } from 'next/server'
import { 
  cacheInvalidationManager, 
  InvalidationStrategy,
  InvalidationRule 
} from '@/lib/cache-invalidation'
import { ProcessingEngine } from '@/lib/cache-architecture'
import { withAPIRateLimit } from '@/lib/rate-limit-middleware'

interface InvalidationResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// Get invalidation status and rules
async function getInvalidationStatus(request: NextRequest): Promise<NextResponse> {
  try {
    const stats = cacheInvalidationManager.getStats()
    const rules = cacheInvalidationManager.getRules()

    return NextResponse.json<InvalidationResponse>({
      success: true,
      data: {
        stats,
        rules: rules.map(rule => ({
          ...rule,
          // Don't expose internal schedule objects
          schedule: rule.schedule ? {
            interval: rule.schedule.interval,
            maxBatchSize: rule.schedule.maxBatchSize
          } : undefined
        }))
      }
    })

  } catch (error) {
    console.error('Cache invalidation status error:', error)
    return NextResponse.json<InvalidationResponse>({
      success: false,
      error: 'Failed to retrieve invalidation status'
    }, { status: 500 })
  }
}

export const GET = withAPIRateLimit('cache-invalidation-status', 60)(getInvalidationStatus)

// Manual cache invalidation
async function manualInvalidation(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { 
      type, 
      engine, 
      operation, 
      fileId, 
      pattern, 
      strategy = InvalidationStrategy.IMMEDIATE 
    } = body

    let result

    switch (type) {
      case 'engine':
        if (!engine) {
          return NextResponse.json<InvalidationResponse>({
            success: false,
            error: 'Engine parameter required for engine invalidation'
          }, { status: 400 })
        }
        result = await cacheInvalidationManager.invalidateByEngine(engine as ProcessingEngine)
        break

      case 'operation':
        if (!engine || !operation) {
          return NextResponse.json<InvalidationResponse>({
            success: false,
            error: 'Engine and operation parameters required for operation invalidation'
          }, { status: 400 })
        }
        result = await cacheInvalidationManager.invalidateByOperation(
          engine as ProcessingEngine, 
          operation
        )
        break

      case 'file':
        if (!fileId) {
          return NextResponse.json<InvalidationResponse>({
            success: false,
            error: 'FileId parameter required for file invalidation'
          }, { status: 400 })
        }
        result = await cacheInvalidationManager.invalidateByFileId(fileId)
        break

      case 'pattern':
        if (!pattern) {
          return NextResponse.json<InvalidationResponse>({
            success: false,
            error: 'Pattern parameter required for pattern invalidation'
          }, { status: 400 })
        }
        
        const customRule: InvalidationRule = {
          id: `manual-pattern-${Date.now()}`,
          name: 'Manual pattern invalidation',
          strategy: strategy as InvalidationStrategy,
          pattern,
          enabled: true
        }
        
        result = await cacheInvalidationManager.executeRule(customRule)
        break

      case 'all':
        // Invalidate all caches
        const allRule: InvalidationRule = {
          id: `manual-all-${Date.now()}`,
          name: 'Manual all cache invalidation',
          strategy: InvalidationStrategy.IMMEDIATE,
          pattern: '*',
          enabled: true
        }
        
        result = await cacheInvalidationManager.executeRule(allRule)
        break

      default:
        return NextResponse.json<InvalidationResponse>({
          success: false,
          error: 'Invalid invalidation type. Use: engine, operation, file, pattern, or all'
        }, { status: 400 })
    }

    return NextResponse.json<InvalidationResponse>({
      success: true,
      data: result,
      message: `Invalidation completed: ${result.entriesInvalidated} entries removed`
    })

  } catch (error) {
    console.error('Manual invalidation error:', error)
    return NextResponse.json<InvalidationResponse>({
      success: false,
      error: 'Failed to perform manual invalidation'
    }, { status: 500 })
  }
}

export const POST = withAPIRateLimit('cache-invalidation-manual', 20)(manualInvalidation)

// Add or update invalidation rule
async function updateInvalidationRule(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { 
      id, 
      name, 
      strategy, 
      pattern, 
      conditions, 
      schedule, 
      enabled = true 
    } = body

    if (!id || !name || !strategy || !pattern) {
      return NextResponse.json<InvalidationResponse>({
        success: false,
        error: 'Required fields: id, name, strategy, pattern'
      }, { status: 400 })
    }

    // Validate strategy
    if (!Object.values(InvalidationStrategy).includes(strategy)) {
      return NextResponse.json<InvalidationResponse>({
        success: false,
        error: `Invalid strategy. Use: ${Object.values(InvalidationStrategy).join(', ')}`
      }, { status: 400 })
    }

    // Validate schedule for scheduled strategy
    if (strategy === InvalidationStrategy.SCHEDULED && !schedule) {
      return NextResponse.json<InvalidationResponse>({
        success: false,
        error: 'Schedule configuration required for scheduled strategy'
      }, { status: 400 })
    }

    const rule: InvalidationRule = {
      id,
      name,
      strategy,
      pattern,
      conditions,
      schedule,
      enabled
    }

    cacheInvalidationManager.addRule(rule)

    return NextResponse.json<InvalidationResponse>({
      success: true,
      message: `Invalidation rule ${id} ${enabled ? 'added' : 'updated'} successfully`
    })

  } catch (error) {
    console.error('Invalidation rule update error:', error)
    return NextResponse.json<InvalidationResponse>({
      success: false,
      error: 'Failed to update invalidation rule'
    }, { status: 500 })
  }
}

export const PUT = withAPIRateLimit('cache-invalidation-rules', 10)(updateInvalidationRule)

// Delete invalidation rule
async function deleteInvalidationRule(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('ruleId')

    if (!ruleId) {
      return NextResponse.json<InvalidationResponse>({
        success: false,
        error: 'Rule ID parameter required'
      }, { status: 400 })
    }

    const removed = cacheInvalidationManager.removeRule(ruleId)

    if (removed) {
      return NextResponse.json<InvalidationResponse>({
        success: true,
        message: `Invalidation rule ${ruleId} removed successfully`
      })
    } else {
      return NextResponse.json<InvalidationResponse>({
        success: false,
        error: 'Rule not found'
      }, { status: 404 })
    }

  } catch (error) {
    console.error('Invalidation rule deletion error:', error)
    return NextResponse.json<InvalidationResponse>({
      success: false,
      error: 'Failed to delete invalidation rule'
    }, { status: 500 })
  }
}

export const DELETE = withAPIRateLimit('cache-invalidation-delete', 10)(deleteInvalidationRule)
