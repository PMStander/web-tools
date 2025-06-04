"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';

interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'failed';
  progress?: number;
  analysisId?: string;
  error?: string;
}

interface AnalysisUploaderProps {
  onAnalysisComplete?: (analysisId: string, fileName: string) => void;
  onAnalysisStart?: (analysisId: string, fileName: string) => void;
  maxFiles?: number;
  batchMode?: boolean;
}

export function AnalysisUploader({ 
  onAnalysisComplete,
  onAnalysisStart,
  maxFiles = 10,
  batchMode = false 
}: AnalysisUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending' as const
    }));

    setUploadedFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: batchMode,
    disabled: isUploading
  });

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(item => item.id !== id));
  };

  const uploadSingleFile = async (fileItem: FileUploadItem) => {
    const formData = new FormData();
    formData.append('file', fileItem.file);
    formData.append('analysisType', 'full');

    try {
      setUploadedFiles(prev => prev.map(item => 
        item.id === fileItem.id 
          ? { ...item, status: 'uploading', progress: 0 }
          : item
      ));

      const response = await fetch('/api/tools/ai/analyze', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles(prev => prev.map(item => 
          item.id === fileItem.id 
            ? { ...item, status: 'analyzing', analysisId: result.analysisId, progress: 10 }
            : item
        ));

        onAnalysisStart?.(result.analysisId, fileItem.file.name);
        
        // Poll for analysis completion
        pollAnalysisStatus(fileItem.id, result.analysisId);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadedFiles(prev => prev.map(item => 
        item.id === fileItem.id 
          ? { ...item, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
          : item
      ));
    }
  };

  const uploadBatchFiles = async () => {
    const pendingFiles = uploadedFiles.filter(item => item.status === 'pending');
    if (pendingFiles.length === 0) return;

    const formData = new FormData();
    pendingFiles.forEach(item => {
      formData.append('files', item.file);
    });
    formData.append('analysisType', 'full');

    try {
      setIsUploading(true);
      setUploadedFiles(prev => prev.map(item => 
        item.status === 'pending' ? { ...item, status: 'uploading' } : item
      ));

      const response = await fetch('/api/tools/ai/analyze/batch', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Start polling for batch status
        pollBatchStatus(result.batchId);
      } else {
        throw new Error(result.error || 'Batch upload failed');
      }
    } catch (error) {
      setUploadedFiles(prev => prev.map(item => 
        item.status === 'uploading' 
          ? { ...item, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
          : item
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const pollAnalysisStatus = async (fileId: string, analysisId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/tools/ai/analyze/${analysisId}`);
        const result = await response.json();

        if (result.success && result.analysis) {
          const analysis = result.analysis;
          
          setUploadedFiles(prev => prev.map(item => 
            item.id === fileId 
              ? { 
                  ...item, 
                  status: analysis.status === 'completed' ? 'completed' : 'analyzing',
                  progress: analysis.progress || 50,
                  error: analysis.error
                }
              : item
          ));

          if (analysis.status === 'completed') {
            onAnalysisComplete?.(analysisId, uploadedFiles.find(f => f.id === fileId)?.file.name || '');
            return;
          } else if (analysis.status === 'failed') {
            return;
          }
        }

        // Continue polling if still processing
        setTimeout(checkStatus, 2000);
      } catch (error) {
        console.error('Error polling analysis status:', error);
        setUploadedFiles(prev => prev.map(item => 
          item.id === fileId 
            ? { ...item, status: 'failed', error: 'Failed to check analysis status' }
            : item
        ));
      }
    };

    checkStatus();
  };

  const pollBatchStatus = async (batchId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/tools/ai/analyze/batch?id=${batchId}`);
        const result = await response.json();

        if (result.success && result.batch) {
          const batch = result.batch;
          
          // Update individual file statuses
          setUploadedFiles(prev => prev.map(item => {
            const batchFile = batch.files.find((f: any) => f.fileName === item.file.name);
            if (batchFile) {
              return {
                ...item,
                status: batchFile.status,
                analysisId: batchFile.analysisId,
                error: batchFile.error,
                progress: batchFile.result?.progress || (batchFile.status === 'completed' ? 100 : 50)
              };
            }
            return item;
          }));

          // Notify of completed analyses
          batch.files.forEach((batchFile: any) => {
            if (batchFile.status === 'completed' && batchFile.analysisId) {
              onAnalysisComplete?.(batchFile.analysisId, batchFile.fileName);
            }
            if (batchFile.status === 'processing' && batchFile.analysisId) {
              onAnalysisStart?.(batchFile.analysisId, batchFile.fileName);
            }
          });

          if (batch.status === 'completed' || batch.status === 'failed') {
            setIsUploading(false);
            return;
          }
        }

        // Continue polling if still processing
        setTimeout(checkStatus, 3000);
      } catch (error) {
        console.error('Error polling batch status:', error);
        setIsUploading(false);
      }
    };

    checkStatus();
  };

  const startAnalysis = () => {
    if (batchMode) {
      uploadBatchFiles();
    } else {
      const pendingFile = uploadedFiles.find(item => item.status === 'pending');
      if (pendingFile) {
        uploadSingleFile(pendingFile);
      }
    }
  };

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'uploading':
      case 'analyzing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'uploading':
      case 'analyzing':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const pendingCount = uploadedFiles.filter(f => f.status === 'pending').length;
  const processingCount = uploadedFiles.filter(f => ['uploading', 'analyzing'].includes(f.status)).length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-colors ${
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop documents here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Or click to select files • PDF, DOCX, TXT • Max 50MB each
              {batchMode && ` • Up to ${maxFiles} files`}
            </p>
            <Button variant="outline" disabled={isUploading}>
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                {pendingCount > 0 && (
                  <Button 
                    onClick={startAnalysis}
                    disabled={isUploading}
                    size="sm"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      `Analyze ${batchMode ? 'All' : 'Document'}`
                    )}
                  </Button>
                )}
              </div>

              {uploadedFiles.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {getStatusIcon(item.status)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    {item.progress !== undefined && (
                      <Progress value={item.progress} className="mt-1 h-1" />
                    )}
                    {item.error && (
                      <p className="text-xs text-red-500 mt-1">{item.error}</p>
                    )}
                  </div>

                  <Badge variant={getStatusColor(item.status)} className="text-xs">
                    {item.status === 'analyzing' ? 'Analyzing' : 
                     item.status === 'uploading' ? 'Uploading' :
                     item.status === 'completed' ? 'Complete' :
                     item.status === 'failed' ? 'Failed' : 'Ready'}
                  </Badge>

                  {item.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
