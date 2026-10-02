/* Abertura da face TI e Dados: Q-learning tabular rodando no navegador.
   O núcleo (RL) não toca no DOM e é testado em Node: tests/check-maze.mjs. */
var RL = (function () {
  "use strict";
  // '.' livre, '#' parede, 'X' armadilha, 'S' início, 'G' meta
  var MAZE = [
    "................",
    ".......XXXX.....",
    ".......XXXX.....",
    "...#...XXXX...#.",
    "S..#...XXXX...#G",
    "...#...XXXX...#.",
    ".......XXXX.....",
    ".......XXXX.....",
    "................"
  ];
  var ROWS = MAZE.length, COLS = MAZE[0].length;
  var ACTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // cima, direita, baixo, esquerda
  var P = { alpha: 0.5, gamma: 0.96, step: -0.04, pit: -1, goal: 1, epsStart: 0.35, epsMin: 0.04, epsDecay: 0.985, maxSteps: 250 };

  function cell(x, y) { return MAZE[y].charAt(x); }
  function find(ch) {
    for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) if (cell(x, y) === ch) return [x, y];
    return null;
  }
  function stepEnv(x, y, a) {
    var nx = x + ACTIONS[a][0], ny = y + ACTIONS[a][1];
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || cell(nx, ny) === "#") { nx = x; ny = y; }
    var c = cell(nx, ny);
    if (c === "X") return { x: nx, y: ny, r: P.pit, done: true, kind: "pit" };
    if (c === "G") return { x: nx, y: ny, r: P.goal, done: true, kind: "goal" };
    return { x: nx, y: ny, r: P.step, done: false, kind: "move" };
  }
  function newQ() { return new Float32Array(ROWS * COLS * 4); }
  function idx(x, y, a) { return (y * COLS + x) * 4 + a; }
  function best(q, x, y) {
    var b = 0, v = q[idx(x, y, 0)];
    for (var a = 1; a < 4; a++) { var w = q[idx(x, y, a)]; if (w > v + 1e-9) { v = w; b = a; } }
    return b;
  }
  function maxQ(q, x, y) { return q[idx(x, y, best(q, x, y))]; }
  function pick(q, x, y, eps, rnd) {
    if (rnd() < eps) return Math.floor(rnd() * 4);
    var v = maxQ(q, x, y), c = [];
    for (var a = 0; a < 4; a++) if (Math.abs(q[idx(x, y, a)] - v) < 1e-9) c.push(a);
    return c[Math.floor(rnd() * c.length)]; // desempate aleatório: sem viés para "cima" no início
  }
  function update(q, x, y, a, s) {
    var target = s.r + (s.done ? 0 : P.gamma * maxQ(q, s.x, s.y));
    var i = idx(x, y, a);
    q[i] += P.alpha * (target - q[i]);
  }
  // Segue a política gulosa a partir do início. ok = chegou à meta sem cair em armadilha.
  function greedyRun(q, limit) {
    var s = find("S"), x = s[0], y = s[1], path = [[x, y]], seen = {};
    for (var t = 0; t < (limit || 120); t++) {
      var a = best(q, x, y), r = stepEnv(x, y, a);
      x = r.x; y = r.y; path.push([x, y]);
      if (r.done) return { ok: r.kind === "goal", kind: r.kind, path: path };
      var k = x + "," + y;
      if ((seen[k] || 0) > 3) return { ok: false, kind: "loop", path: path };
      seen[k] = (seen[k] || 0) + 1;
    }
    return { ok: false, kind: "timeout", path: path };
  }
  // Menor caminho (passos), com ou sem permissão de atravessar armadilhas.
  function shortest(allowPits) {
    var s = find("S"), g = find("G"), dist = {}, queue = [[s[0], s[1]]];
    dist[s[0] + "," + s[1]] = 0;
    while (queue.length) {
      var p = queue.shift(), d = dist[p[0] + "," + p[1]];
      if (p[0] === g[0] && p[1] === g[1]) return d;
      for (var a = 0; a < 4; a++) {
        var nx = p[0] + ACTIONS[a][0], ny = p[1] + ACTIONS[a][1];
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
        var c = cell(nx, ny);
        if (c === "#" || (!allowPits && c === "X")) continue;
        var key = nx + "," + ny;
        if (dist[key] !== undefined) continue;
        dist[key] = d + 1; queue.push([nx, ny]);
      }
    }
    return -1;
  }
  function mulberry32(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var SAFE = shortest(false);
  // Um episódio completo de treino. Devolve { kind, steps }.
  function episode(q, eps, rnd) {
    var s0 = find("S"), x = s0[0], y = s0[1], kind = "timeout", n = 0;
    for (; n < P.maxSteps; n++) {
      var a = pick(q, x, y, eps, rnd), s = stepEnv(x, y, a);
      update(q, x, y, a, s); x = s.x; y = s.y;
      if (s.done) { kind = s.kind; n++; break; }
    }
    return { kind: kind, steps: n };
  }
  // Treino completo e determinístico (modo de movimento reduzido e testes).
  function train(seed, maxEpisodes) {
    var q = newQ(), rnd = mulberry32(seed), eps = P.epsStart, stable = 0, ep = 0;
    while (ep < (maxEpisodes || 1500)) {
      episode(q, eps, rnd); ep++;
      eps = Math.max(P.epsMin, eps * P.epsDecay);
      var g = greedyRun(q);
      stable = g.ok && g.path.length - 1 === SAFE ? stable + 1 : 0;
      if (stable >= 15) break;
    }
    return { q: q, episodes: ep, eps: eps };
  }
  return { MAZE: MAZE, ROWS: ROWS, COLS: COLS, ACTIONS: ACTIONS, P: P, SAFE: SAFE, cell: cell, find: find, stepEnv: stepEnv,
    newQ: newQ, idx: idx, best: best, maxQ: maxQ, pick: pick, update: update, greedyRun: greedyRun, shortest: shortest,
    episode: episode, train: train, mulberry32: mulberry32 };
})();

