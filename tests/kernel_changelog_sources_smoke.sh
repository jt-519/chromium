#!/usr/bin/env bash
set -euo pipefail

grep -q "发版变更日志" "pages/chromium/kernel/kernel_changelog.html"
grep -q "整理规则 / 工作流" "pages/chromium/kernel/kernel_changelog.html"
grep -q "data-tab=\"changelog\"" "pages/chromium/kernel/kernel_changelog.html"
grep -q "data-tab=\"workflow\"" "pages/chromium/kernel/kernel_changelog.html"
grep -q "来源策略" "pages/chromium/kernel/kernel_changelog.html"
grep -q "Step 1：建立版本映射" "pages/chromium/kernel/kernel_changelog.html"
grep -q "Step 6：按需进行源码核对" "pages/chromium/kernel/kernel_changelog.html"
grep -q "最终输出结构" "pages/chromium/kernel/kernel_changelog.html"
grep -q "Chrome Release Notes" "pages/chromium/kernel/kernel_changelog.html"
grep -q "Chromium Source Log" "pages/chromium/kernel/kernel_changelog.html"
grep -q "AndroidX WebKit" "pages/chromium/kernel/kernel_changelog.html"
