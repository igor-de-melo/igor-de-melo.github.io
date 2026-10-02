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
    bar.setAttribute("role", "tablist");
    bar.setAttribute("aria-label", "Simulações / Simulations / Simulations");
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
      bar.appendChild(b);
      return b;
    });
    group.insertBefore(bar, group.firstChild);
    function show(n, focus) {
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
