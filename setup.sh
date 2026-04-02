#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
	echo "Error: npm is not installed or not in PATH."
	exit 1
fi

echo "Installing dependencies..."
npm install
echo "Setup complete."
