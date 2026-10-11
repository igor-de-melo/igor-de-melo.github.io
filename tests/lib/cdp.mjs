// Navegador para os testes, pelo Chrome DevTools Protocol (sem dependências). Usado por check-lightbox e check-print.
// Procura o Chrome/Chromium nos caminhos comuns; defina CHROME_PATH se preciso.
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CANDIDATES = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].filter(Boolean);
export const chromePath = CANDIDATES.find((p) => existsSync(p));
export const hasBrowser = !!chromePath && typeof WebSocket === "function";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Abre o navegador, chama fn({ send, evalJs, open, key }) e fecha tudo no fim.
export async function withBrowser(name, fn) {
  const profile = mkdtempSync(join(tmpdir(), name + "-"));
  const port = 9400 + Math.floor(Math.random() * 400);
  const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--no-first-run", "--allow-file-access-from-files",
    "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
  let ws, seq = 0;
  const pending = new Map();
  try {
    for (let i = 0; i < 60 && !ws; i++) {
      try { const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const page = list.find((t) => t.type === "page"); if (page) ws = new WebSocket(page.webSocketDebuggerUrl); } catch { /* ainda subindo */ }
      if (!ws) await sleep(250);
    }
    if (!ws) throw new Error("o navegador não respondeu");
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
    chrome.kill();
    await sleep(400);
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* perfil ainda em uso */ }
  }
}
