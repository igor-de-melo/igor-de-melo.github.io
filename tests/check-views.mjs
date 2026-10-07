// Verifica as duas visões do site (Simplificado e Temático). Uso: node tests/check-views.mjs
// Parte estática (sempre): script de início e seletor em cada página, regra que desliga o movimento no Simplificado.
// Parte em navegador (quando há Chrome/Chromium; defina CHROME_PATH se preciso): data-view válido conforme a URL,
// nenhuma animação ou transição ativa em data-view="simple" e nenhum scroll horizontal em 375 e 1280 px.
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "aero/index.html", "data/index.html", "it-security/index.html"];
const errors = [];
const fail = (msg) => errors.push(msg);

/* ---------- Estático ---------- */
for (const f of PAGES) {
  const src = readFileSync(join(root, f), "utf8");
  const head = src.slice(0, src.indexOf("</head>"));
  if (f === "index.html") { // a Home é sempre Temático e não tem seletor
    if (!head.includes('<script>document.documentElement.dataset.view="themed"</script>')) fail(`${f}: o <head> deve fixar data-view="themed"`);
    if (/data-view-set|data-view-toggle|class="[^"]*\bs-only\b/.test(src)) fail(`${f}: a Home não deve ter seletor de visão nem marcação .s-only`);
    for (const a of ["aero", "data", "it-security"]) {
      if (!src.includes(`href="${a}/index.html?view=simple" data-face data-face-view="simple"`)) fail(`${f}: falta o botão do Simplificado de ${a}`);
      if (!src.includes(`href="${a}/index.html?view=themed" data-face data-face-view="themed"`)) fail(`${f}: o cartão de ${a} deve abrir ?view=themed`);
    }
    continue;
  }
  if (!/dataset\.view=v==="simple"\?"simple":"themed"/.test(head)) fail(`${f}: falta no <head> o script que aplica data-view (só "simple" ou "themed")`);
  if (!/try\{v=localStorage\.getItem\("view"\)\}catch/.test(head)) fail(`${f}: a leitura do localStorage "view" deve estar em try/catch`);
  for (const v of ["simple", "themed"]) if (!src.includes(`data-view-set="${v}"`)) fail(`${f}: falta o botão data-view-set="${v}"`);
  if (!src.includes("data-view-toggle")) fail(`${f}: falta o botão compacto de visão (data-view-toggle)`);
  if (!/id="view-status" aria-live="polite"/.test(src)) fail(`${f}: falta a região aria-live que anuncia a troca de visão`);
}
const css = readFileSync(join(root, "assets", "style.css"), "utf8");
if (!/\[data-view="simple"\] \*,\[data-view="simple"\] \*::before,\[data-view="simple"\] \*::after\{animation:none!important;transition:none!important\}/.test(css)) {
  fail('assets/style.css: falta a regra que desliga animações e transições em [data-view="simple"]');
}

/* ---------- Navegador (Chrome DevTools Protocol, sem dependências) ---------- */
const CANDIDATES = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].filter(Boolean);
const chromePath = CANDIDATES.find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let browserChecks = 0;

