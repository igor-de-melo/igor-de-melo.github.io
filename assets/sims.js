/* Seletor de simulações. Cada página pode ter várias simulações, mas só uma aparece por vez.
   Marcação:
   <div class="sims" data-sims>
     <figure class="tunnel sim-panel" data-sim="id"
             data-label-pt-br="..." data-label-en="..." data-label-fr="..."> ... </figure>
     (mais painéis)
   </div>
   Com um painel só, nada muda. Com dois ou mais, cria uma barra de abas acima e mostra o primeiro.
   Cada simulação já pausa sozinha quando sai da tela (IntersectionObserver) e se redimensiona
   (ResizeObserver), então esconder um painel basta para pausá-lo. */
(function () {
  "use strict";
  var LANGS = [["pt-BR", "labelPtBr"], ["en", "labelEn"], ["fr", "labelFr"]];
  document.querySelectorAll("[data-sims]").forEach(function (group, g) {
    var panels = Array.prototype.slice.call(group.querySelectorAll(":scope > .sim-panel"));
    if (panels.length < 2) return;
    var bar = document.createElement("div");
    bar.className = "sim-tabs";
    var strip = document.createElement("div");
    strip.className = "sim-tablist";
    strip.setAttribute("role", "tablist");
    strip.setAttribute("aria-label", "Simulações / Simulations / Simulations");
    var tabs = panels.map(function (panel, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sim-tab";
      b.setAttribute("role", "tab");
      b.id = "sim-tab-" + g + "-" + i;
      if (!panel.id) panel.id = "sim-panel-" + g + "-" + i;
      b.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", b.id);
      LANGS.forEach(function (l) {
        var s = document.createElement("span");
        s.lang = l[0];
        s.textContent = panel.dataset[l[1]] || panel.dataset.sim;
        b.appendChild(s);
      });
      b.addEventListener("click", function () { show(i, false); });
      b.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { e.preventDefault(); show((i + k + panels.length) % panels.length, true); }
      });
      strip.appendChild(b);
      return b;
    });
    bar.appendChild(strip);
    // Contador "1 de 3" com setas (anterior / próxima).
    var OF = { "pt-BR": " de ", en: " of ", fr: " sur " };
    var STEP = [[-1, "Simulação anterior", "Previous simulation", "Simulation précédente", "M15 5l-7 7 7 7"], [1, "Próxima simulação", "Next simulation", "Simulation suivante", "M9 5l7 7-7 7"]];
    var nav = document.createElement("div"), count = document.createElement("span"), current = 0;
    nav.className = "sim-nav";
    count.className = "sim-count";
    LANGS.forEach(function (l) { var s = document.createElement("span"); s.lang = l[0]; count.appendChild(s); });
    nav.appendChild(count);
    STEP.forEach(function (st) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sim-step";
      b.title = st[1];
      b.setAttribute("data-title-pt-br", st[1]); b.setAttribute("data-title-en", st[2]); b.setAttribute("data-title-fr", st[3]);
      b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + st[4] + '"/></svg>';
      var sr = document.createElement("span");
      sr.className = "sr";
      [st[1], st[2], st[3]].forEach(function (t, k) { var s = document.createElement("span"); s.lang = LANGS[k][0]; s.textContent = t; sr.appendChild(s); });
      b.appendChild(sr);
      b.addEventListener("click", function () { show((current + st[0] + panels.length) % panels.length, false); });
      nav.appendChild(b);
    });
    bar.appendChild(nav);
    document.addEventListener("sitelangchange", function (e) {
      Array.prototype.forEach.call(nav.querySelectorAll(".sim-step"), function (b) { b.title = b.getAttribute("data-title-" + e.detail.lang.toLowerCase()) || b.title; });
    });
    group.insertBefore(bar, group.firstChild);
    function show(n, focus) {
      current = n;
      Array.prototype.forEach.call(count.children, function (s) { s.textContent = (n + 1) + OF[s.lang] + panels.length; });
      panels.forEach(function (p, i) {
        var on = i === n;
        p.hidden = !on;
        tabs[i].setAttribute("aria-selected", on ? "true" : "false");
        tabs[i].tabIndex = on ? 0 : -1;
      });
      if (focus) tabs[n].focus();
      group.dispatchEvent(new CustomEvent("simchange", { detail: { sim: panels[n].dataset.sim } }));
    }
    show(0, false);
  });
})();
