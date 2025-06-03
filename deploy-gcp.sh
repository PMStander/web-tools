#!/bin/bash

# Web Tools Platform - Google Cloud Deployment Script
# This script builds and deploys the application to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${1:-"your-project-id"}
REGION=${2:-"us-central1"}
SERVICE_NAME="web-tools"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo -e "${BLUE}🚀 Web Tools Platform - Google Cloud Deployment${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo -e "${YELLOW}Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed${NC}"
    echo -e "${YELLOW}Please install Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "  Project ID: ${YELLOW}$PROJECT_ID${NC}"
echo -e "  Region: ${YELLOW}$REGION${NC}"
echo -e "  Service: ${YELLOW}$SERVICE_NAME${NC}"
echo -e "  Image: ${YELLOW}$IMAGE_NAME${NC}"
echo ""

# Confirm deployment
read -p "$(echo -e ${YELLOW}Continue with deployment? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

echo -e "${BLUE}🔧 Setting up Google Cloud project...${NC}"

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${BLUE}🔌 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker for GCR
echo -e "${BLUE}🐳 Configuring Docker for Google Container Registry...${NC}"
gcloud auth configure-docker

# Build the Docker image
echo -e "${BLUE}🏗️  Building Docker image...${NC}"
docker build -t $IMAGE_NAME:latest .

# Tag with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker tag $IMAGE_NAME:latest $IMAGE_NAME:$TIMESTAMP

# Push to Google Container Registry
echo -e "${BLUE}📤 Pushing image to Google Container Registry...${NC}"
docker push $IMAGE_NAME:latest
docker push $IMAGE_NAME:$TIMESTAMP

# Deploy to Cloud Run
echo -e "${BLUE}🚀 Deploying to Google Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 100 \
    --min-instances 1 \
    --concurrency 80 \
    --timeout 300 \
    --port 3000 \
    --set-env-vars NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Service URL: ${BLUE}$SERVICE_URL${NC}"
echo -e "${GREEN}📊 Monitor: ${BLUE}https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME${NC}"

# Optional: Open the service in browser
read -p "$(echo -e ${YELLOW}Open service in browser? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open $SERVICE_URL
    elif command -v xdg-open &> /dev/null; then
        xdg-open $SERVICE_URL
    else
        echo -e "${YELLOW}Please open: $SERVICE_URL${NC}"
    fi
fi

echo -e "${GREEN}🎉 Web Tools Platform is now live on Google Cloud!${NC}"
