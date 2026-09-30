#!/bin/sh

# Save the external port assigned by Render/Cloud (defaults to 8000)
GATEWAY_PORT=${PORT:-8000}

# Configure internal service URLs for the API Gateway
export AUTH_SERVICE_URL="http://127.0.0.1:8001"
export INTERVIEW_SERVICE_URL="http://127.0.0.1:8002"
export RESUME_SERVICE_URL="http://127.0.0.1:8003"
export ROADMAP_SERVICE_URL="http://127.0.0.1:8004"
export BILLING_SERVICE_URL="http://127.0.0.1:8005"

# Automatically derive service-specific MongoDB databases from single MONGODB_URL
if [ -n "$MONGODB_URL" ]; then
  AUTH_MONGO=$(node -e "const u = (process.env.AUTH_MONGODB_URL || process.env.MONGODB_URL || ''); const m = u.match(/^(mongodb(?:\+srv)?:\/\/[^\/?]+)(?:\/[^?]*)?(\?.*)?$/); console.log(m ? m[1] + '/User' + (m[2] || '') : u);")
  BILLING_MONGO=$(node -e "const u = (process.env.BILLING_MONGODB_URL || process.env.MONGODB_URL || ''); const m = u.match(/^(mongodb(?:\+srv)?:\/\/[^\/?]+)(?:\/[^?]*)?(\?.*)?$/); console.log(m ? m[1] + '/billing' + (m[2] || '') : u);")
  INTERVIEW_MONGO=$(node -e "const u = (process.env.INTERVIEW_MONGODB_URL || process.env.MONGODB_URL || ''); const m = u.match(/^(mongodb(?:\+srv)?:\/\/[^\/?]+)(?:\/[^?]*)?(\?.*)?$/); console.log(m ? m[1] + '/interviewStart' + (m[2] || '') : u);")
  RESUME_MONGO=$(node -e "const u = (process.env.RESUME_MONGODB_URL || process.env.MONGODB_URL || ''); const m = u.match(/^(mongodb(?:\+srv)?:\/\/[^\/?]+)(?:\/[^?]*)?(\?.*)?$/); console.log(m ? m[1] + '/Resume' + (m[2] || '') : u);")
  ROADMAP_MONGO=$(node -e "const u = (process.env.ROADMAP_MONGODB_URL || process.env.MONGODB_URL || ''); const m = u.match(/^(mongodb(?:\+srv)?:\/\/[^\/?]+)(?:\/[^?]*)?(\?.*)?$/); console.log(m ? m[1] + '/Roadmaps' + (m[2] || '') : u);")
else
  AUTH_MONGO=""
  BILLING_MONGO=""
  INTERVIEW_MONGO=""
  RESUME_MONGO=""
  ROADMAP_MONGO=""
fi

echo "=== Starting FirstHireAI Unified Backend Services ==="

echo "1. Starting Auth Service on :8001..."
PORT=8001 MONGODB_URL="${AUTH_MONGO:-$MONGODB_URL}" node services/auth-service/index.js &

echo "2. Starting Interview Service on :8002..."
PORT=8002 \
MONGODB_URL="${INTERVIEW_MONGO:-$MONGODB_URL}" \
GROQ_API_KEY="${INTERVIEW_GROQ_API_KEY:-$GROQ_API_KEY}" \
node services/interview-service/index.js &

echo "3. Starting Resume Service on :8003..."
PORT=8003 \
MONGODB_URL="${RESUME_MONGO:-$MONGODB_URL}" \
GROQ_API_KEY="${RESUME_GROQ_API_KEY:-$GROQ_API_KEY}" \
node services/resume-service/index.js &

echo "4. Starting Roadmap Service on :8004..."
PORT=8004 \
MONGODB_URL="${ROADMAP_MONGO:-$MONGODB_URL}" \
GROQ_API_KEY="${ROADMAP_GROQ_API_KEY:-$GROQ_API_KEY}" \
node services/roadmap-service/index.js &

echo "5. Starting Billing Service on :8005..."
PORT=8005 MONGODB_URL="${BILLING_MONGO:-$MONGODB_URL}" node services/billing-service/index.js &

# Give background services 3 seconds to bind to ports
sleep 3

echo "6. Starting API Gateway on :$GATEWAY_PORT..."
PORT=$GATEWAY_PORT exec node gateway/index.js
