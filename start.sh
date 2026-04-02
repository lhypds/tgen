#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ ! -d "node_modules" ]; then
	echo "Dependencies not found. Running setup first..."
	"$ROOT_DIR/setup.sh"
fi

echo "Starting dev server..."
npm run dev
