function showPopup(message, title) {
  const overlay = document.getElementById("popup-overlay");
  const popup = document.getElementById("popup");
  const msgEl = document.getElementById("popup-message");
  const titleEl = document.getElementById("popup-title-text");

  if (title) titleEl.textContent = title;

  if (message && (message.includes('\n') || message.length > 60)) {
    msgEl.innerHTML = `<pre>${escapeHtml(message)}</pre>`;
  } else {
    msgEl.innerHTML = ``;
    msgEl.textContent = message;
  }

  overlay.classList.add("show");
  popup.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closePopup() {
  document.getElementById("popup-overlay").classList.remove("show");
  document.getElementById("popup").classList.remove("show");
  document.body.style.overflow = "";
}

function copyPopupContent() {
  const msgEl = document.getElementById("popup-message");
  const text = msgEl.textContent || msgEl.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("popup-copy-btn");
    btn.textContent = "已复制 ✓";
    setTimeout(() => { btn.textContent = "复制"; }, 2000);
  }).catch(() => {});
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.querySelector(".message").textContent = message;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, duration);
}

function showUserAgent() {
  showPopup(navigator.userAgent, "👤 User Agent");
}

function initUABanner() {
  const uaText = document.getElementById("uaText");
  if (uaText) uaText.textContent = navigator.userAgent;
}

initUABanner();

const originalConsoleLog = console.log;
const outputElement = document.getElementById("consoleOutput");
const MAX_LOG_LINES = 200;

console.log = function (...args) {
  const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" ");
  const timestamp = new Date().toLocaleTimeString();
  const line = document.createElement("div");
  line.textContent = `[${timestamp}] ${message}`;
  outputElement.appendChild(line);
  if (outputElement.childElementCount > MAX_LOG_LINES) {
    outputElement.removeChild(outputElement.firstElementChild);
  }
  outputElement.scrollTop = outputElement.scrollHeight;
  originalConsoleLog.apply(console, args);
};

function getDownlodUrl(name) {
  return `https://jt-519.github.io/dev-page/data/crx/${name}.crx`;
}

function delay(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

function closePage() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3com_message_cmd:closePage", {}, { requestID: reqID });
}

function onBackPressed() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3com_message_cmd:onBackPressed", {}, { requestID: reqID });
}

async function installLocalExtension() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3ext_message_cmd:installLocalExtension", {}, { requestID: reqID });
}

async function installExtension() {
  var reqID = randomString(8);
  var result = confirm(`是否安装扩展 ${window.EXT_ID}?`);
  if (!result) return false;

  A3ExtMessage.send("$a3ext_message_cmd:installExtension",
    { id: window.EXT_ID, url: getDownlodUrl(window.EXT_NAME) },
    { requestID: reqID }
  );

  if (!isAndroid()) {
    mockClientMessage("installExtension", { requestID: reqID, common: {} });
    A3OnExtMessage(`notifyInstallState`, `${JSON.stringify({ requestID: reqID, data: { id: window.EXT_ID, state: 1 } })}`);
    await delay(1000);
    A3OnExtMessage(`notifyInstallState`, `${JSON.stringify({ requestID: reqID, data: { id: window.EXT_ID, state: 2 } })}`);
    await delay(1000);
    A3OnExtMessage(`notifyInstallState`, `${JSON.stringify({ requestID: reqID, data: { id: window.EXT_ID, state: 3 } })}`);
  }
}

function changeExtensionState() {
  var reqID = randomString(8);
  var enable = Math.random() >= 0.5;
  var stateName = enable ? "启用" : "禁用";

  A3ExtMessage.send("$a3ext_message_cmd:changeExtensionState",
    { id: window.EXT_ID, state: enable ? "ENABLED" : "DISABLED" },
    { requestID: reqID }
  );

  var result = Math.random() >= 0.5;
  mockClientMessage("changeExtensionState", {
    requestID: reqID, common: {}, errCode: 0,
    errMessage: result ? `${stateName}成功！` : `${stateName}失败!`, data: enable
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

function windowOpenUrl() {
  window.open("https://jt-519.github.io/dev-page/pages/chromium/mse_test.html", "example", "width=600,height=600");
}

function closeWindow() {
  window.close();
}

async function isExtensionEnabled() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3ext_message_cmd:isExtensionEnabled", { id: window.EXT_ID }, { requestID: reqID });
  var result = Math.random() >= 0.5;
  mockClientMessage("isExtensionEnabled", { requestID: reqID, common: {}, errCode: 0, errMessage: "ok", data: result });
}

async function getDevModeEnabled() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3com_message_cmd:getDevModeEnabled", {}, { requestID: reqID });
  var result = Math.random() >= 0.5;
  mockClientMessage("getDevModeEnabled", { requestID: reqID, common: {}, errCode: 0, errMessage: "ok", data: result });
}

async function setDevModeEnabled() {
  var reqID = randomString(8);
  var result = Math.random() >= 0.5;
  A3ExtMessage.send("$a3com_message_cmd:setDevModeEnabled", { enable: result }, { requestID: reqID });
  mockClientMessage("setDevModeEnabled", { requestID: reqID, common: {}, errCode: 0, errMessage: "ok", data: result });
}

async function getInstallState() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3ext_message_cmd:getInstallState", { id: window.EXT_ID }, { requestID: reqID });
  var state = getRandomInt(0, 3);
  mockClientMessage("getInstallState", { requestID: reqID, common: {}, errCode: 0, errMessage: "ok", data: { state: state } });
}

