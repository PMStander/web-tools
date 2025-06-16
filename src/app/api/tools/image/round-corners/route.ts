import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface RoundCornersRequest {
  fileId: string
  radius: number // Corner radius in pixels
  corners?: 'all' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  backgroundColor?: string // Background color for transparent areas
  outputFormat?: 'png' | 'webp' | 'avif' // Note: JPEG doesn't support transparency
  quality?: number
  outputName?: string
}

// FileService handles directory paths
// FileService handles directory paths

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: RoundCornersRequest = await request.json()
    const { fileId, radius, corners = 'all', backgroundColor, outputFormat = 'png', outputName } = body
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    if (!radius || radius < 1) {
      return NextResponse.json({
        success: false,
        error: 'Corner radius must be at least 1 pixel'
      }, { status: 400 })
    }
    
    // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to determine image dimensions')
    }
    
    const maxRadius = Math.min(metadata.width, metadata.height) / 2
    const actualRadius = Math.min(radius, maxRadius)
    
    // Create SVG mask for rounded corners
    let maskSvg = ''
    
    switch (corners) {
      case 'all':
        maskSvg = `
          <svg width="${metadata.width}" height="${metadata.height}">
            <rect x="0" y="0" width="${metadata.width}" height="${metadata.height}" 
                  rx="${actualRadius}" ry="${actualRadius}" fill="white" />
          </svg>
        `
        break
        
      case 'top':
        maskSvg = `
          <svg width="${metadata.width}" height="${metadata.height}">
            <path d="M 0,${actualRadius} 
                     Q 0,0 ${actualRadius},0 
                     L ${metadata.width - actualRadius},0 
                     Q ${metadata.width},0 ${metadata.width},${actualRadius} 
                     L ${metadata.width},${metadata.height} 
                     L 0,${metadata.height} Z" fill="white" />
          </svg>
        `
        break
        
      case 'bottom':
        maskSvg = `
          <svg width="${metadata.width}" height="${metadata.height}">
            <path d="M 0,0 
                     L ${metadata.width},0 
                     L ${metadata.width},${metadata.height - actualRadius} 
                     Q ${metadata.width},${metadata.height} ${metadata.width - actualRadius},${metadata.height} 
                     L ${actualRadius},${metadata.height} 
                     Q 0,${metadata.height} 0,${metadata.height - actualRadius} Z" fill="white" />
          </svg>
        `
        break
        
      default:
        // For specific corners, use the all corners approach for simplicity
        maskSvg = `
          <svg width="${metadata.width}" height="${metadata.height}">
            <rect x="0" y="0" width="${metadata.width}" height="${metadata.height}" 
                  rx="${actualRadius}" ry="${actualRadius}" fill="white" />
          </svg>
        `
        break
    }
    
    let pipeline = image
    
    // Apply background color if specified
    if (backgroundColor) {
      const bgColor = backgroundColor.startsWith('#') 
        ? backgroundColor 
        : `#${backgroundColor.replace('#', '')}`
      
      // Create background
      const bgSvg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <rect width="100%" height="100%" fill="${bgColor}" />
        </svg>
      `
      
      pipeline = sharp(Buffer.from(bgSvg))
        .composite([{ input: await image.toBuffer(), blend: 'over' }])
    }
    
    // Apply rounded corners mask
    pipeline = pipeline.composite([{
      input: Buffer.from(maskSvg),
      blend: 'dest-in'
    }])
    
    // Apply output format
    const quality = body.quality || 90
    
    switch (outputFormat) {
      case 'png': pipeline = pipeline.png({ quality }); break
      case 'webp': pipeline = pipeline.webp({ quality }); break
      case 'avif': pipeline = pipeline.avif({ quality }); break
    }
    
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
    
    // Save result
    const outputFileId = uuidv4()
    const baseOutputName = outputName || `rounded-image.${outputFormat}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    await writeFile(outputPath, data)
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      radius: actualRadius,
      corners,
      dimensions: { width: info.width || 0, height: info.height || 0 },
      processingTime
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
