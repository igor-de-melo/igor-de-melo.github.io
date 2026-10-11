// Verifica a ampliação de figuras (galerias). Uso: node tests/check-lightbox.mjs [--list]
// Para cada figura ampliável de cada página, nas duas visões, nos dois temas, em 375 e 1280 px: abre a ampliada e confere
// que ela mostra a figura clicada (mesmo arquivo), na maior variante (largura natural = data-w), com o alt e a legenda dela,
// que cabe na janela, que o contador "n de x" acompanha, que Esc fecha e que o foco volta a quem abriu.
// Falha se figuras diferentes abrirem a mesma imagem. --list imprime as figuras testadas.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { root, hasBrowser, withBrowser, sleep } from "./lib/cdp.mjs";

const PAGES = ["aero/index.html", "data/index.html", "it-security/index.html"];
const list = process.argv.includes("--list");
const errors = [];
const fail = (msg) => errors.push(msg);
let checks = 0;
const tested = new Map();

/* ---------- Estático: a <img> da ampliada não pode ter srcset nem sizes (com eles o navegador ignora o src trocado) ---------- */
for (const f of PAGES) {
  const src = readFileSync(join(root, f), "utf8");
  const box = src.match(/<dialog class="lightbox"[\s\S]*?<\/dialog>/);
  const galleries = (src.match(/data-gallery/g) || []).length;
  if (galleries && !box) fail(`${f}: há galeria, mas falta o <dialog class="lightbox">`);
  if (box && /<img\b[^>]*\b(srcset|sizes)=/.test(box[0])) fail(`${f}: a <img> da ampliada não pode ter srcset nem sizes`);
}

/* ---------- Navegador ---------- */
// Lista as figuras da página: uma por miniatura de cada galeria.
const FIGS = `(function(){return [].map.call(document.querySelectorAll('[data-gallery]'),function(g,gi){return [].map.call(g.querySelectorAll('.gallery-thumb'),function(t,ti){
  return {g:gi,t:ti,src:t.getAttribute('data-src'),w:+t.getAttribute('data-w'),cap:t.getAttribute('data-cap-pt-br')||'',alt:(t.querySelector('img')||{}).alt||''}})})})()`;
// Abre a figura (galeria g, miniatura t) e devolve o que a ampliada mostra.
const OPEN = (g, t) => `(async function(){var G=document.querySelectorAll('[data-gallery]')[${g}],T=G.querySelectorAll('.gallery-thumb')[${t}],M=G.querySelector('.gallery-main'),box=document.querySelector('dialog.lightbox'),img=box.querySelector('img');
  G.scrollIntoView({block:'center'});
  var viaMain=!!M.offsetParent;T.focus();T.click();if(viaMain){M.focus();M.click();}
  if(!box.open)return {open:false};
  for(var i=0;i<100&&!(img.complete&&img.naturalWidth);i++)await new Promise(function(r){setTimeout(r,50)});
  var r=img.getBoundingClientRect(),b=box.getBoundingClientRect(),lang=document.documentElement.lang,cap=[].filter.call(box.querySelectorAll('.lightbox-cap [lang]'),function(s){return s.lang===lang})[0];
  return {open:true,viaMain:viaMain,src:(img.currentSrc||img.src).split('/').pop(),nw:img.naturalWidth,alt:img.alt,srcset:img.hasAttribute('srcset'),cap:cap?cap.textContent:box.querySelector('.lightbox-cap').textContent,
    fits:r.width>0&&r.height>0&&r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&b.right<=innerWidth+1&&b.bottom<=innerHeight+1,
    ratio:Math.abs(r.width/r.height-img.naturalWidth/img.naturalHeight)<0.02||getComputedStyle(img).objectFit==='contain',
    sw:document.documentElement.scrollWidth>innerWidth,count:[].filter.call(G.querySelectorAll('figcaption .gallery-i'),function(n){return n.textContent===String(${t}+1)}).length===G.querySelectorAll('figcaption .gallery-i').length,
    pressed:T.getAttribute('aria-pressed')==='true'}})()`;
const CLOSED = (g, t) => `(function(){var G=document.querySelectorAll('[data-gallery]')[${g}],T=G.querySelectorAll('.gallery-thumb')[${t}],M=G.querySelector('.gallery-main'),a=document.activeElement;
  return {open:document.querySelector('dialog.lightbox').open,focus:a===T?'thumb':a===M?'main':(a&&a.tagName)}})()`;