async function removeExtension() {
  var reqID = randomString(8);
  var result = confirm(`是否卸载扩展 ${window.EXT_ID}?`);
  if (!result) return false;

  A3ExtMessage.send("$a3ext_message_cmd:removeExtension", { id: window.EXT_ID }, { requestID: reqID });
  var success = Math.random() >= 0.5;
  mockClientMessage("removeExtension", { requestID: reqID, common: {}, errCode: 0, errMessage: success ? "删除成功！" : "删除失败!", data: success });
}

function openCrxManagerPage() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3ext_message_cmd:openCrxManagerPage", { id: window.EXT_ID }, { requestID: reqID });
  mockClientMessage("openCrxManagerPage", { requestID: reqID, common: {} });
}

function getExtensionIcon() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3ext_message_cmd:getExtensionIcon", { id: window.EXT_ID }, { requestID: reqID });
  mockClientMessage("getExtensionIcon", { requestID: reqID, errCode: 0, errMessage: "ok", data: "data:image/png;base64,ICON_BASE64", common: {} });
}

function isSettingsEnabled() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3ext_message_cmd:isSettingsEnabled", { id: window.EXT_ID }, { requestID: reqID });
  mockClientMessage("isSettingsEnabled", { requestID: reqID, errCode: 0, errMessage: "ok", data: true, common: {} });
}

