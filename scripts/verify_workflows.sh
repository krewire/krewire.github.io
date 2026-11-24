#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Verifying Community Portal Workflows ==="

# 1. Regression check: detect any reintroduction of obsolete Core CLI path
echo "Checking for obsolete Core CLI path 'tools/kiw' in workflows..."
if grep -rn "tools/kiw" "${REPO_ROOT}/.github/workflows/"; then
  echo "FAIL: Obsolete Core CLI path 'tools/kiw' found in workflows!" >&2
  exit 1
fi
echo "✓ No obsolete CLI paths found in workflows."

# 2. Verify all workflows install the canonical Krew CLI
echo "Checking for canonical Krew CLI build in workflows..."
for wf in "${REPO_ROOT}/.github/workflows/"*.yaml; do
  if ! grep -q "krew.git" "$wf"; then
    echo "FAIL: Workflow $(basename "$wf") does not clone krew.git!" >&2
    exit 1
  fi
  if ! grep -q "cmd/krew" "$wf"; then
    echo "FAIL: Workflow $(basename "$wf") does not build ./cmd/krew!" >&2
    exit 1
  fi
done
echo "✓ All workflows build canonical Krew CLI (cmd/krew)."

echo "=== All workflow regression checks passed! ==="
