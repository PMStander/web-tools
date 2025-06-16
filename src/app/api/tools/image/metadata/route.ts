import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface MetadataRequest {
  fileId: string
  action: 'extract' | 'remove' | 'modify'
  newMetadata?: {
    title?: string
    description?: string
    author?: string
    copyright?: string
    keywords?: string[]
  }
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
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
    
    const body: MetadataRequest = await request.json()
    const { fileId, action, newMetadata, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID is required'
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
    
    let pipeline = image
    let extractedMetadata = {}
    
    switch (action) {
      case 'extract':
        // Extract and return metadata without modifying image
        extractedMetadata = {
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          channels: metadata.channels,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha,
          orientation: metadata.orientation,
          exif: metadata.exif,
          icc: metadata.icc,
          iptc: metadata.iptc,
          xmp: metadata.xmp,
          size: metadata.size
        }
        
        return NextResponse.json({
          success: true,
          metadata: extractedMetadata,
          processingTime: Date.now() - startTime
        })
        
      case 'remove':
        // Remove all metadata
        pipeline = pipeline.withMetadata({})
        break
        
      case 'modify':
        // Modify metadata (simplified implementation)
        const metadataToSet: any = {}
        
        if (newMetadata?.title) metadataToSet.title = newMetadata.title
        if (newMetadata?.description) metadataToSet.description = newMetadata.description
        if (newMetadata?.author) metadataToSet.author = newMetadata.author
        if (newMetadata?.copyright) metadataToSet.copyright = newMetadata.copyright
        
        pipeline = pipeline.withMetadata(metadataToSet)
        break
        
      default:
        throw new Error(`Unsupported action: ${action}`)
    }
    
    // Apply output format
    const format = outputFormat || metadata.format as any || 'png'
    const quality = body.quality || 90
    
    switch (format) {
      case 'jpeg': pipeline = pipeline.jpeg({ quality }); break
      case 'png': pipeline = pipeline.png({ quality }); break
      case 'webp': pipeline = pipeline.webp({ quality }); break
      case 'avif': pipeline = pipeline.avif({ quality }); break
    }
    
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
    
    // Save result
    const outputFileId = uuidv4()
    const fileExtension = format === 'jpeg' ? 'jpg' : format
    const baseOutputName = outputName || `metadata-${action}-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    await writeFile(outputPath, data)
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      action,
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  
  if (!fileId) {
    return NextResponse.json({
      success: false,
      error: 'File ID is required'
    }, { status: 400 })
  }
  
  try {
    // Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
    const metadata = await sharp(inputPath).metadata()
    
    return NextResponse.json({
      success: true,
      metadata: {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
        size: metadata.size
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid image file'
    }, { status: 400 })
  }
}
