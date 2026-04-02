#!/bin/bash

echo "Stopping server..."
if pm2 stop ecosystem.config.cjs; then
  echo "Server stopped."
fi
