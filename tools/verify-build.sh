#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Running build.js to normalize TSVs and regenerate packs.json..."
node build.js

if ! git diff --quiet; then
  echo "Build produced changes. Please commit them." >&2
  git --no-pager diff --stat
  exit 1
fi

echo "OK: No changes after build."

