import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { rateLimit } from './rate-limit'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
  requestId?: string
}

export interface ProcessingJob {
  id: string
  type: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  startTime: number
  endTime?: number
  inputFiles: string[]
  outputFiles?: string[]
  error?: string
  metadata?: Record<string, any>
}

// Rate limiting configuration
const rateLimitConfig = {
  upload: { requests: 10, window: 60 * 1000 }, // 10 uploads per minute
  processing: { requests: 20, window: 60 * 1000 }, // 20 processing requests per minute
  download: { requests: 100, window: 60 * 1000 }, // 100 downloads per minute
  default: { requests: 50, window: 60 * 1000 } // 50 requests per minute
}

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
}

// Generate unique request ID
export function generateRequestId(): string {
  return crypto.randomBytes(16).toString('hex')
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteAddr || 'unknown'
}

// Validate API key (for premium features)
export function validateApiKey(request: NextRequest): { valid: boolean; tier: string } {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return { valid: false, tier: 'free' }
  }
  
  // In production, validate against database
  // For now, simple validation
  if (apiKey.startsWith('pro_')) {
    return { valid: true, tier: 'pro' }
  }
  
  if (apiKey.startsWith('enterprise_')) {
    return { valid: true, tier: 'enterprise' }
  }
  
  return { valid: false, tier: 'free' }
}

// Apply rate limiting
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimitConfig = 'default'
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const clientIP = getClientIP(request)
  const config = rateLimitConfig[type]
  
  return await rateLimit(clientIP, config.requests, config.window)
}

// Validate file size limits based on user tier
export function validateFileSizeLimit(fileSize: number, userTier: string): boolean {
  const limits = {
    free: 50 * 1024 * 1024, // 50MB
    pro: 500 * 1024 * 1024, // 500MB
    enterprise: 2 * 1024 * 1024 * 1024 // 2GB
  }
  
  const limit = limits[userTier as keyof typeof limits] || limits.free
  return fileSize <= limit
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim()
    .substring(0, 255) // Limit length
}

// Validate file type
export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType)
}

// Create standardized API response
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    message,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  }
}

// Log API request
export function logApiRequest(
  request: NextRequest,
  response: { status: number; processingTime?: number },
  additionalData?: Record<string, any>
) {
  const logData = {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    clientIP: getClientIP(request),
    status: response.status,
    processingTime: response.processingTime,
    timestamp: new Date().toISOString(),
    ...additionalData
  }
  
  console.log('API Request:', JSON.stringify(logData))
}

// Error handler wrapper
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

// Async timeout wrapper
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ])
}

// File processing queue (in-memory for development)
class ProcessingQueue {
  private jobs = new Map<string, ProcessingJob>()
  
  addJob(job: ProcessingJob): void {
    this.jobs.set(job.id, job)
  }
  
  getJob(id: string): ProcessingJob | undefined {
    return this.jobs.get(id)
  }
  
  updateJob(id: string, updates: Partial<ProcessingJob>): void {
    const job = this.jobs.get(id)
    if (job) {
      Object.assign(job, updates)
    }
  }
  
  removeJob(id: string): void {
    this.jobs.delete(id)
  }
  
  getAllJobs(): ProcessingJob[] {
    return Array.from(this.jobs.values())
  }
  
  getJobsByStatus(status: ProcessingJob['status']): ProcessingJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status)
  }
}

export const processingQueue = new ProcessingQueue()

// Cleanup old files (run periodically)
export async function cleanupOldFiles(maxAgeHours = 24): Promise<void> {
  try {
    const { readdir, stat, unlink } = await import('fs/promises')
    const { join } = await import('path')
    
    const directories = [
      join(process.cwd(), 'uploads'),
      join(process.cwd(), 'outputs')
    ]
    
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000)
    
    for (const dir of directories) {
      try {
        const files = await readdir(dir)
        
        for (const file of files) {
          const filePath = join(dir, file)
          const stats = await stat(filePath)
          
          if (stats.mtime.getTime() < cutoffTime) {
            await unlink(filePath)
            console.log(`Cleaned up old file: ${filePath}`)
          }
        }
      } catch (error) {
        console.error(`Error cleaning directory ${dir}:`, error)
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

// Health check utilities
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    fileSystem: boolean
    processing: boolean
    memory: {
      used: number
      total: number
      percentage: number
    }
  }
  uptime: number
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const startTime = process.uptime()
  const memUsage = process.memoryUsage()
  
  // Check file system access
  let fileSystemHealthy = true
  try {
    const { access } = await import('fs/promises')
    await access(process.cwd())
  } catch {
    fileSystemHealthy = false
  }
  
  // Check processing queue
  const processingHealthy = processingQueue.getJobsByStatus('failed').length < 10
  
  const memoryPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100
  
  let status: HealthStatus['status'] = 'healthy'
  if (!fileSystemHealthy || !processingHealthy || memoryPercentage > 90) {
    status = 'unhealthy'
  } else if (memoryPercentage > 75) {
    status = 'degraded'
  }
  
  return {
    status,
    timestamp: new Date().toISOString(),
    services: {
      fileSystem: fileSystemHealthy,
      processing: processingHealthy,
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: Math.round(memoryPercentage * 100) / 100
      }
    },
    uptime: startTime
  }
}
