(function () {
  "use strict";
  var root = document.documentElement;
  var VALID = ["pt-BR", "en", "fr"];
  var KEY = "lang";

  /* ---------- Armazenamento (pode falhar em file://, janela privada etc.) ---------- */
  function readStored() {
    try { var v = window.localStorage.getItem(KEY); return VALID.indexOf(v) >= 0 ? v : null; }
    catch (e) { return null; }
  }
  function store(l) {
    try { window.localStorage.setItem(KEY, l); } catch (e) { /* sem persistência */ }
  }

  /* ---------- Idioma ---------- */
  // Títulos por página: atributos data-title-pt-br, data-title-en e data-title-fr no <html>.
  // Quem precisar reagir à troca escuta o evento "sitelangchange" (detail.lang).
  var langButtons = document.querySelectorAll("button[data-lang]");
  var faceLinks = document.querySelectorAll("a[data-face]");
  faceLinks = Array.prototype.map.call(faceLinks, function (a) {
    return { el: a, base: a.getAttribute("href").split("?")[0], view: a.getAttribute("data-face-view") };
  });

  // Links entre as páginas levam o idioma. Na Home, cada link diz a visão que abre (data-face-view: o cartão abre o
  // Temático e o botão abaixo dele, o Simplificado). Nas áreas, o Simplificado segue para as outras áreas; o link
  // para a Home vai sem visão, porque a Home é sempre Temático.
  function updateFaceLinks(l) {
    var simple = root.dataset.view === "simple";
    faceLinks.forEach(function (f) {
      var v = f.view || (simple && f.base !== "../index.html" ? "simple" : "");
      f.el.setAttribute("href", f.base + "?lang=" + l + (v ? "&view=" + v : ""));
    });
  }

  function setLang(l, persist) {
    root.lang = l;
    langButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === l)); });
    var title = root.getAttribute("data-title-" + l.toLowerCase());
    if (title) document.title = title;
    var desc = root.getAttribute("data-desc-" + l.toLowerCase()), meta = document.querySelector('meta[name="description"]');
    if (desc && meta) meta.setAttribute("content", desc);
    updateFaceLinks(l);
    // Dicas (title) dos botões só de ícone: atributos data-title-* no próprio botão.
    document.querySelectorAll("button[data-title-" + l.toLowerCase() + "]").forEach(function (b) { b.title = b.getAttribute("data-title-" + l.toLowerCase()); });
    document.querySelectorAll("[data-aria-" + l.toLowerCase() + "]").forEach(function (e) { e.setAttribute("aria-label", e.getAttribute("data-aria-" + l.toLowerCase())); });
    document.querySelectorAll("img[data-alt-" + l.toLowerCase() + "]").forEach(function (i) { i.alt = i.getAttribute("data-alt-" + l.toLowerCase()); });
    // Currículo em PDF: um arquivo por idioma (data-cv-pt-br, data-cv-en e data-cv-fr no próprio link).
    document.querySelectorAll("a[data-cv-" + l.toLowerCase() + "]").forEach(function (a) {
      var h = a.getAttribute("data-cv-" + l.toLowerCase());
      a.setAttribute("href", h);
      if (a.hasAttribute("data-print-url")) a.setAttribute("data-print-url", "https://igor-de-melo.github.io/assets/docs/" + h.split("/").pop());
      // Nome do arquivo baixado: Igor_de_Melo_CV_<área>_<idioma>.pdf (a área vem do atributo download de cada página).
      if (a.hasAttribute("download")) a.setAttribute("download", a.getAttribute("download").replace(/_(pt|en|fr)\.pdf$/, "_" + l.toLowerCase().slice(0, 2) + ".pdf"));
    });
    if (persist) store(l);
    document.dispatchEvent(new CustomEvent("sitelangchange", { detail: { lang: l } }));
  }
  langButtons.forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang, true); }); });

  /* ---------- Tema claro/escuro ---------- */
  // O tema ativo fica sempre em <html data-theme>: um script no <head> aplica a escolha gravada (localStorage "theme")
  // ou, sem escolha, o tema do sistema. TI e Cibersegurança é só escuro no Temático; no Simplificado tem os dois
  // temas como as outras páginas (o botão dela só aparece nessa visão).
  // Quem desenha em canvas escuta o evento "sitethemechange" e relê as cores.
  var themeBtns = Array.prototype.slice.call(document.querySelectorAll(".theme-toggle"));
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() { return root.dataset.theme === "dark"; }
  function storedTheme() {
    try { var t = window.localStorage.getItem("theme"); return t === "dark" || t === "light" ? t : null; }
    catch (e) { return null; }
  }
  var darkOnly = document.body.dataset.area === "it-security";
  function themeLocked() { return darkOnly && root.dataset.view !== "simple"; }
  function preferredTheme() { return storedTheme() || (darkQuery.matches ? "dark" : "light"); }
  function syncTheme() {
    themeBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(isDark())); });
    document.dispatchEvent(new CustomEvent("sitethemechange", { detail: { dark: isDark() } }));
  }
  if (themeBtns.length) {
    themeBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var next = isDark() ? "light" : "dark";
        root.dataset.theme = next;
        try { window.localStorage.setItem("theme", next); } catch (e) { /* sem persistência */ }
        syncTheme();
      });
      b.setAttribute("aria-pressed", String(isDark()));
    });
    if (darkQuery.addEventListener) darkQuery.addEventListener("change", function () {
      if (storedTheme() || themeLocked()) return;
      root.dataset.theme = darkQuery.matches ? "dark" : "light";
      syncTheme();
    });
  }

  /* ---------- Régua de seções (scroll-spy) ---------- */
  // A seção atual é a que cruza uma linha a 40% da altura da janela. O item atual recebe aria-current e
  // a régua recebe --ry / --rt / --rh (posição do marcador), usados pelas variantes de cada área no CSS.
  var rulerLinks = Array.prototype.slice.call(document.querySelectorAll(".ruler li:not(.s-only) > a[href^='#']"));
  var sections = rulerLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  var track = document.querySelector(".ruler-track");
  var nowTitle = document.querySelector(".now-title"), progress = document.querySelector(".now-progress");
  var current = -1, lineIndex = 0, nowN = null, nowPct = null, nowTimer = 0, nowTicks = [];
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Ciência de Dados, "célula em execução": o rótulo do item atual mostra [*] e, 0,6 s depois, o número [n].
  // Itens já visitados mantêm o número. Com "reduzir movimento", o número aparece direto.
  var cells = [], running = -1, cellTimer = 0;
  function runCell(i) {
    if (!cells.length) return;
    clearTimeout(cellTimer);
    if (running >= 0) cells[running].textContent = "[" + (running + 1) + "]";
    running = -1;
    if (still.matches) { cells[i].textContent = "[" + (i + 1) + "]"; return; }
    running = i;
    cells[i].textContent = "[*]";
    cellTimer = setTimeout(function () { cells[i].textContent = "[" + (i + 1) + "]"; running = -1; }, 600);
  }

  function placeMark() {
    if (!track || current < 0) return;
    var li = rulerLinks[current].parentNode;
    if (!li.offsetHeight) return; // trilho escondido (menu do celular fechado)
    track.style.setProperty("--ry", (li.offsetTop + li.offsetHeight / 2 - 22) + "px");
    track.style.setProperty("--rt", li.offsetTop + "px");
    track.style.setProperty("--rh", li.offsetHeight + "px");
  }
  function setCurrent(i) {
    if (i === current || !rulerLinks[i]) return;
    current = i;
    rulerLinks.forEach(function (a, k) {
      if (k === i) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    });
    placeMark();
    runCell(i);
    // Barra de status (TI e Cibersegurança): marca a mesma seção que a régua.
    Array.prototype.forEach.call(document.querySelectorAll(".sb-i"), function (e, k) { e.classList.toggle("cur", k === i); });
    var h = sections[i] && sections[i].querySelector("h2");
    if (nowTitle && h && !(sNav && root.dataset.view === "simple")) nowTitle.innerHTML = h.innerHTML;
    nowTicks.forEach(function (t, k) { t.className = k === i ? "cur" : k < i ? "done" : ""; });
    if (nowN) { // Dados: contador da célula, In [*] e depois In [n]
      clearTimeout(nowTimer);
      if (still.matches) nowN.textContent = "In [" + (i + 1) + "]";
      else { nowN.textContent = "In [*]"; nowTimer = setTimeout(function () { nowN.textContent = "In [" + (i + 1) + "]"; }, 600); }
    }
  }
  if (rulerLinks.length && sections.every(Boolean)) {
    // Régua horizontal do celular: progresso contínuo da rolagem (--pf de 0 a 1); o desenho de cada área está no CSS.
    if (progress) {
      var area = document.body.dataset.area, mk = function (cls) { var e = document.createElement("span"); e.className = cls; return e; };
      progress.textContent = "";
      var bar = mk("now-bar"), mark = mk("now-mark");
      if (area === "data") { nowN = mk("now-n"); progress.appendChild(nowN); }
      if (area === "aero") { var plane = document.querySelector(".ruler-mark svg"); if (plane) mark.appendChild(plane.cloneNode(true)); }
      bar.appendChild(mk("now-fill"));
      // Um traço por seção, na fração da rolagem em que a seção começa.
      nowTicks = sections.map(function () { var t = document.createElement("i"); bar.appendChild(t); return t; });
      // Simplificado: as seções da régua .s-nav (inclui Cursos e Idiomas, sem as seções vazias) ganham traços próprios.
      var simpleSecs = Array.prototype.map.call(document.querySelectorAll(".s-nav a[href^='#']"), function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
      var simpleTicks = simpleSecs.map(function () { var t = document.createElement("i"); t.className = "s-tick"; bar.appendChild(t); return t; });
      var placeTicks = function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var put = function (secs, ticks) {
          secs.forEach(function (sec, k) {
            var top = sec.getBoundingClientRect().top + window.scrollY;
            ticks[k].style.left = (max > 0 ? Math.min(1, Math.max(0, top / max)) * 100 : 0).toFixed(2) + "%";
          });
        };
        put(sections, nowTicks);
        put(simpleSecs, simpleTicks);
      };
      bar.appendChild(mark); progress.appendChild(bar);
      if (area === "it-security") { nowPct = mk("now-pct"); progress.appendChild(nowPct); }
      var ticking = false, onScroll = function () {
        ticking = false;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        progress.style.setProperty("--pf", p.toFixed(4));
        if (nowPct) nowPct.textContent = Math.round(p * 100) + "%";
      };
      window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }, { passive: true });
      window.addEventListener("resize", function () { placeTicks(); onScroll(); });
      window.addEventListener("load", placeTicks);
      document.addEventListener("load", function (e) { if (e.target && e.target.tagName === "IMG") placeTicks(); }, true); // imagens que carregam depois mudam a altura
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeTicks);
      placeTicks();
      onScroll();
      // A troca de visão muda a altura da página: os traços e o progresso são refeitos.
      document.addEventListener("siteviewchange", function () { placeTicks(); onScroll(); });
    }
    if (document.body.dataset.area === "data") cells = rulerLinks.map(function (a) {
      var n = document.createElement("span");
      n.className = "ruler-n";
      n.setAttribute("aria-hidden", "true");
      a.parentNode.appendChild(n);
      return n;
    });
    setCurrent(0);
    // Clique num item: o marcador vai direto até ele; a rolagem não o faz parar nas seções do caminho.
    var locked = false, lockTimer = 0;
    var unlock = function () { locked = false; clearTimeout(lockTimer); };
    rulerLinks.forEach(function (a, k) {
      a.addEventListener("click", function () {
        setCurrent(k);
        locked = true;
        clearTimeout(lockTimer);
        lockTimer = setTimeout(unlock, 1500);
      });
    });
    window.addEventListener("scrollend", unlock);
    if ("IntersectionObserver" in window) {
      var atEnd = false;
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) lineIndex = sections.indexOf(e.target); });
        if (!atEnd && !locked) setCurrent(lineIndex);
      }, { rootMargin: "-40% 0px -60% 0px" });
      sections.forEach(function (sec) { spy.observe(sec); });
      // Fim da página: a última seção é curta e nunca chega à linha dos 40%.
      var end = document.createElement("div");
      end.setAttribute("aria-hidden", "true");
      end.style.cssText = "height:1px;margin-top:-1px"; // com altura zero, o fim da página às vezes não era detectado
      document.body.appendChild(end);
      new IntersectionObserver(function (entries) {
        atEnd = entries[0].isIntersecting;
        if (!locked) setCurrent(atEnd ? sections.length - 1 : lineIndex);
      }).observe(end);
    }
    window.addEventListener("resize", placeMark);
    document.addEventListener("sitelangchange", placeMark);
    document.addEventListener("siteviewchange", placeMark);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeMark);
  }

  /* ---------- Régua do Simplificado (.s-nav): seção atual e seções já percorridas ---------- */
  // Mesma linha a 40% da janela. O link atual recebe aria-current; o item atual, .is-cur; os anteriores, .is-done.
  // Sem animação: o CSS só troca cor e peso.
  var sNav = document.querySelector(".s-nav");
  if (sNav && "IntersectionObserver" in window) {
    var sLinks = Array.prototype.slice.call(sNav.querySelectorAll("a[href^='#']"));
    var sTargets = sLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var sOn = sLinks.map(function () { return false; }), sCur = -1, sEnd = false;
    var sMark = function () {
      var i = sCur;
      var line = window.innerHeight * 0.4;
      sOn.forEach(function (v, k) {
        if (v) { i = k; return; }
        // Bloco dentro de outra seção (Cursos em Formação): conta do seu início até o fim da seção que o contém.
        var t = sTargets[k];
        if (t && i >= 0 && sOn[i] && sTargets[i] !== t && sTargets[i].contains(t) && t.getBoundingClientRect().top <= line) i = k;
      });
      if (sEnd) i = sLinks.length - 1;
      sCur = i;
      if (nowTitle && i >= 0 && root.dataset.view === "simple") nowTitle.innerHTML = sLinks[i].innerHTML;
      sLinks.forEach(function (a, k) {
        if (k === i) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
        a.parentNode.classList.toggle("is-cur", k === i);
        a.parentNode.classList.toggle("is-done", k < i);
      });
    };
    var sSpy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { var k = sTargets.indexOf(e.target); if (k >= 0) sOn[k] = e.isIntersecting; });
      sMark();
    }, { rootMargin: "-40% 0px -60% 0px" });
    sTargets.forEach(function (t) { if (t) sSpy.observe(t); });
    var sFoot = document.createElement("div");
    sFoot.setAttribute("aria-hidden", "true");
    sFoot.style.cssText = "height:1px;margin-top:-1px";
    document.body.appendChild(sFoot);
    new IntersectionObserver(function (entries) { sEnd = entries[0].isIntersecting; sMark(); }).observe(sFoot);
    window.addEventListener("scroll", function () { if (root.dataset.view === "simple") sMark(); }, { passive: true });
    // Ao trocar de visão, o título da barra do celular volta a seguir a régua daquela visão.
    document.addEventListener("siteviewchange", function () {
      if (root.dataset.view === "simple") { sMark(); return; }
      var h2 = sections[current] && sections[current].querySelector("h2");
      if (nowTitle && h2) nowTitle.innerHTML = h2.innerHTML;
    });
  }

  /* ---------- Home no celular: extensão dos sinais entre um nó e o seguinte ---------- */
  // O nó fica no centro do cartão (CSS). O sinal vai de 8 px abaixo dele até 8 px acima do nó seguinte, e isso depende
  // da altura dos dois cartões: cada estágio recebe --sig-top e --sig-bottom (este negativo, porque passa do estágio).
  var chain = document.querySelector(".chain");
  if (chain) {
    var stages = Array.prototype.slice.call(chain.querySelectorAll(".stage"));
    var NODE = 24, GAP = 8; // meio nó (48 px) e folga entre o nó e o sinal
    var center = function (st) { var c = st.querySelector(".hcard"); return c ? c.offsetTop + c.offsetHeight / 2 : 0; };
    var measureChain = function () {
      stages.forEach(function (st, k) {
        var next = stages[k + 1];
        st.style.setProperty("--sig-top", (center(st) + NODE + GAP) + "px");
        if (next) st.style.setProperty("--sig-bottom", -(next.offsetTop - st.offsetTop - st.offsetHeight + center(next) - NODE - GAP) + "px");
      });
      chain.classList.add("is-measured");
    };
    measureChain();
    window.addEventListener("resize", measureChain);
    window.addEventListener("load", measureChain);
    document.addEventListener("sitelangchange", measureChain);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureChain);
  }

  /* ---------- Contadores ao lado dos títulos de seção ---------- */
  // <p class="sec-n" data-count="seletor" data-pt-br="singular|plural" data-en="..." data-fr="...">: o número vem
  // da contagem de itens da própria seção, então não precisa ser atualizado à mão quando um item entra ou sai.
  Array.prototype.forEach.call(document.querySelectorAll(".sec-n[data-count]"), function (el) {
    var sec = el.closest("section");
    var n = sec ? sec.querySelectorAll(el.getAttribute("data-count")).length : 0;
    if (!n) return;
    VALID.forEach(function (l) {
      var words = (el.getAttribute("data-" + l.toLowerCase()) || "").split("|");
      var span = el.querySelector('[lang="' + l + '"]');
      if (span && words.length === 2) span.textContent = n + " " + words[n === 1 ? 0 : 1];
    });
  });

  /* ---------- Menu do celular (o trilho vira um painel) ---------- */
  var menuBtn = document.querySelector(".menu-toggle"), rail = document.getElementById("trilho");
  if (menuBtn && rail) {
    var now = document.querySelector(".now");
    var behind = Array.prototype.slice.call(document.querySelectorAll(".topbar, .content"));
    var narrow = window.matchMedia("(max-width: 760px)");
    var setMenu = function (open) {
      if (open && now) root.style.setProperty("--menu-top", Math.round(now.getBoundingClientRect().bottom) + "px");
      root.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      behind.forEach(function (el) { el.inert = open; });
      if (open) placeMark();
    };
    var isOpen = function () { return root.classList.contains("menu-open"); };
    menuBtn.addEventListener("click", function () { setMenu(!isOpen()); });
    rail.addEventListener("click", function (e) { if (isOpen() && e.target.closest("a[href]:not([download])")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      if (e.key === "Escape") { setMenu(false); menuBtn.focus(); return; }
      if (e.key !== "Tab") return;
      // Foco preso entre o botão do menu e o último controle do painel.
      var items = rail.querySelectorAll("a[href], button"), last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === menuBtn) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); menuBtn.focus(); }
    });
    var onWide = function () { if (!narrow.matches && isOpen()) setMenu(false); };
    if (narrow.addEventListener) narrow.addEventListener("change", onWide);
  }

  /* ---------- Animação de entrada ---------- */
  // Cada bloco sobe 28 px com fade quando entra na janela; blocos que entram juntos saem escalonados.
  // Sem IntersectionObserver ou com "reduzir movimento", nada é escondido.
  if ("IntersectionObserver" in window && !still.matches && root.dataset.view !== "simple") {
    var blocks = document.querySelectorAll(".hero > *, .hero-cell, .sims, main > .section, .gate-hero, .gate-pick, .stage");
    var riser = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        riser.unobserve(e.target);
        e.target.style.setProperty("--d", (n++ * 0.08) + "s");
        e.target.classList.remove("rise-wait");
        e.target.classList.add("rise");
      });
    });
    Array.prototype.forEach.call(blocks, function (el) { el.classList.add("rise-wait"); riser.observe(el); });
  }

  /* ---------- Visão: Simplificado (CV online) ou Temático ---------- */
  // O atributo <html data-view> é posto por um script no <head> (?view= > localStorage "view" > "themed").
  // No computador, o par de botões [data-view-set]; no celular, o interruptor "Site Simplificado" [data-view-toggle]
  // (role="switch": ligado no Simplificado). Aqui: os botões, a URL (history.replaceState, mantendo ?lang= e o #), o armazenamento e o anúncio da troca.
  var VIEW_NAMES = { simple: { "pt-BR": "Simplificado", en: "Simple", fr: "Simplifié" }, themed: { "pt-BR": "Temático", en: "Themed", fr: "Thématique" } };
  var VIEW_WORD = { "pt-BR": "Visualização", en: "View", fr: "Affichage" }; // anúncio da troca (#view-status)
  var viewButtons = Array.prototype.slice.call(document.querySelectorAll("[data-view-set]"));
  var viewToggles = Array.prototype.slice.call(document.querySelectorAll("[data-view-toggle]"));
  var viewStatus = document.getElementById("view-status");
  function currentView() { return root.dataset.view === "simple" ? "simple" : "themed"; }
  function syncView(announce) {
    var v = currentView(), l = VALID.indexOf(root.lang) >= 0 ? root.lang : "pt-BR";
    viewButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view-set") === v)); });
    viewToggles.forEach(function (b) { b.setAttribute("aria-checked", String(v === "simple")); });
    if (announce && viewStatus) viewStatus.textContent = VIEW_WORD[l] + ": " + VIEW_NAMES[v][l];
  }
  // Ordem do CV: no Simplificado, cada [data-simple-before="id"] vai para antes do elemento com esse id
  // (em Aero, Competências antes de Experiência); no Temático volta ao lugar, marcado por um comentário.
  var movers = Array.prototype.map.call(document.querySelectorAll("[data-simple-before]"), function (el) {
    var home = document.createComment("lugar no Temático");
    el.parentNode.insertBefore(home, el);
    return { el: el, home: home };
  });
  function orderForView(keepSamples) {
    var simple = currentView() === "simple";
    movers.forEach(function (m) {
      var to = simple ? document.getElementById(m.el.getAttribute("data-simple-before")) : m.home.nextSibling;
      var parent = simple ? to && to.parentNode : m.home.parentNode;
      if (parent && to !== m.el) parent.insertBefore(m.el, to);
    });
    // Trechos de código de exemplo (<details class="sample">): fechados por padrão nas duas visões; ao trocar de visão, voltam a fechar.
    if (!keepSamples) Array.prototype.forEach.call(document.querySelectorAll("details.sample"), function (d) { d.open = false; });
  }
  orderForView();
  // target (opcional): elemento que deve ficar visível depois da troca; sem ele, fica a seção atual.
  function setView(v, target) {
    if (v !== "simple" && v !== "themed") return;
    // Guarda a seção em que o leitor está, para mantê-la visível depois que o layout mudar.
    var keep = target || (window.scrollY > 0 && sections && sections[current] ? sections[current] : null);
    root.dataset.view = v;
    orderForView();
    if (darkOnly) root.dataset.theme = v === "simple" ? preferredTheme() : "dark";
    syncTheme(); // as cores mudam com a visão: quem desenha em canvas relê os tokens
    try { window.localStorage.setItem("view", v); } catch (e) { /* sem persistência */ }
    try {
      var p = new URLSearchParams(window.location.search);
      p.set("view", v);
      window.history.replaceState(null, "", window.location.pathname + "?" + p.toString() + (target && target.id ? "#" + target.id : window.location.hash));
    } catch (e) { /* file:// em alguns navegadores */ }
    if (v === "simple") Array.prototype.forEach.call(document.querySelectorAll(".rise-wait"), function (el) { el.classList.remove("rise-wait"); });
    updateFaceLinks(root.lang);
    syncView(true);
    if (typeof setMenu === "function" && root.classList.contains("menu-open")) {
      // O interruptor também fica dentro do painel: ao fechá-lo, o foco volta para o botão do menu (senão se perde).
      var hadFocus = rail.contains(document.activeElement);
      setMenu(false);
      if (hadFocus) menuBtn.focus();
    }
    if (keep) window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { keep.scrollIntoView({ block: "start", behavior: "instant" }); }); });
    document.dispatchEvent(new CustomEvent("siteviewchange", { detail: { view: v } }));
  }
  viewButtons.forEach(function (b) { b.addEventListener("click", function () { setView(b.getAttribute("data-view-set")); }); });
  viewToggles.forEach(function (b) { b.addEventListener("click", function () { setView(currentView() === "simple" ? "themed" : "simple"); }); });
  // Links "Ver simulação no modo Temático": trocam a visão sem recarregar e levam até a âncora do próprio link.
  Array.prototype.forEach.call(document.querySelectorAll("a[data-view-go]"), function (a) {
    a.addEventListener("click", function (e) {
      var to = document.getElementById((a.getAttribute("href").split("#")[1] || ""));
      if (!to) return;
      e.preventDefault();
      setView(a.getAttribute("data-view-go"), to);
    });
  });
  document.addEventListener("sitelangchange", function () { syncView(false); });
  // O estado dos controles segue <html data-view> por qualquer caminho: página devolvida pelo voltar/avançar e trocas feitas fora de setView.
  window.addEventListener("pageshow", function () { syncView(false); });
  if ((viewButtons.length || viewToggles.length) && "MutationObserver" in window) new MutationObserver(function () { syncView(false); }).observe(root, { attributes: true, attributeFilter: ["data-view"] });

  /* ---------- Impressão: sempre o layout do Simplificado ---------- */
  // A folha usa a camada [data-view="simple"] qualquer que seja a visão na tela: antes de imprimir, a página passa
  // para o Simplificado (com a ordem de seções do CV) e, depois, volta ao que estava. Nada é gravado nem muda na URL.
  // A Home não tem Simplificado e fica de fora. Sem JavaScript, vale o @media print de cada visão.
  if (viewButtons.length || viewToggles.length) {
    var printBack = null;
    var printOn = function () {
      if (printBack || currentView() === "simple") return;
      printBack = { y: window.scrollY };
      root.dataset.view = "simple";
      orderForView(true);
      Array.prototype.forEach.call(document.querySelectorAll(".rise-wait"), function (el) { el.classList.remove("rise-wait"); });
    };
    var printOff = function () {
      if (!printBack) return;
      root.dataset.view = "themed";
      orderForView(true);
      window.scrollTo(0, printBack.y);
      printBack = null;
    };
    window.addEventListener("beforeprint", printOn);
    window.addEventListener("afterprint", printOff);
  }
  // Chegou com ?view= na URL: guarda a escolha para as próximas páginas.
  // (A Home não tem seletor e é sempre Temático: lá o parâmetro é ignorado e a escolha gravada não muda.)
  if (viewButtons.length || viewToggles.length) {
    try { var qv = new URLSearchParams(window.location.search).get("view"); if (qv === "simple" || qv === "themed") window.localStorage.setItem("view", qv); } catch (e) { /* sem persistência */ }
  }

  /* ---------- Idioma inicial: ?lang=, depois localStorage, depois PT ---------- */
  var requested = new URLSearchParams(window.location.search).get("lang");
  if (VALID.indexOf(requested) >= 0) setLang(requested, true);
  else setLang(readStored() || "pt-BR", false);
})();
