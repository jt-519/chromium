// Test runners — one async function per tab
// Depends on: state.js, tests.js, config.js (all via KT)
(function(KT) {
  const { CFG, markPass, markFail, markUnsupported, markRunning, delay, withTimeout } = KT;
  const { BASIC_TESTS, PERF_JS_TESTS, PERF_DOM_TESTS, PERF_RENDER_TESTS,
          STORAGE_TESTS, MEDIA_CODEC_TESTS, MEDIA_GFX_TESTS, STRESS_TESTS } = KT;

  async function runBasic() {
    for (const t of BASIC_TESTS) {
      markRunning(t.id);
      await delay(30);
      try {
        const r = await t.fn();
        if (r) markPass('basic', t.id);
        else markUnsupported('basic', t.id);
      } catch(e) { markUnsupported('basic', t.id); }
    }
  }

  async function runPerformance() {
    markRunning('jsLoop'); await delay(50);
    let t0 = performance.now();
    for (let i = 0; i < 10000000; i++) Math.sqrt(i);
    let ms = Math.round(performance.now() - t0);
    markPass('performance', 'jsLoop', ms + ' ms');

    markRunning('jsonParse'); await delay(50);
    const bigObj = {};
    for (let i = 0; i < 10000; i++) bigObj['key_' + i] = 'value_' + Math.random();
    t0 = performance.now();
    const str = JSON.stringify(bigObj); JSON.parse(str);
    ms = Math.round(performance.now() - t0);
    markPass('performance', 'jsonParse', ms + ' ms');

    markRunning('regexBench'); await delay(50);
    const re = /(\d+)-(\w+)/g;
    const testStr = '123-abc '.repeat(100000);
    t0 = performance.now(); testStr.match(re);
    ms = Math.round(performance.now() - t0);
    markPass('performance', 'regexBench', ms + ' ms');

    markRunning('wasmBench'); await delay(50);
    try {
      // WASM module: i32 fib(i32 n) — recursive fibonacci
      // (module (func $fib (param i32) (result i32)
      //   (if (result i32) (i32.lt_s (local.get 0) (i32.const 2))
      //     (local.get 0)
      //     (i32.add (call $fib (i32.sub (local.get 0) (i32.const 1)))
      //              (call $fib (i32.sub (local.get 0) (i32.const 2))))))
      //   (export "fib" (func $fib)))
      const wasmBytes = new Uint8Array([
        0x00,0x61,0x73,0x6d,0x01,0x00,0x00,0x00,
        0x01,0x06,0x01,0x60,0x01,0x7f,0x01,0x7f,
        0x03,0x02,0x01,0x00,
        0x07,0x07,0x01,0x03,0x66,0x69,0x62,0x00,0x00,
        0x0a,0x1e,0x01,0x1c,0x00,0x20,0x00,0x41,0x02,0x49,0x04,0x7f,0x20,0x00,0x05,
        0x20,0x00,0x41,0x01,0x6b,0x10,0x00,0x20,0x00,0x41,0x02,0x6b,0x10,0x00,0x6a,0x0b,0x0b
      ]);
      const mod = await WebAssembly.instantiate(wasmBytes);
      const fib = mod.instance.exports.fib;
      t0 = performance.now();
      const result = fib(32);
      ms = Math.round(performance.now() - t0);
      if (result === 2178309) markPass('performance', 'wasmBench', ms + ' ms');
      else markFail('performance', 'wasmBench', 'WRONG RESULT');
    } catch(e) { markFail('performance', 'wasmBench', 'ERROR'); }

    markRunning('domCreate'); await delay(50);
    const frag = document.createDocumentFragment();
    t0 = performance.now();
    for (let i = 0; i < 10000; i++) { const d = document.createElement('div'); d.textContent = i; frag.appendChild(d); }
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;top:0;';
    document.body.appendChild(container);
    container.appendChild(frag);
    ms = Math.round(performance.now() - t0);
    markPass('performance', 'domCreate', ms + ' ms');

    markRunning('domDelete'); await delay(50);
    t0 = performance.now(); container.innerHTML = '';
    ms = Math.round(performance.now() - t0);
    document.body.removeChild(container);
    markPass('performance', 'domDelete', ms + ' ms');

    markRunning('domQuery'); await delay(50);
    const qc = document.createElement('div');
    qc.style.cssText = 'position:absolute;left:-9999px;';
    for (let i = 0; i < 100; i++) { const s = document.createElement('span'); s.className = 'test-q'; qc.appendChild(s); }
    document.body.appendChild(qc);
    t0 = performance.now();
    for (let i = 0; i < 10000; i++) qc.querySelectorAll('.test-q');
    ms = Math.round(performance.now() - t0);
    document.body.removeChild(qc);
    markPass('performance', 'domQuery', ms + ' ms');

    markRunning('scrollFps'); await delay(50);
    const scrollBox = document.createElement('div');
    scrollBox.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;overflow:auto;z-index:-1;opacity:0;';
    for (let i = 0; i < 5000; i++) { const d = document.createElement('div'); d.style.height = '30px'; d.textContent = 'Item ' + i; scrollBox.appendChild(d); }
    document.body.appendChild(scrollBox);
    let frames = 0, scrollStart = performance.now();
    const dur = CFG.scrollDuration;
    const scrollRaf = () => { frames++; if (performance.now() - scrollStart < dur) requestAnimationFrame(scrollRaf); };
    requestAnimationFrame(scrollRaf);
    const scrollInterval = setInterval(() => { scrollBox.scrollTop += 200; }, 16);
    await delay(dur);
    clearInterval(scrollInterval);
    const fps = Math.round(frames / (dur / 1000));
    document.body.removeChild(scrollBox);
    markPass('performance', 'scrollFps', fps + ' fps');

    markRunning('canvasFps');
    const canvasBox = document.getElementById('canvasBox');
    const canvas = document.getElementById('fpsCanvas');
    canvasBox.style.display = 'block';
    canvas.width = canvasBox.clientWidth; canvas.height = 200;
    const ctx = canvas.getContext('2d');
    const balls = [];
    for (let i = 0; i < CFG.canvasBalls; i++) {
      balls.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, r: 3 + Math.random() * 4, c: `hsl(${Math.random() * 360},70%,60%)` });
    }
    let cFrames = 0; const cStart = performance.now(); let running = true;
    const cdur = CFG.canvasDuration;
    const animate = () => {
      if (!running) return;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const b of balls) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > canvas.width) b.vx *= -1;
        if (b.y < 0 || b.y > canvas.height) b.vy *= -1;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = b.c; ctx.fill();
      }
      cFrames++; requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    await delay(cdur);
    running = false;
    const cFps = Math.round(cFrames / (cdur / 1000));
    canvasBox.style.display = 'none';
    markPass('performance', 'canvasFps', cFps + ' fps');

    markRunning('webglFps'); await delay(50);
    try {
      const glCanvas = document.createElement('canvas');
      glCanvas.width = 400; glCanvas.height = 300;
      const gl = glCanvas.getContext('webgl');
      if (!gl) { markFail('performance', 'webglFps', 'NO WEBGL'); }
      else {
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
        gl.compileShader(vs);
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, 'precision mediump float;uniform vec4 c;void main(){gl_FragColor=c;}');
        gl.compileShader(fs);
        const prog = gl.createProgram();
        gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);
        const pLoc = gl.getAttribLocation(prog, 'p');
        const cLoc = gl.getUniformLocation(prog, 'c');
        const triCount = CFG.webglTriangles;
        const verts = new Float32Array(triCount * 6);
        for (let i = 0; i < triCount; i++) {
          const cx = Math.random() * 2 - 1, cy = Math.random() * 2 - 1, sz = 0.02;
          const off = i * 6;
          verts[off] = cx; verts[off+1] = cy;
          verts[off+2] = cx + sz; verts[off+3] = cy;
          verts[off+4] = cx; verts[off+5] = cy + sz;
        }
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(pLoc); gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

        let gFrames = 0; let gRunning = true;
        const gDur = CFG.webglDuration;
        const glAnimate = () => {
          if (!gRunning) return;
          gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
          for (let i = 0; i < triCount; i++) {
            gl.uniform4f(cLoc, Math.random(), Math.random(), Math.random(), 1);
            gl.drawArrays(gl.TRIANGLES, i * 3, 3);
          }
          gFrames++; requestAnimationFrame(glAnimate);
        };
        requestAnimationFrame(glAnimate);
        await delay(gDur);
        gRunning = false;
        const gFps = Math.round(gFrames / (gDur / 1000));
        markPass('performance', 'webglFps', gFps + ' fps');
      }
    } catch(e) { markFail('performance', 'webglFps', 'ERROR'); }
  }

  async function runStorage() {
    markRunning('lsWrite'); await delay(30);
    try { let t0 = performance.now(); for (let i = 0; i < 1000; i++) localStorage.setItem('_kt' + i, 'v' + i); let ms = Math.round(performance.now() - t0); markPass('storage', 'lsWrite', ms + ' ms'); } catch(e) { markFail('storage', 'lsWrite'); }

    markRunning('lsRead'); await delay(30);
    try { let t0 = performance.now(); for (let i = 0; i < 1000; i++) localStorage.getItem('_kt' + i); let ms = Math.round(performance.now() - t0); markPass('storage', 'lsRead', ms + ' ms'); } catch(e) { markFail('storage', 'lsRead'); }

    markRunning('lsDelete'); await delay(30);
    try { let t0 = performance.now(); for (let i = 0; i < 1000; i++) localStorage.removeItem('_kt' + i); let ms = Math.round(performance.now() - t0); markPass('storage', 'lsDelete', ms + ' ms'); } catch(e) { markFail('storage', 'lsDelete'); }

    markRunning('ssWrite'); await delay(30);
    try { let t0 = performance.now(); for (let i = 0; i < 1000; i++) sessionStorage.setItem('_kt' + i, 'v'); for (let i = 0; i < 1000; i++) sessionStorage.removeItem('_kt' + i); let ms = Math.round(performance.now() - t0); markPass('storage', 'ssWrite', ms + ' ms'); } catch(e) { markFail('storage', 'ssWrite'); }

    markRunning('idbWrite'); await delay(30);
    try {
      await new Promise((res) => { const r = indexedDB.deleteDatabase('_ktTest'); r.onsuccess = res; r.onerror = res; r.onblocked = res; });
      const db = await new Promise((res, rej) => { const r = indexedDB.open('_ktTest', 1); r.onupgradeneeded = e => e.target.result.createObjectStore('s', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = rej; });
      let t0 = performance.now();
      const tx = db.transaction('s', 'readwrite'); const store = tx.objectStore('s');
      for (let i = 0; i < 100; i++) store.put({ id: i, data: 'x'.repeat(100) });
      await new Promise(r => { tx.oncomplete = r; });
      let ms = Math.round(performance.now() - t0);
      markPass('storage', 'idbWrite', ms + ' ms');

      markRunning('idbRead');
      t0 = performance.now();
      const tx2 = db.transaction('s', 'readonly'); const store2 = tx2.objectStore('s');
      for (let i = 0; i < 100; i++) store2.get(i);
      await new Promise(r => { tx2.oncomplete = r; });
      ms = Math.round(performance.now() - t0);
      markPass('storage', 'idbRead', ms + ' ms');
      db.close();
      indexedDB.deleteDatabase('_ktTest');
    } catch(e) {
      markFail('storage', 'idbWrite');
      markRunning('idbRead');
      markFail('storage', 'idbRead');
    }

    markRunning('cookie'); await delay(30);
    try {
      document.cookie = '_kt=1;path=/';
      const has = document.cookie.includes('_kt=1');
      document.cookie = '_kt=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/';
      if (has) markPass('storage', 'cookie'); else markFail('storage', 'cookie');
    } catch(e) { markFail('storage', 'cookie'); }
  }

  async function runMedia() {
    const v = document.createElement('video');
    const a = document.createElement('audio');

    const codecs = [
      { id: 'h264', test: () => v.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '' },
      { id: 'vp9',  test: () => v.canPlayType('video/webm; codecs="vp9"') !== '' },
      { id: 'h265', test: () => v.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"') !== '' || v.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"') !== '' },
      { id: 'av1',  test: () => v.canPlayType('video/mp4; codecs="av01.0.01M.08"') !== '' },
      { id: 'aac',  test: () => a.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '' },
      { id: 'opus', test: () => a.canPlayType('audio/webm; codecs="opus"') !== '' },
    ];
    for (const c of codecs) {
      markRunning(c.id); await delay(30);
      try { if (c.test()) markPass('media', c.id, 'Supported'); else markUnsupported('media', c.id); }
      catch(e) { markUnsupported('media', c.id); }
    }

    markRunning('gfxWebgl'); await delay(30);
    try { const cv = document.createElement('canvas'); const gl = cv.getContext('webgl'); if (gl) { gl.clearColor(1, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); markPass('media', 'gfxWebgl'); } else markUnsupported('media', 'gfxWebgl'); } catch(e) { markUnsupported('media', 'gfxWebgl'); }

    markRunning('gfxWebgl2'); await delay(30);
    try { const cv = document.createElement('canvas'); const gl = cv.getContext('webgl2'); if (gl) { gl.clearColor(0, 1, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); markPass('media', 'gfxWebgl2'); } else markUnsupported('media', 'gfxWebgl2'); } catch(e) { markUnsupported('media', 'gfxWebgl2'); }

    markRunning('gfxCanvas'); await delay(30);
    try { const cv = document.createElement('canvas'); const ctx = cv.getContext('2d'); ctx.fillRect(0, 0, 10, 10); markPass('media', 'gfxCanvas'); } catch(e) { markFail('media', 'gfxCanvas'); }

    markRunning('gfxWebrtc'); await delay(30);
    try { if (typeof RTCPeerConnection !== 'undefined') { const pc = new RTCPeerConnection(); const dc = pc.createDataChannel('test'); dc.close(); pc.close(); markPass('media', 'gfxWebrtc'); } else markUnsupported('media', 'gfxWebrtc'); } catch(e) { markFail('media', 'gfxWebrtc'); }
  }

  async function runStress() {
    markRunning('memPressure'); await delay(50);
    try {
      await withTimeout(async () => {
        const arr = [];
        const memStart = performance.memory ? performance.memory.usedJSHeapSize : 0;
        for (let i = 0; i < CFG.stressMemIterations; i++) { arr.push(new Array(100000).fill(Math.random())); await delay(CFG.stressMemDelay); }
        const memEnd = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memDelta = Math.round((memEnd - memStart) / 1024 / 1024);
        arr.length = 0;
        markPass('stress', 'memPressure', (memDelta > 0 ? '+' + memDelta : memDelta) + ' MB');
      }, CFG.stressTimeout);
    } catch(e) { markFail('stress', 'memPressure', e.message === 'TIMEOUT' ? 'TIMEOUT' : 'ERROR'); }

    markRunning('iframePressure'); await delay(50);
    try {
      await withTimeout(async () => {
        const iframeBox = document.createElement('div');
        iframeBox.style.cssText = 'position:absolute;left:-9999px;top:0;';
        document.body.appendChild(iframeBox);
        let alive = 0;
        for (let i = 0; i < CFG.stressIframeCount; i++) { const f = document.createElement('iframe'); f.srcdoc = '<p>' + i + '</p>'; iframeBox.appendChild(f); alive++; }
        await delay(1000);
        markPass('stress', 'iframePressure', alive + ' alive');
        iframeBox.remove();
      }, CFG.stressTimeout);
    } catch(e) { markFail('stress', 'iframePressure', e.message === 'TIMEOUT' ? 'TIMEOUT' : 'ERROR'); }

    markRunning('domPressure'); await delay(50);
    try {
      await withTimeout(async () => {
        const domBox = document.createElement('div');
        domBox.style.cssText = 'position:absolute;left:-9999px;top:0;';
        document.body.appendChild(domBox);
        const t0 = performance.now();
        for (let i = 0; i < CFG.stressDomCount; i++) { const d = document.createElement('span'); domBox.appendChild(d); }
        const dms = Math.round(performance.now() - t0);
        markPass('stress', 'domPressure', dms + ' ms / ' + (CFG.stressDomCount / 1000) + 'K');
        domBox.remove();
      }, CFG.stressTimeout);
    } catch(e) { markFail('stress', 'domPressure', e.message === 'TIMEOUT' ? 'TIMEOUT' : 'ERROR'); }

    markRunning('canvasPressure'); await delay(50);
    try {
      await withTimeout(async () => {
        const cv = document.createElement('canvas'); cv.width = 400; cv.height = 300;
        const ctx = cv.getContext('2d');
        const ct0 = performance.now();
        for (let i = 0; i < CFG.stressCanvasCount; i++) { ctx.fillStyle = `hsl(${i % 360},60%,50%)`; ctx.fillRect(Math.random() * 400, Math.random() * 300, 5, 5); }
        const cms = Math.round(performance.now() - ct0);
        markPass('stress', 'canvasPressure', cms + ' ms / ' + (CFG.stressCanvasCount / 1000) + 'K');
      }, CFG.stressTimeout);
    } catch(e) { markFail('stress', 'canvasPressure', e.message === 'TIMEOUT' ? 'TIMEOUT' : 'ERROR'); }
  }

  Object.assign(KT, { runBasic, runPerformance, runStorage, runMedia, runStress });
})(window.KT);
