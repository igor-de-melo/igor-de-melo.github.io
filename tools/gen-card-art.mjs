// Gera as duas ilustrações SVG dos cartões da porta de entrada, a partir dos mesmos modelos das faces:
//   aero: linhas de corrente do aerofólio de Joukowski (mesmo cálculo de assets/flow.js), α = 5°
//   ti:   labirinto e rota aprendida por Q-learning (assets/maze.js)
// Uso: node tools/gen-card-art.mjs   (imprime { aero, ti } em JSON; o HTML da raiz embute o resultado)
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const RL = require(join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "maze.js"));

const VB_W = 480, VB_H = 240;
const f = (n) => (Math.round(n * 10) / 10).toString();

/* ---------- Aerofólio de Joukowski ---------- */
const MU_X = -0.09, MU_Y = 0.07, U = 1;
const R = Math.hypot(1 - MU_X, MU_Y), BETA = Math.atan2(MU_Y, 1 - MU_X);
const alpha = (5 * Math.PI) / 180, ca = Math.cos(alpha), sa = Math.sin(alpha);
const gamma = 4 * Math.PI * U * R * Math.sin(alpha + BETA);
function vel(x, y) {
  const bx = x * ca - y * sa, by = x * sa + y * ca;
  const a = bx * bx - by * by - 4, b = 2 * bx * by, r = Math.hypot(a, b);
  const sr = Math.sqrt(Math.max(0, (r + a) / 2));
  let si = Math.sqrt(Math.max(0, (r - a) / 2)); if (b < 0) si = -si;
  const z1x = (bx + sr) / 2, z1y = (by + si) / 2, z2x = (bx - sr) / 2, z2y = (by - si) / 2;
  const d1 = Math.hypot(z1x - MU_X, z1y - MU_Y), d2 = Math.hypot(z2x - MU_X, z2y - MU_Y);
  let zx, zy, dd; if (d1 >= d2) { zx = z1x; zy = z1y; dd = d1; } else { zx = z2x; zy = z2y; dd = d2; }
  if (dd < R * 1.0005) return null;
  const dx = zx - MU_X, dy = zy - MU_Y, dm2 = dx * dx + dy * dy;
  let wx = U * ca, wy = -U * sa;
  const d2x = dx * dx - dy * dy, d2y = -2 * dx * dy, k = (U * R * R) / (dm2 * dm2);
  wx -= k * (ca * d2x - sa * d2y); wy -= k * (ca * d2y + sa * d2x);
  const g = gamma / (2 * Math.PI * dm2); wx += g * dy; wy += g * dx;
  const zm2 = zx * zx + zy * zy, zi4 = 1 / (zm2 * zm2);
  const jx = 1 - (zx * zx - zy * zy) * zi4, jy = 2 * zx * zy * zi4, jm2 = jx * jx + jy * jy;
  if (jm2 < 1e-7) return null;
  const ub = (wx * jx + wy * jy) / jm2, vb = -((wy * jx - wx * jy) / jm2);
  return [ub * ca + vb * sa, -ub * sa + vb * ca];
}
function aeroSvg() {
  const S = 62, cx = 232, cy = 118; // px por unidade, centro do desenho
  const X = (x) => cx + x * S, Y = (y) => cy - y * S;
  const foil = [];
  for (let i = 0; i < 240; i++) {
    const th = (i / 240) * 2 * Math.PI, zx = MU_X + R * Math.cos(th), zy = MU_Y + R * Math.sin(th), m = zx * zx + zy * zy;
    const Zx = zx + zx / m, Zy = zy - zy / m;
    foil.push([Zx * ca + Zy * sa, -Zx * sa + Zy * ca]);
  }
  const lines = [];
  for (let s = 0; s < 15; s++) {
    let x = -(cx / S) - 0.2, y = ((s - 7) / 7) * 1.75 + 0.02;
    const pts = [];
    for (let n = 0; n < 4000 && x < (VB_W - cx) / S + 0.2; n++) {
      const v = vel(x, y); if (!v) break;
      const sp = Math.hypot(v[0], v[1]) || 1, h = 0.04 / sp;
      const m = vel(x + v[0] * h * 0.5, y + v[1] * h * 0.5); if (!m) break;
      x += m[0] * h; y += m[1] * h;
      if (n % 3 === 0) pts.push([x, y]);
    }
    if (pts.length < 4) continue;
    const mid = pts[Math.floor(pts.length / 2)];
    const d = pts.map((p, i) => (i ? "L" : "M") + f(X(p[0])) + " " + f(Y(p[1]))).join("");
    lines.push(`<path class="art-flow ${mid[1] > 0.05 ? "art-up" : "art-dn"}" d="${d}"/>`);
  }
  const fp = foil.map((p, i) => (i ? "L" : "M") + f(X(p[0])) + " " + f(Y(p[1]))).join("") + "Z";
  return `<svg viewBox="0 0 ${VB_W} ${VB_H}" role="presentation" focusable="false" preserveAspectRatio="xMidYMid slice">${lines.join("")}<path class="art-foil" d="${fp}"/></svg>`;
}

