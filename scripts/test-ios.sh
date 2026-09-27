#!/usr/bin/env bash
set -euo pipefail
: "${SIMULATOR_UDID:?Set SIMULATOR_UDID to the booted test device}"
cd "$(dirname "$0")/.."
mkdir -p .qa/maestro
maestro --device "$SIMULATOR_UDID" test --test-output-dir .qa/maestro scripts/maestro
