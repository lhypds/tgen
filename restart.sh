#!/bin/bash
set -e
cd "$(dirname "$0")"
git pull
# Dev dependencies too: the build needs vite even when NODE_ENV=production
npm install --include=dev
npm run build
pm2 restart ecosystem.config.cjs --update-env
