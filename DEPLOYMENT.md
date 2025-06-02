# WebTools Pro - Deployment Guide

This guide covers deploying WebTools Pro to production environments with optimal performance and security.

## 🚀 Quick Deploy Options

### Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_APP_URL
# - OPENAI_API_KEY (optional)
# - ANTHROPIC_API_KEY (optional)
```

### Netlify
```bash
# 1. Build the project
npm run build

# 2. Deploy to Netlify
# Upload the .next folder or connect your Git repository
```

### Docker
```bash
# 1. Build Docker image
docker build -t webtools-pro .

# 2. Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -e OPENAI_API_KEY=your_key \
  webtools-pro
```

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# File upload limits (optional)
MAX_FILE_SIZE=100000000  # 100MB
MAX_FILES_PER_REQUEST=10

# Cache settings (optional)
CACHE_TTL=3600  # 1 hour
CACHE_MAX_SIZE=1000
```

### Optional AI Services
```env
# OpenAI for advanced AI features
OPENAI_API_KEY=sk-...

# Anthropic Claude for document analysis
ANTHROPIC_API_KEY=sk-ant-...

# Google Cloud for OCR and vision
GOOGLE_CLOUD_PROJECT_ID=your-project
GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json
```

### Analytics and Monitoring
```env
# Google Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Mixpanel for user analytics
MIXPANEL_TOKEN=your_token

# Sentry for error tracking
SENTRY_DSN=https://...
```

## 🏗 Production Build

### Build Optimization
```bash
# 1. Install dependencies
npm ci --production

# 2. Build for production
npm run build

# 3. Start production server
npm start
```

### Build Analysis
```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npm run depcheck

# Audit for vulnerabilities
npm audit
```

## 🔒 Security Configuration

### Security Headers
The application includes security headers in `next.config.js`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### File Upload Security
- MIME type validation
- File size limits
- Malware scanning (basic)
- Automatic file cleanup
- Rate limiting per IP

### API Security
- Rate limiting by endpoint
- Request validation
- Error sanitization
- CORS configuration

## 📊 Performance Optimization

### Caching Strategy
```bash
# Static assets: 1 year
Cache-Control: public, max-age=31536000, immutable

# API responses: 5 minutes
Cache-Control: public, max-age=300, s-maxage=300

# Images: 1 day
Cache-Control: public, max-age=86400
```

### CDN Configuration
For optimal performance, configure your CDN to:
- Cache static assets for 1 year
- Cache API responses for 5 minutes
- Enable compression (gzip/brotli)
- Use HTTP/2 or HTTP/3

### Database Optimization
If using a database:
- Index frequently queried fields
- Use connection pooling
- Implement query caching
- Monitor slow queries

## 🔍 Monitoring Setup

### Health Checks
```bash
# Application health
GET /api/health

# Cache status
GET /api/cache/stats

# System metrics
GET /api/metrics
```

### Logging
Configure structured logging:
```javascript
// Example logging configuration
{
  level: 'info',
  format: 'json',
  transports: [
    'console',
    'file',
    'external-service'
  ]
}
```

### Error Tracking
Integrate with error tracking services:
- Sentry for error monitoring
- LogRocket for session replay
- DataDog for infrastructure monitoring

## 🚦 Load Balancing

### Nginx Configuration
```nginx
upstream webtools_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://webtools_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static file caching
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker Compose
```yaml
version: '3.8'
services:
  webtools-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_APP_URL=https://your-domain.com
      - NODE_ENV=production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - webtools-app
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use stateless application design
- Implement session storage (Redis)
- Use external file storage (S3, GCS)
- Database read replicas

### Vertical Scaling
- Monitor CPU and memory usage
- Optimize Node.js heap size
- Use PM2 for process management
- Enable cluster mode

### Auto-scaling
```yaml
# Kubernetes HPA example
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webtools-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webtools-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🛡 Backup and Recovery

### File Backup
- Implement automated file cleanup
- Use cloud storage for processed files
- Regular backup of user data
- Point-in-time recovery

### Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump webtools_db > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

## 📋 Pre-launch Checklist

### Performance
- [ ] Lighthouse score > 95
- [ ] Core Web Vitals in green
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Caching configured

### Security
- [ ] Security headers configured
- [ ] File upload validation
- [ ] Rate limiting enabled
- [ ] Error handling sanitized
- [ ] Dependencies audited

### Functionality
- [ ] All tools working
- [ ] File processing tested
- [ ] Error scenarios handled
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Monitoring
- [ ] Health checks configured
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Analytics configured
- [ ] Alerting rules set

## 🆘 Troubleshooting

### Common Issues
1. **High memory usage**: Check for memory leaks in file processing
2. **Slow API responses**: Review caching and database queries
3. **File upload failures**: Verify file size limits and disk space
4. **Build failures**: Check Node.js version and dependencies

### Debug Commands
```bash
# Check application logs
docker logs webtools-app

# Monitor resource usage
docker stats webtools-app

# Test API endpoints
curl -X POST https://your-domain.com/api/health

# Check cache status
curl https://your-domain.com/api/cache/stats
```

---

For additional support, contact: support@webtools-pro.com