if (typeof module !== "undefined" && module.exports) module.exports = RL;

if (typeof document !== "undefined") (function () {
  "use strict";
  var canvas = document.getElementById("maze");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var labels = {
    "pt-BR": "Simulação: um agente aprende por tentativa e erro a atravessar um labirinto e a evitar as armadilhas",
    "en": "Simulation: an agent learns by trial and error to cross a maze and avoid the traps",
    "fr": "Simulation : un agent apprend par essais et erreurs à traverser un labyrinthe et à éviter les pièges"
  };
  var epOut = document.getElementById("rl-ep"), epsOut = document.getElementById("rl-eps"), lenOut = document.getElementById("rl-len");
  var stateEls = document.querySelectorAll("[data-state]");
  var whenEls = document.querySelectorAll("[data-when]");
  var pauseBtn = document.getElementById("rl-pause"), restartBtn = document.getElementById("rl-restart");

  function cssVar(name, fallback) {
    var v = getComputedStyle(canvas).getPropertyValue(name).trim();
    return v || fallback;
  }
  var C = {};
  function readColors() {
    C.ink = cssVar("--ink", "#16233A"); C.surface = cssVar("--surface", "#F5F7F9"); C.rule = cssVar("--rule", "#C5CDD6");
    C.blue = cssVar("--accent", "#2F45B5"); C.red = cssVar("--stagnation", "#B0232F");
  }
  readColors();

  function fmt(v, d) { return new Intl.NumberFormat(root.lang, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v); }

  /* ---------- Estado ---------- */
  var q, eps, episodes, agent, mode, stable, greedyLen, path, pathIdx, holdUntil, lastMove, paused = false, visible = true, raf = 0, rnd = Math.random;
  var start = RL.find("S");
  var staticPath = null;

  function resetAgent() { agent = { x: start[0], y: start[1], n: 0 }; }
  function restart() {
    q = RL.newQ(); eps = RL.P.epsStart; episodes = 0; stable = 0; greedyLen = null; mode = "train"; path = null; pathIdx = 0; staticPath = null;
    resetAgent();
    if (reduce.matches) { pretrain(); }
    setState(); readout(); draw();
    if (!reduce.matches) startLoop();
  }
  function pretrain() {
    var r = RL.train((Date.now() & 0xffff) + 1, 1500);
    q = r.q; eps = r.eps; episodes = r.episodes;
    var g = RL.greedyRun(q); greedyLen = g.ok ? g.path.length - 1 : null;
    staticPath = g.ok ? g.path : null; mode = "demo"; resetAgent();
  }
  function setState() {
    stateEls.forEach(function (e) { e.hidden = e.getAttribute("data-state") !== (mode === "demo" ? "learned" : "learning"); });
    whenEls.forEach(function (e) { e.hidden = e.getAttribute("data-when") !== (paused ? "paused" : "running"); });
  }
  function readout() {
    if (epOut) epOut.textContent = String(episodes);
    if (epsOut) epsOut.textContent = fmt(eps, 2);
    if (lenOut) lenOut.textContent = greedyLen === null ? "–" : String(greedyLen);
  }
  function stepsPerFrame() { return Math.min(400, 1 + Math.floor(0.05 * Math.pow(episodes + 1, 1.8))); }

  function trainStep() {
    var a = RL.pick(q, agent.x, agent.y, eps, rnd), s = RL.stepEnv(agent.x, agent.y, a);
    RL.update(q, agent.x, agent.y, a, s);
    agent.x = s.x; agent.y = s.y; agent.n++;
    if (s.done || agent.n >= RL.P.maxSteps) {
      episodes++;
      eps = Math.max(RL.P.epsMin, eps * RL.P.epsDecay);
      var g = RL.greedyRun(q);
      greedyLen = g.ok ? g.path.length - 1 : null;
      stable = g.ok && greedyLen === RL.SAFE ? stable + 1 : 0;
      resetAgent();
      if (stable >= 15 || episodes >= 900) { enterDemo(); return false; }
    }
    return true;
  }
  function enterDemo() {
    var g = RL.greedyRun(q);
    path = g.path; pathIdx = 0; holdUntil = 0; lastMove = 0; mode = "demo";
    greedyLen = g.ok ? g.path.length - 1 : null;
    resetAgent(); setState(); readout();
  }
  function demoStep(t) {
    if (holdUntil && t < holdUntil) return;
    if (holdUntil && t >= holdUntil) { holdUntil = 0; pathIdx = 0; }
    if (t - lastMove < 110) return;
    lastMove = t;
    if (pathIdx < path.length - 1) pathIdx++;
    else { holdUntil = t + 1100; }
    agent.x = path[pathIdx][0]; agent.y = path[pathIdx][1];
  }

  /* ---------- Desenho ---------- */
  var W = 0, H = 0, cs = 20, ox = 0, oy = 0;
  function resize() {
    var rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var pad = Math.max(10, Math.min(W, H) * 0.04);
    cs = Math.floor(Math.min((W - 2 * pad) / RL.COLS, (H - 2 * pad) / RL.ROWS));
    ox = Math.round((W - cs * RL.COLS) / 2); oy = Math.round((H - cs * RL.ROWS) / 2);
    draw();
  }
  function px(x) { return ox + x * cs; }
  function py(y) { return oy + y * cs; }
  function arrow(cx, cy, a) {
    var d = RL.ACTIONS[a], r = cs * 0.2, nx = -d[1], ny = d[0];
    ctx.beginPath();
    ctx.moveTo(cx + d[0] * r, cy + d[1] * r);
    ctx.lineTo(cx - d[0] * r * 0.7 + nx * r * 0.8, cy - d[1] * r * 0.7 + ny * r * 0.8);
    ctx.lineTo(cx - d[0] * r * 0.7 - nx * r * 0.8, cy - d[1] * r * 0.7 - ny * r * 0.8);
    ctx.closePath(); ctx.fill();
  }
  function draw() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    var x, y, c, v, i;
    for (y = 0; y < RL.ROWS; y++) for (x = 0; x < RL.COLS; x++) {
      c = RL.cell(x, y);
      if (c === "#") { ctx.fillStyle = C.ink; ctx.fillRect(px(x), py(y), cs, cs); continue; }
      if (c === "X") { ctx.globalAlpha = 0.92; ctx.fillStyle = C.red; ctx.fillRect(px(x), py(y), cs, cs); ctx.globalAlpha = 1; continue; }
      v = RL.maxQ(q, x, y);
      if (c !== "G" && v > 0) { ctx.globalAlpha = Math.min(1, v) * 0.55; ctx.fillStyle = C.blue; ctx.fillRect(px(x), py(y), cs, cs); ctx.globalAlpha = 1; }
    }
    // grade
    ctx.strokeStyle = C.rule; ctx.globalAlpha = 0.6; ctx.lineWidth = 1; ctx.beginPath();
    for (i = 0; i <= RL.COLS; i++) { ctx.moveTo(px(i) + 0.5, oy); ctx.lineTo(px(i) + 0.5, oy + cs * RL.ROWS); }
    for (i = 0; i <= RL.ROWS; i++) { ctx.moveTo(ox, py(i) + 0.5); ctx.lineTo(ox + cs * RL.COLS, py(i) + 0.5); }
    ctx.stroke(); ctx.globalAlpha = 1;
    // política (setas) nas células já exploradas
    ctx.fillStyle = C.ink; ctx.globalAlpha = 0.55;
    for (y = 0; y < RL.ROWS; y++) for (x = 0; x < RL.COLS; x++) {
      c = RL.cell(x, y);
      if (c === "#" || c === "X" || c === "G") continue;
      var any = false;
      for (i = 0; i < 4; i++) if (q[RL.idx(x, y, i)] !== 0) { any = true; break; }
      if (any) arrow(px(x) + cs / 2, py(y) + cs / 2, RL.best(q, x, y));
    }
    ctx.globalAlpha = 1;
    // meta e início
    var g = RL.find("G");
    ctx.fillStyle = C.blue; ctx.fillRect(px(g[0]), py(g[1]), cs, cs);
    ctx.fillStyle = C.surface; ctx.beginPath(); ctx.arc(px(g[0]) + cs / 2, py(g[1]) + cs / 2, cs * 0.22, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px(start[0]) + cs / 2, py(start[1]) + cs / 2, cs * 0.34, 0, 6.2832); ctx.stroke();
    // rota aprendida
    var route = mode === "demo" ? (staticPath || (path && path.slice(0, pathIdx + 1))) : null;
    if (route && route.length > 1) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(2, cs * 0.12); ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (i = 0; i < route.length; i++) { var X = px(route[i][0]) + cs / 2, Y = py(route[i][1]) + cs / 2; if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    // agente
    ctx.fillStyle = C.ink; ctx.strokeStyle = C.surface; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px(agent.x) + cs / 2, py(agent.y) + cs / 2, cs * 0.3, 0, 6.2832); ctx.fill(); ctx.stroke();
  }

  /* ---------- Laço ---------- */
  function frame(t) {
    raf = 0;
    if (!visible || document.hidden || paused || reduce.matches) return;
    if (mode === "train") {
      var n = stepsPerFrame();
      for (var i = 0; i < n; i++) if (!trainStep()) break;
      if (mode === "train") readout();
    } else demoStep(t);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function startLoop() { if (!raf && !reduce.matches && !paused) raf = requestAnimationFrame(frame); }

  if (pauseBtn) pauseBtn.addEventListener("click", function () { paused = !paused; setState(); if (!paused) startLoop(); });
  if (restartBtn) restartBtn.addEventListener("click", function () { paused = false; restart(); });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) startLoop(); }).observe(canvas);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) startLoop(); });
  if (reduce.addEventListener) reduce.addEventListener("change", function () { if (pauseBtn) pauseBtn.hidden = reduce.matches; restart(); });
  document.addEventListener("sitelangchange", function (e) { canvas.setAttribute("aria-label", labels[e.detail.lang]); readout(); });
  document.addEventListener("sitethemechange", function () { readColors(); draw(); });
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas.parentElement); else window.addEventListener("resize", resize);

  canvas.setAttribute("aria-label", labels[root.lang] || labels["pt-BR"]);
  if (pauseBtn) pauseBtn.hidden = reduce.matches;
  restart();
  resize();
})();
