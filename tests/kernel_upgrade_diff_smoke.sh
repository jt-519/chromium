#!/usr/bin/env bash
set -euo pipefail

test -f "pages/chromium/kernel_upgrade_diff.html"
grep -q "WebView 内核差异分析" "pages/chromium/kernel_upgrade_diff.html"
grep -q "Mutation Events" "pages/chromium/kernel_upgrade_diff.html"
grep -q "kernel_upgrade_diff.html" "index.html"
