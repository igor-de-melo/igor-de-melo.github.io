// Gera as imagens de compartilhamento (og:image), 1200 × 630, em assets/img/og/: home.png, aero.png e data.png.
// Uso: node tools/build-og.mjs   (ou: npm run build:og). Precisa do Chrome/Chromium (defina CHROME_PATH se preciso).
// Visual do site no tema escuro: fundo e tinta da Home, Archivo, um acento por área. Texto em inglês.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "img", "og");
const CARDS = [
  { file: "home", area: "Portfolio", line: "Aeronautical Engineering · Data Science · IT & Cybersecurity", accent: "#8FB6FF" },
  { file: "aero", area: "Aerospace Engineering", line: "Aerodynamics, CFD, flight mechanics, propulsion and systems engineering", accent: "#8AB4F8" },
  { file: "data", area: "Data & IT", line: "SQL, Python, automation and machine learning", accent: "#5FD3C8" },
];
const font = pathToFileURL(join(ROOT, "assets", "fonts", "archivo-latin.woff2")).href;
const html = (c) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:"Archivo";font-weight:400 800;font-stretch:100% 125%;src:url("${font}") format("woff2")}
html,body{margin:0}body{width:1200px;height:630px;box-sizing:border-box;padding:72px 80px;background:#0C1418;color:#E8EBEF;font-family:"Archivo",Arial,sans-serif;display:flex;flex-direction:column;justify-content:space-between}
.bar{width:96px;height:8px;background:${c.accent}}
.name{margin:28px 0 0;font-size:44px;font-weight:600;color:#A9B2BD}
.area{margin:8px 0 0;font-size:92px;line-height:1.02;font-weight:800;font-stretch:112%;letter-spacing:-.02em}
.line{margin:0;font-size:34px;line-height:1.3;color:#A9B2BD;max-width:980px}
.url{margin:18px 0 0;font-size:26px;color:${c.accent}}
</style><div><div class="bar"></div><p class="name">Igor de Melo</p><p class="area">${c.area}</p></div><div><p class="line">${c.line}</p><p class="url">igor-de-melo.github.io</p></div>`;

const chromePath = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].filter(Boolean).find((p) => existsSync(p));
if (!chromePath) { console.error("Chrome/Chromium não encontrado; defina CHROME_PATH."); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), "build-og-")), port = 9800 + Math.floor(Math.random() * 100);
const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--no-first-run", "--allow-file-access-from-files", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
let ws, seq = 0; const pending = new Map();
try {
  for (let i = 0; i < 60 && !ws; i++) { try { const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); if (page) ws = new WebSocket(page.webSocketDebuggerUrl); } catch { /* subindo */ } if (!ws) await sleep(250); }
  await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
  ws.addEventListener("message", (ev) => { const m = JSON.parse(ev.data), p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  mkdirSync(OUT, { recursive: true });
  for (const c of CARDS) {
    const tmp = join(profile, c.file + ".html"); writeFileSync(tmp, html(c));
    await send("Page.navigate", { url: pathToFileURL(tmp).href });
    await sleep(900);
    const shot = await send("Page.captureScreenshot", { format: "png", optimizeForSpeed: false });
    const buf = Buffer.from(shot.data, "base64"); writeFileSync(join(OUT, c.file + ".png"), buf);
    console.log(`assets/img/og/${c.file}.png  ${Math.round(buf.length / 1024)} KB`);
  }
} finally { try { ws && ws.close(); } catch { /* fechado */ } chrome.kill(); await sleep(400); try { rmSync(profile, { recursive: true, force: true }); } catch { /* em uso */ } }
