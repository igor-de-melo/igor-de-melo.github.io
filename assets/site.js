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
    return { el: a, base: a.getAttribute("href").split("?")[0] };
  });

  function setLang(l, persist) {
    root.lang = l;
    langButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === l)); });
    var title = root.getAttribute("data-title-" + l.toLowerCase());
    if (title) document.title = title;
    var desc = root.getAttribute("data-desc-" + l.toLowerCase()), meta = document.querySelector('meta[name="description"]');
    if (desc && meta) meta.setAttribute("content", desc);
    faceLinks.forEach(function (f) { f.el.setAttribute("href", f.base + "?lang=" + l); });
    // Dicas (title) dos botões só de ícone: atributos data-title-* no próprio botão.
    document.querySelectorAll("button[data-title-" + l.toLowerCase() + "]").forEach(function (b) { b.title = b.getAttribute("data-title-" + l.toLowerCase()); });
    document.querySelectorAll("[data-aria-" + l.toLowerCase() + "]").forEach(function (e) { e.setAttribute("aria-label", e.getAttribute("data-aria-" + l.toLowerCase())); });
    document.querySelectorAll("img[data-alt-" + l.toLowerCase() + "]").forEach(function (i) { i.alt = i.getAttribute("data-alt-" + l.toLowerCase()); });
    if (persist) store(l);
    document.dispatchEvent(new CustomEvent("sitelangchange", { detail: { lang: l } }));
  }
  langButtons.forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang, true); }); });

  /* ---------- Tema claro/escuro ---------- */
  // O tema ativo fica sempre em <html data-theme>: um script no <head> aplica a escolha gravada (localStorage "theme")
  // ou, sem escolha, o tema do sistema. TI e Cibersegurança é só escuro e não tem botão.
  // Quem desenha em canvas escuta o evento "sitethemechange" e relê as cores.
  var themeBtn = document.querySelector(".theme-toggle");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() { return root.dataset.theme === "dark"; }
  function storedTheme() {
    try { var t = window.localStorage.getItem("theme"); return t === "dark" || t === "light" ? t : null; }
    catch (e) { return null; }
  }
  function syncTheme() {
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(isDark()));
    document.dispatchEvent(new CustomEvent("sitethemechange", { detail: { dark: isDark() } }));
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      try { window.localStorage.setItem("theme", next); } catch (e) { /* sem persistência */ }
      syncTheme();
    });
    if (darkQuery.addEventListener) darkQuery.addEventListener("change", function () {
      if (storedTheme()) return;
      root.dataset.theme = darkQuery.matches ? "dark" : "light";
      syncTheme();
    });
    themeBtn.setAttribute("aria-pressed", String(isDark()));
  }

  /* ---------- Régua de seções (scroll-spy) ---------- */
  // A seção atual é a que cruza uma linha a 40% da altura da janela. O item atual recebe aria-current e
  // a régua recebe --ry / --rt / --rh (posição do marcador), usados pelas variantes de cada área no CSS.
  var rulerLinks = Array.prototype.slice.call(document.querySelectorAll(".ruler a[href^='#']"));
  var sections = rulerLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  var track = document.querySelector(".ruler-track");
  var nowTitle = document.querySelector(".now-title"), progress = document.querySelector(".now-progress");
  var ticks = [], current = -1, lineIndex = 0;
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
    if (nowTitle && h) nowTitle.innerHTML = h.innerHTML;
    if (progress) {
      progress.style.setProperty("--pf", String(ticks.length > 1 ? i / (ticks.length - 1) : 0));
      ticks.forEach(function (t, k) { t.className = k === i ? "cur" : k < i ? "done" : ""; });
    }
  }
  if (rulerLinks.length && sections.every(Boolean)) {
    if (progress) rulerLinks.forEach(function (a, k) {
      var t = document.createElement("i");
      t.style.left = (rulerLinks.length > 1 ? (100 * k) / (rulerLinks.length - 1) : 0) + "%";
      progress.appendChild(t);
      ticks.push(t);
    });
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
      document.body.appendChild(end);
      new IntersectionObserver(function (entries) {
        atEnd = entries[0].isIntersecting;
        if (!locked) setCurrent(atEnd ? sections.length - 1 : lineIndex);
      }).observe(end);
    }
    window.addEventListener("resize", placeMark);
    document.addEventListener("sitelangchange", placeMark);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeMark);
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
    rail.addEventListener("click", function (e) { if (isOpen() && e.target.closest("a[href^='#']")) setMenu(false); });
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
  if ("IntersectionObserver" in window && !still.matches) {
    var blocks = document.querySelectorAll(".hero > *, .hero-cell, .sims, main > .section, .gate-hero, .gate-pick, .gate-card");
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

  /* ---------- Idioma inicial: ?lang=, depois localStorage, depois PT ---------- */
  var requested = new URLSearchParams(window.location.search).get("lang");
  if (VALID.indexOf(requested) >= 0) setLang(requested, true);
  else setLang(readStored() || "pt-BR", false);
})();
