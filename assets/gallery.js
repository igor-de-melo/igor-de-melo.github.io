/* Galeria dos projetos e imagem ampliada.
   Marcação:
   <figure class="gallery" data-gallery>
     <button class="gallery-main"><img ...></button>
     <div class="gallery-thumbs"><button class="gallery-thumb" aria-pressed data-src data-w data-h [data-cap-pt-br/-en/-fr]>...</button> ...</div>
     <figcaption> ... <span class="gallery-i">1</span> ... </figcaption>   (uma vez por idioma)
   </figure>
   Clicar numa miniatura troca a imagem principal; clicar na principal abre o <dialog class="lightbox">.
   Quando a principal está escondida (grade de miniaturas do Simplificado), a miniatura já abre a imagem ampliada.
   A ampliada mostra sempre a figura escolhida na maior variante (o data-src da miniatura, sem sufixo) e nunca leva
   srcset/sizes: com eles o navegador ignoraria o src trocado aqui.
   O <dialog> nativo prende o foco, fecha com Esc e devolve o foco ao botão que o abriu. */
(function () {
  "use strict";
  var box = document.querySelector("dialog.lightbox");
  var boxImg = box && box.querySelector("img"), boxCap = box && box.querySelector(".lightbox-cap");

  Array.prototype.forEach.call(document.querySelectorAll("[data-gallery]"), function (fig) {
    var main = fig.querySelector(".gallery-main"), img = main && main.querySelector("img");
    var thumbs = Array.prototype.slice.call(fig.querySelectorAll(".gallery-thumb"));
    var cap = fig.querySelector("figcaption");
    if (!img || !thumbs.length) return;
    thumbs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        // Variantes responsivas: a principal troca o srcset junto com o src; a imagem ampliada usa sempre o src (a maior).
        if (t.getAttribute("data-srcset")) img.srcset = t.getAttribute("data-srcset"); else img.removeAttribute("srcset");
        img.src = t.getAttribute("data-src");
        img.width = t.getAttribute("data-w");
        img.height = t.getAttribute("data-h");
        var from = t.querySelector("img");
        if (from) Array.prototype.forEach.call(from.attributes, function (at) { if (at.name === "alt" || at.name.indexOf("data-alt-") === 0) img.setAttribute(at.name, at.value); });
        thumbs.forEach(function (o) { o.setAttribute("aria-pressed", String(o === t)); });
        Array.prototype.forEach.call(fig.querySelectorAll(".gallery-i"), function (n) { n.textContent = i + 1; });
        // Legenda por imagem: data-cap-pt-br / -en / -fr no botão da miniatura preenchem o .gallery-c de cada língua.
        Array.prototype.forEach.call(fig.querySelectorAll("figcaption > [lang]"), function (sp) {
          var cap = t.getAttribute("data-cap-" + sp.lang.toLowerCase()), box = sp.querySelector(".gallery-c");
          if (cap && box) box.textContent = cap;
        });
        if (open && !main.offsetParent) open();
      });
    });
    var open = null;
    if (!box || typeof box.showModal !== "function") return;
    main.addEventListener("click", open = function () {
      var cur = thumbs.filter(function (t) { return t.getAttribute("aria-pressed") === "true"; })[0] || thumbs[0];
      boxImg.removeAttribute("srcset");
      boxImg.removeAttribute("sizes");
      boxImg.removeAttribute("loading");
      boxImg.src = cur.getAttribute("data-src");
      boxImg.alt = img.alt;
      boxImg.setAttribute("width", cur.getAttribute("data-w"));
      boxImg.setAttribute("height", cur.getAttribute("data-h"));
      if (boxCap && cap) {
        boxCap.textContent = "";
        Array.prototype.forEach.call(cap.childNodes, function (n) { boxCap.appendChild(n.cloneNode(true)); });
      }
      box.showModal();
    });
  });

  if (box) {
    box.querySelector(".lightbox-close").addEventListener("click", function () { box.close(); });
    // Clique fora da imagem (no fundo escurecido) também fecha.
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  }
})();