async function browser() {
  const profile = mkdtempSync(join(tmpdir(), "check-views-"));
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
    const evalJs = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result.value;
    await send("Page.enable"); await send("Runtime.enable");
    const open = async (file, query, width) => {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
      await send("Page.navigate", { url: "about:blank" });
      await send("Page.navigate", { url: pathToFileURL(join(root, file)).href + query });
      await sleep(900);
      await evalJs("try{localStorage.removeItem('view')}catch(e){};0");
    };
    const STATE = `(function(){var d=document.documentElement,run=document.getAnimations().filter(function(a){return a.playState==='running'}).length;
      var moving=[].filter.call(document.querySelectorAll('body *'),function(e){var c=getComputedStyle(e);return c.animationName!=='none'||parseFloat(c.transitionDuration)>0}).length;
      return {view:d.dataset.view,sw:d.scrollWidth,iw:window.innerWidth,run:run,moving:moving}})()`;
    for (const f of PAGES) {
      // data-view conforme a URL
      const home = f === "index.html";
      for (const [query, wantArea] of [["", "themed"], ["?view=simple", "simple"], ["?view=themed", "themed"], ["?view=qualquer", "themed"], ["?lang=en&view=simple", "simple"]]) {
        const want = home ? "themed" : wantArea;
        await open(f, query, 1280);
        const s = await evalJs(STATE); browserChecks++;
        if (s.view !== want) fail(`${f}${query}: data-view="${s.view}", esperado "${want}"`);
      }
      if (home) {
        // Preferência gravada "simple": a Home continua no Temático e não mexe na preferência.
        await open(f, "", 1280);
        await evalJs("try{localStorage.setItem('view','simple')}catch(e){};0");
        await send("Page.navigate", { url: pathToFileURL(join(root, f)).href + "?lang=fr&view=simple" });
        await sleep(900);
        const h = await evalJs(`(function(){var st=null;try{st=localStorage.getItem('view')}catch(e){}
          var g=function(s){return [].map.call(document.querySelectorAll(s),function(a){return a.getAttribute('href')}).join(' ')};
          return {view:document.documentElement.dataset.view,stored:st,simple:g('.hcard-simple'),cards:g('.hcard-link'),sw:document.querySelectorAll('[data-view-set],[data-view-toggle]').length}})()`); browserChecks++;
        await evalJs("try{localStorage.removeItem('view')}catch(e){};0");
        if (h.view !== "themed") fail(`${f} (localStorage "simple" e ?view=simple): data-view="${h.view}", esperado "themed"`);
        if (h.stored !== null && h.stored !== "simple") fail(`${f}: a Home mudou a preferência gravada para "${h.stored}"`);
        if (h.sw) fail(`${f}: a Home não deve ter seletor de visão`);
        const dest = (v) => ["aero", "data", "it-security"].map((a) => `${a}/index.html?lang=fr&view=${v}`).join(" ");
        if (h.simple !== dest("simple")) fail(`${f}: botões do Simplificado apontam para "${h.simple}"`);
        if (h.cards !== dest("themed")) fail(`${f}: cartões apontam para "${h.cards}"`);
        for (const width of [375, 1280]) { await open(f, "", width); const s = await evalJs(STATE); browserChecks++; if (s.sw > s.iw) fail(`${f} (${width}px): scroll horizontal (${s.sw} > ${s.iw})`); }
        continue;
      }
      // Simplificado: sem movimento e sem scroll horizontal
      for (const width of [375, 1280]) for (const lang of ["pt-BR", "en", "fr"]) {
        await open(f, `?lang=${lang}&view=simple`, width);
        const s = await evalJs(STATE); browserChecks++;
        if (s.run > 0 || s.moving > 0) fail(`${f} (${lang}, ${width}px, simple): ${s.run} animação(ões) rodando e ${s.moving} elemento(s) com animação ou transição`);
        if (s.sw > s.iw) fail(`${f} (${lang}, ${width}px, simple): scroll horizontal (${s.sw} > ${s.iw})`);
      }
      // Simplificado de Aero (S2): imagens visíveis com alt, nada do Temático à mostra e ordem do CV
      if (f === "aero/index.html") for (const lang of ["pt-BR", "en", "fr"]) {
        await open(f, `?lang=${lang}&view=simple`, 1280);
        const c = await evalJs(`(function(){var vis=function(e){return e.getClientRects().length>0};
          var noAlt=[].filter.call(document.querySelectorAll('main img, .hero img'),function(i){return vis(i)&&!i.alt.trim()}).length;
          var themedOnly=[].filter.call(document.querySelectorAll('.t-only, .sims, .sec-n, .chain-sig, .actions, .contact-icons'),vis).length;
          var a=document.getElementById('competencias'),b=document.getElementById('experiencia');
          return {noAlt:noAlt,themedOnly:themedOnly,order:!a||!b||!!(a.compareDocumentPosition(b)&4),h1:document.querySelectorAll('h1').length}})()`); browserChecks++;
        if (c.noAlt) fail(`${f} (${lang}, simple): ${c.noAlt} imagem(ns) visível(is) sem alt`);
        if (c.themedOnly) fail(`${f} (${lang}, simple): ${c.themedOnly} elemento(s) só do Temático à mostra`);
        if (!c.order) fail(`${f} (${lang}, simple): Competências deveria vir antes de Experiência`);
        if (c.h1 !== 1) fail(`${f} (${lang}, simple): ${c.h1} elementos h1`);
      }
      // Régua do Simplificado (S2.1): marca a seção atual e as já percorridas; sem scroll horizontal em 1000 px
      if (f === "aero/index.html") {
        await open(f, "?view=simple", 1280);
        await evalJs("document.getElementById('projetos').scrollIntoView();0");
        await sleep(400);
        const r = await evalJs(`(function(){var c=document.querySelector('.s-nav a[aria-current]');return {cur:c?c.getAttribute('href'):'',done:document.querySelectorAll('.s-nav li.is-done').length,pos:getComputedStyle(document.querySelector('.s-nav')).position}})()`); browserChecks++;
        if (r.cur !== "#projetos" || r.done !== 3) fail(`${f} (simple): régua em "${r.cur}" com ${r.done} seções percorridas, esperado "#projetos" com 3`);
        if (r.pos !== "absolute") fail(`${f} (simple, 1280px): a régua deveria ficar ao lado do conteúdo`);
        await open(f, "?view=simple", 1000);
        const w = await evalJs(STATE); browserChecks++;
        if (w.sw > w.iw) fail(`${f} (1000px, simple): scroll horizontal (${w.sw} > ${w.iw})`);
      }
      { await open(f, "?lang=en&view=simple", 1280);
        const hrefs = await evalJs(`[].map.call(document.querySelectorAll('a.hm, .rail-pages a[data-face], .foot-areas a[data-face]'),function(a){return a.getAttribute('href')}).filter(function(h){return /^\\.\\.\\/index\\.html/.test(h)}).join(' ')`); browserChecks++;
        if (!hrefs || /view=/.test(hrefs)) fail(`${f} (simple): o link para a Home deve ir sem visão, achei "${hrefs}"`);
      }
      // Temático: nada do Simplificado à mostra e Competências no lugar de origem
      { await open(f, "?view=themed", 1280);
        const c = await evalJs(`(function(){var n=[].filter.call(document.querySelectorAll('.s-only'),function(e){return e.getClientRects().length>0}).length;
          var a=document.getElementById('competencias'),b=document.getElementById('experiencia');
          return {sOnly:n,order:!a||!b||!!(b.compareDocumentPosition(a)&4),theme:document.documentElement.dataset.theme}})()`); browserChecks++;
        if (c.sOnly) fail(`${f} (themed): ${c.sOnly} elemento(s) .s-only à mostra`);
        if (!c.order) fail(`${f} (themed): a ordem das seções mudou`);
        if (f === "it-security/index.html" && c.theme !== "dark") fail(`${f} (themed): tema "${c.theme}", esperado "dark"`);
      }
      // Temático: continua sem scroll horizontal
      for (const width of [375, 1280]) {
        await open(f, "?view=themed", width);
        const s = await evalJs(STATE); browserChecks++;
        if (s.sw > s.iw) fail(`${f} (${width}px, themed): scroll horizontal (${s.sw} > ${s.iw})`);
      }
    }
  } finally {
    try { ws && ws.close(); } catch { /* já fechado */ }
    chrome.kill();
    await sleep(400);
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* perfil ainda em uso */ }
  }
}

if (chromePath && typeof WebSocket === "function") {
  try { await browser(); } catch (e) { fail("navegador: " + e.message); }
} else {
  console.log("AVISO  sem Chrome/Chromium (ou sem WebSocket no Node): só a parte estática foi verificada. Defina CHROME_PATH para rodar tudo.");
}

if (errors.length) { console.error(errors.map((e) => "FALHA  " + e).join("\n")); console.error(`\n${errors.length} problema(s).`); process.exit(1); }
console.log(`Visões OK em ${PAGES.length} páginas (${browserChecks} verificações em navegador).`);
