#!/usr/bin/env bash
set -euo pipefail
: "${SIMULATOR_UDID:?Set SIMULATOR_UDID to the booted test device}"
cd "$(dirname "$0")/.."
mkdir -p .qa/recordings
xcrun simctl io "$SIMULATOR_UDID" recordVideo --codec=h264 ".qa/recordings/${1:-walkthrough}.mp4"
