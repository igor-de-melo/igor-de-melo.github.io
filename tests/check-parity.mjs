// Verifica a paridade PT/EN/FR nos HTML do site. Uso: node tests/check-parity.mjs
import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = ["index.html", "aero/index.html", "data/index.html", "it-security/index.html"];
const LANGS = ["pt-BR", "en", "fr"];
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style"]);

// Parser mínimo e tolerante: devolve a árvore de elementos (com linha de origem).
function parse(src) {
  const top = { tag: "#root", attrs: {}, children: [], line: 1 };
  const stack = [top];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+|<)/gi;
  const lineAt = (i) => src.slice(0, i).split("\n").length;
  let m;
  while ((m = re.exec(src))) {
    const cur = stack[stack.length - 1];
    if (m[1]) {
      const tag = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      const attrs = {};
      for (const a of m[3].matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
        attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? "";
      }
      const el = { tag, attrs, children: [], line: lineAt(m.index), parent: cur };
      cur.children.push(el);
      if (RAW.has(tag)) {
        const end = src.toLowerCase().indexOf("</" + tag, re.lastIndex);
        re.lastIndex = end < 0 ? src.length : end;
      } else if (!VOID.has(tag) && !m[4]) stack.push(el);
    } else if (m[5] !== undefined && m[5].trim()) {
      cur.children.push({ text: m[5].trim(), line: lineAt(m.index), parent: cur });
    }
  }
  return top;
}

const errors = [];
const fail = (file, line, msg) => errors.push(`${file}:${line}: ${msg}`);
const describe = (el) => `<${el.tag}${el.attrs.id ? "#" + el.attrs.id : ""}${el.attrs.class ? "." + el.attrs.class.split(/\s+/)[0] : ""}>`;

function walk(el, file, inheritedLang) {
  if (el.text !== undefined) return;
  // 1) Paridade entre filhos diretos.
  const count = Object.fromEntries(LANGS.map((l) => [l, 0]));
  for (const c of el.children) if (c.tag && LANGS.includes(c.attrs.lang)) count[c.attrs.lang]++;
  const counts = LANGS.map((l) => count[l]);
  if (counts.some((n) => n !== counts[0])) {
    fail(file, el.line, `${describe(el)} tem filhos por idioma desiguais (pt-BR=${counts[0]}, en=${counts[1]}, fr=${counts[2]})`);
  }
  // 2) Sem mistura de idiomas: elemento de um idioma não contém elemento de outro.
  for (const c of el.children) {
    if (!c.tag) continue;
    const own = LANGS.includes(c.attrs.lang) ? c.attrs.lang : null;
    if (own && inheritedLang && own !== inheritedLang && c.tag !== "html") {
      fail(file, c.line, `${describe(c)} (${own}) está dentro de elemento ${inheritedLang}`);
    }
    walk(c, file, own || inheritedLang);
  }
}

// Todo HTML do site começa exatamente por "<!doctype html>" (um "<" perdido faz o texto aparecer na página).
for (const f of [...files, "index.template.html"]) {
  const head = readFileSync(join(root, f), "utf8").slice(0, 15);
  if (head !== "<!doctype html>") fail(f, 1, `não começa por "<!doctype html>" (começa por ${JSON.stringify(head)})`);
}

// Seletor de visão (Simplificado / Temático): presente nas páginas de área, com os rótulos nas três línguas.
// A Home é sempre Temático: não tem seletor e traz, abaixo de cada cartão, o botão "Ver versão simplificada".
const VIEW_LABELS = ['<span lang="pt-BR">Simplificado</span><span lang="en">Simple</span><span lang="fr">Simplifié</span>', '<span lang="pt-BR">Temático</span><span lang="en">Themed</span><span lang="fr">Thématique</span>', 'aria-label="Visualização / View / Affichage"'];
const SIMPLE_BTN = '<span lang="pt-BR">Ver versão simplificada</span><span lang="en">View simple version</span><span lang="fr">Voir la version simplifiée</span>';
const SIMPLE_ARIA = [["aero", "Engenharia Aeronáutica", "Aeronautical Engineering", "Ingénierie aéronautique"], ["data", "Ciência de Dados", "Data Science", "Science des données"], ["it-security", "TI e Cibersegurança", "IT &amp; Cybersecurity", "Informatique et cybersécurité"]];
for (const f of files) {
  const src = readFileSync(join(root, f), "utf8");
  const home = !/[\\/]/.test(f);
  if (!home) { for (const l of VIEW_LABELS) if (!src.includes(l)) fail(f, 1, "seletor de visão: falta " + l); continue; }
  for (const l of VIEW_LABELS) if (src.includes(l)) fail(f, 1, "a Home não deve ter seletor de visão: " + l);
  if (src.split(SIMPLE_BTN).length - 1 !== 3) fail(f, 1, 'esperava 3 botões "Ver versão simplificada" com os rótulos nas três línguas');
  for (const [area, pt, en, fr] of SIMPLE_ARIA) {
    const want = `href="${area}/index.html?view=simple" data-face data-face-view="simple" aria-label="Ver versão simplificada: ${pt}" data-aria-pt-br="Ver versão simplificada: ${pt}" data-aria-en="View simple version: ${en}" data-aria-fr="Voir la version simplifiée&nbsp;: ${fr}"`;
    if (!src.includes(want)) fail(f, 1, `botão do Simplificado de ${area}: destino ou aria-label nas três línguas`);
  }
}

for (const f of files) {
  const tree = parse(readFileSync(join(root, f), "utf8"));
  const html = tree.children.find((c) => c.tag === "html");
  if (!html) { fail(f, 1, "sem <html>"); continue; }
  walk(html, f, null);
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problema(s).`);
  process.exit(1);
}
console.log(`Paridade OK em ${files.length} arquivos (${files.map((f) => relative(root, join(root, f))).join(", ")}).`);
