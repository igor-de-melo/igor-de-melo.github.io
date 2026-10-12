// Verifica as duas visões do site (Simplificado e Temático). Uso: node tests/check-views.mjs
// Parte estática (sempre): script de início e seletor em cada página, regra que desliga o movimento no Simplificado.
// Parte em navegador (quando há Chrome/Chromium; defina CHROME_PATH se preciso): data-view válido conforme a URL,
// nenhuma animação ou transição ativa em data-view="simple" e nenhum scroll horizontal em 375 e 1280 px; no celular, o
// interruptor "Site Simplificado" (role="switch"): presença, texto nas três línguas, estado, clique, teclado e foco.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { root, hasBrowser, withBrowser, sleep } from "./lib/cdp.mjs";

const PAGES = ["index.html", "aero/index.html", "data/index.html", "it-security/index.html"];
const errors = [];
const fail = (msg) => errors.push(msg);

/* ---------- Estático ---------- */
for (const f of PAGES) {
  const src = readFileSync(join(root, f), "utf8");
  const head = src.slice(0, src.indexOf("</head>"));
  if (f === "index.html") { // a Home é sempre Temático e não tem seletor
    if (!head.includes('<script>document.documentElement.dataset.view="themed"</script>')) fail(`${f}: o <head> deve fixar data-view="themed"`);
    if (/data-view-set|data-view-toggle|role="switch"|class="[^"]*\bs-only\b/.test(src)) fail(`${f}: a Home não deve ter seletor de visão nem marcação .s-only`);
    for (const a of ["aero", "data", "it-security"]) {
      if (!src.includes(`href="${a}/index.html?view=simple" data-face data-face-view="simple"`)) fail(`${f}: falta o botão do Simplificado de ${a}`);
      if (!src.includes(`href="${a}/index.html?view=themed" data-face data-face-view="themed"`)) fail(`${f}: o cartão de ${a} deve abrir ?view=themed`);
    }
    continue;
  }
  if (!/dataset\.view=v==="simple"\?"simple":"themed"/.test(head)) fail(`${f}: falta no <head> o script que aplica data-view (só "simple" ou "themed")`);
  if (!/try\{v=localStorage\.getItem\("view"\)\}catch/.test(head)) fail(`${f}: a leitura do localStorage "view" deve estar em try/catch`);
  for (const v of ["simple", "themed"]) if (!src.includes(`data-view-set="${v}"`)) fail(`${f}: falta o botão data-view-set="${v}"`);
  // Celular: interruptor "Site Simplificado" na barra do título (.now) e no menu (.rail-view), com o texto visível nas três línguas
  const SWITCH = '<button type="button" class="view-check" role="switch" aria-checked="false" data-view-toggle><svg class="view-check-ic" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">';
  const LABEL = '</svg><span lang="pt-BR">Site Simplificado</span><span lang="en">Simplified Site</span><span lang="fr">Site simplifié</span></button>';
  if (src.split(SWITCH).length - 1 !== 2 || src.split(LABEL).length - 1 !== 2 || (src.match(/data-view-toggle/g) || []).length !== 2) fail(`${f}: esperava dois interruptores "Site Simplificado" (barra do título e menu), com role="switch" e o texto nas três línguas`);
  if (!/<div class="now-tools">\s*<button type="button" class="view-check"/.test(src) || !/<div class="rail-view">\s*<button type="button" class="view-check"/.test(src)) fail(`${f}: o interruptor deve ficar em .now-tools e em .rail-view`);
  if (/class="view-toggle"|ic-simple|ic-themed/.test(src)) fail(`${f}: sobrou marcação do ícone antigo de troca de visão`);
  if (!/id="view-status" aria-live="polite"/.test(src)) fail(`${f}: falta a região aria-live que anuncia a troca de visão`);
}
const css = readFileSync(join(root, "assets", "style.css"), "utf8");
if (/\.view-toggle|\.ic-themed|\.ic-simple/.test(css)) fail("assets/style.css: sobrou CSS do ícone antigo de troca de visão");
if (!/\[data-view="simple"\] :is\([^)]*\.view-check[^)]*\)\{display:none!important\}/.test(css)) fail("assets/style.css: o interruptor de visão deve sumir na impressão");
if (!/\[data-view="simple"\] \*,\[data-view="simple"\] \*::before,\[data-view="simple"\] \*::after\{animation:none!important;transition:none!important\}/.test(css)) {
  fail('assets/style.css: falta a regra que desliga animações e transições em [data-view="simple"]');
}

