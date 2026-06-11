// Test definitions — all test metadata arrays
// Depends on: config.js (KT.CFG)
(function(KT) {
  const CFG = KT.CFG;

  KT.BASIC_TESTS = [
    { id: 'localStorage',   name: 'LocalStorage',        fn: () => { try { localStorage.setItem('_t','1'); localStorage.removeItem('_t'); return true; } catch(e) { return false; } } },
    { id: 'sessionStorage', name: 'SessionStorage',       fn: () => { try { sessionStorage.setItem('_t','1'); sessionStorage.removeItem('_t'); return true; } catch(e) { return false; } } },
    { id: 'indexedDB',      name: 'IndexedDB',            fn: () => typeof indexedDB !== 'undefined' },
    { id: 'fetch',          name: 'Fetch API',            fn: () => typeof fetch === 'function' },
    { id: 'xhr',            name: 'XMLHttpRequest',       fn: () => typeof XMLHttpRequest === 'function' },
    { id: 'websocket',      name: 'WebSocket',            fn: () => typeof WebSocket === 'function' },
    { id: 'worker',         name: 'Web Worker',           fn: () => typeof Worker !== 'undefined' },
    { id: 'sharedWorker',   name: 'SharedWorker',         fn: () => typeof SharedWorker !== 'undefined' },
    { id: 'serviceWorker',  name: 'ServiceWorker',        fn: () => 'serviceWorker' in navigator },
    { id: 'wasm',           name: 'WebAssembly',          fn: () => {
      if (typeof WebAssembly === 'undefined') return false;
      // Instantiate minimal valid module: magic + version
      const bytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
      try { return WebAssembly.validate(bytes) && !!new WebAssembly.Module(bytes); } catch(e) { return false; }
    } },
    { id: 'webgl',          name: 'WebGL',                fn: () => { try { return !!document.createElement('canvas').getContext('webgl'); } catch(e) { return false; } } },
    { id: 'webgl2',         name: 'WebGL 2',              fn: () => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch(e) { return false; } } },
    { id: 'canvas2d',       name: 'Canvas 2D',            fn: () => { try { return !!document.createElement('canvas').getContext('2d'); } catch(e) { return false; } } },
    { id: 'offscreen',      name: 'OffscreenCanvas',      fn: () => typeof OffscreenCanvas !== 'undefined' },
    { id: 'webgpu',         name: 'WebGPU',               fn: () => 'gpu' in navigator },
    { id: 'webrtc',         name: 'WebRTC',               fn: () => typeof RTCPeerConnection !== 'undefined' },
    { id: 'crypto',         name: 'Web Crypto',           fn: async () => {
      if (!(window.crypto && window.crypto.subtle)) return false;
      const buf = new Uint8Array([116, 101, 115, 116]);
      const digest = await crypto.subtle.digest('SHA-256', buf);
      return digest.byteLength === 32;
    } },
    { id: 'intersectionObs',name: 'IntersectionObserver', fn: () => typeof IntersectionObserver !== 'undefined' },
    { id: 'resizeObs',      name: 'ResizeObserver',       fn: () => typeof ResizeObserver !== 'undefined' },
    { id: 'mutationObs',    name: 'MutationObserver',     fn: () => typeof MutationObserver !== 'undefined' },
    { id: 'broadcastCh',    name: 'BroadcastChannel',     fn: () => typeof BroadcastChannel !== 'undefined' },
    { id: 'sharedBuf',      name: 'SharedArrayBuffer',    fn: () => typeof SharedArrayBuffer !== 'undefined' },
    { id: 'notification',   name: 'Notification',         fn: () => typeof Notification !== 'undefined' },
    { id: 'geolocation',    name: 'Geolocation',          fn: () => 'geolocation' in navigator },
    { id: 'mediaRecorder',  name: 'MediaRecorder',        fn: () => typeof MediaRecorder !== 'undefined' },
    { id: 'perfObserver',   name: 'PerformanceObserver',  fn: () => typeof PerformanceObserver !== 'undefined' },
  ];

  KT.PERF_JS_TESTS = [
    { id: 'jsLoop',     name: 'Math.sqrt 10M iterations' },
    { id: 'jsonParse',  name: 'JSON parse/stringify (1MB)' },
    { id: 'regexBench', name: 'Regex 100K matches' },
    { id: 'wasmBench',  name: 'WASM fibonacci(40)' },
  ];
  KT.PERF_DOM_TESTS = [
    { id: 'domCreate', name: 'Create 10000 DIVs' },
    { id: 'domDelete', name: 'Delete 10000 DIVs' },
    { id: 'domQuery',  name: 'querySelectorAll 10000x' },
  ];
  KT.PERF_RENDER_TESTS = [
    { id: 'scrollFps', name: 'Scroll FPS (long list)' },
    { id: 'canvasFps', name: 'Canvas ' + CFG.canvasBalls + ' balls FPS' },
    { id: 'webglFps',  name: 'WebGL ' + CFG.webglTriangles + ' triangles FPS' },
  ];

  KT.STORAGE_TESTS = [
    { id: 'lsWrite',   name: 'localStorage Write 1000' },
    { id: 'lsRead',    name: 'localStorage Read 1000' },
    { id: 'lsDelete',  name: 'localStorage Delete 1000' },
    { id: 'ssWrite',   name: 'sessionStorage Write' },
    { id: 'idbWrite',  name: 'IndexedDB Write 100' },
    { id: 'idbRead',   name: 'IndexedDB Read 100' },
    { id: 'cookie',    name: 'Cookie Read/Write' },
  ];

  KT.MEDIA_CODEC_TESTS = [
    { id: 'h264', name: 'Video H.264' },
    { id: 'vp9',  name: 'Video VP9' },
    { id: 'h265', name: 'Video H.265/HEVC' },
    { id: 'av1',  name: 'Video AV1' },
    { id: 'aac',  name: 'Audio AAC' },
    { id: 'opus', name: 'Audio Opus' },
  ];
  KT.MEDIA_GFX_TESTS = [
    { id: 'gfxWebgl',  name: 'WebGL Render' },
    { id: 'gfxWebgl2', name: 'WebGL2 Render' },
    { id: 'gfxCanvas', name: 'Canvas 2D Render' },
    { id: 'gfxWebrtc', name: 'WebRTC DataChannel' },
  ];

  KT.STRESS_TESTS = [
    { id: 'memPressure',    name: 'Memory Pressure (' + Math.round(CFG.stressMemIterations * CFG.stressMemDelay / 1000) + 's)' },
    { id: 'iframePressure', name: 'Create ' + CFG.stressIframeCount + ' iframes' },
    { id: 'domPressure',    name: 'Create ' + CFG.stressDomCount + ' DOM nodes' },
    { id: 'canvasPressure', name: 'Canvas ' + CFG.stressCanvasCount + ' objects' },
  ];
})(window.KT);
