// Main — orchestration, event bindings, and init
// Depends on: all other kernel-test modules (via KT)
(function(KT) {
  const { BASIC_TESTS, PERF_JS_TESTS, PERF_DOM_TESTS, PERF_RENDER_TESTS,
          STORAGE_TESTS, MEDIA_CODEC_TESTS, MEDIA_GFX_TESTS, STRESS_TESTS } = KT;

  // ── UI init ──────────────────────────────────────────────
  function renderRows(containerId, tests) {
    const el = document.getElementById(containerId);
    el.innerHTML = tests.map(t =>
      `<div class="kt-row"><span class="kt-row-name">${t.name}</span><span class="kt-row-val waiting" id="v-${t.id}">--</span></div>`
    ).join('');
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.kt-tab');
    const panels = document.querySelectorAll('.kt-panel');
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      panels.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('panel-' + t.dataset.tab).classList.add('active');
    }));
  }

  function initUI() {
    KT.parseBrowserInfo();
    initTabs();
    renderRows('basicTests',      BASIC_TESTS);
    renderRows('perfJsTests',     PERF_JS_TESTS);
    renderRows('perfDomTests',    PERF_DOM_TESTS);
    renderRows('perfRenderTests', PERF_RENDER_TESTS);
    renderRows('storageTests',    STORAGE_TESTS);
    renderRows('mediaCodecTests', MEDIA_CODEC_TESTS);
    renderRows('mediaGfxTests',   MEDIA_GFX_TESTS);
    renderRows('stressTests',     STRESS_TESTS);
  }

  // ── Tab counts ───────────────────────────────────────────
  const TAB_COUNTS = {
    basic:   () => BASIC_TESTS.length,
    perf:    () => PERF_JS_TESTS.length + PERF_DOM_TESTS.length + PERF_RENDER_TESTS.length,
    storage: () => STORAGE_TESTS.length,
    media:   () => MEDIA_CODEC_TESTS.length + MEDIA_GFX_TESTS.length,
    stress:  () => STRESS_TESTS.length,
  };
  const TAB_RUNNERS = {
    basic: KT.runBasic, perf: KT.runPerformance, storage: KT.runStorage,
    media: KT.runMedia, stress: KT.runStress,
  };

  function countAll() {
    return Object.values(TAB_COUNTS).reduce((sum, fn) => sum + fn(), 0);
  }

  function finalize() {
    document.getElementById('globalStatus').textContent = 'Done ✓';
    KT.setButtons(false);
    KT.syncOutput();
    document.getElementById('btnReport').disabled = false;
  }

  // ── Runners ──────────────────────────────────────────────
  async function runAll() {
    KT.resetState();
    KT.setTotal(countAll()); // fix: write to module-level totalTests, not a local shadow
    KT.updateUI();
    document.getElementById('globalStatus').textContent = 'Running...';
    KT.setButtons(true);
    document.getElementById('btnReport').disabled = true;

    await KT.runBasic();
    await KT.runPerformance();
    await KT.runStorage();
    await KT.runMedia();
    await KT.runStress();

    finalize();
  }

  async function runTab(tab) {
    KT.resetState();
    KT.setTotal(TAB_COUNTS[tab]()); // fix: same shadowing bug fixed here
    KT.updateUI();
    document.getElementById('globalStatus').textContent = 'Running ' + tab + '...';
    KT.setButtons(true);
    document.getElementById('btnReport').disabled = true;

    await TAB_RUNNERS[tab]();
    finalize();
  }

  // ── Event bindings ───────────────────────────────────────
  document.getElementById('btnRunAll').addEventListener('click', () => { if (!KT.isRunning()) runAll(); });
  document.querySelectorAll('[data-run]').forEach(btn => btn.addEventListener('click', () => { if (!KT.isRunning()) runTab(btn.dataset.run); }));

  document.getElementById('btnExport').addEventListener('click', () => {
    const d = window.__KERNEL_TEST_RESULT__; if (!d) return;
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kernel_test_' + Date.now() + '.json';
    a.click();
  });

  document.getElementById('btnCopy').addEventListener('click', () => {
    const d = window.__KERNEL_TEST_RESULT__; if (!d) return;
    const text = JSON.stringify(d, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea'); ta.value = text;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    document.getElementById('globalStatus').textContent = 'Copied ✓';
    setTimeout(() => document.getElementById('globalStatus').textContent = 'Done ✓', 1500);
  });

  document.getElementById('btnViewUA').addEventListener('click', () => {
    const ua = navigator.userAgent;
    const overlay = document.getElementById('reportOverlay');
    const content = document.getElementById('reportContent');
    content.innerHTML = `
      <div class="kt-report-header">
        <h2 class="kt-report-title">User-Agent</h2>
        <div class="kt-report-meta">当前浏览器完整 UA 字符串</div>
      </div>
      <div class="kt-report-body">
        <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;font-family:var(--font-mono);font-size:12px;line-height:1.8;color:var(--text-secondary);word-break:break-all;user-select:all;">${ua}</div>
        <button class="kt-btn" id="btnCopyUAInModal" style="margin-top:16px;">复制 UA</button>
      </div>`;
    overlay.classList.add('active');
    document.getElementById('btnCopyUAInModal').addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(ua);
      } else {
        const ta = document.createElement('textarea'); ta.value = ua;
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      document.getElementById('btnCopyUAInModal').textContent = '已复制 ✓';
      setTimeout(() => { document.getElementById('btnCopyUAInModal').textContent = '复制 UA'; }, 1500);
    });
  });

  // ── Baseline import ──────────────────────────────────────
  const fileInput = document.getElementById('baselineFileInput');
  const btnImport = document.getElementById('btnImportBaseline');
  const btnClear = document.getElementById('btnClearBaseline');
  const baselineStatus = document.getElementById('baselineStatus');
  const statusEl = document.getElementById('globalStatus');

  function refreshBaselineUI() {
    const label = KT.getBaselineLabel();
    if (label) {
      baselineStatus.textContent = '基准: ' + label;
      baselineStatus.style.display = '';
      btnClear.style.display = '';
    } else {
      baselineStatus.style.display = 'none';
      btnClear.style.display = 'none';
    }
  }

  btnImport.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const result = KT.importBaseline(data);
        if (result.ok) {
          refreshBaselineUI();
          statusEl.textContent = '基准已导入 ✓';
          setTimeout(() => { statusEl.textContent = 'Ready'; }, 2000);
        } else {
          alert('导入失败: ' + result.reason);
        }
      } catch(err) {
        alert('JSON 解析失败: ' + err.message);
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
  });

  btnClear.addEventListener('click', () => {
    KT.clearBaseline();
    refreshBaselineUI();
    statusEl.textContent = '基准已清除';
    setTimeout(() => { statusEl.textContent = 'Ready'; }, 1500);
  });

  // ── Init ─────────────────────────────────────────────────
  initUI();
  refreshBaselineUI();
})(window.KT);
