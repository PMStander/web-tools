/**
 * Advanced Multi-Tier Caching System with Performance Optimization
 * Implements Memory + Redis + CDN caching with intelligent eviction
 */

import { Redis } from 'ioredis';
import LRU from 'lru-cache';
import { performanceMonitor, PerformanceTimer } from './metrics';

export interface CacheConfig {
  memory: {
    maxSize: number;
    ttl: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    ttl: number;
  };
  cdn: {
    enabled: boolean;
    maxAge: number;
  };
}

export interface CacheEntry<T = any> {
  value: T;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
  ttl: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  memory: {
    size: number;
    maxSize: number;
    usage: number;
  };
  redis: {
    connected: boolean;
    commandsProcessed: number;
    memoryUsage: number;
  };
}

export class AdvancedCacheManager {
  private memoryCache: LRU<string, CacheEntry>;
  private redis: Redis;