// Scoring — API capability scoring logic
// Depends on: (standalone, reads KT.results indirectly via __KERNEL_TEST_RESULT__)
(function(KT) {
  // N/A items are excluded from both earned and possible (environment restrictions ≠ failures)
  KT.SCORE_WEIGHTS = {
    // Core 5pt — missing directly blocks business functionality
    localStorage: 5, sessionStorage: 5, indexedDB: 5, fetch: 5,
    websocket: 5, wasm: 5, webgl: 5, canvas2d: 5, crypto: 5,
    // Important 3pt — mainstream features, partial impact when missing
    xhr: 3, worker: 3, webgl2: 3, webrtc: 3,
    intersectionObs: 3, resizeObs: 3, mutationObs: 3,
    // Extended 1pt — bonus items, acceptable if absent
    serviceWorker: 1, mediaRecorder: 1,
    sharedWorker: 1, offscreen: 1, webgpu: 1, broadcastCh: 1,
    sharedBuf: 1, notification: 1, geolocation: 1, perfObserver: 1,
  };
  KT.SCORE_BASE = 20;

  KT.calcScore = function calcScore(basicResults) {
    if (!basicResults) return null;
    let earned = 0, possible = 0;
    Object.entries(KT.SCORE_WEIGHTS).forEach(([id, w]) => {
      const val = basicResults[id];
      if (val === 'N/A' || val === undefined) return; // exclude env-restricted items
      possible += w;
      if (val === 'PASS') earned += w;
    });
    if (possible === 0) return null;
    return {
      score: KT.SCORE_BASE + Math.round((earned / possible) * (100 - KT.SCORE_BASE)),
      earned,
      possible,
    };
  };

  KT.scoreMeta = function scoreMeta(score) {
    if (score >= 95) return { label: '优秀', sublabel: '可发版',    color: '#4ade80', badge: '🟢' };
    if (score >= 85) return { label: '良好', sublabel: '关注失分项', color: '#f5a623', badge: '🟡' };
    if (score >= 70) return { label: '待改进', sublabel: '需评估影响', color: '#fb923c', badge: '🟠' };
    return             { label: '不通过', sublabel: '阻塞升核',   color: '#ff5555', badge: '🔴' };
  };
})(window.KT);
