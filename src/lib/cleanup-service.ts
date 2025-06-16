import { readdir, stat, unlink, rmdir } from 'fs/promises';
import { join } from 'path';
import { logger } from './logger';

interface CleanupConfig {
  tempFileLifetime: number;     // in milliseconds
  outputFileLifetime: number;   // in milliseconds
  uploadFileLifetime: number;   // in milliseconds
  cleanupInterval: number;      // in milliseconds
  maxConcurrentCleanups: number;
  dryRun: boolean;
}

interface CleanupStats {
  filesScanned: number;
  filesDeleted: number;
  directoriesDeleted: number;
  bytesFreed: number;
  errors: number;
  duration: number;
}

export class CleanupService {
  private config: CleanupConfig;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private activeCleanups = 0;

  constructor(config?: Partial<CleanupConfig>) {
    this.config = {
      tempFileLifetime: parseInt(process.env.TEMP_FILE_LIFETIME || '7200000'), // 2 hours
      outputFileLifetime: parseInt(process.env.OUTPUT_FILE_LIFETIME || '86400000'), // 24 hours
      uploadFileLifetime: parseInt(process.env.UPLOAD_FILE_LIFETIME || '604800000'), // 7 days
      cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL || '3600000'), // 1 hour
      maxConcurrentCleanups: 3,
      dryRun: false,
      ...config
    };
  }

  /**
   * Start the automatic cleanup service
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Cleanup service is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting cleanup service', {
      category: 'cleanup',
      metadata: {
        tempFileLifetime: this.config.tempFileLifetime,
        outputFileLifetime: this.config.outputFileLifetime,
        uploadFileLifetime: this.config.uploadFileLifetime,
        cleanupInterval: this.config.cleanupInterval
      }
    });

    // Run initial cleanup
    this.runCleanupCycle().catch(error => {
      logger.error('Initial cleanup failed', error, { category: 'cleanup' });
    });

    // Schedule periodic cleanups
    this.intervalId = setInterval(() => {
      this.runCleanupCycle().catch(error => {
        logger.error('Scheduled cleanup failed', error, { category: 'cleanup' });
      });
    }, this.config.cleanupInterval);
  }

  /**
   * Stop the automatic cleanup service
   */
  stop(): void {
    if (!this.isRunning) {
      logger.warn('Cleanup service is not running');
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info('Cleanup service stopped', { category: 'cleanup' });
  }

  /**
   * Run a complete cleanup cycle
   */
  async runCleanupCycle(): Promise<CleanupStats> {
    if (this.activeCleanups >= this.config.maxConcurrentCleanups) {
      logger.warn('Maximum concurrent cleanups reached, skipping cycle', {
        category: 'cleanup',
        metadata: { activeCleanups: this.activeCleanups }
      });
      return this.getEmptyStats();
    }

    this.activeCleanups++;
    const startTime = Date.now();

    try {
      logger.info('Starting cleanup cycle', { category: 'cleanup' });

      const stats: CleanupStats = {
        filesScanned: 0,
        filesDeleted: 0,
        directoriesDeleted: 0,
        bytesFreed: 0,
        errors: 0,
        duration: 0
      };

      // Clean temp files
      const tempStats = await this.cleanupDirectory(
        process.env.TEMP_DIR || 'temp',
        this.config.tempFileLifetime,
        'temp files'
      );
      this.mergeStats(stats, tempStats);

      // Clean output files
      const outputStats = await this.cleanupDirectory(
        process.env.OUTPUTS_DIR || 'outputs',
        this.config.outputFileLifetime,
        'output files'
      );
      this.mergeStats(stats, outputStats);

      // Clean old uploads (optional, be more conservative)
      if (this.config.uploadFileLifetime > 0) {
        const uploadStats = await this.cleanupDirectory(
          process.env.UPLOADS_DIR || 'uploads',
          this.config.uploadFileLifetime,
          'upload files'
        );
        this.mergeStats(stats, uploadStats);
      }

      stats.duration = Date.now() - startTime;

      logger.info('Cleanup cycle completed', {
        category: 'cleanup',
        metadata: stats
      });

      return stats;

    } catch (error) {
      logger.error('Cleanup cycle failed', error, { category: 'cleanup' });
      throw error;
    } finally {
      this.activeCleanups--;
    }
  }

  /**
   * Clean up files in a specific directory
   */
  async cleanupDirectory(
    directory: string,
    maxAge: number,
    description: string
  ): Promise<CleanupStats> {
    const stats: CleanupStats = {
      filesScanned: 0,
      filesDeleted: 0,
      directoriesDeleted: 0,
      bytesFreed: 0,
      errors: 0,
      duration: 0
    };

    const startTime = Date.now();

    try {
      const dirPath = join(process.cwd(), directory);
      const cutoffTime = Date.now() - maxAge;

      logger.debug(`Cleaning ${description} in ${dirPath}`, {
        category: 'cleanup',
        metadata: { directory, maxAge, cutoffTime }
      });

      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.')) {
          continue; // Skip hidden files like .gitkeep
        }

        const entryPath = join(dirPath, entry.name);
        
        try {
          const fileStats = await stat(entryPath);
          stats.filesScanned++;

          // Check if file is old enough to be deleted
          if (fileStats.mtime.getTime() < cutoffTime) {
            if (this.config.dryRun) {
              logger.info(`[DRY RUN] Would delete: ${entryPath}`, {
                category: 'cleanup',
                metadata: {
                  size: fileStats.size,
                  age: Date.now() - fileStats.mtime.getTime(),
                  type: entry.isDirectory() ? 'directory' : 'file'
                }
              });
            } else {
              if (entry.isDirectory()) {
                await this.deleteDirectory(entryPath);
                stats.directoriesDeleted++;
              } else {
                await unlink(entryPath);
                stats.filesDeleted++;
                stats.bytesFreed += fileStats.size;
              }

              logger.debug(`Deleted: ${entryPath}`, {
                category: 'cleanup',
                metadata: {
                  size: fileStats.size,
                  type: entry.isDirectory() ? 'directory' : 'file'
                }
              });
            }
          }
        } catch (error) {
          stats.errors++;
          logger.error(`Error processing ${entryPath}`, error, {
            category: 'cleanup'
          });
        }
      }

      stats.duration = Date.now() - startTime;

      logger.info(`${description} cleanup completed`, {
        category: 'cleanup',
        metadata: {
          directory,
          ...stats
        }
      });

      return stats;

    } catch (error) {
      stats.errors++;
      logger.error(`Failed to clean directory ${directory}`, error, {
        category: 'cleanup'
      });
      return stats;
    }
  }

  /**
   * Recursively delete a directory
   */
  private async deleteDirectory(dirPath: string): Promise<void> {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await this.deleteDirectory(entryPath);
      } else {
        await unlink(entryPath);
      }
    }

    await rmdir(dirPath);
  }

  /**
   * Clean up specific file by ID
   */
  async cleanupFile(fileId: string): Promise<boolean> {
    const directories = [
      process.env.UPLOADS_DIR || 'uploads',
      process.env.OUTPUTS_DIR || 'outputs',
      process.env.TEMP_DIR || 'temp'
    ];

    let deleted = false;

    for (const dir of directories) {
      try {
        const dirPath = join(process.cwd(), dir);
        const entries = await readdir(dirPath);

        for (const entry of entries) {
          if (entry.startsWith(fileId)) {
            const filePath = join(dirPath, entry);
            
            if (this.config.dryRun) {
              logger.info(`[DRY RUN] Would delete file: ${filePath}`, {
                category: 'cleanup',
                fileId
              });
            } else {
              await unlink(filePath);
              deleted = true;
              
              logger.info('File deleted on demand', {
                category: 'cleanup',
                fileId,
                metadata: { filePath }
              });
            }
          }
        }
      } catch (error) {
        logger.error(`Error cleaning file ${fileId} from ${dir}`, error, {
          category: 'cleanup',
          fileId
        });
      }
    }

    return deleted;
  }

  /**
   * Get disk usage statistics
   */
  async getDiskUsage(): Promise<{
    uploads: { files: number; size: number };
    outputs: { files: number; size: number };
    temp: { files: number; size: number };
    total: { files: number; size: number };
  }> {
    const directories = {
      uploads: process.env.UPLOADS_DIR || 'uploads',
      outputs: process.env.OUTPUTS_DIR || 'outputs',
      temp: process.env.TEMP_DIR || 'temp'
    };

    const usage = {
      uploads: { files: 0, size: 0 },
      outputs: { files: 0, size: 0 },
      temp: { files: 0, size: 0 },
      total: { files: 0, size: 0 }
    };

    for (const [key, dir] of Object.entries(directories)) {
      try {
        const dirPath = join(process.cwd(), dir);
        const entries = await readdir(dirPath);

        for (const entry of entries) {
          if (entry.startsWith('.')) continue; // Skip hidden files

          const entryPath = join(dirPath, entry);
          const stats = await stat(entryPath);
          
          if (!stats.isDirectory()) {
            usage[key as keyof typeof usage].files++;
            usage[key as keyof typeof usage].size += stats.size;
          }
        }
      } catch (error) {
        logger.error(`Error getting disk usage for ${dir}`, error, {
          category: 'cleanup'
        });
      }
    }

    usage.total.files = usage.uploads.files + usage.outputs.files + usage.temp.files;
    usage.total.size = usage.uploads.size + usage.outputs.size + usage.temp.size;

    return usage;
  }

  /**
   * Emergency cleanup when disk space is low
   */
  async emergencyCleanup(): Promise<CleanupStats> {
    logger.warn('Running emergency cleanup', { category: 'cleanup' });

    // Use shorter lifetimes for emergency cleanup
    const oldConfig = { ...this.config };
    this.config.tempFileLifetime = Math.min(this.config.tempFileLifetime, 30 * 60 * 1000); // 30 minutes
    this.config.outputFileLifetime = Math.min(this.config.outputFileLifetime, 60 * 60 * 1000); // 1 hour

    try {
      const stats = await this.runCleanupCycle();
      logger.info('Emergency cleanup completed', {
        category: 'cleanup',
        metadata: stats
      });
      return stats;
    } finally {
      this.config = oldConfig;
    }
  }

  private mergeStats(target: CleanupStats, source: CleanupStats): void {
    target.filesScanned += source.filesScanned;
    target.filesDeleted += source.filesDeleted;
    target.directoriesDeleted += source.directoriesDeleted;
    target.bytesFreed += source.bytesFreed;
    target.errors += source.errors;
  }

  private getEmptyStats(): CleanupStats {
    return {
      filesScanned: 0,
      filesDeleted: 0,
      directoriesDeleted: 0,
      bytesFreed: 0,
      errors: 0,
      duration: 0
    };
  }
}

// Global cleanup service instance
export const cleanupService = new CleanupService();

// Auto-start cleanup service if enabled
if (process.env.ENABLE_FILE_CLEANUP === 'true' && process.env.NODE_ENV !== 'test') {
  cleanupService.start();
}

export type { CleanupConfig, CleanupStats };