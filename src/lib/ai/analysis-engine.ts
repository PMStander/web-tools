import { analyzeDocument, AIAnalysisResult } from './openai-client';
import { processDocument, ExtractedContent, cleanupTempFile } from './document-processor';
import { v4 as uuidv4 } from 'uuid';

export interface DocumentAnalysisRequest {
  filePath: string;
  fileName: string;
  analysisType?: 'full' | 'summary' | 'quick';
  userId?: string;
}

export interface DocumentAnalysisResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  extractedContent?: ExtractedContent;
  aiAnalysis?: AIAnalysisResult;
  error?: string;
  processingTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for analysis results (in production, use a database)
const analysisResults = new Map<string, DocumentAnalysisResponse>();

/**
 * Start document analysis process
 */
export async function startDocumentAnalysis(
  request: DocumentAnalysisRequest
): Promise<{ analysisId: string; status: string }> {
  const analysisId = uuidv4();
  const startTime = Date.now();
  
  // Initialize analysis record
  const analysisResult: DocumentAnalysisResponse = {
    id: analysisId,
    status: 'processing',
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  analysisResults.set(analysisId, analysisResult);
  
  // Start analysis in background
  processDocumentAnalysis(analysisId, request, startTime).catch(error => {
    console.error(`Analysis ${analysisId} failed:`, error);
    analysisResults.set(analysisId, {
      ...analysisResults.get(analysisId)!,
      status: 'failed',
      error: error.message,
      updatedAt: new Date()
    });
  });
  
  return {
    analysisId,
    status: 'processing'
  };
}

/**
 * Process document analysis (internal function)
 */
async function processDocumentAnalysis(
  analysisId: string,
  request: DocumentAnalysisRequest,
  startTime: number
): Promise<void> {
  try {
    // Update progress: Starting text extraction
    updateAnalysisProgress(analysisId, 10, 'Extracting text from document...');
    
    // Step 1: Extract text content
    const extractedContent = await processDocument(request.filePath);
    updateAnalysisProgress(analysisId, 30, 'Text extraction completed, starting AI analysis...');
    
    // Step 2: Perform AI analysis
    const aiAnalysis = await analyzeDocument(extractedContent.text);
    updateAnalysisProgress(analysisId, 90, 'AI analysis completed, finalizing results...');
    
    // Step 3: Finalize results
    const processingTime = Date.now() - startTime;
    const finalResult: DocumentAnalysisResponse = {
      id: analysisId,
      status: 'completed',
      progress: 100,
      extractedContent,
      aiAnalysis,
      processingTime,
      createdAt: analysisResults.get(analysisId)!.createdAt,
      updatedAt: new Date()
    };
    
    analysisResults.set(analysisId, finalResult);
    
    // Clean up temporary file
    cleanupTempFile(request.filePath);
    
  } catch (error) {
    console.error(`Document analysis failed for ${analysisId}:`, error);
    
    // Clean up temporary file even on error
    cleanupTempFile(request.filePath);
    
    throw error;
  }
}

/**
 * Update analysis progress
 */
function updateAnalysisProgress(analysisId: string, progress: number, status?: string): void {
  const current = analysisResults.get(analysisId);
  if (current) {
    analysisResults.set(analysisId, {
      ...current,
      progress,
      updatedAt: new Date()
    });
  }
}

/**
 * Get analysis result by ID
 */
export function getAnalysisResult(analysisId: string): DocumentAnalysisResponse | null {
  return analysisResults.get(analysisId) || null;
}

/**
 * Get all analysis results for a user (if userId tracking is implemented)
 */
export function getUserAnalysisResults(userId: string): DocumentAnalysisResponse[] {
  // This would typically query a database in production
  return Array.from(analysisResults.values())
    .filter(result => (result as any).userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Delete analysis result
 */
export function deleteAnalysisResult(analysisId: string): boolean {
  return analysisResults.delete(analysisId);
}

/**
 * Export analysis results in different formats
 */
export function exportAnalysisResult(
  analysisId: string,
  format: 'json' | 'csv' | 'text'
): string | null {
  const result = analysisResults.get(analysisId);
  if (!result || result.status !== 'completed' || !result.aiAnalysis) {
    return null;
  }
  
  const { aiAnalysis, extractedContent } = result;
  
  switch (format) {
    case 'json':
      return JSON.stringify({
        analysisId,
        fileName: extractedContent?.metadata.fileName,
        analysis: aiAnalysis,
        metadata: extractedContent?.metadata,
        exportedAt: new Date().toISOString()
      }, null, 2);
      
    case 'csv':
      // Simple CSV export for key data
      const csvData = [
        ['Field', 'Value'],
        ['Document', extractedContent?.metadata.fileName || 'Unknown'],
        ['Word Count', extractedContent?.metadata.wordCount?.toString() || '0'],
        ['Reading Time', `${extractedContent?.metadata.readingTime || 0} minutes`],
        ['Sentiment', aiAnalysis.sentiment.overall],
        ['Confidence', aiAnalysis.sentiment.confidence.toString()],
        ['Document Type', aiAnalysis.classification.documentType],
        ['Category', aiAnalysis.classification.category],
        ['Key Points', aiAnalysis.summary.keyPoints.join('; ')],
        ['Key Findings', aiAnalysis.insights.keyFindings.join('; ')],
        ['Recommendations', aiAnalysis.insights.recommendations.join('; ')],
        ['People', aiAnalysis.entities.people.join('; ')],
        ['Organizations', aiAnalysis.entities.organizations.join('; ')],
      ];
      
      return csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      
    case 'text':
      return `DOCUMENT ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
Document: ${extractedContent?.metadata.fileName || 'Unknown'}

SUMMARY
${aiAnalysis.summary.detailed}

KEY POINTS
${aiAnalysis.summary.keyPoints.map(point => `• ${point}`).join('\n')}

SENTIMENT ANALYSIS
Overall Sentiment: ${aiAnalysis.sentiment.overall}
Confidence: ${(aiAnalysis.sentiment.confidence * 100).toFixed(1)}%
Reasoning: ${aiAnalysis.sentiment.reasoning}

KEY FINDINGS
${aiAnalysis.insights.keyFindings.map(finding => `• ${finding}`).join('\n')}

RECOMMENDATIONS
${aiAnalysis.insights.recommendations.map(rec => `• ${rec}`).join('\n')}

EXTRACTED ENTITIES
People: ${aiAnalysis.entities.people.join(', ') || 'None'}
Organizations: ${aiAnalysis.entities.organizations.join(', ') || 'None'}
Dates: ${aiAnalysis.entities.dates.join(', ') || 'None'}
Locations: ${aiAnalysis.entities.locations.join(', ') || 'None'}

DOCUMENT CLASSIFICATION
Type: ${aiAnalysis.classification.documentType}
Category: ${aiAnalysis.classification.category}
Industry: ${aiAnalysis.classification.industry}
Tags: ${aiAnalysis.classification.tags.join(', ')}

METADATA
Word Count: ${extractedContent?.metadata.wordCount || 0}
Reading Time: ${extractedContent?.metadata.readingTime || 0} minutes
File Size: ${((extractedContent?.metadata.fileSize || 0) / 1024).toFixed(1)} KB
Processing Time: ${result.processingTime || 0}ms`;
      
    default:
      return null;
  }
}

/**
 * Clean up old analysis results (for memory management)
 */
export function cleanupOldResults(maxAge: number = 24 * 60 * 60 * 1000): void {
  const cutoff = Date.now() - maxAge;
  
  for (const [id, result] of analysisResults.entries()) {
    if (result.createdAt.getTime() < cutoff) {
      analysisResults.delete(id);
    }
  }
}
