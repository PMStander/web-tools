/**
 * Performance Dashboard API
 * Real-time performance monitoring and analytics endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance/metrics';
import { cacheManager } from '@/lib/performance/cache-manager';