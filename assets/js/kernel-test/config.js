// Configurable Parameters — CDP/CI can override via window.__KERNEL_TEST_CONFIG__ before page load
window.KT = window.KT || {};

window.KT.CFG = Object.assign({
  scrollDuration:      2000,
  canvasDuration:      3000,
  canvasBalls:         1000,
  webglTriangles:      5000,
  webglDuration:       3000,
  stressMemIterations: 50,
  stressMemDelay:      100,
  stressIframeCount:   50,
  stressDomCount:      50000,
  stressCanvasCount:   3000,
  stressTimeout:       15000,
}, window.__KERNEL_TEST_CONFIG__ || {});