function getInstalledItems() {
  var reqID = randomString(8);
  A3ExtMessage.send("$a3ext_message_cmd:getInstalledItems", {}, { requestID: reqID });
  mockClientMessage("getInstalledItems", {
    requestID: reqID, common: {}, errCode: 0, errMessage: "ok",
    data: [{ id: window.EXT_ID, name: "Dark Reader", description: "Dark Reader", state: "ENABLED", version: "4.9.88" }]
  });
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function mockClientMessage(type, clientData) {
  if (!isAndroid()) {
    console.log(`非Android mock client:`, JSON.stringify(clientData));
    A3OnExtMessage(type, JSON.stringify(clientData));
  }
}

function randomString(len) {
  len = len || 32;
  var $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  var maxPos = $chars.length;
  var pwd = "";
  for (let i = 0; i < len; i++) { pwd += $chars.charAt(Math.floor(Math.random() * maxPos)); }
  return pwd;
}

const REQUEST_TTL_MS = 30000;
let requestDataCache = {};
function cacheRequestData(requestID, requestData) {
  requestDataCache[requestID] = requestData;
  setTimeout(() => { delete requestDataCache[requestID]; }, REQUEST_TTL_MS);
}

function A3MessageSend() {
  let EventCallbacks = {};
  return {
    send: function (type, data, clientData) {
      const requestID = clientData?.requestID || randomString(8);
      const resp = { errCode: 0, errMessage: "ok", data: data, requestID };
      cacheRequestData(requestID, data);
      const content = `${type}:${JSON.stringify(resp)}`;
      console.log(`前端发送请求:`, content);
      try { window.webkit.messageHandlers.ai_ext_message.postMessage(content); } catch (error) {}
    },
    on: function (type, func) {
      if (!EventCallbacks[type]) EventCallbacks[type] = [];
      EventCallbacks[type].push(func);
    },
    onMessage: function (type, data, ...args) {
      console.log(`客户端回传请求：${type}---`, data);
      if (type && EventCallbacks[type]) {
        EventCallbacks[type].forEach(function (cb) {
          let parseData = data;
          try { parseData = JSON.parse(data); } catch (e) {}
          let requestID = parseData.requestID;
          let requestData = requestDataCache[requestID] || {};
          if (requestDataCache[requestID]) delete requestDataCache[requestID];
          cb.apply(null, [requestData, parseData, ...args]);
        });
      }
      return false;
    }
  };
}

function extEvent() {
  window.A3ExtMessage.on("isSettingsEnabled", (requestData, clientData) => {
    console.log(`前端收到客户端 isSettingsEnabled：`, clientData);
    showToast(clientData.data ? "扩展功能可用!" : "扩展功能不可用");
    return true;
  });

  window.A3ExtMessage.on("getInstalledItems", (requestData, clientData) => {
    console.log(`前端收到客户端 getInstalledItems：`, clientData);
    showPopup(JSON.stringify(clientData, null, 2), "📋 已安装扩展列表");
    return true;
  });

  window.A3ExtMessage.on("installExtension", (requestData, clientData) => {
    console.log(`前端收到客户端 installExtension`, clientData);
    return true;
  });

  window.A3ExtMessage.on("getExtensionIcon", (requestData, clientData) => {
    console.log(`前端收到客户端 getExtensionIcon`, clientData);
    if (clientData.errCode == 0) {
      showPopup(clientData.data, "🖼 Extension Icon");
    } else {
      showToast(`${window.EXT_ID} ${clientData.errMessage}`);
    }
    return true;
  });

  window.A3ExtMessage.on("removeExtension", (requestData, clientData) => {
    console.log(`前端收到客户端 removeExtension`, clientData);
    showToast(`${window.EXT_ID} ${clientData.errMessage}`);
    return true;
  });

  window.A3ExtMessage.on("isExtensionEnabled", (requestData, clientData) => {
    console.log(`前端收到客户端 isExtensionEnabled`, clientData);
    if (clientData.errCode != 0) {
      showToast(`${window.EXT_ID} ${clientData.errMessage}`);
      return true;
    }
    showToast(clientData.data ? `${window.EXT_ID} 扩展已启用!` : `${window.EXT_ID} 扩展已禁用!`);
    return true;
  });

  window.A3ExtMessage.on("installLocalExtension", (requestData, clientData) => {
    console.log(`前端收到客户端 installLocalExtension`, clientData);
    if (clientData.errCode != 0) showToast(clientData.errMessage);
    return true;
  });

  function handleDevModeResponse(requestData, clientData) {
    console.log(`前端收到客户端 devMode`, clientData);
    if (clientData.errCode != 0) { showToast(clientData.errMessage); return true; }
    window.DEV_MODE_ENABLED = clientData.data;
    showToast(clientData.data ? "已开启开发者模式!" : "已关闭开发者模式!");
    return true;
  }
  window.A3ExtMessage.on("getDevModeEnabled", handleDevModeResponse);
  window.A3ExtMessage.on("setDevModeEnabled", handleDevModeResponse);

  window.A3ExtMessage.on("changeExtensionState", (requestData, clientData) => {
    console.log(`前端收到客户端 changeExtensionState`, clientData);
    showToast(`${window.EXT_ID} ${clientData.errMessage}`);
    return true;
  });

  window.A3ExtMessage.on("notifyInstallState", (requestData, clientData) => {
    console.log(`前端收到客户端 notifyInstallState`, clientData);
    const stateMsg = { 1: "开始安装", 2: "安装中...", 3: "扩展安装成功!" };
    if (stateMsg[clientData.data.state]) {
      showToast(`${clientData.data.id} ${stateMsg[clientData.data.state]}`);
    } else {
      showToast(`${clientData.data.id} ${clientData.errMessage || "状态未知"}`);
    }
    return true;
  });
}

function init() {
  if (window._A3_EXTENSION_WEBQUERY_INIT) return;
  window._A3_EXTENSION_WEBQUERY_INIT = true;
  window.EXT_ID = "ifoakfbpdcdoeenechcleahebpibofpc";
  window.DEV_MODE_ENABLED = false;
  window.EXT_NAME = "Dark_Reader_4.9.87";

  if (!window.A3ExtMessage) {
    let A3ExtMessage = A3MessageSend();
    window.A3ExtMessage = A3ExtMessage;
    window.A3OnExtMessage = A3ExtMessage.onMessage;
  }

  // Event listeners
  document.getElementById("showUA").addEventListener("click", showUserAgent);
  document.getElementById("getInstalledItems").addEventListener("click", getInstalledItems);
  document.getElementById("isSettingsEnabled").addEventListener("click", isSettingsEnabled);
  document.getElementById("closePage").addEventListener("click", closePage);
  document.getElementById("onBackPressed").addEventListener("click", onBackPressed);
  document.getElementById("removeExtension").addEventListener("click", removeExtension);
  document.getElementById("openCrxManagerPage").addEventListener("click", openCrxManagerPage);
  document.getElementById("changeExtensionState").addEventListener("click", changeExtensionState);
  document.getElementById("getInstallState").addEventListener("click", getInstallState);
  document.getElementById("isExtensionEnabled").addEventListener("click", isExtensionEnabled);
  document.getElementById("installLocalExtension").addEventListener("click", installLocalExtension);
  document.getElementById("getDevModeEnabled").addEventListener("click", getDevModeEnabled);
  document.getElementById("setDevModeEnabled").addEventListener("click", setDevModeEnabled);
  document.getElementById("getExtensionIcon").addEventListener("click", getExtensionIcon);
  document.getElementById("windowOpenUrl").addEventListener("click", windowOpenUrl);
  document.getElementById("closeWindow").addEventListener("click", closeWindow);

  document.querySelectorAll(".InstallExtension").forEach((item) => {
    item.addEventListener("click", function () {
      window.EXT_ID = this.getAttribute("ext-id");
      window.EXT_NAME = this.getAttribute("ext-name");
      installExtension();
    });
  });

  extEvent();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });
}

init();
