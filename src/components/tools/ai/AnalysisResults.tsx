"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Brain, 
  Search, 
  BarChart3, 
  Lightbulb,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Mail,
  Building,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { DocumentAnalysisResponse } from '@/lib/ai/analysis-engine';

interface AnalysisResultsProps {
  analysisId: string;
  analysisData?: DocumentAnalysisResponse | null; // Optional, component will fetch if not provided
}

export function AnalysisResults({ analysisId, analysisData: providedData }: AnalysisResultsProps) {
  const [analysisData, setAnalysisData] = useState<DocumentAnalysisResponse | null>(providedData || null);
  const [loading, setLoading] = useState(!providedData);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'text'>('json');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!providedData && analysisId) {
        try {
          setLoading(true);
          const response = await fetch(`/api/tools/ai/analyze/${analysisId}`);
          
          if (response.ok) {
            const data: DocumentAnalysisResponse = await response.json();
            setAnalysisData(data);
            setError(null);
          } else {
            throw new Error('Failed to fetch analysis data');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [analysisId, providedData]);

  // Type guards to ensure data is available and complete
  const hasValidData = analysisData && 
                      analysisData.status === 'completed' && 
                      analysisData.extractedContent && 
                      analysisData.aiAnalysis;

  const safeExtractedContent = hasValidData ? analysisData.extractedContent : null;
  const safeAiAnalysis = hasValidData ? analysisData.aiAnalysis : null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/tools/ai/analyze/${analysisId}?export=${exportFormat}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `analysis_${analysisId}.${exportFormat === 'text' ? 'txt' : exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (exportError) {
      console.error('Export error:', exportError);
      // You might want to show a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-500">Loading analysis results...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-4" />
          <p className="text-red-500 mb-4">Error loading analysis: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasValidData || !safeAiAnalysis || !safeExtractedContent) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Analysis Results</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {safeExtractedContent?.metadata?.fileName || 'Unknown file'} • {safeExtractedContent?.metadata?.wordCount || 0} words • {safeExtractedContent?.metadata?.readingTime || 0} min read
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'text')}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="text">Text Report</option>
              </select>
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="classification">Classification</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Brief Overview</h4>
                <p className="text-gray-700">{safeAiAnalysis.summary.brief}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Detailed Summary</h4>
                <p className="text-gray-700">{safeAiAnalysis.summary.detailed}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Key Points</h4>
                <ul className="space-y-2">
                  {safeAiAnalysis.summary.keyPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entities Tab */}
        <TabsContent value="entities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* People */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>People</span>
                  <Badge variant="secondary">{safeAiAnalysis.entities.people.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {safeAiAnalysis.entities.people.map((person: string, index: number) => (
                    <Badge key={index} variant="outline">{person}</Badge>
                  ))}
                  {safeAiAnalysis.entities.people.length === 0 && (
                    <p className="text-sm text-gray-500">No people identified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Building className="h-4 w-4" />
                  <span>Organizations</span>
                  <Badge variant="secondary">{safeAiAnalysis.entities.organizations.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {safeAiAnalysis.entities.organizations.map((org: string, index: number) => (
                    <Badge key={index} variant="outline">{org}</Badge>
                  ))}
                  {safeAiAnalysis.entities.organizations.length === 0 && (
                    <p className="text-sm text-gray-500">No organizations identified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>Locations</span>
                  <Badge variant="secondary">{safeAiAnalysis.entities.locations.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {safeAiAnalysis.entities.locations.map((location: string, index: number) => (
                    <Badge key={index} variant="outline">{location}</Badge>
                  ))}
                  {safeAiAnalysis.entities.locations.length === 0 && (
                    <p className="text-sm text-gray-500">No locations identified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Dates</span>
                  <Badge variant="secondary">{safeAiAnalysis.entities.dates.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {safeAiAnalysis.entities.dates.map((date: string, index: number) => (
                    <Badge key={index} variant="outline">{date}</Badge>
                  ))}
                  {safeAiAnalysis.entities.dates.length === 0 && (
                    <p className="text-sm text-gray-500">No dates identified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>Contact Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {safeAiAnalysis.entities.emails.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Emails</p>
                    <div className="flex flex-wrap gap-1">
                      {safeAiAnalysis.entities.emails.map((email: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">{email}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {safeAiAnalysis.entities.phoneNumbers.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Phone Numbers</p>
                    <div className="flex flex-wrap gap-1">
                      {safeAiAnalysis.entities.phoneNumbers.map((phone: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">{phone}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {safeAiAnalysis.entities.urls.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">URLs</p>
                    <div className="flex flex-wrap gap-1">
                      {safeAiAnalysis.entities.urls.map((url: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">{url}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monetary Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>Monetary Values</span>
                  <Badge variant="secondary">{safeAiAnalysis.entities.monetaryValues.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {safeAiAnalysis.entities.monetaryValues.map((value: string, index: number) => (
                    <Badge key={index} variant="outline">{value}</Badge>
                  ))}
                  {safeAiAnalysis.entities.monetaryValues.length === 0 && (
                    <p className="text-sm text-gray-500">No monetary values identified</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Sentiment Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg border ${getSentimentColor(safeAiAnalysis.sentiment.overall)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Overall Sentiment</p>
                    <p className="text-sm opacity-80">{safeAiAnalysis.sentiment.reasoning}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold capitalize">{safeAiAnalysis.sentiment.overall}</p>
                    <p className="text-sm">Confidence: {(safeAiAnalysis.sentiment.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Key Findings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Key Findings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {safeAiAnalysis.insights.keyFindings.map((finding: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {safeAiAnalysis.insights.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Action Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {safeAiAnalysis.insights.actionItems.map((action: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Document Properties */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Document Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Complexity</p>
                    <Badge className={getComplexityColor(safeAiAnalysis.insights.complexity)}>
                      {safeAiAnalysis.insights.complexity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Target Audience</p>
                    <p className="text-sm">{safeAiAnalysis.insights.targetAudience}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Purpose</p>
                    <p className="text-sm">{safeAiAnalysis.insights.purpose}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Processing Time</p>
                    <p className="text-sm">{analysisData.processingTime || 0}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Classification Tab */}
        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Classification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Document Type</p>
                  <Badge variant="outline">{safeAiAnalysis.classification.documentType}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Category</p>
                  <Badge variant="outline">{safeAiAnalysis.classification.category}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Industry</p>
                  <Badge variant="outline">{safeAiAnalysis.classification.industry}</Badge>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Confidence Score</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${safeAiAnalysis.classification.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{(safeAiAnalysis.classification.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {safeAiAnalysis.classification.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
