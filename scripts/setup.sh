#!/usr/bin/env bash
# ==========================================
# CloudNative DevSecOps Platform - Local Setup Script
# ==========================================
set -e

echo "=========================================================="
echo "🚀 Initializing CloudNative DevSecOps Environment"
echo "=========================================================="

# 1. Check prerequisites
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️ Docker not detected in PATH. Ensure Docker is running."; }

# 2. Run backend tests locally
echo "🧪 Running backend unit tests..."
if [ -d "app/backend" ]; then
  cd app/backend
  if command -v npm >/dev/null 2>&1; then
    npm test || true
  fi
  cd ../..
fi

# 3. Start local stack with docker-compose
echo "🐳 Starting local services with Docker Compose..."
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose -f docker/docker-compose.yml up -d --build
  echo "✅ Local stack running!"
  echo "🌐 Frontend Dashboard: http://localhost:8080"
  echo "⚙️ Backend API:        http://localhost:5000/api/info"
  echo "📊 Prometheus Metrics: http://localhost:5000/metrics"
else
  echo "⚠️ docker-compose not found. Run 'docker compose up' manually when ready."
fi
