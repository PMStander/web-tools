import { NextRequest, NextResponse } from 'next/server';
import { FileService, AppError } from '@/lib/file-service';
import { getAnalysisResult, exportAnalysisResult } from '@/lib/ai/analysis-engine';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/tools/ai/analyze/[id] - Get specific analysis result
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('export') as 'json' | 'csv' | 'text' | null;
    
    const result = getAnalysisResult(id);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    // If requesting export format
    if (format && result.status === 'completed') {
      const exportData = exportAnalysisResult(id, format);
      
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
      
      const fileName = result.extractedContent?.metadata.fileName || 'document';
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      return new Response(exportData, {
        headers: {
          'Content-Type': contentTypes[format],
          'Content-Disposition': `attachment; filename="${cleanFileName}_analysis.${fileExtensions[format]}"`
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
