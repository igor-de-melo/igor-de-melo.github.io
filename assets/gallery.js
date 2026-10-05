/* Galeria dos projetos e imagem ampliada.
   Marcação:
   <figure class="gallery" data-gallery>
     <button class="gallery-main"><img ...></button>
     <div class="gallery-thumbs"><button class="gallery-thumb" aria-pressed data-src data-w data-h>...</button> ...</div>
     <figcaption> ... <span class="gallery-i">1</span> ... </figcaption>   (uma vez por idioma)
   </figure>
   Clicar numa miniatura troca a imagem principal; clicar na principal abre o <dialog class="lightbox">.
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
        img.src = t.getAttribute("data-src");
        img.width = t.getAttribute("data-w");
        img.height = t.getAttribute("data-h");
        thumbs.forEach(function (o) { o.setAttribute("aria-pressed", String(o === t)); });
        Array.prototype.forEach.call(fig.querySelectorAll(".gallery-i"), function (n) { n.textContent = i + 1; });
      });
    });
    if (!box || typeof box.showModal !== "function") return;
    main.addEventListener("click", function () {
      boxImg.src = img.getAttribute("src");
      boxImg.width = img.width;
      boxImg.height = img.height;
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
