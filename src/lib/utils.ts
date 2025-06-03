import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared file size formatting function to prevent hydration issues
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Shared file icon utility to prevent hydration issues
export function getFileIcon(fileType: string | undefined | null): string {
  // More robust null/undefined checking
  if (!fileType || typeof fileType !== 'string' || fileType.length === 0) {
    return 'File'
  }

  // Ensure we have a valid string before calling string methods
  const safeFileType = String(fileType).toLowerCase()

  if (safeFileType.startsWith('image/')) return 'Image'
  if (safeFileType.startsWith('video/')) return 'Video'
  if (safeFileType.includes('pdf') || safeFileType.includes('document')) return 'FileText'
  return 'File'
}
