import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import * as mammoth from 'mammoth';

export interface ExtractedContent {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    readingTime: number; // in minutes
    fileSize: number;
    fileName: string;
    fileType: string;
  };
}

/**
 * Calculate estimated reading time based on word count
 */
function calculateReadingTime(wordCount: number): number {
  // Average reading speed: 200-250 words per minute
  return Math.ceil(wordCount / 225);
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Extract text from PDF files
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  // Verify file exists before processing
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found: ${filePath}`);
  }

  console.log(`Processing PDF file: ${filePath}`);

  try {
    // Use pdfjs-dist for robust PDF text extraction
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
    const data = new Uint8Array(fs.readFileSync(filePath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += (content.items as { str: string }[]).map(item => item.str).join(' ') + '\n';
    }
    console.log(`PDF text extracted successfully, length: ${text.length} characters`);
    return text;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`pdfjs-dist failed for file ${filePath}:`, errorMessage);
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
}

/**
 * Extract text from DOCX files
 */
export async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract text from DOCX: ${errorMessage}`);
  }
}

/**
 * Extract text from TXT files
 */
export async function extractTextFromTXT(filePath: string): Promise<string> {
  try {
    // Try different encodings
    const encodings: BufferEncoding[] = ['utf8', 'utf16le', 'latin1'];
    
    for (const encoding of encodings) {
      try {
        return fs.readFileSync(filePath, encoding);
      } catch (error: unknown) {
        if (encoding === encodings[encodings.length - 1]) {
          throw error;
        }
        // Try next encoding
      }
    }
    
    throw new Error('Unable to read file with any supported encoding');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract text from TXT: ${errorMessage}`);
  }
}

/**
 * Get PDF page count
 */
async function getPDFPageCount(filePath: string): Promise<number> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(fileBuffer);
    return pdfDoc.getPageCount();
  } catch (error: unknown) {
    console.warn('Could not get PDF page count:', error);
    return 0;
  }
}

/**
 * Process uploaded document and extract text content with metadata
 */
export async function processDocument(filePath: string): Promise<ExtractedContent> {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }
  
  const stats = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath).toLowerCase();
  
  let text: string;
  let pageCount: number | undefined;
  
  try {
    switch (fileExt) {
      case '.pdf':
        text = await extractTextFromPDF(filePath);
        pageCount = await getPDFPageCount(filePath);
        break;
        
      case '.docx':
        text = await extractTextFromDOCX(filePath);
        break;
        
      case '.txt':
        text = await extractTextFromTXT(filePath);
        break;
        
      default:
        throw new Error(`Unsupported file type: ${fileExt}`);
    }
    
    // Clean up text
    text = text.trim();
    if (!text) {
      throw new Error('No text content found in document');
    }
    
    const wordCount = countWords(text);
    const readingTime = calculateReadingTime(wordCount);
    
    return {
      text,
      metadata: {
        pageCount,
        wordCount,
        readingTime,
        fileSize: stats.size,
        fileName,
        fileType: fileExt.substring(1).toUpperCase()
      }
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Document processing failed: ${errorMessage}`);
  }
}

/**
 * Validate uploaded file
 */
export function validateDocumentFile(file: {
  name: string;
  size: number;
  type: string;
}): { valid: boolean; error?: string } {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  // Check file size
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 50MB limit'
    };
  }
  
  // Check file extension
  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload PDF, DOCX, or TXT files.'
    };
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type detected'
    };
  }
  
  return { valid: true };
}

/**
 * Clean up temporary file
 */
export function cleanupTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn('Failed to cleanup temp file:', error);
  }
}
