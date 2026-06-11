// State management — shared mutable state and UI helpers
// Depends on: config.js (KT.CFG)
(function(KT) {
  let totalTests = 0, completed = 0, passed = 0, failed = 0, unsupported = 0;
  let isRunning = false;
  const results = { basic: {}, performance: {}, storage: {}, media: {}, stress: {} };

  function resetState() {
    totalTests = 0; completed = 0; passed = 0; failed = 0; unsupported = 0;
    Object.keys(results).forEach(k => results[k] = {});
  }

  function setTotal(n) { totalTests = n; }

  function updateUI() {
    document.getElementById('sTotal').textContent = totalTests;
    document.getElementById('sPass').textContent = passed;
    document.getElementById('sFail').textContent = failed;
    const pct = totalTests > 0 ? (completed / totalTests * 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
  }

  function setRowValue(id, val, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.className = 'kt-row-val ' + (cls || '');
  }

  function markPass(tab, id, val) {
    results[tab][id] = val || 'PASS';
    setRowValue('v-' + id, val || 'PASS', val ? 'metric' : 'pass');
    completed++; passed++; updateUI(); syncOutput();
  }
  function markFail(tab, id, reason) {
    results[tab][id] = reason || 'FAIL';
    setRowValue('v-' + id, reason || 'FAIL', 'fail');
    completed++; failed++; updateUI(); syncOutput();
  }
  function markUnsupported(tab, id) {
    results[tab][id] = 'N/A';
    setRowValue('v-' + id, 'N/A', 'unsupported');
    completed++; unsupported++; updateUI(); syncOutput();
  }
  function markRunning(id) { setRowValue('v-' + id, 'RUNNING...', 'running'); }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function withTimeout(fn, ms) {
    return Promise.race([
      fn(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms))
    ]);
  }

  function setButtons(disabled) {
    isRunning = disabled;
    document.getElementById('btnRunAll').disabled = disabled;
    document.querySelectorAll('[data-run]').forEach(b => b.disabled = disabled);
  }

  let _browserInfo = null;

  function parseOS(ua) {
    const android = ua.match(/Android ([\d.]+)/);
    if (android) return 'Android ' + android[1];
    const ios = ua.match(/OS ([\d_]+) like Mac OS X/);
    if (ios) return 'iOS ' + ios[1].replace(/_/g, '.');
    const mac = ua.match(/Mac OS X ([\d._]+)/);
    if (mac) return 'macOS ' + mac[1].replace(/_/g, '.');
    const win = ua.match(/Windows NT ([\d.]+)/);
    if (win) {
      const ver = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
      return 'Windows ' + (ver[win[1]] || win[1]);
    }
    const linux = ua.match(/Linux (x86_64|aarch64|armv\d+l?|i686)/);
    if (linux) return 'Linux ' + linux[1];
    if (/Linux/.test(ua)) return 'Linux';
    if (/CrOS/.test(ua)) return 'ChromeOS';
    return null;
  }

  function parseBrowserInfo() {
    const ua = navigator.userAgent;
    const chromiumMatch = ua.match(/Chrom(?:e|ium)\/(\d+)/);
    const os = parseOS(ua);
    _browserInfo = {
      'User Agent': ua,
      'Chromium': chromiumMatch ? chromiumMatch[1] : 'N/A',
    };
    if (os) _browserInfo['OS'] = os;
    _browserInfo['Platform'] = navigator.platform;
    _browserInfo['Language'] = navigator.language;
    _browserInfo['CPU Cores'] = navigator.hardwareConcurrency || 'N/A';
    _browserInfo['Screen'] = screen.width + '×' + screen.height + ' @' + (window.devicePixelRatio || 1) + 'x';
    _browserInfo['Cookie Enabled'] = navigator.cookieEnabled ? 'Yes' : 'No';

    const container = document.getElementById('browserInfo');
    container.innerHTML = Object.entries(_browserInfo).map(([k, v]) =>
      `<div class="kt-info-item"><div class="kt-info-label">${k}</div><div class="kt-info-value">${v}</div></div>`
    ).join('');
    return _browserInfo;
  }

  function syncOutput() {
    const info = _browserInfo;
    const output = {
      timestamp: new Date().toISOString(),
      ua: navigator.userAgent,
      browser: {
        chromium: info ? info.Chromium : 'N/A',
        os: info ? (info.OS || info.Platform) : 'N/A',
        cpu: navigator.hardwareConcurrency,
        screen: screen.width + 'x' + screen.height + '@' + (window.devicePixelRatio || 1),
      },
      summary: { total: totalTests, pass: passed, fail: failed, unsupported, completed },
      config: KT.CFG,
      tabs: results,
    };
    window.__KERNEL_TEST_RESULT__ = output;
    try { localStorage.setItem('kernel_test_result', JSON.stringify(output)); } catch(e) {}
  }

  // Expose to KT namespace
  Object.assign(KT, {
    results, isRunning: () => isRunning,
    resetState, setTotal, updateUI, setButtons,
    markPass, markFail, markUnsupported, markRunning,
    delay, withTimeout, parseBrowserInfo, syncOutput,
  });
})(window.KT);