/* ---------- Labirinto e rota aprendida ---------- */
function mazeSvg() {
  const cs = 26, ox = Math.round((VB_W - cs * RL.COLS) / 2), oy = Math.round((VB_H - cs * RL.ROWS) / 2);
  const t = RL.train(11, 1500), g = RL.greedyRun(t.q);
  let walls = "", pits = "", val = "";
  for (let y = 0; y < RL.ROWS; y++) for (let x = 0; x < RL.COLS; x++) {
    const c = RL.cell(x, y), px = ox + x * cs, py = oy + y * cs;
    if (c === "#") walls += `M${px} ${py}h${cs}v${cs}h-${cs}z`;
    else if (c === "X") pits += `M${px} ${py}h${cs}v${cs}h-${cs}z`;
    else if (c !== "G") { const v = RL.maxQ(t.q, x, y); if (v > 0.02) val += `<rect x="${px}" y="${py}" width="${cs}" height="${cs}" fill-opacity="${f(Math.min(1, v) * 0.55)}"/>`; }
  }
  const gx = RL.find("G"), s = RL.find("S"), mid = g.path[Math.floor(g.path.length * 0.62)];
  const route = g.path.map((p, i) => (i ? "L" : "M") + f(ox + p[0] * cs + cs / 2) + " " + f(oy + p[1] * cs + cs / 2)).join("");
  return `<svg viewBox="0 0 ${VB_W} ${VB_H}" role="presentation" focusable="false" preserveAspectRatio="xMidYMid slice">` +
    `<g class="art-val">${val}</g><path class="art-pit" d="${pits}"/><path class="art-wall" d="${walls}"/>` +
    `<rect class="art-goal" x="${ox + gx[0] * cs}" y="${oy + gx[1] * cs}" width="${cs}" height="${cs}"/>` +
    `<circle class="art-dot" cx="${ox + gx[0] * cs + cs / 2}" cy="${oy + gx[1] * cs + cs / 2}" r="${cs * 0.22}"/>` +
    `<circle class="art-start" cx="${ox + s[0] * cs + cs / 2}" cy="${oy + s[1] * cs + cs / 2}" r="${cs * 0.34}"/>` +
    `<path class="art-route" pathLength="1" d="${route}"/>` +
    `<circle class="art-agent" cx="${f(ox + mid[0] * cs + cs / 2)}" cy="${f(oy + mid[1] * cs + cs / 2)}" r="${cs * 0.3}"/></svg>`;
}

/* ---------- Rede com propagação de malware (modelo SIR) ---------- */
function netSvg() {
  const rnd = RL.mulberry32(29), nodes = [];
  // nós espalhados com distância mínima (amostragem por rejeição, determinística)
  for (let tries = 0; nodes.length < 34 && tries < 5000; tries++) {
    const x = 26 + rnd() * (VB_W - 52), y = 22 + rnd() * (VB_H - 44);
    if (nodes.every((n) => Math.hypot(n.x - x, n.y - y) > 44)) nodes.push({ x, y });
  }
  const edges = [];
  nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 82) edges.push([i, j]); }));
  // estado: infecção a partir do nó mais à esquerda, por saltos; parte da rede já isolada pelo defensor
  const src = nodes.reduce((m, n, i) => (n.x < nodes[m].x ? i : m), 0), hop = nodes.map(() => Infinity);
  hop[src] = 0; const q = [src];
  while (q.length) { const u = q.shift(); edges.forEach(([a, b]) => { const v = a === u ? b : b === u ? a : -1; if (v >= 0 && hop[v] === Infinity) { hop[v] = hop[u] + 1; q.push(v); } }); }
  const state = nodes.map((n, i) => (hop[i] <= 2 ? "i" : hop[i] === 3 ? "r" : "s"));
  const e = edges.map(([a, b]) => {
    const hot = state[a] === "i" && state[b] === "i", cut = state[a] === "r" || state[b] === "r";
    return `<line class="art-edge${hot ? " art-edge-hot" : cut ? " art-edge-cut" : ""}" x1="${f(nodes[a].x)}" y1="${f(nodes[a].y)}" x2="${f(nodes[b].x)}" y2="${f(nodes[b].y)}"/>`;
  }).join("");
  const n = nodes.map((p, i) => `<circle class="art-node art-node-${state[i]}" cx="${f(p.x)}" cy="${f(p.y)}" r="${state[i] === "s" ? 6 : 7}"/>`).join("");
  return `<svg viewBox="0 0 ${VB_W} ${VB_H}" role="presentation" focusable="false" preserveAspectRatio="xMidYMid slice">${e}${n}</svg>`;
}

process.stdout.write(JSON.stringify({ aero: aeroSvg(), ti: mazeSvg(), cyber: netSvg() }));
