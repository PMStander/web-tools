import { join } from 'path';
import { readFile, stat, readdir } from 'fs/promises';
import { existsSync } from 'fs';

export interface FileMetadata {
  fileId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  category?: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

export class FileService {
  private static readonly UPLOAD_DIR = process.env.UPLOADS_DIR || 'uploads';
  private static readonly OUTPUT_DIR = process.env.OUTPUTS_DIR || 'outputs';
  private static readonly TEMP_DIR = process.env.TEMP_DIR || 'temp';

  /**
   * Resolve the file path for a given fileId
   * Checks both uploads and outputs directories
   */
  static async resolveFilePath(fileId: string): Promise<string | null> {
    try {
      // First, try to get metadata for the file
      const metadata = await this.getFileMetadata(fileId);
      if (metadata && existsSync(metadata.filePath)) {
        return metadata.filePath;
      }

      // Fallback: search in uploads directory
      const uploadPath = await this.findFileInDirectory(fileId, this.UPLOAD_DIR);
      if (uploadPath) {
        return uploadPath;
      }

      // Fallback: search in outputs directory
      const outputPath = await this.findFileInDirectory(fileId, this.OUTPUT_DIR);
      if (outputPath) {
        return outputPath;
      }

      return null;
    } catch (error) {
      console.error(`Error resolving file path for ${fileId}:`, error);
      return null;
    }
  }

  /**
   * Get file metadata from JSON file
   */
  static async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    const metadataPath = join(this.UPLOAD_DIR, `${fileId}.json`);
    try {
      const data = await readFile(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Find file in a specific directory by fileId
   */
  private static async findFileInDirectory(fileId: string, directory: string): Promise<string | null> {
    try {
      const files = await readdir(directory);
      
      for (const fileName of files) {
        // Skip metadata files
        if (fileName.endsWith('.json')) continue;
        
        // Check if filename starts with fileId or equals fileId
        if (fileName.startsWith(fileId) || fileName === fileId) {
          const filePath = join(directory, fileName);
          
          // Verify file exists and is accessible
          try {
            await stat(filePath);
            return filePath;
          } catch {
            continue;
          }
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Validate if a file exists and is accessible
   */
  static async validateFileExists(filePath: string): Promise<boolean> {
    try {
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file info including size and metadata
   */
  static async getFileInfo(fileId: string): Promise<{ path: string; metadata: FileMetadata | null; stats: any } | null> {
    const filePath = await this.resolveFilePath(fileId);
    if (!filePath) {
      return null;
    }

    try {
      const stats = await stat(filePath);
      const metadata = await this.getFileMetadata(fileId);
      
      return {
        path: filePath,
        metadata,
        stats
      };
    } catch (error) {
      console.error(`Error getting file info for ${fileId}:`, error);
      return null;
    }
  }

  /**
   * Generate a safe output file path
   */
  static generateOutputPath(outputFileId: string, originalName: string, suffix: string = ''): string {
    const fileExtension = originalName.split('.').pop() || '';
    const baseName = originalName.replace(/\.[^/.]+$/, ''); // Remove extension
    const outputName = suffix 
      ? `${outputFileId}_${baseName}${suffix}.${fileExtension}`
      : `${outputFileId}_${baseName}.${fileExtension}`;
    
    return join(this.OUTPUT_DIR, outputName);
  }

  /**
   * Generate a safe temp file path
   */
  static generateTempPath(fileId: string, extension: string = ''): string {
    const fileName = extension ? `${fileId}.${extension}` : fileId;
    return join(this.TEMP_DIR, fileName);
  }

  /**
   * Sanitize filename to prevent directory traversal
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .toLowerCase();
  }

  /**
   * Check if file size is within limits
   */
  static validateFileSize(size: number, category: 'pdf' | 'image' | 'video'): boolean {
    const limits = {
      pdf: parseInt(process.env.MAX_FILE_SIZE_PDF || '52428800'),      // 50MB
      image: parseInt(process.env.MAX_FILE_SIZE_IMAGE || '26214400'),  // 25MB
      video: parseInt(process.env.MAX_FILE_SIZE_VIDEO || '524288000')  // 500MB
    };

    return size <= limits[category];
  }

  /**
   * Get MIME type category
   */
  static getFileCategory(mimeType: string): 'pdf' | 'image' | 'video' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'other';
  }

  /**
   * Validate file type against allowed types
   */
  static validateFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  /**
   * Check if path is within allowed directories (security)
   */
  static isPathSafe(filePath: string): boolean {
    const allowedDirs = [this.UPLOAD_DIR, this.OUTPUT_DIR, this.TEMP_DIR];
    const resolvedPath = join(process.cwd(), filePath);
    
    return allowedDirs.some(dir => {
      const allowedDir = join(process.cwd(), dir);
      return resolvedPath.startsWith(allowedDir);
    });
  }
}