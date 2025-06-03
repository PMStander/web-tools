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
  if (!fileType || typeof fileType !== 'string') return 'File'
  if (fileType.startsWith('image/')) return 'Image'
  if (fileType.startsWith('video/')) return 'Video'
  if (fileType.includes('pdf') || fileType.includes('document')) return 'FileText'
  return 'File'
}
