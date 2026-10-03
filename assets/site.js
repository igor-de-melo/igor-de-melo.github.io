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

  /* ---------- Tema claro/escuro ---------- */
  // Padrão: segue o sistema. O botão grava a escolha (localStorage "theme"); um script no <head> a aplica antes da pintura.
  // Quem desenha em canvas escuta o evento "sitethemechange" e relê as cores.
  var themeBtn = document.querySelector(".theme-toggle");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() {
    var t = root.dataset.theme;
    return t ? t === "dark" : darkQuery.matches;
  }
  function syncTheme() {
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(isDark()));
    document.dispatchEvent(new CustomEvent("sitethemechange", { detail: { dark: isDark() } }));
  }
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { window.localStorage.setItem("theme", next); } catch (e) { /* sem persistência */ }
    syncTheme();
  });
  if (darkQuery.addEventListener) darkQuery.addEventListener("change", function () { if (!root.dataset.theme) syncTheme(); });
  if (themeBtn) themeBtn.setAttribute("aria-pressed", String(isDark()));

  /* ---------- Menu de seções no celular ---------- */
  var navToggle = document.querySelector(".nav-toggle"), nav = document.getElementById("secoes");
  if (navToggle && nav) {
    var closeNav = function () { nav.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false"); };
    navToggle.addEventListener("click", function () {
      var open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { closeNav(); navToggle.focus(); } });
  }

  /* ---------- Idioma inicial: ?lang=, depois localStorage, depois PT ---------- */
  var requested = new URLSearchParams(window.location.search).get("lang");
  if (VALID.indexOf(requested) >= 0) setLang(requested, true);
  else setLang(readStored() || "pt-BR", false);
})();
