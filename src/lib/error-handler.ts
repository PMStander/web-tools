// Error handling utilities for PDF processing APIs

export interface APIError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export class PDFProcessingError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'PDFProcessingError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Common error codes
export const ERROR_CODES = {
  // File errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_CORRUPTED: 'FILE_CORRUPTED',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  
  // Processing errors
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  EXTRACTION_FAILED: 'EXTRACTION_FAILED',
  CONVERSION_FAILED: 'CONVERSION_FAILED',
  OCR_FAILED: 'OCR_FAILED',
  COMPRESSION_FAILED: 'COMPRESSION_FAILED',
  
  // System errors
  INSUFFICIENT_MEMORY: 'INSUFFICIENT_MEMORY',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Validation errors
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Security errors
  SECURITY_SCAN_FAILED: 'SECURITY_SCAN_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED'
} as const

// Error message templates
export const ERROR_MESSAGES = {
  [ERROR_CODES.FILE_NOT_FOUND]: 'The requested file could not be found',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit',
  [ERROR_CODES.FILE_CORRUPTED]: 'The file appears to be corrupted or invalid',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'File type is not supported for this operation',
  [ERROR_CODES.PROCESSING_FAILED]: 'Failed to process the PDF file',
  [ERROR_CODES.EXTRACTION_FAILED]: 'Failed to extract text from the PDF',
  [ERROR_CODES.CONVERSION_FAILED]: 'Failed to convert the PDF to the requested format',
  [ERROR_CODES.OCR_FAILED]: 'OCR processing failed',
  [ERROR_CODES.COMPRESSION_FAILED]: 'Failed to compress the PDF file',
  [ERROR_CODES.INSUFFICIENT_MEMORY]: 'Insufficient memory to process this file',
  [ERROR_CODES.TIMEOUT]: 'Processing timeout - file may be too large or complex',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded - please try again later',
  [ERROR_CODES.INVALID_PARAMETERS]: 'Invalid parameters provided',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.SECURITY_SCAN_FAILED]: 'File failed security scan',
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access'
} as const

// Create standardized error response
export function createErrorResponse(error: PDFProcessingError | Error, processingTime?: number) {
  if (error instanceof PDFProcessingError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      processingTime
    }
  }

  // Handle generic errors
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    processingTime
  }
}

// Validate PDF file buffer
export function validatePDFBuffer(buffer: Buffer): void {
  if (!buffer || buffer.length === 0) {
    throw new PDFProcessingError(
      ERROR_CODES.FILE_CORRUPTED,
      ERROR_MESSAGES[ERROR_CODES.FILE_CORRUPTED],
      400
    )
  }

  // Check PDF signature
  const pdfSignature = buffer.subarray(0, 4)
  if (!pdfSignature.equals(Buffer.from('%PDF'))) {
    throw new PDFProcessingError(
      ERROR_CODES.INVALID_FILE_TYPE,
      'File is not a valid PDF document',
      400
    )
  }

  // Check minimum PDF size (should be at least a few KB)
  if (buffer.length < 1024) {
    throw new PDFProcessingError(
      ERROR_CODES.FILE_CORRUPTED,
      'PDF file is too small to be valid',
      400
    )
  }

  // Check maximum size (100MB)
  const MAX_SIZE = 100 * 1024 * 1024
  if (buffer.length > MAX_SIZE) {
    throw new PDFProcessingError(
      ERROR_CODES.FILE_TOO_LARGE,
      `PDF file exceeds maximum size of ${MAX_SIZE / 1024 / 1024}MB`,
      400
    )
  }
}

// Validate page parameters
export function validatePageParameters(pages: any, totalPages: number): number[] {
  if (!pages) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }

  if (pages === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i)
  }

  if (pages === 'first') {
    return [0]
  }

  if (pages === 'last') {
    return [totalPages - 1]
  }

  if (Array.isArray(pages)) {
    const validPages = pages.filter(p => 
      typeof p === 'number' && p >= 1 && p <= totalPages
    ).map(p => p - 1) // Convert to 0-based indexing

    if (validPages.length === 0) {
      throw new PDFProcessingError(
        ERROR_CODES.INVALID_PARAMETERS,
        'No valid page numbers provided',
        400
      )
    }

    return validPages
  }

  throw new PDFProcessingError(
    ERROR_CODES.INVALID_PARAMETERS,
    'Invalid page parameter format',
    400
  )
}

// Handle processing timeout
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new PDFProcessingError(
          ERROR_CODES.TIMEOUT,
          ERROR_MESSAGES[ERROR_CODES.TIMEOUT],
          408
        ))
      }, timeoutMs)
    })
  ])
}

// Memory usage monitoring
export function checkMemoryUsage(): void {
  const memUsage = process.memoryUsage()
  const maxMemory = 1024 * 1024 * 1024 // 1GB limit
  
  if (memUsage.heapUsed > maxMemory) {
    throw new PDFProcessingError(
      ERROR_CODES.INSUFFICIENT_MEMORY,
      ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_MEMORY],
      507
    )
  }
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): void {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }
  
  const current = rateLimitMap.get(identifier)
  
  if (!current) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now })
    return
  }
  
  if (current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now })
    return
  }
  
  if (current.count >= maxRequests) {
    throw new PDFProcessingError(
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
      429
    )
  }
  
  current.count++
}
