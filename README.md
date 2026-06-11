# chromium

https://jt-519.github.io/chromium

Chromium 升核开发测试工具集。

## 目录结构

```
jt-519-chromium/
├── pages/
│   └── chromium/
│       ├── benchmarks/
│       │   ├── webview_benchmarks.html  # 升核基准工具集
│       │   ├── webview_resources.html   # WebView 资源参考
│       │   └── webview_test_plan.html   # 升核测试方案 (P1-P4)
│       ├── kernel/
│       │   ├── kernel_test.html         # Kernel Test Suite（自动化回归）
│       │   ├── kernel_test_help.html    # 测试帮助文档
│       │   ├── kernel_changelog.html    # 版本变更记录 (M124→M141)
│       │   └── kernel_upgrade_diff.html # 内核差异分析
│       └── tests/
│           ├── chromium_test.html       # CSS 特性测试
│           ├── mse_test.html            # MSE / 扩展管理测试
│           └── nav_123.html             # 导航行为测试
├── assets/
│   ├── css/                             # 全局样式
│   └── js/
│       ├── kernel-test/                 # Kernel Test Suite 模块
│       └── vendor/                      # 第三方库
├── data/
│   └── crx/                             # Chrome 扩展包
└── tests/
    ├── kernel_changelog_sources_smoke.sh
    └── kernel_upgrade_diff_smoke.sh
```

## Chromium 升核工具链

### 基准测试 (`pages/`)

| 页面 | 用途 |
|------|------|
| [webview_benchmarks.html](pages/webview_benchmarks.html) | Speedometer 3.0 / JetStream 2 / MotionMark / WebGL Aquarium 等基准工具集 |
| [webview_test_plan.html](pages/webview_test_plan.html) | 升核测试方案：P1 性能基准 → P2 兼容性 → P3 业务回归 → P4 灰度验证 |
| [webview_resources.html](pages/webview_resources.html) | WebView 升核参考资源汇总 |

### 内核分析 (`pages/`)

| 页面 | 用途 |
|------|------|
| [kernel_test.html](pages/kernel_test.html) | Kernel Test Suite — API 兼容性 + 性能回归自动化测试，支持 CDP 采集 |
| [kernel_upgrade_diff.html](pages/kernel_upgrade_diff.html) | 内核差异分析 — M124→M141 Breaking Changes / Security / WebView 差异速查 |
| [kernel_changelog.html](pages/kernel_changelog.html) | 版本变更记录 — 逐版本重大变更，按影响等级筛选，附官方来源 |

### 功能测试 (`pages/`)

| 页面 | 用途 |
|------|------|
| [mse_test.html](pages/mse_test.html) | MSE 媒体源扩展测试 / 浏览器扩展管理 |
| [chromium_test.html](pages/chromium_test.html) | CSS 特性支持测试 |
| [nav_123.html](pages/nav_123.html) | 导航行为测试 |

## Smoke Tests

```bash
bash tests/kernel_changelog_sources_smoke.sh
bash tests/kernel_upgrade_diff_smoke.sh
```
