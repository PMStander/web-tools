import { NextRequest, NextResponse } from 'next/server';
import { FileService, AppError } from '@/lib/file-service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { startDocumentAnalysis, getAnalysisResult } from '@/lib/ai/analysis-engine';
import { validateDocumentFile } from '@/lib/ai/document-processor';

// FileService handles directory paths;

interface BatchRequest {
  batchId: string;
  files: Array<{
    analysisId: string;
    fileName: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
  }>;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for batch requests (in production, use a database)
const batchRequests = new Map<string, BatchRequest>();

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * POST /api/tools/ai/analyze/batch - Submit multiple documents for batch analysis
 */
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const analysisType = formData.get('analysisType') as string || 'full';
    const userId = formData.get('userId') as string;
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }
    
    if (files.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 files allowed per batch' },
        { status: 400 }
      );
    }
    
    // Validate all files first
    const validationErrors: string[] = [];
    files.forEach((file, index) => {
      const validation = validateDocumentFile({
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      if (!validation.valid) {
        validationErrors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
      }
    });
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    // Create batch request
    const batchId = uuidv4();
    const batchRequest: BatchRequest = {
      batchId,
      files: [],
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Process files and start analyses
    for (const file of files) {
      try {
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
        
        batchRequest.files.push({
          analysisId,
          fileName: file.name,
          status: 'processing'
        });
        
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        batchRequest.files.push({
          analysisId: '',
          fileName: file.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    batchRequests.set(batchId, batchRequest);
    
    // Start monitoring batch progress
    monitorBatchProgress(batchId);
    
    return NextResponse.json({
      success: true,
      batchId,
      status: 'processing',
      totalFiles: files.length,
      message: 'Batch analysis started successfully'
    });
    
  } catch (error) {
    console.error('Error starting batch analysis:', error);
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
 * GET /api/tools/ai/analyze/batch?id=batchId - Get batch processing status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('id');
    
    if (!batchId) {
      return NextResponse.json(
        { success: false, error: 'Batch ID required' },
        { status: 400 }
      );
    }
    
    const batchRequest = batchRequests.get(batchId);
    
    if (!batchRequest) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }
    
    // Update batch status by checking individual analyses
    updateBatchStatus(batchId);
    
    // Get updated batch request
    const updatedBatch = batchRequests.get(batchId)!;
    
    // Include individual analysis results if completed
    const filesWithResults = updatedBatch.files.map(file => {
      if (file.analysisId && (file.status === 'completed' || file.status === 'processing')) {
        const analysisResult = getAnalysisResult(file.analysisId);
        return {
          ...file,
          result: analysisResult
        };
      }
      return file;
    });
    
    return NextResponse.json({
      success: true,
      batch: {
        ...updatedBatch,
        files: filesWithResults
      }
    });
    
  } catch (error) {
    console.error('Error retrieving batch status:', error);
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
 * Monitor batch progress (internal function)
 */
async function monitorBatchProgress(batchId: string) {
  const checkInterval = setInterval(() => {
    updateBatchStatus(batchId);
    
    const batch = batchRequests.get(batchId);
    if (batch && (batch.status === 'completed' || batch.status === 'failed')) {
      clearInterval(checkInterval);
    }
  }, 2000); // Check every 2 seconds
  
  // Clear interval after 5 minutes to prevent memory leaks
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 5 * 60 * 1000);
}

/**
 * Update batch status based on individual file statuses
 */
function updateBatchStatus(batchId: string) {
  const batch = batchRequests.get(batchId);
  if (!batch) return;
  
  let completedCount = 0;
  let failedCount = 0;
  let processingCount = 0;
  
  // Update individual file statuses
  batch.files.forEach(file => {
    if (file.analysisId) {
      const result = getAnalysisResult(file.analysisId);
      if (result) {
        if (result.status === 'completed') {
          file.status = 'completed';
          completedCount++;
        } else if (result.status === 'failed') {
          file.status = 'failed';
          file.error = result.error;
          failedCount++;
        } else {
          file.status = 'processing';
          processingCount++;
        }
      }
    } else if (file.status === 'failed') {
      failedCount++;
    }
  });
  
  // Calculate progress
  const totalFiles = batch.files.length;
  const progress = Math.round(((completedCount + failedCount) / totalFiles) * 100);
  
  // Determine overall batch status
  let status: BatchRequest['status'];
  if (completedCount + failedCount === totalFiles) {
    status = failedCount === totalFiles ? 'failed' : 'completed';
  } else {
    status = 'processing';
  }
  
  // Update batch
  batch.progress = progress;
  batch.status = status;
  batch.updatedAt = new Date();
  
  batchRequests.set(batchId, batch);
}
