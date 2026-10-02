// Valida o Q-learning da abertura da face TI. Uso: node tests/check-maze.mjs
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const RL = require(join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "maze.js"));

let failed = 0;
const check = (ok, msg) => { console.log((ok ? "OK    " : "FALHA ") + msg); if (!ok) failed++; };

const risky = RL.shortest(true);
check(RL.MAZE.every((r) => r.length === RL.COLS), `grade ${RL.COLS}x${RL.ROWS} retangular`);
check(RL.SAFE > 0, `existe rota segura (${RL.SAFE} passos)`);
check(risky > 0 && risky < RL.SAFE, `o atalho pelas armadilhas é mais curto (${risky} < ${RL.SAFE}), logo evitá-lo é aprendizado real`);

const N = 60, episodes = [];
let learned = 0, touchedPit = 0, notOptimal = 0;
for (let seed = 1; seed <= N; seed++) {
  const r = RL.train(seed * 7919, 1500);
  const g = RL.greedyRun(r.q);
  if (g.ok) learned++;
  if (g.path.some(([x, y]) => RL.cell(x, y) === "X")) touchedPit++;
  if (g.ok && g.path.length - 1 !== RL.SAFE) notOptimal++;
  episodes.push(r.episodes);
}
episodes.sort((a, b) => a - b);
check(learned === N, `${learned}/${N} sementes aprenderam a chegar à meta`);
check(touchedPit === 0, `nenhuma política aprendida passa por armadilha (${touchedPit})`);
check(notOptimal === 0, `todas as rotas aprendidas têm o comprimento ótimo seguro (${notOptimal} fora)`);
check(episodes[N - 1] < 900, `convergência abaixo do teto de 900 episódios (mediana ${episodes[N >> 1]}, máx ${episodes[N - 1]})`);

process.exit(failed ? 1 : 0);
