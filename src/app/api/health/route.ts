import { NextRequest, NextResponse } from 'next/server'
import { getHealthStatus, createApiResponse } from '@/lib/api-utils'
import { getAllRateLimits } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const healthStatus = await getHealthStatus()
    
    // Add additional health metrics
    const rateLimitStats = getAllRateLimits()
    const activeConnections = rateLimitStats.length
    
    const extendedHealth = {
      ...healthStatus,
      metrics: {
        activeRateLimits: activeConnections,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      }
    }
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503
    
    return NextResponse.json(
      createApiResponse(true, extendedHealth, undefined, 'Health check completed'),
      { status: statusCode }
    )
    
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      createApiResponse(false, undefined, 'Health check failed'),
      { status: 503 }
    )
  }
}

// Simple ping endpoint
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}
