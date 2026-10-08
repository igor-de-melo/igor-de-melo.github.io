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
        // Celular: cada nó no centro vertical do seu cartão (tolerância de 1 px) e o sinal fora do botão
        for (const width of [320, 375, 430]) for (const lang of ["pt-BR", "en", "fr"]) {
          await open(f, "?lang=" + lang, width);
          const rows = await evalJs(`[].map.call(document.querySelectorAll('.stage'),function(st){
            var n=st.querySelector('.node').getBoundingClientRect(),c=st.querySelector('.hcard').getBoundingClientRect(),b=st.querySelector('.hcard-simple').getBoundingClientRect();
            var hit=[].some.call(st.querySelectorAll('.vsig'),function(s){var r=s.getBoundingClientRect();return r.width>0&&r.right>b.left+0.5&&r.left<b.right-0.5&&r.bottom>b.top&&r.top<b.bottom});
            return {d:Math.abs((n.top+n.height/2)-(c.top+c.height/2)),under:b.top>=c.bottom-0.5,hit:hit,sig:st.querySelectorAll('.vsig').length?getComputedStyle(st.querySelector('.vsig')).display:'-'}})`); browserChecks++;
          rows.forEach((r, k) => {
            if (!(r.d <= 1)) fail(`${f} (${lang}, ${width}px): nó ${k + 1} a ${r.d.toFixed(1)} px do centro do cartão (máx. 1 px)`);
            if (!r.under) fail(`${f} (${lang}, ${width}px): botão ${k + 1} não está abaixo do cartão`);
            if (r.hit) fail(`${f} (${lang}, ${width}px): o sinal do estágio ${k + 1} cobre o botão`);
            if (r.sig === "none") fail(`${f} (${lang}, ${width}px): o sinal do estágio ${k + 1} não foi medido`);
          });
        }
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
      // Simplificado das páginas de área (S3): nenhum campo de CV oculto, sem sintaxe nem rótulos do Temático à mostra,
      // h1 único, títulos sem saltos de nível, imagens com alt e sem scroll horizontal em 375, 768 e 1280 px.
      for (const lang of ["pt-BR", "en", "fr"]) for (const width of [375, 768, 1280]) {
        await open(f, `?lang=${lang}&view=simple`, width);
        const c = await evalJs(`(function(){var vis=function(e){return e.getClientRects().length>0};var d=document.documentElement;
          var lang=d.lang, other=function(e){var p=e.closest('[lang]');return p&&p!==d&&p.lang&&p.lang!==lang&&['pt-BR','en','fr'].indexOf(p.lang)>=0};
          var fields=[].filter.call(document.querySelectorAll('[data-f]'),function(e){return !other(e)&&!e.closest('.t-only')});
          var hidden=fields.filter(function(e){return e.textContent.trim()&&!vis(e)}).map(function(e){return e.getAttribute('data-f')+': '+e.textContent.trim().slice(0,40)});
          var leak=[].filter.call(document.querySelectorAll('.pm,.pn-t,.sx,.sb,.hx,.asc,.scl,.sims,.kv dt,.cell-in--cv .fn,.cell-in--cv .k,.t-only'),vis).length;
          var hs=[].filter.call(document.querySelectorAll('h1,h2,h3,h4,h5,h6'),vis).map(function(h){return +h.tagName[1]});
          var jump=0;for(var i=1;i<hs.length;i++)if(hs[i]-hs[i-1]>1)jump++;
          var noAlt=[].filter.call(document.querySelectorAll('img'),function(i){return vis(i)&&!i.alt.trim()}).length;
          var secs=[].filter.call(document.querySelectorAll('main > section'),vis).map(function(s){return s.id}).join(' ');
          var open=[].filter.call(document.querySelectorAll('details.sample'),function(x){return x.open}).length;
          return {n:fields.length,hidden:hidden,leak:leak,h1:hs.filter(function(n){return n===1}).length,jump:jump,noAlt:noAlt,secs:secs,open:open,sw:d.scrollWidth,iw:innerWidth}})()`); browserChecks++;
        const at = `${f} (${lang}, ${width}px, simple)`;
        if (!c.n) fail(`${at}: nenhum campo data-f encontrado`);
        if (c.hidden.length) fail(`${at}: ${c.hidden.length} campo(s) de CV oculto(s): ${c.hidden.slice(0, 3).join(" | ")}`);
        if (c.leak) fail(`${at}: ${c.leak} elemento(s) só do Temático à mostra (sintaxe, prompt, rótulo de painel…)`);
        if (c.h1 !== 1) fail(`${at}: ${c.h1} elementos h1 visíveis`);
        if (c.jump) fail(`${at}: ${c.jump} salto(s) na hierarquia de títulos`);
        if (c.noAlt) fail(`${at}: ${c.noAlt} imagem(ns) visível(is) sem alt`);
        if (c.open) fail(`${at}: ${c.open} trecho(s) de código aberto(s); deveriam começar recolhidos`);
        if (c.sw > c.iw) fail(`${at}: scroll horizontal (${c.sw} > ${c.iw})`);
        const want = { "aero/index.html": "sobre competencias experiencia projetos pesquisa formacao idiomas contato", "data/index.html": "sobre competencias experiencia projetos formacao idiomas contato", "it-security/index.html": "sobre competencias experiencia projetos formacao idiomas contato" }[f];
        if (c.secs !== want) fail(`${at}: seções "${c.secs}", esperado "${want}"`);
      }
      // Temático: os trechos de código continuam abertos e sem o resumo
      { await open(f, "?view=themed", 1280);
        const t = await evalJs(`(function(){var d=document.querySelectorAll('details.sample');return {n:d.length,open:[].filter.call(d,function(x){return x.open}).length,sum:[].filter.call(document.querySelectorAll('details.sample > summary'),function(e){return e.getClientRects().length>0}).length}})()`); browserChecks++;
        if (t.open !== t.n || t.sum) fail(`${f} (themed): trechos de código devem ficar abertos e sem resumo (${t.open}/${t.n} abertos, ${t.sum} resumos à mostra)`);
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
      {
        await open(f, "?view=simple", 1280);
        await evalJs("document.getElementById('projetos').scrollIntoView();0");
        await sleep(400);
        const r = await evalJs(`(function(){var c=document.querySelector('.s-nav a[aria-current]');return {cur:c?c.getAttribute('href'):'',done:document.querySelectorAll('.s-nav li.is-done').length,pos:getComputedStyle(document.querySelector('.s-nav')).position}})()`); browserChecks++;
        if (r.cur !== "#projetos" || r.done !== 3) fail(`${f} (simple): régua em "${r.cur}" com ${r.done} seções percorridas, esperado "#projetos" com 3`);
        if (r.pos !== "absolute") fail(`${f} (simple, 1280px): a régua deveria ficar ao lado do conteúdo`);
        // Computador: texto de até 52rem, régua a >= 32 px do texto e >= 16 px da borda, conjunto centralizado
        for (const width of [1000, 1100, 1280, 1440, 1920]) for (const lang of ["pt-BR", "fr"]) {
          await open(f, "?lang=" + lang + "&view=simple", width);
          const g = await evalJs(`(function(){var n=document.querySelector('.s-nav').getBoundingClientRect(),m=document.querySelector('main').getBoundingClientRect(),d=document.documentElement;
            return {text:m.width,gap:m.left-n.right,left:n.left,right:innerWidth-m.right,rem:parseFloat(getComputedStyle(d).fontSize),sw:d.scrollWidth,iw:innerWidth}})()`); browserChecks++;
          const at = `${f} (${lang}, ${width}px, simple)`;
          if (g.sw > g.iw) fail(`${at}: scroll horizontal (${g.sw} > ${g.iw})`);
          if (g.text > 52 * g.rem + 0.5) fail(`${at}: texto com ${g.text.toFixed(0)} px, máximo 52rem`);
          if (width >= 1280 && Math.abs(g.text - 52 * g.rem) > 0.5) fail(`${at}: texto com ${g.text.toFixed(0)} px, esperado 52rem`);
          if (g.gap < 32) fail(`${at}: ${g.gap.toFixed(0)} px entre a régua e o texto (mín. 32)`);
          if (g.left < 16) fail(`${at}: régua a ${g.left.toFixed(0)} px da borda (mín. 16)`);
          if (Math.abs(g.left - g.right) > 1) fail(`${at}: conjunto fora do centro (${g.left.toFixed(0)} px à esquerda, ${g.right.toFixed(0)} px à direita)`);
          if (process.env.VIEWS_VERBOSE) console.log(at, "texto", g.text.toFixed(0), "espaço", g.gap.toFixed(0), "margens", g.left.toFixed(0), g.right.toFixed(0));
        }
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
