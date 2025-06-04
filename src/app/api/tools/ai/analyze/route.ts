import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  startDocumentAnalysis,
  getAnalysisResult,
  exportAnalysisResult 
} from '@/lib/ai/analysis-engine';
import { validateDocumentFile } from '@/lib/ai/document-processor';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * POST /api/tools/ai/analyze - Submit document for analysis
 */
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const analysisType = formData.get('analysisType') as string || 'full';
    const userId = formData.get('userId') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file
    const validation = validateDocumentFile({
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Save uploaded file
    const fileId = uuidv4();
    const fileName = `${fileId}_${file.name}`;
    const filePath = join(UPLOAD_DIR, fileName);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Start analysis
    const { analysisId } = await startDocumentAnalysis({
      filePath,
      fileName: file.name,
      analysisType: analysisType as 'full' | 'summary' | 'quick',
      userId
    });
    
    return NextResponse.json({
      success: true,
      analysisId,
      status: 'processing',
      message: 'Document analysis started successfully'
    });
    
  } catch (error) {
    console.error('Error starting document analysis:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tools/ai/analyze?id=analysisId - Get analysis status/results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');
    const format = searchParams.get('format') as 'json' | 'csv' | 'text' | null;
    
    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: 'Analysis ID required' },
        { status: 400 }
      );
    }
    
    const result = getAnalysisResult(analysisId);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    // If requesting export format
    if (format && result.status === 'completed') {
      const exportData = exportAnalysisResult(analysisId, format);
      
      if (!exportData) {
        return NextResponse.json(
          { success: false, error: 'Failed to export analysis' },
          { status: 500 }
        );
      }
      
      const contentTypes = {
        json: 'application/json',
        csv: 'text/csv',
        text: 'text/plain'
      };
      
      const fileExtensions = {
        json: 'json',
        csv: 'csv',
        text: 'txt'
      };
      
      return new Response(exportData, {
        headers: {
          'Content-Type': contentTypes[format],
          'Content-Disposition': `attachment; filename="analysis_${analysisId}.${fileExtensions[format]}"`
        }
      });
    }
    
    // Return analysis result
    return NextResponse.json({
      success: true,
      analysis: result
    });
    
  } catch (error) {
    console.error('Error retrieving analysis:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
