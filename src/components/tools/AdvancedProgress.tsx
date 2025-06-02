"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Pause, 
  Play, 
  RotateCcw,
  Zap,
  Timer
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcessingStage {
  id: string
  name: string
  description?: string
  status: 'pending' | 'active' | 'completed' | 'error' | 'paused'
  progress: number
  estimatedTime?: number // in seconds
  actualTime?: number
  error?: string
}

interface AdvancedProgressProps {
  stages: ProcessingStage[]
  currentStage?: string
  overallProgress: number
  canPause?: boolean
  canRetry?: boolean
  onPause?: () => void
  onResume?: () => void
  onRetry?: (stageId: string) => void
  onCancel?: () => void
  showTimeEstimates?: boolean
  showDetailedView?: boolean
  className?: string
}

export function AdvancedProgress({
  stages,
  currentStage,
  overallProgress,
  canPause = false,
  canRetry = false,
  onPause,
  onResume,
  onRetry,
  onCancel,
  showTimeEstimates = true,
  showDetailedView = false,
  className
}: AdvancedProgressProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!isPaused && stages.some(s => s.status === 'active')) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPaused, stages])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStageIcon = (stage: ProcessingStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'active':
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-300" />
    }
  }

  const getStatusColor = (status: ProcessingStage['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'active': return 'text-blue-600 bg-blue-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'paused': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const totalEstimatedTime = stages.reduce((acc, stage) => acc + (stage.estimatedTime || 0), 0)
  const completedStages = stages.filter(s => s.status === 'completed').length
  const activeStage = stages.find(s => s.status === 'active')

  const handlePauseResume = () => {
    if (isPaused) {
      onResume?.()
      setIsPaused(false)
    } else {
      onPause?.()
      setIsPaused(true)
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6 space-y-6">
        {/* Overall Progress Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Processing Files</h3>
              <p className="text-sm text-gray-500">
                {completedStages} of {stages.length} stages completed
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showTimeEstimates && (
                <div className="text-right text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Timer className="h-3 w-3" />
                    <span>{formatTime(elapsedTime)}</span>
                  </div>
                  {totalEstimatedTime > 0 && (
                    <div className="text-xs text-gray-400">
                      ~{formatTime(totalEstimatedTime)} total
                    </div>
                  )}
                </div>
              )}
              <Badge variant="outline" className="text-xs">
                {Math.round(overallProgress)}%
              </Badge>
            </div>
          </div>
          
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Stage List */}
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                stage.status === 'active' && "bg-blue-50/50 border-blue-200",
                stage.status === 'completed' && "bg-green-50/50 border-green-200",
                stage.status === 'error' && "bg-red-50/50 border-red-200"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                {getStageIcon(stage)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    {stage.status === 'active' && (
                      <Badge variant="outline" className="text-xs">
                        {stage.progress}%
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(stage.status))}
                    >
                      {stage.status}
                    </Badge>
                  </div>
                </div>
                
                {stage.description && (
                  <p className="text-xs text-gray-500">{stage.description}</p>
                )}
                
                {stage.status === 'active' && (
                  <Progress value={stage.progress} className="h-1" />
                )}
                
                {stage.status === 'error' && stage.error && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-red-600">{stage.error}</p>
                    {canRetry && onRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => onRetry(stage.id)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                )}
                
                {showTimeEstimates && showDetailedView && (
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {stage.estimatedTime && (
                      <span>Est: {formatTime(stage.estimatedTime)}</span>
                    )}
                    {stage.actualTime && (
                      <span>Actual: {formatTime(stage.actualTime)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Control Buttons */}
        {(canPause || canRetry || onCancel) && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {canPause && activeStage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePauseResume}
                  className="text-xs"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* Performance Insights */}
        {showDetailedView && completedStages > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Performance Insights</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-500">Average Stage Time</span>
                <span className="font-medium">
                  {formatTime(
                    stages
                      .filter(s => s.actualTime)
                      .reduce((acc, s) => acc + (s.actualTime || 0), 0) / completedStages
                  )}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500">Success Rate</span>
                <span className="font-medium">
                  {Math.round((completedStages / stages.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Circular Progress Variant
export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  children,
  className
}: {
  value: number
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300 ease-in-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
