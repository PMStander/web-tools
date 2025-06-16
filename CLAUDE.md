# CLAUDE.md - AI Assistant Guide for Web Tools Platform

## Project Overview

This is **WebTools Pro**, a comprehensive file processing platform built as a Next.js monolithic application. The platform provides 51+ professional tools for PDF, image, video, and AI-powered file processing, all accessible through a modern web interface.

### Key Features
- **PDF Tools** (9 tools): Split, compress, protect, OCR, convert, watermark, extract text, rotate
- **Image Tools** (20 tools): Crop, resize, compress, background removal, enhance, filters, and more
- **Video Tools** (12 tools): Convert, compress, trim, merge, extract audio, thumbnails, etc.
- **AI Tools** (4 tools): Document analyzer, text generator, image enhancer, chatbot builder
- **Featured Tools** (6 tools): PDF merge, image converter, collaborative editor, workflow builder

## Technology Stack

### Frontend
- **Framework**: Next.js 15.3.2 with React 19.0.0
- **Language**: TypeScript 5.x (strict mode enabled)
- **Styling**: Tailwind CSS 4.1.6 with custom animations
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Icons**: Lucide React 0.509.0
- **Forms**: React Hook Form 7.56.3 with Zod validation

### Backend
- **Runtime**: Node.js 18.x with Next.js API Routes
- **Architecture**: Monolithic with engine-based processing
- **File Processing**:
  - **PDF**: pdf-lib, pdf-parse, Tesseract.js, pdf2pic
  - **Image**: Sharp 0.34.2
  - **Video**: FFmpeg (fluent-ffmpeg wrapper)
  - **AI**: OpenAI and Anthropic SDKs

### Infrastructure
- **Caching**: Multi-tier (memory + Redis + CDN)
- **Storage**: Local filesystem with JSON metadata
- **Deployment**: Docker containers on Google Cloud Run
- **Development**: Port 8000 with Turbopack

## Project Structure

```
web-tools/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin endpoints
│   │   │   ├── files/         # File operations
│   │   │   ├── tools/         # Processing endpoints
│   │   │   │   ├── pdf/       # PDF processing
│   │   │   │   ├── image/     # Image processing
│   │   │   │   ├── video/     # Video processing
│   │   │   │   └── ai/        # AI processing
│   │   │   └── health/        # Health checks
│   │   ├── tools/             # Tool UI pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── tools/            # Tool-specific components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilities
│   │   ├── cache*.ts         # Caching system
│   │   ├── ai/               # AI utilities
│   │   └── utils.ts          # General utilities
│   └── hooks/                # Custom React hooks
├── uploads/                  # User uploads
├── outputs/                  # Processed files
├── docs/                     # Documentation
└── bmad-agent/              # BMad agent system
```

## Development Guidelines

### 1. TypeScript Best Practices
```typescript
// ✅ Good: Use explicit types
interface FileMetadata {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

// ❌ Avoid: any type
const processFile = (file: any) => { ... }

// ✅ Good: Type-safe with Zod
import { z } from 'zod';

const uploadSchema = z.object({
  file: z.instanceof(File),
  operation: z.enum(['compress', 'convert', 'extract']),
  options: z.object({
    quality: z.number().min(1).max(100).optional(),
  }),
});
```

### 2. React/Next.js Patterns

```typescript
// Use Server Components by default
// src/app/tools/pdf/page.tsx
export default function PDFToolsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">PDF Tools</h1>
      {/* Tool grid */}
    </div>
  );
}

// Client Components only when needed
// src/components/tools/FileUpload.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function FileUpload({ onUpload }: { onUpload: (file: File) => void }) {
  // Interactive component logic
}
```

### 3. API Route Pattern

```typescript
// src/app/api/tools/pdf/compress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  fileId: z.string().uuid(),
  quality: z.number().min(1).max(100).default(85),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validate input
    const body = await request.json();
    const { fileId, quality } = requestSchema.parse(body);
    
    // 2. Check cache
    const cached = await checkCache(`compress:${fileId}:${quality}`);
    if (cached) return NextResponse.json(cached);
    
    // 3. Process file
    const result = await compressPDF(fileId, quality);
    
    // 4. Cache result
    await cacheResult(`compress:${fileId}:${quality}`, result);
    
    // 5. Return response
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
```

### 4. Component Conventions

```typescript
// Always use shadcn/ui components when available
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Component file naming
// - PascalCase.tsx for components
// - kebab-case.ts for utilities
// - route.ts for API routes

// Props interface naming
interface FileUploaderProps {
  accept?: string[];
  maxSize?: number;
  onUpload: (file: File) => Promise<void>;
}
```

## Common Development Tasks

### Adding a New Tool

1. **Create API Route**:
   ```bash
   # Create new tool API
   src/app/api/tools/pdf/new-tool/route.ts
   ```

2. **Create UI Page**:
   ```bash
   # Create tool page
   src/app/tools/pdf/new-tool/page.tsx
   ```

3. **Add to Navigation**:
   - Update tool category page
   - Add to SmartNavigation component

