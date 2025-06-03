# Google Cloud Deployment Guide - Web Tools Platform

## 🚀 Quick Deployment

### Prerequisites
1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK** installed ([Install Guide](https://cloud.google.com/sdk/docs/install))
3. **Docker** installed ([Install Guide](https://docs.docker.com/get-docker/))
4. **Project ID** from Google Cloud Console

### One-Command Deployment
```bash
./deploy-gcp.sh YOUR_PROJECT_ID us-central1
```

## 📋 Step-by-Step Deployment

### 1. Setup Google Cloud Project
```bash
# Create a new project (optional)
gcloud projects create YOUR_PROJECT_ID --name="Web Tools Platform"

# Set the project
gcloud config set project YOUR_PROJECT_ID

# Enable billing (required for Cloud Run)
# Do this in the Google Cloud Console: https://console.cloud.google.com/billing
```

### 2. Enable Required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Configure Docker Authentication
```bash
gcloud auth configure-docker
```

### 4. Build and Deploy
```bash
# Option A: Use the deployment script
./deploy-gcp.sh YOUR_PROJECT_ID

# Option B: Manual deployment
docker build -t gcr.io/YOUR_PROJECT_ID/web-tools .
docker push gcr.io/YOUR_PROJECT_ID/web-tools

gcloud run deploy web-tools \
  --image gcr.io/YOUR_PROJECT_ID/web-tools \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 100
```

## 🔧 Configuration Options

### Environment Variables
```bash
# Set environment variables during deployment
gcloud run deploy web-tools \
  --set-env-vars NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,CUSTOM_VAR=value
```

### Resource Configuration
```bash
# Adjust resources based on your needs
--memory 1Gi          # Memory allocation (512Mi, 1Gi, 2Gi, 4Gi, 8Gi)
--cpu 1               # CPU allocation (1, 2, 4, 6, 8)
--max-instances 50    # Maximum instances
--min-instances 0     # Minimum instances (0 for cost optimization)
--concurrency 80      # Requests per instance
--timeout 300         # Request timeout in seconds
```

### Custom Domain Setup
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service web-tools \
  --domain your-domain.com \
  --region us-central1
```

## 🏗️ CI/CD with Cloud Build

### Automatic Deployment from GitHub
1. Connect your GitHub repository to Cloud Build
2. Use the provided `cloudbuild.yaml` configuration
3. Set up triggers for automatic deployment

```bash
# Create a build trigger
gcloud builds triggers create github \
  --repo-name=web-tools \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

## 📊 Monitoring and Logging

### View Logs
```bash
# View service logs
gcloud logs read --service=web-tools --region=us-central1

# Follow logs in real-time
gcloud logs tail --service=web-tools --region=us-central1
```

### Monitor Performance
- **Cloud Console**: https://console.cloud.google.com/run
- **Metrics**: CPU, Memory, Request count, Response time
- **Health Checks**: Automatic health monitoring via `/api/health`

## 💰 Cost Optimization

### Recommended Settings for Production
```bash
gcloud run deploy web-tools \
  --min-instances 1 \
  --max-instances 10 \
  --concurrency 100 \
  --memory 1Gi \
  --cpu 1
```

### Cost-Optimized Settings
```bash
gcloud run deploy web-tools \
  --min-instances 0 \
  --max-instances 5 \
  --concurrency 80 \
  --memory 512Mi \
  --cpu 1
```

## 🔒 Security Configuration

### IAM and Security
```bash
# Remove public access (if needed)
gcloud run services remove-iam-policy-binding web-tools \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"

# Add specific users
gcloud run services add-iam-policy-binding web-tools \
  --region=us-central1 \
  --member="user:email@example.com" \
  --role="roles/run.invoker"
```

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Check build logs
gcloud builds log BUILD_ID

# Local testing
docker build -t web-tools-test .
docker run -p 3000:3000 web-tools-test
```

**Deployment Issues**
```bash
# Check service status
gcloud run services describe web-tools --region=us-central1

# View recent revisions
gcloud run revisions list --service=web-tools --region=us-central1
```

**Performance Issues**
```bash
# Increase resources
gcloud run services update web-tools \
  --memory 2Gi \
  --cpu 2 \
  --region=us-central1
```

## 📈 Scaling Configuration

### Auto-scaling Settings
```bash
# Configure auto-scaling
gcloud run services update web-tools \
  --min-instances 2 \
  --max-instances 50 \
  --concurrency 100 \
  --region=us-central1
```

### Load Testing
```bash
# Install Apache Bench for testing
sudo apt-get install apache2-utils

# Load test
ab -n 1000 -c 10 https://your-service-url.run.app/
```

## 🔄 Updates and Rollbacks

### Deploy New Version
```bash
# Build and deploy new version
./deploy-gcp.sh YOUR_PROJECT_ID

# Or manual update
gcloud run services update web-tools \
  --image gcr.io/YOUR_PROJECT_ID/web-tools:latest \
  --region=us-central1
```

### Rollback to Previous Version
```bash
# List revisions
gcloud run revisions list --service=web-tools --region=us-central1

# Rollback to specific revision
gcloud run services update-traffic web-tools \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

## 📞 Support

### Useful Commands
```bash
# Service URL
gcloud run services describe web-tools --region=us-central1 --format='value(status.url)'

# Service status
gcloud run services list --filter="metadata.name=web-tools"

# Delete service
gcloud run services delete web-tools --region=us-central1
```

### Resources
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Your Web Tools Platform is now ready for Google Cloud! 🚀**
