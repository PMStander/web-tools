import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface CollageRequest {
  fileIds: string[] // Array of image file IDs
  layout: 'grid' | 'horizontal' | 'vertical' | 'custom'
  dimensions?: { width: number; height: number }
  spacing?: number // Gap between images in pixels
  backgroundColor?: string
  customPositions?: Array<{ fileId: string; x: number; y: number; width?: number; height?: number }>
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
    
    const body: CollageRequest = await request.json()
    const { 
      fileIds, 
      layout, 
      dimensions = { width: 1200, height: 800 }, 
      spacing = 10, 
      backgroundColor = '#ffffff',
      customPositions,
      outputFormat = 'png',
      outputName 
    } = body
    
    if (!fileIds || fileIds.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'At least 2 images are required for a collage'
      }, { status: 400 })
    }
    
    if (fileIds.length > 20) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 20 images allowed in a collage'
      }, { status: 400 })
    }
    
    // Load all images and get their metadata
    const images = []
    for (const fileId of fileIds) {
      const inputPath = join(UPLOAD_DIR, fileId)
      const image = sharp(inputPath)
      const metadata = await image.metadata()
      images.push({ image, metadata, fileId })
    }
    
    // Create background canvas
    const bgColor = backgroundColor.startsWith('#') 
      ? backgroundColor 
      : `#${backgroundColor.replace('#', '')}`
    
    const canvasSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}">
        <rect width="100%" height="100%" fill="${bgColor}" />
      </svg>
    `
    
    let canvas = sharp(Buffer.from(canvasSvg))
    const compositeInputs = []
    
    switch (layout) {
      case 'grid':
        // Arrange images in a grid
        const cols = Math.ceil(Math.sqrt(images.length))
        const rows = Math.ceil(images.length / cols)
        
        const cellWidth = Math.floor((dimensions.width - spacing * (cols + 1)) / cols)
        const cellHeight = Math.floor((dimensions.height - spacing * (rows + 1)) / rows)
        
        for (let i = 0; i < images.length; i++) {
          const row = Math.floor(i / cols)
          const col = i % cols
          
          const x = spacing + col * (cellWidth + spacing)
          const y = spacing + row * (cellHeight + spacing)
          
          const resizedImage = await images[i].image
            .resize(cellWidth, cellHeight, { fit: 'cover' })
            .toBuffer()
          
          compositeInputs.push({
            input: resizedImage,
            left: x,
            top: y
          })
        }
        break
        
      case 'horizontal':
        // Arrange images horizontally
        const imageWidth = Math.floor((dimensions.width - spacing * (images.length + 1)) / images.length)
        const imageHeight = dimensions.height - spacing * 2
        
        for (let i = 0; i < images.length; i++) {
          const x = spacing + i * (imageWidth + spacing)
          const y = spacing
          
          const resizedImage = await images[i].image
            .resize(imageWidth, imageHeight, { fit: 'cover' })
            .toBuffer()
          
          compositeInputs.push({
            input: resizedImage,
            left: x,
            top: y
          })
        }
        break
        
      case 'vertical':
        // Arrange images vertically
        const imgWidth = dimensions.width - spacing * 2
        const imgHeight = Math.floor((dimensions.height - spacing * (images.length + 1)) / images.length)
        
        for (let i = 0; i < images.length; i++) {
          const x = spacing
          const y = spacing + i * (imgHeight + spacing)
          
          const resizedImage = await images[i].image
            .resize(imgWidth, imgHeight, { fit: 'cover' })
            .toBuffer()
          
          compositeInputs.push({
            input: resizedImage,
            left: x,
            top: y
          })
        }
        break
        
      case 'custom':
        // Use custom positions
        if (!customPositions || customPositions.length !== images.length) {
          throw new Error('Custom layout requires position data for all images')
        }
        
        for (let i = 0; i < images.length; i++) {
          const position = customPositions[i]
          const imageData = images.find(img => img.fileId === position.fileId)
          
          if (!imageData) continue
          
          let processedImage = imageData.image
          
          if (position.width && position.height) {
            processedImage = processedImage.resize(position.width, position.height, { fit: 'cover' })
          }
          
          const imageBuffer = await processedImage.toBuffer()
          
          compositeInputs.push({
            input: imageBuffer,
            left: position.x,
            top: position.y
          })
        }
        break
        
      default:
        throw new Error(`Unsupported layout: ${layout}`)
    }
    
    // Composite all images onto the canvas
    if (compositeInputs.length > 0) {
      canvas = canvas.composite(compositeInputs)
    }
    
    // Apply output format
    const quality = body.quality || 90
    
    switch (outputFormat) {
      case 'jpeg': canvas = canvas.jpeg({ quality }); break
      case 'png': canvas = canvas.png({ quality }); break
      case 'webp': canvas = canvas.webp({ quality }); break
      case 'avif': canvas = canvas.avif({ quality }); break
    }
    
    const { data, info } = await canvas.toBuffer({ resolveWithObject: true })
    
    // Save result
    const outputFileId = uuidv4()
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : outputFormat
    const baseOutputName = outputName || `collage.${fileExtension}`
    const outputFileName = `${outputFileId}_${baseOutputName}`
    const outputPath = join(OUTPUT_DIR, outputFileName)
    
    await writeFile(outputPath, data)
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      layout,
      imageCount: images.length,
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
