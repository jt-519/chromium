// Baseline — import, validate, persist, access a prior-version test result
// Depends on: config.js (KT namespace)
(function(KT) {
  const STORAGE_KEY = 'kernel_test_baseline';

  function validate(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.timestamp || !data.ua) return false;
    if (!data.browser || typeof data.browser.chromium === 'undefined') return false;
    if (!data.summary || typeof data.summary.total !== 'number') return false;
    if (!data.tabs || typeof data.tabs !== 'object') return false;
    if (!data.tabs.basic || typeof data.tabs.basic !== 'object') return false;
    return true;
  }

  function importBaseline(jsonData) {
    if (!validate(jsonData)) return { ok: false, reason: 'JSON 结构不符合 __KERNEL_TEST_RESULT__ 格式' };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jsonData));
    } catch(e) {
      return { ok: false, reason: '写入 localStorage 失败: ' + e.message };
    }
    return { ok: true };
  }

  function getBaseline() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return validate(data) ? data : null;
    } catch(e) { return null; }
  }

  function clearBaseline() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getBaselineLabel() {
    const b = getBaseline();
    if (!b) return null;
    return 'Chromium ' + (b.browser.chromium || '?');
  }

  Object.assign(KT, { importBaseline, getBaseline, clearBaseline, getBaselineLabel });
})(window.KT);
