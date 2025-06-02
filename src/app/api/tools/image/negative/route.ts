import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface NegativeRequest {
  fileId: string
  preserveAlpha?: boolean
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  outputName?: string
}

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'outputs')

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    
    const body: NegativeRequest = await request.json()
    const { fileId, preserveAlpha = true, outputFormat, outputName } = body
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }
    
    const inputPath = join(UPLOAD_DIR, fileId)
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    
    // Apply negative effect by inverting colors
    let pipeline = image.negate({ alpha: !preserveAlpha })
    
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
    const baseOutputName = outputName || `negative-image.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    await writeFile(outputPath, data)
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      preserveAlpha,
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
