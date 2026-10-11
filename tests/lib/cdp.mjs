// Navegador para os testes, pelo Chrome DevTools Protocol (sem dependências). Usado por check-views, check-lightbox e check-print.
// Procura o Chrome/Chromium nos caminhos comuns; defina CHROME_PATH se preciso.
// Em CI (variável CI definida): sem sandbox, espera mais longa pela porta de depuração e uma segunda tentativa de início.
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const IS_CI = !!process.env.CI;
const START_TIMEOUT = IS_CI ? 30000 : 15000; // ms à espera de /json/version
const ATTEMPTS = IS_CI ? 2 : 1;
const LINUX_NAMES = ["google-chrome-stable", "google-chrome", "chromium-browser", "chromium"];

function findChrome() {
  const env = process.env.CHROME_PATH;
  if (env && existsSync(env)) return env;
  if (process.platform === "linux") {
    const dirs = [...new Set([...(process.env.PATH || "").split(delimiter), "/usr/bin", "/usr/local/bin", "/snap/bin"].filter(Boolean))];
    for (const name of LINUX_NAMES) for (const dir of dirs) { const p = join(dir, name); if (existsSync(p)) return p; }
    return undefined;
  }
  return ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
}
export const chromePath = findChrome();
export const hasBrowser = !!chromePath && typeof WebSocket === "function";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Inicia o Chrome e espera a porta de depuração responder. Devolve { wsUrl, stop } ou, sem resposta,
// encerra o processo, imprime o diagnóstico (comando, código de saída, stderr) e devolve { stop, failed: true }.
async function launch(name, attempt) {
  const profile = mkdtempSync(join(tmpdir(), name + "-"));
  const port = 9400 + Math.floor(Math.random() * 400);
  const args = ["--headless=new", "--disable-gpu", ...(IS_CI ? ["--no-sandbox", "--disable-dev-shm-usage"] : []), "--hide-scrollbars", "--no-first-run",
    "--allow-file-access-from-files", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "about:blank"];
  const chrome = spawn(chromePath, args, { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "", exit = null, spawnError = null;
  chrome.stderr.on("data", (d) => { stderr = (stderr + d).slice(-4000); });
  chrome.on("exit", (code, signal) => { exit = { code, signal }; });
  chrome.on("error", (e) => { spawnError = e; });
  const gone = () => exit !== null || spawnError !== null;
  const stop = async () => {
    if (!gone()) {
      chrome.kill();
      for (let i = 0; i < 30 && !gone(); i++) await sleep(100);
      if (!gone()) { chrome.kill("SIGKILL"); for (let i = 0; i < 10 && !gone(); i++) await sleep(100); }
    }
    chrome.stderr.destroy(); // os processos filhos do Chrome herdam o pipe; sem isto o Node poderia não terminar
    await sleep(400);
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* perfil ainda em uso */ }
  };
  const get = async (path) => (await fetch(`http://127.0.0.1:${port}${path}`, { signal: AbortSignal.timeout(2000) })).json();
  const started = Date.now();
  let wsUrl;
  while (!wsUrl && !gone() && Date.now() - started < START_TIMEOUT) {
    try { await get("/json/version"); const page = (await get("/json")).find((t) => t.type === "page"); if (page) wsUrl = page.webSocketDebuggerUrl; } catch { /* ainda subindo */ }
    if (!wsUrl) await sleep(250);
  }
  if (wsUrl) return { wsUrl, stop };
  const waited = ((Date.now() - started) / 1000).toFixed(1);
  const state = spawnError ? `não iniciou (${spawnError.message})`
    : exit ? `saiu sozinho com código ${exit.code}${exit.signal ? `, sinal ${exit.signal}` : ""}`
    : "ainda em execução, sem responder (encerrado pelo teste)";
  await stop();
  console.error([`DIAGNÓSTICO  navegador sem resposta em http://127.0.0.1:${port}/json/version após ${waited} s (tentativa ${attempt} de ${ATTEMPTS})`,
    `  comando: ${[chromePath, ...args].map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(" ")}`,
    `  processo: ${state}`,
    `  stderr: ${stderr.trim() ? "\n" + stderr.trim().replace(/^/gm, "    ") : "(vazio)"}`].join("\n"));
  return { stop, failed: true };
}

// Abre o navegador, chama fn({ send, evalJs, open, key }) e fecha tudo no fim.
export async function withBrowser(name, fn) {
  let browser;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) { browser = await launch(name, attempt); if (!browser.failed) break; }
  if (browser.failed) throw new Error("o navegador não respondeu");
  let ws, seq = 0;
  const pending = new Map();
  try {
    ws = new WebSocket(browser.wsUrl);
    await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", () => rej(new Error("falha na conexão com o navegador"))); });
    ws.addEventListener("message", (ev) => { const m = JSON.parse(ev.data); const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });
    const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
    const evalJs = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
    await send("Page.enable"); await send("Runtime.enable");
    const open = async (file, query, width, height = 900) => {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 500 });
      await send("Page.navigate", { url: "about:blank" });
      await send("Page.navigate", { url: pathToFileURL(join(root, file)).href + query });
      await sleep(900);
    };
    const key = async (k) => { for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: k, code: k, windowsVirtualKeyCode: k === "Escape" ? 27 : 0 }); };
    await fn({ send, evalJs, open, key });
  } finally {
    try { ws && ws.close(); } catch { /* já fechado */ }
    await browser.stop();
  }
}
