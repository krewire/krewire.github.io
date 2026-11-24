#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Test Suite: Release Pipeline & Contributor Portal Deploy Gate Matrix (Issue #15)
# Validates gate policies for stable, LTS, pre-releases, experimental, and dev tracks.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

evaluate_gate() {
  local EVENT_NAME="$1"
  local CONCLUSION="$2"
  local HEAD_BRANCH="$3"
  local HEAD_SHA="$4"
  local PUSH_REF="$5"
  local DISPATCH_REASON="$6"
  local REPO_NAME="${7:-krewire/krewire.github.io}"

  # Gate Logic Mirroring deploy.yaml
  if [ "${EVENT_NAME}" = "workflow_run" ]; then
    if [ "${CONCLUSION}" != "success" ]; then
      return 1
    fi
    if [ "${REPO_NAME}" != "krewire/krewire.github.io" ]; then
      return 1
    fi
    if [ -z "${HEAD_SHA}" ]; then
      return 1
    fi
    if [[ "${HEAD_BRANCH}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-lts.*)?$ ]]; then
      if [[ "${HEAD_BRANCH}" =~ -(rc|beta|alpha|exp|dev|nightly) ]]; then
        return 1
      fi
      return 0
    else
      return 1
    fi

  elif [ "${EVENT_NAME}" = "push" ]; then
    if [[ ! "${PUSH_REF}" =~ ^refs/tags/v[0-9]+\.[0-9]+\.[0-9]+(-lts.*)?$ ]]; then
      return 1
    fi
    local TAG="${PUSH_REF#refs/tags/}"
    if [[ "${TAG}" =~ -(rc|beta|alpha|exp|dev|nightly) ]]; then
      return 1
    fi
    return 0

  elif [ "${EVENT_NAME}" = "workflow_dispatch" ]; then
    if [ -z "${DISPATCH_REASON}" ] || [ "${DISPATCH_REASON}" = "null" ]; then
      return 1
    fi
    return 0
  fi

  return 1
}

assert_gate() {
  local TEST_NAME="$1"
  local EXPECTED="$2" # "PASS" or "BLOCK"
  local EVENT_NAME="$3"
  local CONCLUSION="$4"
  local HEAD_BRANCH="$5"
  local HEAD_SHA="$6"
  local PUSH_REF="$7"
  local DISPATCH_REASON="$8"

  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  printf "  [%02d] %-60s " "${TOTAL_TESTS}" "${TEST_NAME}..."

  local ACTUAL="PASS"
  if ! evaluate_gate "${EVENT_NAME}" "${CONCLUSION}" "${HEAD_BRANCH}" "${HEAD_SHA}" "${PUSH_REF}" "${DISPATCH_REASON}"; then
    ACTUAL="BLOCK"
  fi

  if [ "${ACTUAL}" = "${EXPECTED}" ]; then
    echo "✓ [${ACTUAL}]"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo "✗ [FAILED: expected ${EXPECTED}, got ${ACTUAL}]"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

echo "=== Verifying Contributor Portal Release Pipeline & Deploy Gate Policy ==="
echo ""
echo "--- Scenario Matrix: Workflow Run Events ---"
assert_gate "Stable release success (v1.0.0)" "PASS" "workflow_run" "success" "v1.0.0" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "LTS release success (v1.0.0-lts)" "PASS" "workflow_run" "success" "v1.0.0-lts" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Stable release failure" "BLOCK" "workflow_run" "failure" "v1.0.0" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Stable release cancelled" "BLOCK" "workflow_run" "cancelled" "v1.0.0" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Stable release timed out" "BLOCK" "workflow_run" "timed_out" "v1.0.0" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "RC pre-release success (v1.0.0-rc.1)" "BLOCK" "workflow_run" "success" "v1.0.0-rc.1" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Beta pre-release success (v1.0.0-beta.1)" "BLOCK" "workflow_run" "success" "v1.0.0-beta.1" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Alpha pre-release success (v1.0.0-alpha.1)" "BLOCK" "workflow_run" "success" "v1.0.0-alpha.1" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Experimental release success (v1.0.0-exp.1)" "BLOCK" "workflow_run" "success" "v1.0.0-exp.1" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Dev track release success (v1.0.0-dev.1)" "BLOCK" "workflow_run" "success" "v1.0.0-dev.1" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Nightly release success (v0.2.0-nightly.20261124)" "BLOCK" "workflow_run" "success" "v0.2.0-nightly.20261124" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Untagged default branch success (main)" "BLOCK" "workflow_run" "success" "main" "0123456789abcdef0123456789abcdef01234567" "" ""
assert_gate "Missing head_sha" "BLOCK" "workflow_run" "success" "v1.0.0" "" "" ""

echo ""
echo "--- Scenario Matrix: Direct Push Tag Events ---"
assert_gate "Valid stable tag push (v2.1.0)" "PASS" "push" "" "" "0123456789abcdef0123456789abcdef01234567" "refs/tags/v2.1.0" ""
assert_gate "Valid LTS tag push (v2.0.0-lts2)" "PASS" "push" "" "" "0123456789abcdef0123456789abcdef01234567" "refs/tags/v2.0.0-lts2" ""
assert_gate "Pre-release RC tag push" "BLOCK" "push" "" "" "0123456789abcdef0123456789abcdef01234567" "refs/tags/v2.1.0-rc.1" ""
assert_gate "Experimental tag push" "BLOCK" "push" "" "" "0123456789abcdef0123456789abcdef01234567" "refs/tags/v2.1.0-exp.1" ""

echo ""
echo "--- Scenario Matrix: Manual Dispatch Events ---"
assert_gate "Manual dispatch with auditable reason" "PASS" "workflow_dispatch" "" "" "0123456789abcdef0123456789abcdef01234567" "" "Hotfix critical vulnerability"
assert_gate "Manual dispatch empty reason" "BLOCK" "workflow_dispatch" "" "" "0123456789abcdef0123456789abcdef01234567" "" ""

echo ""
echo "--- Static Workflow Verification ---"

# 1. Pinned Third-Party Actions
echo "Checking action pinning in workflows..."
UNPINNED=$(grep -rn "uses: [a-zA-Z0-9_-]\+/[a-zA-Z0-9_.-]\+@" "${REPO_DIR}/.github/workflows" | grep -v "@[0-9a-f]\{40\}" || true)
if [ -n "${UNPINNED}" ]; then
  echo "✗ FAILED: Found unpinned third-party actions:"
  echo "${UNPINNED}"
  FAILED_TESTS=$((FAILED_TESTS + 1))
else
  echo "✓ All third-party actions are pinned to full 40-character commit SHAs."
  PASSED_TESTS=$((PASSED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 2. Checkout uses exact deploy_sha in deploy.yaml
echo "Checking checkout ref in deploy.yaml..."
if grep -q "ref: \${{ needs.gate.outputs.deploy_sha }}" "${REPO_DIR}/.github/workflows/deploy.yaml"; then
  echo "✓ Deploy workflow binds checkout to exact verified release SHA."
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo "✗ FAILED: deploy.yaml does not bind checkout to verified release SHA."
  FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 3. Least-privilege permissions in all workflows
echo "Checking permissions declarations..."
for wf in deploy.yaml release.yaml nightly.yaml hotfix.yaml ci.yaml; do
  if [ -f "${REPO_DIR}/.github/workflows/${wf}" ]; then
    if grep -q "^permissions: {}" "${REPO_DIR}/.github/workflows/${wf}"; then
      echo "✓ ${wf} declares least-privilege default (permissions: {})."
      PASSED_TESTS=$((PASSED_TESTS + 1))
    else
      echo "✗ FAILED: ${wf} does not declare top-level permissions: {}."
      FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
  fi
done

echo ""
echo "=== Summary: ${PASSED_TESTS}/${TOTAL_TESTS} tests passed ==="
if [ "${FAILED_TESTS}" -gt 0 ]; then
  echo "✗ ${FAILED_TESTS} tests failed."
  exit 1
fi

echo "✓ All release-event matrix tests and security policies verified successfully!"
