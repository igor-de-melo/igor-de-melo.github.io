(function () {
  "use strict";
  var root = document.documentElement;

  var canvasLabels = {
    "pt-BR": "Simulação: partículas escoando em torno de um aerofólio",
    "en": "Simulation: particles flowing around an airfoil",
    "fr": "Simulation : particules s’écoulant autour d’un profil"
  };
  function applyLang(l) {
    document.getElementById("flow").setAttribute("aria-label", canvasLabels[l]);
    updateReadout();
  }
  document.addEventListener("sitelangchange", function (e) { applyLang(e.detail.lang); });

  /* ---------- Escoamento potencial: aerofólio de Joukowski ----------
     Plano ζ: cilindro de centro μ e raio R passando por ζ = 1.
     z = ζ + 1/ζ.  w(ζ) = U[(ζ-μ)e^{-iα} + R² e^{iα}/(ζ-μ)] + iΓ/(2π) ln(ζ-μ)
     Kutta: Γ = 4πUR sin(α+β).  Vista em referencial do túnel (aerofólio girado de α). */
  var MU_X = -0.09, MU_Y = 0.07, U = 1;
  var R = Math.hypot(1 - MU_X, MU_Y);
  var BETA = Math.atan2(MU_Y, 1 - MU_X);
  var alpha = 0, ca = 1, sa = 0, gamma = 0;

  var foil = [], chord = 4;
  (function buildFoil() {
    var minX = Infinity, maxX = -Infinity, n = 240;
    for (var i = 0; i < n; i++) {
      var th = (i / n) * 2 * Math.PI;
      var zx = MU_X + R * Math.cos(th), zy = MU_Y + R * Math.sin(th);
      var m = zx * zx + zy * zy;
      var X = zx + zx / m, Y = zy - zy / m;
      foil.push([X, Y]);
      if (X < minX) minX = X;
      if (X > maxX) maxX = X;
    }
    chord = maxX - minX;
  })();

  function setAlpha(deg) {
    alpha = (deg * Math.PI) / 180;
    ca = Math.cos(alpha); sa = Math.sin(alpha);
    gamma = 4 * Math.PI * U * R * Math.sin(alpha + BETA);
  }

  // Velocidade no referencial do túnel. Retorna false dentro do aerofólio.
  function vel(x, y, out) {
    var bx = x * ca - y * sa, by = x * sa + y * ca;
    var a = bx * bx - by * by - 4, b = 2 * bx * by, r = Math.hypot(a, b);
    var sr = Math.sqrt(Math.max(0, (r + a) / 2));
    var si = Math.sqrt(Math.max(0, (r - a) / 2));
    if (b < 0) si = -si;
    var z1x = (bx + sr) / 2, z1y = (by + si) / 2, z2x = (bx - sr) / 2, z2y = (by - si) / 2;
    var d1 = Math.hypot(z1x - MU_X, z1y - MU_Y), d2 = Math.hypot(z2x - MU_X, z2y - MU_Y);
    var zx, zy, dd;
    if (d1 >= d2) { zx = z1x; zy = z1y; dd = d1; } else { zx = z2x; zy = z2y; dd = d2; }
    if (dd < R * 1.0005) return false;
    var dx = zx - MU_X, dy = zy - MU_Y, dm2 = dx * dx + dy * dy;
    var wx = U * ca, wy = -U * sa;
    var d2x = dx * dx - dy * dy, d2y = -2 * dx * dy, k = (U * R * R) / (dm2 * dm2);
    wx -= k * (ca * d2x - sa * d2y);
    wy -= k * (ca * d2y + sa * d2x);
    var g = gamma / (2 * Math.PI * dm2);
    wx += g * dy; wy += g * dx;
    var zm2 = zx * zx + zy * zy, zi4 = 1 / (zm2 * zm2);
    var jx = 1 - (zx * zx - zy * zy) * zi4, jy = 2 * zx * zy * zi4, jm2 = jx * jx + jy * jy;
    if (jm2 < 1e-7) return false;
    var ub = (wx * jx + wy * jy) / jm2, vb = -((wy * jx - wx * jy) / jm2);
    var sp2 = ub * ub + vb * vb;
    if (sp2 > 9) { var s = 3 / Math.sqrt(sp2); ub *= s; vb *= s; sp2 = 9; }
    out[0] = ub * ca + vb * sa;
    out[1] = -ub * sa + vb * ca;
    out[2] = sp2;
    return true;
  }

  /* ---------- Leitura (ângulo e C_L) ---------- */
  var aoa = document.getElementById("aoa");
  var aoaOut = document.getElementById("aoa-out");
  var clOut = document.getElementById("cl-out");
  function fmt(v, d) {
    return new Intl.NumberFormat(root.lang, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  }
  function updateReadout() {
    var deg = parseFloat(aoa.value);
    var cl = (8 * Math.PI * R * Math.sin((deg * Math.PI) / 180 + BETA)) / chord;
    aoaOut.textContent = fmt(deg, 1) + "°";
    clOut.textContent = fmt(cl, 2);
    aoa.setAttribute("aria-valuetext", fmt(deg, 1) + "°, CL " + fmt(cl, 2));
  }

  /* ---------- Canvas ---------- */
  var canvas = document.getElementById("flow");
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, S = 1, CX = 0, CY = 0, XMIN = -4, XMAX = 4, YMIN = -2, YMAX = 2;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var foilColor = "#16233A";
  function readFoil() { foilColor = getComputedStyle(canvas).getPropertyValue("--ink").trim() || "#16233A"; }
  readFoil();
  document.addEventListener("sitethemechange", function () { readFoil(); if (reduce.matches) drawStatic(); });

  // Paleta Cp: sucção (azul) -> escoamento livre (ardósia) -> estagnação (vermelho)
  var BUCKETS = 48, CP_MIN = -1.2, CP_MAX = 0.7;
  var colors = [];
  (function buildColors() {
    var suc = [47, 69, 181], fre = [135, 146, 162], sta = [176, 35, 47];
    var zero = (0 - CP_MIN) / (CP_MAX - CP_MIN);
    for (var i = 0; i < BUCKETS; i++) {
      var t = i / (BUCKETS - 1), c;
      if (t < zero) { var u = t / zero; c = suc.map(function (v, j) { return Math.round(v + (fre[j] - v) * u); }); }
      else { var q = (t - zero) / (1 - zero); c = fre.map(function (v, j) { return Math.round(v + (sta[j] - v) * q); }); }
      colors.push("rgb(" + c.join(",") + ")");
    }
  })();
  function bucketOf(sp2) {
    var cp = 1 - sp2 / (U * U);
    var t = (cp - CP_MIN) / (CP_MAX - CP_MIN);
    return Math.max(0, Math.min(BUCKETS - 1, Math.round(t * (BUCKETS - 1))));
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var wide = W > 700;
    S = Math.min((wide ? 0.42 : 0.72) * W / chord, H / 2.9);
    CX = W * (wide ? 0.56 : 0.5); CY = H * 0.5;
    XMIN = -CX / S - 0.2; XMAX = (W - CX) / S + 0.2;
    YMIN = -(H - CY) / S; YMAX = CY / S;
    initParticles();
    if (reduce.matches) drawStatic();
  }

  function drawFoil() {
    ctx.beginPath();
    for (var i = 0; i < foil.length; i++) {
      var X = foil[i][0] * ca + foil[i][1] * sa, Y = -foil[i][0] * sa + foil[i][1] * ca;
      var px = CX + X * S, py = CY - Y * S;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = foilColor;
    ctx.fill();
  }

  /* Partículas com rastro */
  var TRAIL = 16, particles = [], tmp = [0, 0, 0], tmp2 = [0, 0, 0];
  function spawn(p, anywhere) {
    for (var tries = 0; tries < 20; tries++) {
      p.x = anywhere ? XMIN + Math.random() * (XMAX - XMIN) : XMIN + Math.random() * 0.3;
      p.y = YMIN + Math.random() * (YMAX - YMIN);
      if (vel(p.x, p.y, tmp)) break;
    }
    p.n = 0;
    p.age = 0;
    p.life = 4 + Math.random() * 6;
    p.b = bucketOf(tmp[2]);
  }
  function initParticles() {
    var count = Math.max(160, Math.min(720, Math.round((W * H) / 1500)));
    particles = [];
    for (var i = 0; i < count; i++) {
      var p = { tx: new Float32Array(TRAIL), ty: new Float32Array(TRAIL) };
      spawn(p, true);
      particles.push(p);
    }
  }

  function advance(dt) {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (!vel(p.x, p.y, tmp)) { spawn(p, false); continue; }
      var mx = p.x + tmp[0] * dt * 0.5, my = p.y + tmp[1] * dt * 0.5;
      if (!vel(mx, my, tmp2)) { spawn(p, false); continue; }
      p.x += tmp2[0] * dt; p.y += tmp2[1] * dt;
      p.age += dt;
      p.b = bucketOf(tmp2[2]);
      if (p.n < TRAIL) { p.tx[p.n] = p.x; p.ty[p.n] = p.y; p.n++; }
      else { p.tx.copyWithin(0, 1); p.ty.copyWithin(0, 1); p.tx[TRAIL - 1] = p.x; p.ty[TRAIL - 1] = p.y; }
      if (p.x > XMAX || p.y < YMIN - 0.5 || p.y > YMAX + 0.5 || p.age > p.life) spawn(p, p.age > p.life);
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.85;
    for (var b = 0; b < BUCKETS; b++) {
      var started = false;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.b !== b || p.n < 2) continue;
        if (!started) { ctx.beginPath(); started = true; }
        ctx.moveTo(CX + p.tx[0] * S, CY - p.ty[0] * S);
        for (var k = 1; k < p.n; k++) ctx.lineTo(CX + p.tx[k] * S, CY - p.ty[k] * S);
      }
      if (started) { ctx.strokeStyle = colors[b]; ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    drawFoil();
  }

  /* Versão estática (movimento reduzido): linhas de corrente integradas */
  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.3;
    ctx.lineCap = "round";
    var paths = [];
    for (var b = 0; b < BUCKETS; b++) paths.push([]);
    var seeds = 44;
    for (var s = 0; s < seeds; s++) {
      var x = XMIN, y = YMIN + ((s + 0.5) / seeds) * (YMAX - YMIN);
      for (var step = 0; step < 2400 && x < XMAX; step++) {
        if (!vel(x, y, tmp)) break;
        var sp = Math.sqrt(tmp[2]) || 1, h = 0.02 / sp;
        var nx = x + tmp[0] * h, ny = y + tmp[1] * h;
        paths[bucketOf(tmp[2])].push(x, y, nx, ny);
        x = nx; y = ny;
      }
    }
    for (var c = 0; c < BUCKETS; c++) {
      var seg = paths[c];
      if (!seg.length) continue;
      ctx.beginPath();
      for (var i = 0; i < seg.length; i += 4) {
        ctx.moveTo(CX + seg[i] * S, CY - seg[i + 1] * S);
        ctx.lineTo(CX + seg[i + 2] * S, CY - seg[i + 3] * S);
      }
      ctx.strokeStyle = colors[c];
      ctx.stroke();
    }
    drawFoil();
  }

  /* Laço de animação: só roda quando a figura está visível */
  var visible = true, rafId = 0, last = 0;
  function frame(t) {
    rafId = 0;
    if (!visible || document.hidden || reduce.matches) return;
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
    last = t;
    advance(dt * 1.5);
    drawParticles();
    rafId = requestAnimationFrame(frame);
  }
  function start() { if (!rafId && !reduce.matches) { last = 0; rafId = requestAnimationFrame(frame); } }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
  reduce.addEventListener && reduce.addEventListener("change", function () { if (reduce.matches) drawStatic(); else start(); });

  aoa.addEventListener("input", function () {
    setAlpha(parseFloat(aoa.value));
    updateReadout();
    if (reduce.matches) drawStatic();
  });

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas.parentElement);
  else window.addEventListener("resize", resize);

  setAlpha(parseFloat(aoa.value));
  applyLang(root.lang);
  resize();
  start();
})();