4. **Implement Processing**:
   ```typescript
   // Use appropriate engine
   import { processPDF } from '@/lib/pdf-engine';
   ```

### File Processing Flow

```typescript
// 1. Upload file
const formData = new FormData();
formData.append('file', file);

const uploadRes = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData,
});

const { fileId } = await uploadRes.json();

// 2. Process file
const processRes = await fetch('/api/tools/pdf/compress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileId, quality: 85 }),
});

const { outputFileId } = await processRes.json();

// 3. Download result
window.location.href = `/api/files/download?fileId=${outputFileId}`;
```

### Testing Commands

```bash
# Development
npm run dev          # Start dev server on port 8000

# Linting
npm run lint         # Run ESLint

# Building
npm run build        # Build for production
npm run start        # Start production server

# Type checking
npx tsc --noEmit     # Check TypeScript types
```

## Important Patterns

### Error Handling

```typescript
// Centralized error handler
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

// In API routes
try {
  // ... processing
} catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  // Log unexpected errors
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Caching Strategy

```typescript
// Multi-tier caching
import { cacheManager } from '@/lib/cache';

// Check cache layers
const result = await cacheManager.get(key, {
  memory: true,    // Check memory first
  redis: true,     // Then Redis
  ttl: 3600,       // 1 hour TTL
});

// Cache with tags for invalidation
await cacheManager.set(key, data, {
  tags: ['pdf', `user:${userId}`],
  ttl: 3600,
});
```

### File Security

```typescript
// Always validate file types
const ALLOWED_TYPES = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/webm'],
};

// Sanitize filenames
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .toLowerCase();
};

// Size limits
const MAX_FILE_SIZE = {
  pdf: 50 * 1024 * 1024,    // 50MB
  image: 25 * 1024 * 1024,  // 25MB
  video: 500 * 1024 * 1024, // 500MB
};
```

## Performance Guidelines

### 1. Image Optimization
```typescript
// Always use Next.js Image component
import Image from 'next/image';

<Image
  src="/tool-icon.png"
  alt="Tool icon"
  width={48}
  height={48}
  loading="lazy"
/>
```

### 2. Code Splitting
```typescript
// Dynamic imports for heavy components
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  loading: () => <Skeleton className="w-full h-96" />,
  ssr: false,
});
```

### 3. API Response Caching
```typescript
// Use proper cache headers
export async function GET() {
  const data = await fetchData();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
```

## Working with BMad Agent System

The project includes a sophisticated agent-based development system at `/bmad-agent/`. When working on architectural changes or major features:

1. **Consult Agent Personas**:
   - Architect (Timmy) - For technical architecture
   - PM (Bill) - For product requirements
   - Design Architect (Karen) - For frontend architecture

2. **Use Agent Tasks**:
   - Located in `/bmad-agent/tasks/`
   - Follow task templates for consistency

3. **Reference Templates**:
   - Architecture templates in `/bmad-agent/templates/`
   - Use for documentation consistency

## Security Checklist

- [ ] Validate all file uploads (type, size, content)
- [ ] Sanitize filenames before storage
- [ ] Use Zod for runtime validation
- [ ] Never expose internal file paths
- [ ] Implement rate limiting on all endpoints
- [ ] Use CSRF protection for state-changing operations
- [ ] Escape user content in UI (React does this by default)
- [ ] Regular dependency updates (`npm audit`)

## Deployment

### Local Development
```bash
npm install
npm run dev
# Open http://localhost:8000
```

### Production Deployment
```bash
# Build Docker image
docker build -t web-tools .

# Deploy to Google Cloud Run
./deploy-gcp.sh your-project-id us-central1
```

## Key Contacts & Resources

- **Architecture Documentation**: `/docs/architecture.md`
- **Testing Strategy**: `/docs/testing-strategy-implementation.md`
- **Deployment Guide**: `/docs/DEPLOYMENT_GUIDE.md`
- **BMad Configuration**: `/bmad-agent/ide-bmad-orchestrator.cfg.md`

## Common Pitfalls to Avoid

1. **Don't use `any` type** - Always define proper TypeScript types
2. **Don't bypass validation** - Always validate with Zod schemas
3. **Don't ignore caching** - Use the multi-tier cache system
4. **Don't process files synchronously** - Use streaming for large files
5. **Don't hardcode values** - Use environment variables
6. **Don't skip error handling** - Always handle edge cases
7. **Don't create files without cleanup** - Implement TTL for temporary files

## Quick Reference

### File Size Limits
- PDF: 50MB
- Images: 25MB  
- Videos: 500MB

### Cache TTLs
- Processed files: 1 hour
- API responses: 5 minutes
- Static assets: 1 year

### Performance Targets
- API response time: <200ms
- Cache hit rate: >95%
- Lighthouse score: >95

## Summary

This is a production-ready file processing platform with a focus on performance, security, and user experience. Follow the established patterns, use the provided components, and leverage the caching system for optimal results. When in doubt, refer to existing implementations in the codebase or consult the comprehensive documentation in the `/docs` directory.