if (hasBrowser) {
  try {
    await withBrowser("check-lightbox", async ({ evalJs, open, key }) => {
      for (const f of PAGES) for (const view of ["themed", "simple"]) for (const theme of ["light", "dark"]) for (const width of [375, 1280]) {
        await open(f, `?lang=pt-BR&view=${view}`, width, width < 500 ? 812 : 900);
        await evalJs(`try{localStorage.setItem('theme','${theme}')}catch(e){};document.documentElement.dataset.theme==='${theme}'||(document.querySelector('.theme-toggle')&&[].some.call(document.querySelectorAll('.theme-toggle'),function(b){if(b.getClientRects().length){b.click();return true}}));0`);
        const figs = (await evalJs(FIGS)).flat();
        const at0 = `${f} (${view}, ${theme}, ${width}px)`;
        if (!tested.has(f)) tested.set(f, figs.map((x) => `galeria ${x.g + 1}, imagem ${x.t + 1}: ${x.src.split("/").pop()} (${x.w} px) “${x.cap || x.alt.slice(0, 50)}”`));
        const opened = new Set();
        for (const x of figs) {
          const at = `${at0}, galeria ${x.g + 1}, imagem ${x.t + 1}`, want = x.src.split("/").pop();
          const r = await evalJs(OPEN(x.g, x.t)); checks++;
          if (!r || !r.open) { fail(`${at}: a ampliada não abriu`); continue; }
          opened.add(r.src);
          if (r.src !== want) fail(`${at}: a ampliada mostra "${r.src}", esperado "${want}"`);
          if (r.nw !== x.w) fail(`${at}: largura natural ${r.nw} px, esperada a da maior variante (${x.w} px)`);
          if (r.srcset) fail(`${at}: a <img> da ampliada tem srcset`);
          if (r.alt !== x.alt) fail(`${at}: alt "${r.alt.slice(0, 40)}", esperado "${x.alt.slice(0, 40)}"`);
          if (x.cap && !r.cap.includes(x.cap)) fail(`${at}: legenda "${r.cap.slice(0, 50)}", esperada "${x.cap}"`);
          if (!r.fits) fail(`${at}: a imagem ampliada não cabe na janela`);
          if (!r.ratio) fail(`${at}: a imagem ampliada está deformada`);
          if (r.sw) fail(`${at}: rolagem horizontal com a ampliada aberta`);
          if (!r.count) fail(`${at}: o contador "n de x" não acompanha a imagem`);
          if (!r.pressed) fail(`${at}: a miniatura clicada não ficou marcada`);
          await key("Escape"); await sleep(80);
          const c = await evalJs(CLOSED(x.g, x.t));
          if (c.open) { fail(`${at}: Esc não fechou a ampliada`); await evalJs("document.querySelector('dialog.lightbox').close();0"); }
          else if (c.focus !== (r.viaMain ? "main" : "thumb")) fail(`${at}: o foco voltou para "${c.focus}", esperado ${r.viaMain ? "o botão da imagem principal" : "a miniatura clicada"}`);
        }
        const distinct = new Set(figs.map((x) => x.src.split("/").pop())).size;
        if (figs.length && opened.size !== distinct) fail(`${at0}: ${figs.length} figuras abriram ${opened.size} imagem(ns) diferente(s), esperado ${distinct}`);
      }
    });
  } catch (e) { fail("navegador: " + e.message); }
} else {
  console.log("AVISO  sem Chrome/Chromium (ou sem WebSocket no Node): só a parte estática foi verificada. Defina CHROME_PATH para rodar tudo.");
}

if (list) for (const [f, figs] of tested) { console.log(`${f}: ${figs.length} figura(s) ampliável(is)`); figs.forEach((x) => console.log("  " + x)); }
if (errors.length) { console.error(errors.slice(0, 40).map((e) => "FALHA  " + e).join("\n")); console.error(`\n${errors.length} problema(s).`); process.exit(1); }
const n = [...tested.values()].reduce((s, v) => s + v.length, 0);
console.log(`Ampliação OK: ${n} figuras em ${PAGES.length} páginas (${checks} aberturas em navegador).`);
