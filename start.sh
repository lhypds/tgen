#!/bin/bash

# Load PORT from .env, default to 3190
PORT=$(grep -E '^PORT=' .env 2>/dev/null | cut -d '=' -f2)
PORT=${PORT:-3190}

echo "Building..."
npm run build || { echo "Build failed"; exit 1; }

if pm2 start ecosystem.config.cjs; then
  echo "Server started at http://localhost:$PORT"
fi
