#!/bin/sh

# Save the external port assigned by Render/Cloud (defaults to 8000)
GATEWAY_PORT=${PORT:-8000}

# Configure internal service URLs for the API Gateway
export AUTH_SERVICE_URL="http://127.0.0.1:8001"
export INTERVIEW_SERVICE_URL="http://127.0.0.1:8002"
export RESUME_SERVICE_URL="http://127.0.0.1:8003"
export ROADMAP_SERVICE_URL="http://127.0.0.1:8004"
export BILLING_SERVICE_URL="http://127.0.0.1:8005"

echo "=== Starting FirstHireAI Unified Backend Services ==="

echo "1. Starting Auth Service on :8001..."
PORT=8001 node services/auth-service/index.js &

echo "2. Starting Interview Service on :8002..."
PORT=8002 node services/interview-service/index.js &

echo "3. Starting Resume Service on :8003..."
PORT=8003 node services/resume-service/index.js &

echo "4. Starting Roadmap Service on :8004..."
PORT=8004 node services/roadmap-service/index.js &

echo "5. Starting Billing Service on :8005..."
PORT=8005 node services/billing-service/index.js &

# Give background services 3 seconds to bind to ports
sleep 3

echo "6. Starting API Gateway on :$GATEWAY_PORT..."
PORT=$GATEWAY_PORT exec node gateway/index.js
