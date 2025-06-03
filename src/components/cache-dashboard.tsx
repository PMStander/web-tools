'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, XCircle, Activity, Database, Zap } from 'lucide-react'
 
interface CacheMetrics {
  hitRate: number
  responseTime: number
  totalRequests: number
  errors: number
  memoryUsage: number
}

interface CacheAlert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  components: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy'
    responseTime?: number
  }>
  metrics: CacheMetrics
  alerts: {
    active: number
    critical: number
  }
}

export function CacheDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [alerts, setAlerts] = useState<CacheAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cache data
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch health status
      const healthResponse = await fetch('/api/admin/cache/health')
      const healthData = await healthResponse.json()
      
      if (healthData.success) {
        setHealth(healthData.data)
      }

      // Fetch metrics
      const metricsResponse = await fetch('/api/admin/cache/metrics?history=true&alerts=true')
      const metricsData = await metricsResponse.json()
      
      if (metricsData.success) {
        setMetrics(metricsData.data)
        setAlerts(metricsData.data.alerts || [])
      }

      setError(null)
    } catch (err) {
      setError('Failed to fetch cache data')
      console.error('Cache dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/cache/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      })
      
      if (response.ok) {
        await fetchData() // Refresh data
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading cache dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'degraded': return 'bg-yellow-100 text-yellow-800'
      case 'unhealthy': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cache Dashboard</h1>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? <Activity className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(health.status)}
              Cache System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Badge className={getStatusColor(health.status)}>
                {health.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {health.metrics.hitRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Hit Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {health.metrics.responseTime.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {health.alerts.active}
                </div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {health.alerts.critical}
                </div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="components" className="space-y-4">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Components Status */}
        <TabsContent value="components">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {health?.components && Object.entries(health.components).map(([name, component]) => (
              <Card key={name}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {name === 'redis' && <Database className="h-4 w-4" />}
                    {name === 'memory' && <Zap className="h-4 w-4" />}
                    {name === 'monitoring' && <Activity className="h-4 w-4" />}
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getStatusColor(component.status)}>
                      {component.status}
                    </Badge>
                    {component.responseTime && (
                      <span className="text-sm text-gray-600">
                        {component.responseTime}ms
                      </span>
                    )}
                  </div>
                  {component.status !== 'healthy' && (
                    <p className="text-sm text-red-600 mt-2">
                      Component experiencing issues
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Metrics */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Real-time cache performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {health && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Hit Rate</span>
                      <span>{health.metrics.hitRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={health.metrics.hitRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Response Time</span>
                      <span>{health.metrics.responseTime.toFixed(0)}ms</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (200 - health.metrics.responseTime) / 2)} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {health.metrics.totalRequests.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {health.metrics.errors}
                      </div>
                      <div className="text-sm text-gray-600">Errors</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Cache system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.filter(alert => !alert.resolved).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {alert.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
