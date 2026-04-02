#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Pulling latest code..."
git pull

if ! command -v npm >/dev/null 2>&1; then
	echo "Error: npm is not installed or not in PATH."
	exit 1
fi

echo "[2/4] Installing dependencies..."
npm install

echo "[3/4] Setting up .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  .env created from .env.example"
else
  echo "  .env already exists, skipping."
fi

echo "[4/5] Installing serve..."
npm install -g serve

echo "[5/5] Building..."
npm run build

echo "Setup complete."
