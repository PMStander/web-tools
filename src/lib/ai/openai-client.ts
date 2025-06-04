import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalysisPrompts {
  summarization: string;
  entityExtraction: string;
  sentimentAnalysis: string;
  insights: string;
  classification: string;
}

export interface AIAnalysisResult {
  summary: {
    brief: string;
    detailed: string;
    keyPoints: string[];
  };
  entities: {
    people: string[];
    organizations: string[];
    dates: string[];
    locations: string[];
    monetaryValues: string[];
    emails: string[];
    phoneNumbers: string[];
    urls: string[];
  };
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral';
    confidence: number;
    reasoning: string;
  };
  insights: {
    keyFindings: string[];
    recommendations: string[];
    actionItems: string[];
    complexity: 'low' | 'medium' | 'high';
    targetAudience: string;
    purpose: string;
  };
  classification: {
    documentType: string;
    category: string;
    industry: string;
    confidence: number;
    tags: string[];
  };
}

/**
 * Splits text into chunks that fit within OpenAI's token limits
 */
export function chunkText(text: string, maxTokens: number = 3500): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // Rough token estimation: ~4 chars per token
    const estimatedTokens = (currentChunk + sentence).length / 4;
    
    if (estimatedTokens > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Generate document summary using OpenAI GPT-4
 */
export async function generateSummary(text: string): Promise<{ brief: string; detailed: string; keyPoints: string[] }> {
  try {
    const chunks = chunkText(text);
    const summaries: string[] = [];
    
    // Process each chunk
    for (const chunk of chunks) {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert document analyst. Summarize the provided text focusing on key insights, decisions, and important information. Be concise but comprehensive.`
          },
          {
            role: "user",
            content: `Please analyze and summarize this text:\n\n${chunk}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });
      
      summaries.push(response.choices[0].message.content || '');
    }
    
    // Generate final consolidated summary
    const consolidatedText = summaries.join('\n\n');
    const finalResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Create a comprehensive summary with:
1. A brief 2-3 sentence overview
2. A detailed paragraph summary
3. 5-8 key points as bullet points

Return as JSON with fields: brief, detailed, keyPoints (array)`
        },
        {
          role: "user",
          content: `Consolidate these summaries into final analysis:\n\n${consolidatedText}`
        }
      ],
      max_tokens: 800,
      temperature: 0.2,
    });
    
    const result = JSON.parse(finalResponse.choices[0].message.content || '{}');
    return {
      brief: result.brief || 'Unable to generate brief summary',
      detailed: result.detailed || 'Unable to generate detailed summary',
      keyPoints: result.keyPoints || []
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate document summary');
  }
}

/**
 * Extract named entities from text
 */
export async function extractEntities(text: string): Promise<AIAnalysisResult['entities']> {
  try {
    const chunks = chunkText(text);
    const allEntities: AIAnalysisResult['entities'] = {
      people: [],
      organizations: [],
      dates: [],
      locations: [],
      monetaryValues: [],
      emails: [],
      phoneNumbers: [],
      urls: []
    };
    
    for (const chunk of chunks) {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Extract named entities from the text. Return JSON with arrays for:
- people: person names
- organizations: company/organization names
- dates: dates in any format
- locations: places, addresses, cities, countries
- monetaryValues: currency amounts
- emails: email addresses
- phoneNumbers: phone numbers
- urls: website URLs

Be precise and avoid duplicates.`
          },
          {
            role: "user",
            content: chunk
          }
        ],
        max_tokens: 600,
        temperature: 0.1,
      });
      
      const entities = JSON.parse(response.choices[0].message.content || '{}');
      
      // Merge entities, avoiding duplicates
      Object.keys(allEntities).forEach(key => {
        if (entities[key] && Array.isArray(entities[key])) {
          entities[key].forEach((item: string) => {
            if (!allEntities[key as keyof typeof allEntities].includes(item)) {
              allEntities[key as keyof typeof allEntities].push(item);
            }
          });
        }
      });
    }
    
    return allEntities;
  } catch (error) {
    console.error('Error extracting entities:', error);
    throw new Error('Failed to extract entities');
  }
}

/**
 * Analyze document sentiment
 */
export async function analyzeSentiment(text: string): Promise<AIAnalysisResult['sentiment']> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze the sentiment of the document. Return JSON with:
- overall: "positive", "negative", or "neutral"
- confidence: number between 0 and 1
- reasoning: brief explanation of the sentiment analysis

Consider the overall tone, language used, and context.`
        },
        {
          role: "user",
          content: text.substring(0, 4000) // Use first part for sentiment
        }
      ],
      max_tokens: 200,
      temperature: 0.2,
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      overall: result.overall || 'neutral',
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning || 'Unable to analyze sentiment'
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      overall: 'neutral',
      confidence: 0.5,
      reasoning: 'Error occurred during sentiment analysis'
    };
  }
}

/**
 * Generate insights and recommendations
 */
export async function generateInsights(text: string): Promise<AIAnalysisResult['insights']> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze the document for insights. Return JSON with:
- keyFindings: array of important discoveries/findings
- recommendations: array of actionable recommendations
- actionItems: array of specific actions to take
- complexity: "low", "medium", or "high"
- targetAudience: who this document is for
- purpose: primary purpose of the document

Focus on actionable insights and practical recommendations.`
        },
        {
          role: "user",
          content: text.substring(0, 4000)
        }
      ],
      max_tokens: 700,
      temperature: 0.3,
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      keyFindings: result.keyFindings || [],
      recommendations: result.recommendations || [],
      actionItems: result.actionItems || [],
      complexity: result.complexity || 'medium',
      targetAudience: result.targetAudience || 'General audience',
      purpose: result.purpose || 'Information sharing'
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error('Failed to generate insights');
  }
}

/**
 * Classify document type and category
 */
export async function classifyDocument(text: string): Promise<AIAnalysisResult['classification']> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Classify this document. Return JSON with:
- documentType: specific type (e.g., "Business Report", "Legal Contract", "Academic Paper")
- category: broad category (e.g., "Business", "Legal", "Academic", "Technical")
- industry: relevant industry if applicable
- confidence: number between 0 and 1
- tags: array of relevant tags/keywords

Be specific and accurate in classification.`
        },
        {
          role: "user",
          content: text.substring(0, 2000) // Use beginning for classification
        }
      ],
      max_tokens: 300,
      temperature: 0.1,
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      documentType: result.documentType || 'General Document',
      category: result.category || 'General',
      industry: result.industry || 'Not specified',
      confidence: result.confidence || 0.7,
      tags: result.tags || []
    };
  } catch (error) {
    console.error('Error classifying document:', error);
    throw new Error('Failed to classify document');
  }
}

/**
 * Perform complete AI analysis of document text
 */
export async function analyzeDocument(text: string): Promise<AIAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  
  try {
    // Run all analyses in parallel for efficiency
    const [summary, entities, sentiment, insights, classification] = await Promise.all([
      generateSummary(text),
      extractEntities(text),
      analyzeSentiment(text),
      generateInsights(text),
      classifyDocument(text)
    ]);
    
    return {
      summary,
      entities,
      sentiment,
      insights,
      classification
    };
  } catch (error) {
    console.error('Error in document analysis:', error);
    throw error;
  }
}

export default openai;
