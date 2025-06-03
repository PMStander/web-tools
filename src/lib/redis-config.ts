import Redis, { RedisOptions } from 'ioredis'

// Redis configuration interface
export interface RedisConfig {
  host: string
  port: number
  password?: string
  db: number
  retryDelayOnFailover: number
  maxRetriesPerRequest: number
  lazyConnect: boolean
  keepAlive: number
  family: number
  connectTimeout: number
  commandTimeout: number
  enableOfflineQueue: boolean
}

// Environment-based Redis configuration
const getRedisConfig = (): RedisConfig => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    family: 4,
    connectTimeout: 10000,
    commandTimeout: 5000,
    enableOfflineQueue: false
  }
}

// Redis connection pools for different use cases
class RedisConnectionManager {
  private static instance: RedisConnectionManager
  private primaryClient: Redis | null = null
  private cacheClient: Redis | null = null
  private sessionClient: Redis | null = null
  private pubSubClient: Redis | null = null
  private config: RedisConfig

  private constructor() {
    this.config = getRedisConfig()
  }

  public static getInstance(): RedisConnectionManager {
    if (!RedisConnectionManager.instance) {
      RedisConnectionManager.instance = new RedisConnectionManager()
    }
    return RedisConnectionManager.instance
  }

  // Primary Redis client for general operations
  public getPrimaryClient(): Redis {
    if (!this.primaryClient) {
      this.primaryClient = new Redis({
        ...this.config,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      } as RedisOptions)

      this.setupClientEventHandlers(this.primaryClient, 'Primary')
    }
    return this.primaryClient
  }

  // Dedicated cache client with optimized settings
  public getCacheClient(): Redis {
    if (!this.cacheClient) {
      this.cacheClient = new Redis({
        ...this.config,
        db: (this.config.db || 0) + 1, // Use different DB for cache
        retryDelayOnFailover: 50,
        maxRetriesPerRequest: 2,
        commandTimeout: 3000, // Faster timeout for cache operations
        lazyConnect: true
      } as RedisOptions)

      this.setupClientEventHandlers(this.cacheClient, 'Cache')
    }
    return this.cacheClient
  }

  // Session client for user sessions
  public getSessionClient(): Redis {
    if (!this.sessionClient) {
      this.sessionClient = new Redis({
        ...this.config,
        db: (this.config.db || 0) + 2, // Use different DB for sessions
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      } as RedisOptions)

      this.setupClientEventHandlers(this.sessionClient, 'Session')
    }
    return this.sessionClient
  }

  // Pub/Sub client for real-time features
  public getPubSubClient(): Redis {
    if (!this.pubSubClient) {
      this.pubSubClient = new Redis({
        ...this.config,
        db: (this.config.db || 0) + 3, // Use different DB for pub/sub
        lazyConnect: true,
        enableOfflineQueue: false
      } as RedisOptions)

      this.setupClientEventHandlers(this.pubSubClient, 'PubSub')
    }
    return this.pubSubClient
  }

  // Setup event handlers for Redis clients
  private setupClientEventHandlers(client: Redis, clientType: string): void {
    client.on('connect', () => {
      console.log(`Redis ${clientType} client connected`)
    })

    client.on('ready', () => {
      console.log(`Redis ${clientType} client ready`)
    })

    client.on('error', (error) => {
      console.error(`Redis ${clientType} client error:`, error)
    })

    client.on('close', () => {
      console.log(`Redis ${clientType} client connection closed`)
    })

    client.on('reconnecting', () => {
      console.log(`Redis ${clientType} client reconnecting`)
    })

    client.on('end', () => {
      console.log(`Redis ${clientType} client connection ended`)
    })
  }

  // Health check for Redis connections
  public async healthCheck(): Promise<{
    primary: boolean
    cache: boolean
    session: boolean
    pubsub: boolean
  }> {
    const checkClient = async (client: Redis | null): Promise<boolean> => {
      if (!client) return false
      try {
        const result = await client.ping()
        return result === 'PONG'
      } catch (error) {
        console.error('Redis health check failed:', error)
        return false
      }
    }

    return {
      primary: await checkClient(this.primaryClient),
      cache: await checkClient(this.cacheClient),
      session: await checkClient(this.sessionClient),
      pubsub: await checkClient(this.pubSubClient)
    }
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    const clients = [
      this.primaryClient,
      this.cacheClient,
      this.sessionClient,
      this.pubSubClient
    ]

    await Promise.all(
      clients.map(async (client) => {
        if (client) {
          try {
            await client.quit()
          } catch (error) {
            console.error('Error during Redis client shutdown:', error)
          }
        }
      })
    )

    this.primaryClient = null
    this.cacheClient = null
    this.sessionClient = null
    this.pubSubClient = null
  }
}

// Export singleton instance
export const redisManager = RedisConnectionManager.getInstance()

// Export individual clients for convenience
export const primaryRedis = () => redisManager.getPrimaryClient()
export const cacheRedis = () => redisManager.getCacheClient()
export const sessionRedis = () => redisManager.getSessionClient()
export const pubsubRedis = () => redisManager.getPubSubClient()

// Redis key prefixes for different data types
export const REDIS_PREFIXES = {
  CACHE: 'cache:',
  SESSION: 'session:',
  FILE: 'file:',
  USER: 'user:',
  PROCESSING: 'processing:',
  ANALYTICS: 'analytics:',
  RATE_LIMIT: 'rate_limit:',
  LOCK: 'lock:'
} as const

// Redis TTL constants (in seconds)
export const REDIS_TTL = {
  VERY_SHORT: 60,        // 1 minute
  SHORT: 300,            // 5 minutes
  MEDIUM: 1800,          // 30 minutes
  LONG: 3600,            // 1 hour
  VERY_LONG: 86400,      // 24 hours
  WEEK: 604800,          // 7 days
  MONTH: 2592000         // 30 days
} as const

export default redisManager
