# WebTools Pro - Technology Context

## Core Technology Stack

### Frontend Technologies
- **Framework**: Next.js 15.3.2 with React 19.0.0
- **Language**: TypeScript 5.x for type safety and developer experience
- **Styling**: Tailwind CSS 4.1.6 with CSS variables and custom animations
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Next.js with Turbopack for fast development builds

### Backend Technologies
- **Runtime**: Node.js with Next.js API Routes
- **API Design**: RESTful APIs with OpenAPI 3.0 specification
- **Authentication**: JWT with refresh token rotation
- **File Processing**:
  - Sharp for image processing and optimization
  - pdf-lib for PDF manipulation and generation
  - FFmpeg for video processing and conversion
- **Validation**: Zod for runtime type validation and schema definition

### Database & Storage
- **Primary Database**: PostgreSQL for user data and metadata
- **Caching**: Redis for session management and API response caching
- **File Storage**: AWS S3 with CloudFront CDN for global distribution
- **Search**: Elasticsearch for advanced file search capabilities

### AI & Machine Learning
- **AI Services**: OpenAI GPT-4, Anthropic Claude for document analysis
- **Image AI**: Stability AI for image enhancement and background removal
- **OCR**: Tesseract.js for optical character recognition
- **Content Analysis**: Custom ML models for document classification

### Development Tools
- **Package Manager**: npm with package-lock.json for dependency management
- **Code Quality**: ESLint with Next.js configuration and TypeScript rules
- **Formatting**: Prettier for consistent code formatting
- **Testing**: Jest for unit testing, Playwright for E2E testing
- **Type Checking**: TypeScript with strict mode enabled

## Infrastructure & Deployment

### Cloud Services
- **Hosting**: Vercel for frontend deployment with edge functions
- **CDN**: CloudFront for global content delivery and caching
- **Monitoring**: Prometheus + Grafana for metrics and alerting
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Error Tracking**: Sentry for error monitoring and performance tracking

### Security Infrastructure
- **SSL/TLS**: Automatic HTTPS with Let's Encrypt certificates
- **WAF**: Web Application Firewall for DDoS and attack protection
- **Secrets Management**: AWS Secrets Manager for API keys and credentials
- **Compliance**: SOC 2, GDPR, HIPAA compliance frameworks

### Performance Optimization
- **Caching Strategy**: Multi-tier caching (Browser, CDN, Application, Database)
- **Image Optimization**: Next.js Image component with WebP/AVIF support
- **Code Splitting**: Route-based and component-based code splitting
- **Bundle Analysis**: Webpack Bundle Analyzer for optimization insights

## Development Environment

### Required Dependencies
```json
{
  "node": ">=18.0.0",
  "npm": ">=8.0.0",
  "typescript": "^5.0.0"
}
```

### Key Package Dependencies
- **React Ecosystem**: React 19, React DOM, React Hook Form
- **UI Framework**: Radix UI components, Tailwind CSS, Lucide icons
- **Utilities**: clsx, date-fns, zod for validation
- **File Processing**: Sharp, pdf-lib for core functionality
- **Development**: ESLint, TypeScript, Next.js dev tools

### Environment Configuration
```bash
# Required Environment Variables
NEXT_PUBLIC_APP_URL=http://localhost:8000
NODE_ENV=development

# Optional - AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Optional - Analytics
GOOGLE_ANALYTICS_ID=your_ga_id
MIXPANEL_TOKEN=your_mixpanel_token
```

## Project Structure

### Directory Organization
```
web-tools/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── tools/          # Tool-specific pages
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── tools/         # Tool-specific components
│   ├── lib/               # Utility functions
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
├── docs/                  # Project documentation
├── __tests__/             # Test files
├── .project/              # Project management system
└── mcp-taskmanager/       # MCP task manager module
```

### Configuration Files
- **next.config.js**: Next.js configuration with performance optimizations
- **tailwind.config.js**: Tailwind CSS configuration with custom theme
- **tsconfig.json**: TypeScript configuration with strict mode
- **components.json**: shadcn/ui configuration
- **eslint.config.mjs**: ESLint configuration for code quality

## Development Workflow

### Local Development Setup
1. **Clone Repository**: `git clone https://github.com/PMStander/web-tools.git`
2. **Install Dependencies**: `npm install`
3. **Environment Setup**: Copy `.env.example` to `.env.local`
4. **Start Development**: `npm run dev` (runs on port 8000)
5. **Build Production**: `npm run build`

### Code Quality Standards
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Next.js recommended rules with custom configurations
- **Prettier**: Consistent code formatting across the project
- **Husky**: Pre-commit hooks for code quality enforcement

### Testing Strategy
- **Unit Tests**: Jest for component and utility function testing
- **Integration Tests**: API route testing with supertest
- **E2E Tests**: Playwright for full user workflow testing
- **Performance Tests**: Lighthouse CI for performance monitoring

## Scalability Considerations

### Performance Targets
- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: All metrics in green zone
- **Bundle Size**: <500KB initial load
- **API Response**: <200ms average response time
- **File Processing**: <3 seconds for typical operations

### Scaling Strategy
- **Horizontal Scaling**: Microservices architecture for independent scaling
- **Database Scaling**: Read replicas and connection pooling
- **CDN Optimization**: Global edge caching for static assets
- **Auto-scaling**: Kubernetes-based auto-scaling for traffic spikes

### Monitoring & Observability
- **Real-time Metrics**: Performance, error rates, user engagement
- **Health Checks**: Automated system health monitoring
- **Alerting**: PagerDuty integration for critical issues
- **Analytics**: User behavior tracking and conversion optimization
