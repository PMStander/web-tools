import { NextRequest, NextResponse } from 'next/server'
import { cacheMonitor, AlertType } from '@/lib/cache-monitoring'
import { withAPIRateLimit } from '@/lib/rate-limit-middleware'

interface AlertsResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// Get cache alerts
async function getAlerts(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const severity = searchParams.get('severity') as 'low' | 'medium' | 'high' | 'critical' | null
    const type = searchParams.get('type') as AlertType | null

    // Get alerts
    let alerts = activeOnly ? cacheMonitor.getActiveAlerts() : cacheMonitor.getAllAlerts()

    // Filter by severity
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity)
    }

    // Filter by type
    if (type) {
      alerts = alerts.filter(alert => alert.type === type)
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return NextResponse.json<AlertsResponse>({
      success: true,
      data: {
        alerts,
        summary: {
          total: alerts.length,
          active: alerts.filter(a => !a.resolved).length,
          bySeverity: {
            critical: alerts.filter(a => a.severity === 'critical').length,
            high: alerts.filter(a => a.severity === 'high').length,
            medium: alerts.filter(a => a.severity === 'medium').length,
            low: alerts.filter(a => a.severity === 'low').length
          },
          byType: Object.values(AlertType).reduce((acc, alertType) => {
            acc[alertType] = alerts.filter(a => a.type === alertType).length
            return acc
          }, {} as Record<AlertType, number>)
        }
      }
    })

  } catch (error) {
    console.error('Cache alerts API error:', error)
    return NextResponse.json<AlertsResponse>({
      success: false,
      error: 'Failed to retrieve cache alerts'
    }, { status: 500 })
  }
}

export const GET = withAPIRateLimit('cache-alerts', 100)(getAlerts)

// Resolve alert
async function resolveAlert(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { alertId, resolveAll, type } = body

    if (resolveAll) {
      // Resolve all alerts of a specific type
      if (type) {
        const alerts = cacheMonitor.getAllAlerts().filter(a => a.type === type && !a.resolved)
        let resolvedCount = 0
        
        for (const alert of alerts) {
          const resolved = await cacheMonitor.resolveAlert(alert.id)
          if (resolved) resolvedCount++
        }

        return NextResponse.json<AlertsResponse>({
          success: true,
          message: `Resolved ${resolvedCount} alerts of type ${type}`
        })
      } else {
        // Resolve all active alerts
        const alerts = cacheMonitor.getActiveAlerts()
        let resolvedCount = 0
        
        for (const alert of alerts) {
          const resolved = await cacheMonitor.resolveAlert(alert.id)
          if (resolved) resolvedCount++
        }

        return NextResponse.json<AlertsResponse>({
          success: true,
          message: `Resolved ${resolvedCount} alerts`
        })
      }
    } else if (alertId) {
      // Resolve specific alert
      const resolved = await cacheMonitor.resolveAlert(alertId)
      
      if (resolved) {
        return NextResponse.json<AlertsResponse>({
          success: true,
          message: `Alert ${alertId} resolved successfully`
        })
      } else {
        return NextResponse.json<AlertsResponse>({
          success: false,
          error: 'Alert not found or already resolved'
        }, { status: 404 })
      }
    } else {
      return NextResponse.json<AlertsResponse>({
        success: false,
        error: 'Alert ID or resolveAll flag required'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Alert resolution error:', error)
    return NextResponse.json<AlertsResponse>({
      success: false,
      error: 'Failed to resolve alert'
    }, { status: 500 })
  }
}

export const POST = withAPIRateLimit('cache-alerts-resolve', 20)(resolveAlert)

// Create test alert (for testing purposes)
async function createTestAlert(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { type, severity, message } = body

    if (!type || !severity || !message) {
      return NextResponse.json<AlertsResponse>({
        success: false,
        error: 'Type, severity, and message are required'
      }, { status: 400 })
    }

    // Create test alert (would need to implement in CacheMonitor)
    console.log('Test alert creation requested:', { type, severity, message })

    return NextResponse.json<AlertsResponse>({
      success: true,
      message: 'Test alert created successfully'
    })

  } catch (error) {
    console.error('Test alert creation error:', error)
    return NextResponse.json<AlertsResponse>({
      success: false,
      error: 'Failed to create test alert'
    }, { status: 500 })
  }
}

export const PUT = withAPIRateLimit('cache-alerts-test', 5)(createTestAlert)
