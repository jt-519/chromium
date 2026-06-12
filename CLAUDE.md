# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

纯静态站点，无构建步骤，无 npm/bundler。部署于 GitHub Pages：https://jt-519.github.io/chromium/

## 本地开发

直接用浏览器打开 `index.html`，或启动本地静态服务器（推荐，避免 `file://` 协议下 CSS mask 等资源加载限制）：

```bash
python3 -m http.server 8080
# 访问 http://localhost:8080
```

## Smoke Tests

```bash
bash tests/kernel_changelog_sources_smoke.sh
bash tests/kernel_upgrade_diff_smoke.sh
```

**注意**：smoke tests 目前引用的是旧路径 `pages/chromium/`，实际文件在 `pages/`，运行前需先修复路径。

## 架构说明

### 页面结构

- `index.html` — 首页，工具导航卡片，所有样式内联在 `<style>` 块中（不引用 pages.css）
- `pages/*.html` — 10 个工具页，均通过 `../assets/css/pages.css` 引用共享样式

### 共享样式

`assets/css/pages.css` 是所有 `pages/` 内页的设计系统。index.html 有独立的内联样式，两者设计 token（颜色、字体变量）保持一致但互相独立。

### JS 模块

- `assets/js/qrcode.js` — 二维码生成，所有页面底部均引入，显示当前页面 QR 码按钮
- `assets/js/mse_test.js` — MSE 媒体源测试逻辑，供 `pages/mse_test.html` 使用
- `assets/js/kernel-test/` — Kernel Test Suite 模块（main.js / tests.js / runners.js / scoring.js / baseline.js / report.js / config.js / state.js），供 `pages/kernel_test.html` 使用
- `assets/js/vendor/` — 第三方库

### 图标

`assets/icons/` 存放 10 个 SVG 图标，仅 `index.html` 使用。图标通过 CSS mask 技术渲染：`.ic` 元素设置 `background-color: currentColor`，inline style 直接指定 `-webkit-mask-image` 和 `mask-image`（不使用 CSS 自定义属性传递 `url()`，避免浏览器 URL 解析问题）。

### 数据文件

`data/crx/` 存放 Chrome 扩展 `.crx` 文件，供测试页面内的扩展管理功能使用。
