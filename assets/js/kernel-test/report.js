// Report generation — builds and shows the report overlay
// Depends on: state.js, tests.js, scoring.js (all via KT)
(function(KT) {
  function generateReport() {
    const d = window.__KERNEL_TEST_RESULT__;
    if (!d) return;

    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const testMap = {};
    [KT.BASIC_TESTS, KT.PERF_JS_TESTS, KT.PERF_DOM_TESTS, KT.PERF_RENDER_TESTS,
      KT.STORAGE_TESTS, KT.MEDIA_CODEC_TESTS, KT.MEDIA_GFX_TESTS, KT.STRESS_TESTS].forEach(arr => {
      arr.forEach(t => { testMap[t.id] = t.name; });
    });

    const scoreResult = KT.calcScore(d.tabs.basic);
    const meta = scoreResult ? KT.scoreMeta(scoreResult.score) : null;
    const passRate = d.summary.total > 0 ? Math.round((d.summary.pass / d.summary.total) * 100) : 0;

    const baseline = KT.getBaseline && KT.getBaseline();
    const baselineScore = baseline ? KT.calcScore(baseline.tabs.basic) : null;

    const scoreHtml = scoreResult ? `
      <div class="kt-report-score-block" style="border-color:${meta.color}33;background:${meta.color}0d;">
        <div class="kt-report-score-num" style="color:${meta.color};">${scoreResult.score}</div>
        <div class="kt-report-score-info">
          <div class="kt-report-score-label" style="color:${meta.color};">${meta.badge} ${meta.label} — ${meta.sublabel}</div>
          <div class="kt-report-score-sub">API 能力得分 · 满分 100 · 基础分 ${KT.SCORE_BASE}</div>
          <div class="kt-report-score-sub">有效项得分 ${scoreResult.earned} / ${scoreResult.possible} 分（N/A 项已排除）</div>
        </div>
        <a href="kernel_test_help.html#scoring" class="kt-report-score-help" target="_blank">评分说明 ↗</a>
      </div>
    ` : '';

    const compareHtml = (baseline && scoreResult && baselineScore) ? `
      <div class="kt-report-compare-header">
        <div class="kt-report-compare-item"><strong>${baselineScore.score}</strong>旧核 Chromium ${esc(baseline.browser.chromium)}</div>
        <span class="kt-report-compare-arrow">→</span>
        <div class="kt-report-compare-item"><strong>${scoreResult.score}</strong>新核 Chromium ${esc(d.browser.chromium)}</div>
        <div class="kt-report-compare-item"><strong class="${scoreResult.score > baselineScore.score ? 'score-up' : scoreResult.score < baselineScore.score ? 'score-down' : 'score-same'}">${scoreResult.score > baselineScore.score ? '+' : ''}${scoreResult.score - baselineScore.score}</strong>分差</div>
      </div>
    ` : '';

    let html = `
      <div class="kt-report-header">
        <h2 class="kt-report-title">WebView 内核测试报告</h2>
        <div class="kt-report-meta">
          时间: ${esc(new Date(d.timestamp).toLocaleString())}<br>
          设备: Chromium ${esc(d.browser.chromium)} / Android ${esc(d.browser.android)}<br>
          系统: CPU ${esc(d.browser.cpu)} cores / Memory ${esc(d.browser.memory)}
        </div>
      </div>
      <div class="kt-report-body">
        ${compareHtml}
        ${scoreHtml}
        <div class="kt-report-summary-box">
          <div><span>Total:</span> <strong>${d.summary.total}</strong></div>
          <div><span>Pass:</span> <strong class="val-pass">${d.summary.pass}</strong></div>
          <div><span>Fail:</span> <strong class="val-fail">${d.summary.fail}</strong></div>
          <div><span>Unsupported:</span> <strong>${d.summary.unsupported}</strong></div>
          <div><span>通过率:</span> <strong>${passRate}%</strong></div>
        </div>
    `;

    const sections = [
      { key: 'basic',       title: 'Basic (Web API 能力)' },
      { key: 'performance', title: 'Performance (性能基准)' },
      { key: 'storage',     title: 'Storage (存储能力)' },
      { key: 'media',       title: 'Media (音视频与图形)' },
      { key: 'stress',      title: 'Stress (压力测试)' },
    ];

    const parseNum = (s) => { const m = String(s).match(/^([\d.]+)/); return m ? parseFloat(m[1]) : null; };

    sections.forEach(sec => {
      const tabResults = d.tabs[sec.key];
      if (!tabResults || Object.keys(tabResults).length === 0) return;
      const baseTab = baseline && baseline.tabs[sec.key];
      const hasCompare = baseTab && Object.keys(baseTab).length > 0;

      html += `<h3 class="kt-report-section-title">${sec.title}</h3>`;

      if (hasCompare) {
        html += `<table class="kt-report-table"><thead><tr>
          <th class="col-name">测试项</th><th class="col-old">旧核</th><th class="col-new">新核</th><th class="col-delta">变化</th>
        </tr></thead><tbody>`;

        Object.entries(tabResults).forEach(([id, val]) => {
          const name = testMap[id] || id;
          const newVal = String(val);
          const oldVal = baseTab[id] !== undefined ? String(baseTab[id]) : '--';
          const weight = KT.SCORE_WEIGHTS[id];
          const weightBadge = weight ? `<span class="kt-report-weight">${weight}pt</span>` : '';

          let deltaHtml = '—', deltaClass = 'delta-same';
          const isPass = v => ['PASS','Supported'].includes(v);
          const isFail = v => ['FAIL','N/A','TIMEOUT','ERROR'].includes(v) || v === '--';

          if ((isPass(newVal) || isFail(newVal)) && (isPass(oldVal) || isFail(oldVal))) {
            if (!isPass(oldVal) && isPass(newVal)) { deltaHtml = '✓ 新增'; deltaClass = 'delta-improve'; }
            else if (isPass(oldVal) && !isPass(newVal)) { deltaHtml = '✗ 退化'; deltaClass = 'delta-regress'; }
          } else {
            const isFps = newVal.includes('fps');
            const oN = parseNum(oldVal), nN = parseNum(newVal);
            if (oN != null && nN != null && oN > 0) {
              const pct = Math.round(((nN - oN) / oN) * 100);
              const improved = isFps ? (nN > oN) : (nN < oN);
              const degraded = isFps ? (nN < oN) : (nN > oN);
              if (degraded && Math.abs(pct) > 10) deltaClass = 'delta-regress';
              else if (improved && Math.abs(pct) > 10) deltaClass = 'delta-improve';
              deltaHtml = (pct > 0 ? '+' : '') + pct + '%';
            } else { deltaHtml = '--'; }
          }

          const iconFor = v => {
            if (isPass(v)) return '✓';
            if (['FAIL','TIMEOUT','ERROR'].includes(v) || String(v).includes('FAIL')) return '✗';
            if (v === 'N/A') return '-';
            return esc(v);
          };

          html += `<tr>
            <td class="col-name">${esc(name)}${weightBadge}</td>
            <td class="col-old">${iconFor(oldVal)}</td>
            <td class="col-new">${iconFor(newVal)}</td>
            <td class="col-delta ${deltaClass}">${deltaHtml}</td>
          </tr>`;
        });

        html += `</tbody></table>`;
      } else {
        html += `<table class="kt-report-table"><tbody>`;
        Object.entries(tabResults).forEach(([id, val]) => {
          const name = testMap[id] || id;
          const valStr = String(val);
          let icon = '·', valClass = '';
          if (valStr === 'PASS' || valStr === 'Supported')                            { icon = '✓'; valClass = 'val-pass'; }
          else if (valStr === 'FAIL')                                                  { icon = '✗'; valClass = 'val-fail'; }
          else if (valStr === 'N/A')                                                   { icon = '-'; valClass = 'val-na'; }
          else if (valStr.includes('FAIL') || valStr === 'TIMEOUT' || valStr === 'ERROR') { icon = '✗'; valClass = 'val-fail'; }
          else                                                                         { icon = '✓'; valClass = 'val-metric'; }

          const weight = KT.SCORE_WEIGHTS[id];
          const weightBadge = weight ? `<span class="kt-report-weight">${weight}pt</span>` : '';

          html += `<tr>
            <td class="col-icon ${valClass}">${icon}</td>
            <td class="col-name">${esc(name)}${weightBadge}</td>
            <td class="col-val ${valClass}">${esc(valStr)}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
      }
    });

    html += `</div>`;
    document.getElementById('reportContent').innerHTML = html;
    document.getElementById('reportOverlay').classList.add('active');
  }

  function closeReport() {
    document.getElementById('reportOverlay').classList.remove('active');
  }

  document.getElementById('btnReport').addEventListener('click', generateReport);
  document.getElementById('btnCloseReport').addEventListener('click', closeReport);
  document.getElementById('reportOverlay').addEventListener('click', e => {
    if (e.target.id === 'reportOverlay') closeReport();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeReport();
  });

  KT.generateReport = generateReport;
})(window.KT);