/* ---------- Navegador (tests/lib/cdp.mjs) ---------- */
let browserChecks = 0;

async function browser() {
  await withBrowser("check-views", async ({ send, evalJs, open: openPage }) => {
    const open = async (file, query, width) => {
      await openPage(file, query, width);
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
          return {view:document.documentElement.dataset.view,stored:st,simple:g('.hcard-simple'),cards:g('.hcard-link'),sw:document.querySelectorAll('[data-view-set],[data-view-toggle],[role=switch],.view-check').length}})()`); browserChecks++;
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
          var h1e=[].filter.call(document.querySelectorAll('h1'),vis),sm=document.querySelector('.s-summary');
          var soon=[].filter.call(document.querySelectorAll('.repo-soon'),vis).length;
          return {h1t:h1e.length?h1e[0].textContent.trim():'',sum:!!sm&&vis(sm)&&sm.innerText.trim().length>80,lead:[].filter.call(document.querySelectorAll('#sobre .lead'),vis).length,soon:soon,
            n:fields.length,hidden:hidden,leak:leak,h1:hs.filter(function(n){return n===1}).length,jump:jump,noAlt:noAlt,secs:secs,open:open,sw:d.scrollWidth,iw:innerWidth}})()`); browserChecks++;
        const at = `${f} (${lang}, ${width}px, simple)`;
        if (!c.n) fail(`${at}: nenhum campo data-f encontrado`);
        if (c.hidden.length) fail(`${at}: ${c.hidden.length} campo(s) de CV oculto(s): ${c.hidden.slice(0, 3).join(" | ")}`);
        if (c.leak) fail(`${at}: ${c.leak} elemento(s) só do Temático à mostra (sintaxe, prompt, rótulo de painel…)`);
        if (c.h1 !== 1) fail(`${at}: ${c.h1} elementos h1 visíveis`);
        if (c.h1t !== "Igor Augusto de Melo") fail(`${at}: o h1 deveria ser o nome, achei "${c.h1t}"`);
        if (!c.sum) fail(`${at}: o resumo do Simplificado (.s-summary) não está visível`);
        if (c.lead) fail(`${at}: o primeiro parágrafo do Sobre deveria ficar só no Temático`);
        if (c.soon) fail(`${at}: ${c.soon} aviso(s) de "em breve" à mostra`);
        if (c.jump) fail(`${at}: ${c.jump} salto(s) na hierarquia de títulos`);
        if (c.noAlt) fail(`${at}: ${c.noAlt} imagem(ns) visível(is) sem alt`);
        if (c.open) fail(`${at}: ${c.open} trecho(s) de código aberto(s); deveriam começar recolhidos`);
        if (c.sw > c.iw) fail(`${at}: scroll horizontal (${c.sw} > ${c.iw})`);
        const want = { "aero/index.html": "sobre competencias experiencia projetos pesquisa formacao idiomas contato", "data/index.html": "sobre competencias experiencia projetos formacao idiomas contato", "it-security/index.html": "sobre competencias experiencia projetos formacao idiomas contato" }[f];
        if (c.secs !== want) fail(`${at}: seções "${c.secs}", esperado "${want}"`);
      }
      // Temático: os trechos de código também ficam num menu recolhível, fechado por padrão, com o resumo à mostra
      { await open(f, "?view=themed", 1280);
        const t = await evalJs(`(function(){var d=document.querySelectorAll('details.sample');var vis=function(e){return e.getClientRects().length>0};var h=[].filter.call(document.querySelectorAll('h1'),vis);
          return {h1:h.length,h1name:h.length===1&&h[0].classList.contains('area-title'),n:d.length,open:[].filter.call(d,function(x){return x.open}).length,sum:[].filter.call(document.querySelectorAll('details.sample > summary'),function(e){return e.getClientRects().length>0}).length}})()`); browserChecks++;
        if (t.h1 !== 1 || !t.h1name) fail(`${f} (themed): esperava um único h1 visível, o título da área (${t.h1} visíveis)`);
        if (t.open !== 0 || t.sum !== t.n) fail(`${f} (themed): trechos de código devem começar fechados, cada um com o seu resumo visível (${t.open}/${t.n} abertos, ${t.sum} resumos à mostra)`);
      }
      // Simplificado de Aero (S2): imagens visíveis com alt, nada do Temático à mostra e ordem do CV
      if (f === "aero/index.html") for (const lang of ["pt-BR", "en", "fr"]) {
        await open(f, `?lang=${lang}&view=simple`, 1280);
        const c = await evalJs(`(function(){var vis=function(e){return e.getClientRects().length>0};
          var noAlt=[].filter.call(document.querySelectorAll('main img, .hero img'),function(i){return vis(i)&&!i.alt.trim()}).length;
          var themedOnly=[].filter.call(document.querySelectorAll('.t-only, .sims, .sec-n, .chain-sig, .actions, .contact-icons'),vis).length;
          var a=document.getElementById('competencias'),b=document.getElementById('experiencia');
          return {noAlt:noAlt,themedOnly:themedOnly,order:!a||!b||!!(a.compareDocumentPosition(b)&4),h1:[].filter.call(document.querySelectorAll('h1'),vis).length}})()`); browserChecks++;
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
      // Tabela de resultados (Aero): ao lado da galeria e centralizada na coluna do texto quando há espaço; a lista de
      // edições começa depois da tabela e da galeria; em qualquer largura, nada passa da borda interna do cartão.
      if (f === "aero/index.html") for (const [view, width] of [["themed", 1280], ["themed", 375], ["simple", 375], ["simple", 1280]]) {
        await open(f, "?lang=pt-BR&view=" + view, width);
        const t = await evalJs(`(function(){var t=document.querySelector('.results'),a=t.closest('article'),g=a.querySelector('.gallery'),w=t.parentNode,
          e=[].filter.call(a.querySelectorAll('.editions'),function(x){return x.getClientRects().length})[0],R=function(x){return x.getBoundingClientRect()},cs=getComputedStyle(a);
          var r=R(t),gr=R(g),wr=R(w),inR=R(a).right-parseFloat(cs.paddingRight)-parseFloat(cs.borderRightWidth),over=0;
          [].forEach.call(a.querySelectorAll('h3,.org,dl,.results-wrap,.editions,.gallery'),function(x){if(x.getClientRects().length)over=Math.max(over,R(x).right-inR)});
          return {wrap:w.className,beside:r.top<gr.bottom-1&&r.bottom>gr.top+1,clear:r.right<=gr.left+1,off:Math.abs((r.left-wr.left)-(wr.right-r.right)),after:R(e).top>=Math.max(r.bottom,r.top<gr.top+1||r.top<gr.bottom?(R(e).top>gr.top?Math.min(gr.bottom,R(e).top):0):0)-1,
            below:R(e).top>=r.bottom-1&&(gr.top>R(e).top||R(e).top>=gr.bottom-1),over:over}})()`); browserChecks++;
        const at = `${f} (${view}, ${width}px)`;
        if (t.wrap !== "results-wrap") fail(`${at}: a tabela de resultados deve ficar dentro de .results-wrap`);
        if (t.off > 1.5) fail(`${at}: tabela fora do centro do seu bloco (${t.off.toFixed(1)} px de diferença entre as margens)`);
        if (!t.below) fail(`${at}: a lista de edições deve começar depois da tabela e da galeria`);
        if (t.over > 1) fail(`${at}: conteúdo do cartão passa ${t.over.toFixed(0)} px da borda interna`);
        if (view === "themed" && width === 1280 && !(t.beside && t.clear)) fail(`${at}: a tabela deveria ficar ao lado da galeria, na coluna do texto`);
        if (width === 375 && t.beside) fail(`${at}: no celular a tabela não fica ao lado da galeria`);
      }
      // Celular: interruptor "Site Simplificado" (role="switch"). Um na barra do título e outro no menu.
      {
        const SW = `(function(){var d=document.documentElement,vis=function(e){return !!e&&e.getClientRects().length>0},R=function(e){return e.getBoundingClientRect()};
          var all=[].slice.call(document.querySelectorAll('[role=switch]')),b=document.querySelector('.now .view-check'),m=document.querySelector('.rail .view-check'),r=R(b),row=R(document.querySelector('.now-row'));
          var near=[].filter.call(document.querySelectorAll('.now-row .theme-toggle,.now-row .menu-toggle'),vis).map(R),t=R(document.querySelector('.now-title'));
          var lab=[].filter.call(b.querySelectorAll('span'),vis)[0],a=document.activeElement,p=getComputedStyle(b.querySelector('path')).stroke,c=getComputedStyle(b.querySelector('circle')).fill;
          return {view:d.dataset.view,n:all.length,checked:all.map(function(x){return x.getAttribute('aria-checked')}).join(','),bar:vis(b),menu:vis(m),desk:vis(document.querySelector('.view-switch')),
            name:b.innerText.trim(),label:b.getAttribute('aria-label')||b.title||'',w:r.width,h:r.height,mh:vis(m)?R(m).height:0,
            fits:r.left>=row.left-0.5&&r.right<=row.right+0.5&&t.right<=r.left+0.5&&!near.some(function(o){return o.left<r.right-0.5&&o.right>r.left+0.5}),
            oneLine:!!lab&&R(lab).height<parseFloat(getComputedStyle(lab).fontSize)*1.6,mark:p!=='none',filled:c!=='none',
            focus:a===b?'bar':a===m?'menu':a&&a.classList.contains('menu-toggle')?'menu-toggle':a?a.tagName:'',open:d.classList.contains('menu-open'),
            pressed:[].map.call(document.querySelectorAll('.view-switch [data-view-set]'),function(x){return x.getAttribute('data-view-set')+'='+x.getAttribute('aria-pressed')}).join(','),
            url:location.search,status:document.getElementById('view-status').textContent,sw:d.scrollWidth,iw:innerWidth}})()`;
        const press = async (k) => { // Enter aciona no keydown (com o caractere) e Espaço, no keyup
          const e = k === "Enter" ? { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" } : { key: " ", code: "Space", windowsVirtualKeyCode: 32, text: " " };
          await send("Input.dispatchKeyEvent", { type: "keyDown", ...e });
          await send("Input.dispatchKeyEvent", { type: "keyUp", key: e.key, code: e.code, windowsVirtualKeyCode: e.windowsVirtualKeyCode });
          await sleep(150);
        };
        const NAMES = { "pt-BR": "Site Simplificado", en: "Simplified Site", fr: "Site simplifié" };
        const state = (s, view, at) => { // o estado visual e o aria-checked acompanham <html data-view>
          const on = view === "simple";
          if (s.view !== view) fail(`${at}: data-view="${s.view}", esperado "${view}"`);
          if (s.checked !== `${on},${on}`) fail(`${at}: aria-checked "${s.checked}", esperado "${on},${on}"`);
          if (s.mark !== on || s.filled !== on) fail(`${at}: círculo ${s.filled ? "preenchido" : "vazio"} e marca ${s.mark ? "à mostra" : "oculta"}, esperado ${on ? "preenchido com a marca" : "só o contorno"}`);
          if (s.pressed !== `simple=${on},themed=${!on}`) fail(`${at}: seletor do computador em "${s.pressed}"`);
        };
        // Presença, texto, estado inicial pela URL, alvo de toque e encaixe em cada largura de celular
        for (const view of ["themed", "simple"]) for (const lang of ["pt-BR", "en", "fr"]) {
          await open(f, `?lang=${lang}&view=${view}`, 375);
          for (const width of [320, 360, 375, 390, 430]) {
            await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: true });
            await sleep(120);
            const s = await evalJs(SW), at = `${f} (${lang}, ${width}px, ${view}, interruptor)`; browserChecks++;
            if (s.n !== 2 || !s.bar) fail(`${at}: esperava dois interruptores, com o da barra do título visível (${s.n}, visível: ${s.bar})`);
            if (s.desk) fail(`${at}: o seletor do computador não deveria aparecer no celular`);
            if (s.name !== NAMES[lang] || s.label) fail(`${at}: nome "${s.name}" (aria-label ou title: "${s.label}"), esperado só o texto visível "${NAMES[lang]}"`);
            if (s.w < 44 || s.h < 44) fail(`${at}: alvo de toque de ${s.w.toFixed(0)} × ${s.h.toFixed(0)} px (mín. 44 × 44)`);
            if (!s.fits) fail(`${at}: o interruptor sai da barra ou cobre o título, o tema ou o menu`);
            if (!s.oneLine) fail(`${at}: o texto do interruptor quebrou em duas linhas`);
            if (s.sw > s.iw) fail(`${at}: scroll horizontal (${s.sw} > ${s.iw})`);
            state(s, view, at);
          }
        }
        // Computador: o interruptor não aparece nas duas visões; vale o par de botões
        for (const view of ["themed", "simple"]) {
          await open(f, "?view=" + view, 1280);
          const s = await evalJs(SW); browserChecks++;
          if (s.bar || s.menu || !s.desk) fail(`${f} (1280px, ${view}): no computador vale o seletor de dois botões, sem o interruptor (barra: ${s.bar}, menu: ${s.menu}, seletor: ${s.desk})`);
          state(s, view, `${f} (1280px, ${view})`);
        }
        // Troca por clique, Enter e Espaço na barra do título: o foco fica no interruptor, a URL e o anúncio acompanham
        await open(f, "?lang=pt-BR&view=themed", 375);
        let want = "themed";
        for (const how of ["click", "Enter", " ", "click"]) {
          if (how === "click") await evalJs("(function(){var b=document.querySelector('.now .view-check');b.focus();b.click()})();0");
          else { await evalJs("document.querySelector('.now .view-check').focus();0"); await press(how); }
          await sleep(150);
          want = want === "themed" ? "simple" : "themed";
          const s = await evalJs(SW), at = `${f} (375px, ${how === " " ? "Espaço" : how} na barra)`; browserChecks++;
          state(s, want, at);
          if (s.focus !== "bar") fail(`${at}: o foco foi para "${s.focus}", deveria continuar no interruptor`);
          if (!new RegExp("[?&]view=" + want + "(&|$)").test(s.url)) fail(`${at}: a URL ficou "${s.url}"`);
          if (s.status !== (want === "simple" ? "Visualização: Simplificado" : "Visualização: Temático")) fail(`${at}: anúncio "${s.status}"`);
        }
        // No menu: a troca fecha o painel e devolve o foco ao botão do menu
        for (const how of ["Enter", " "]) {
          await evalJs("document.querySelector('.menu-toggle').click();0"); await sleep(150);
          const o = await evalJs(SW); browserChecks++;
          if (!o.open || !o.menu || o.mh < 44) fail(`${f} (375px, menu): o interruptor do menu deveria estar visível, com 44 px de altura (aberto: ${o.open}, visível: ${o.menu}, altura: ${o.mh})`);
          await evalJs("document.querySelector('.rail .view-check').focus();0"); await press(how);
          await sleep(150);
          want = want === "themed" ? "simple" : "themed";
          const s = await evalJs(SW), at = `${f} (375px, ${how === " " ? "Espaço" : how} no menu)`; browserChecks++;
          state(s, want, at);
          if (s.open) fail(`${at}: o menu deveria fechar depois da troca`);
          if (s.focus !== "menu-toggle") fail(`${at}: o foco foi para "${s.focus}", deveria voltar ao botão do menu`);
        }
        // Trocas feitas por outros controles: o par de botões do computador e o próprio atributo data-view
        for (const [how, js] of [["botão do seletor do computador", "document.querySelector('.view-switch [data-view-set=WANT]').click()"], ["mudança direta de data-view", "document.documentElement.dataset.view='WANT'"]]) {
          want = want === "themed" ? "simple" : "themed";
          await evalJs(js.replace("WANT", want) + ";0"); await sleep(150);
          const s = await evalJs(SW); browserChecks++;
          state(s, want, `${f} (375px, ${how})`);
        }
        // Voltar do navegador: o estado segue a visão da página que reaparece
        await open(f, "?view=simple", 375);
        await evalJs("location.href='../index.html';0"); await sleep(900);
        await evalJs("history.back();0"); await sleep(900);
        { const s = await evalJs(SW); browserChecks++; state(s, "simple", `${f} (375px, voltar do navegador)`); }
        await evalJs("try{localStorage.removeItem('view')}catch(e){};0");
      }
      // Temático: continua sem scroll horizontal
      for (const width of [375, 1280]) {
        await open(f, "?view=themed", width);
        const s = await evalJs(STATE); browserChecks++;
        if (s.sw > s.iw) fail(`${f} (${width}px, themed): scroll horizontal (${s.sw} > ${s.iw})`);
      }
    }
  });
}

if (hasBrowser) {
  try { await browser(); } catch (e) { fail("navegador: " + e.message); }
} else {
  console.log("AVISO  sem Chrome/Chromium (ou sem WebSocket no Node): só a parte estática foi verificada. Defina CHROME_PATH para rodar tudo.");
}

if (errors.length) { console.error(errors.map((e) => "FALHA  " + e).join("\n")); console.error(`\n${errors.length} problema(s).`); process.exit(1); }
console.log(`Visões OK em ${PAGES.length} páginas (${browserChecks} verificações em navegador).`);
