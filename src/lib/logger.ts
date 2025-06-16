interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  category?: string;
  fileId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFileLogging: boolean;
  logFilePath?: string;
  categories?: string[];
}

class Logger {
  private config: LoggerConfig;
  private readonly levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.LOG_LEVEL as any || 'info',
      enableConsole: process.env.NODE_ENV !== 'test',
      enableFileLogging: false,
      ...config
    };
  }

  private shouldLog(level: LogEntry['level']): boolean {
    return this.levels[level] >= this.levels[this.config.level];
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, category, fileId, userId, metadata } = entry;
    
    let formatted = `[${timestamp}] ${level.toUpperCase()}`;
    
    if (category) formatted += ` [${category}]`;
    if (fileId) formatted += ` [File: ${fileId}]`;
    if (userId) formatted += ` [User: ${userId}]`;
    
    formatted += `: ${message}`;
    
    if (metadata && Object.keys(metadata).length > 0) {
      formatted += ` | ${JSON.stringify(metadata)}`;
    }
    
    return formatted;
  }

  private log(level: LogEntry['level'], message: string, options: Partial<LogEntry> = {}) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...options
    };

    if (this.config.enableConsole) {
      const formatted = this.formatMessage(entry);
      
      switch (level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted);
          if (entry.stack && process.env.NODE_ENV === 'development') {
            console.error(entry.stack);
          }
          break;
      }
    }

    // Future: Add file logging, external logging services, etc.
  }

  debug(message: string, options?: Partial<LogEntry>) {
    this.log('debug', message, options);
  }

  info(message: string, options?: Partial<LogEntry>) {
    this.log('info', message, options);
  }

  warn(message: string, options?: Partial<LogEntry>) {
    this.log('warn', message, options);
  }

  error(message: string, error?: Error | unknown, options?: Partial<LogEntry>) {
    const logOptions: Partial<LogEntry> = {
      ...options,
      stack: error instanceof Error ? error.stack : undefined,
      metadata: {
        ...options?.metadata,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    };

    this.log('error', message, logOptions);
  }

  // Specialized logging methods for common use cases
  fileOperation(operation: string, fileId: string, success: boolean = true, metadata?: Record<string, any>) {
    const level = success ? 'info' : 'error';
    const message = `File ${operation} ${success ? 'completed' : 'failed'}`;
    
    this.log(level, message, {
      category: 'file-operation',
      fileId,
      metadata: {
        operation,
        success,
        ...metadata
      }
    });
  }

  processingStart(tool: string, fileId: string, metadata?: Record<string, any>) {
    this.info(`Processing started: ${tool}`, {
      category: 'processing',
      fileId,
      metadata: {
        tool,
        startTime: Date.now(),
        ...metadata
      }
    });
  }

  processingComplete(tool: string, fileId: string, duration: number, metadata?: Record<string, any>) {
    this.info(`Processing completed: ${tool}`, {
      category: 'processing',
      fileId,
      metadata: {
        tool,
        duration,
        success: true,
        ...metadata
      }
    });
  }

  processingError(tool: string, fileId: string, error: Error | unknown, metadata?: Record<string, any>) {
    this.error(`Processing failed: ${tool}`, error, {
      category: 'processing',
      fileId,
      metadata: {
        tool,
        success: false,
        ...metadata
      }
    });
  }

  apiRequest(method: string, endpoint: string, status: number, duration: number, metadata?: Record<string, any>) {
    const level = status >= 400 ? 'warn' : status >= 500 ? 'error' : 'info';
    const message = `${method} ${endpoint} - ${status}`;
    
    this.log(level, message, {
      category: 'api',
      metadata: {
        method,
        endpoint,
        status,
        duration,
        ...metadata
      }
    });
  }

  security(event: string, details: Record<string, any>, severity: 'info' | 'warn' | 'error' = 'warn') {
    this.log(severity, `Security event: ${event}`, {
      category: 'security',
      metadata: details
    });
  }

  performance(metric: string, value: number, unit: string = 'ms', metadata?: Record<string, any>) {
    this.info(`Performance: ${metric} = ${value}${unit}`, {
      category: 'performance',
      metadata: {
        metric,
        value,
        unit,
        ...metadata
      }
    });
  }
}

// Create global logger instance
export const logger = new Logger();

// Export types for use in other modules
export type { LogEntry, LoggerConfig };
export { Logger };

// Utility function for request logging middleware
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const originalSend = res.send;

    res.send = function(body: any) {
      const duration = Date.now() - start;
      logger.apiRequest(
        req.method,
        req.originalUrl || req.url,
        res.statusCode,
        duration,
        {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          contentLength: body ? Buffer.byteLength(body) : 0
        }
      );
      
      return originalSend.call(this, body);
    };

    next();
  };
}