import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface SepiaRequest {
  fileId: string
  intensity?: number // 0-100, sepia intensity
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
    
    const body: SepiaRequest = await request.json()
    const { fileId, intensity = 100, outputFormat, outputName } = body
    
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
    
    // Apply sepia effect
    const sepiaIntensity = Math.max(0, Math.min(100, intensity)) / 100
    let pipeline = image
    
    // Convert to sepia using recomb matrix
    const sepiaMatrix = [
      [0.393 * sepiaIntensity + (1 - sepiaIntensity), 0.769 * sepiaIntensity, 0.189 * sepiaIntensity],
      [0.349 * sepiaIntensity, 0.686 * sepiaIntensity + (1 - sepiaIntensity), 0.168 * sepiaIntensity],
      [0.272 * sepiaIntensity, 0.534 * sepiaIntensity, 0.131 * sepiaIntensity + (1 - sepiaIntensity)]
    ]
    
    pipeline = pipeline.recomb(sepiaMatrix)
    
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
    const baseOutputName = outputName || `sepia-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    await writeFile(outputPath, data)
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      intensity,
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
