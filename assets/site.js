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
    if (persist) store(l);
    document.dispatchEvent(new CustomEvent("sitelangchange", { detail: { lang: l } }));
  }
  langButtons.forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang, true); }); });

  /* ---------- Cabeçalho ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Idioma inicial: ?lang=, depois localStorage, depois PT ---------- */
  var requested = new URLSearchParams(window.location.search).get("lang");
  if (VALID.indexOf(requested) >= 0) setLang(requested, true);
  else setLang(readStored() || "pt-BR", false);
})();
