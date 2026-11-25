#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Community Portal Smoke & Regression Verification Driver (Issue #16)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_DIR}"

echo "=== 1. Checking or Running Clean Portal Build ==="
if [ ! -d ".krewire/build" ]; then
  if command -v krew >/dev/null 2>&1; then
    krew build
  elif command -v kiw >/dev/null 2>&1; then
    kiw build
  else
    echo "ERROR: krew CLI not found on PATH. Cannot build portal." >&2
    exit 1
  fi
fi

echo "=== 2. Running Portal Verification Suite ==="
python3 "${SCRIPT_DIR}/verify_portal.py"

echo "=== 3. Validating Route Manifest ==="
if [ ! -f ".krewire/build/route_manifest.json" ]; then
  echo "ERROR: Expected route_manifest.json was not produced!" >&2
  exit 1
fi

echo "✓ Portal verification completed successfully."
