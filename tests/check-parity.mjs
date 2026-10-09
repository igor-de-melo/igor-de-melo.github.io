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

// Marcação de campos do CV (data-section, data-item, data-f) nas páginas de área: a contagem de cada valor é igual
// nas três línguas, e todo item de experiência ou de formação tem data-f="title" em cada língua.
function fieldCount(el, lang, acc) {
  if (el.text !== undefined) return acc;
  if (el.tag !== "html" && LANGS.includes(el.attrs.lang) && el.attrs.lang !== lang) return acc;
  for (const k of ["data-section", "data-item", "data-f"]) if (el.attrs[k]) acc[k + "=" + el.attrs[k]] = (acc[k + "=" + el.attrs[k]] || 0) + 1;
  for (const c of el.children) fieldCount(c, lang, acc);
  return acc;
}
function eachItem(el, fn) {
  if (el.text !== undefined) return;
  if (el.attrs["data-item"]) fn(el);
  for (const c of el.children) eachItem(c, fn);
}
const FIELD_VALUES = {
  "data-section": ["summary", "skills", "experience", "projects", "research", "education", "courses", "languages", "contact", "volunteering"],
  "data-item": ["experience", "project", "research", "education", "course", "skill-group", "volunteering"],
  "data-f": ["title", "org", "place", "period", "status", "desc", "bullet", "stack", "link"],
};
function findAll(el, test, out = []) {
  if (el.text !== undefined) return out;
  if (test(el)) out.push(el);
  for (const c of el.children) findAll(c, test, out);
  return out;
}
function findAllLang(el, test, lang, out = []) {
  if (el.text !== undefined) return out;
  if (el.tag !== "html" && LANGS.includes(el.attrs.lang) && el.attrs.lang !== lang) return out;
  if (test(el)) out.push(el);
  for (const c of el.children) findAllLang(c, test, lang, out);
  return out;
}
const hasClass = (el, c) => (el.attrs.class || "").split(/\s+/).includes(c);
for (const f of files) {
  if (!/[\\/]/.test(f)) continue; // a Home não tem campos de CV
  const tree = parse(readFileSync(join(root, f), "utf8"));
  // Valores permitidos (status é o estado de um projeto, e não um período).
  for (const [attr, ok] of Object.entries(FIELD_VALUES)) for (const el of findAll(tree, (e) => e.attrs[attr])) {
    if (!ok.includes(el.attrs[attr])) fail(f, el.line, `${attr}="${el.attrs[attr]}" não é um valor previsto`);
  }
  // Resumo do Simplificado: um bloco .s-only com data-section="summary" e o texto (data-f="desc") nas três línguas.
  const sums = findAll(tree, (e) => e.attrs["data-section"] === "summary");
  if (sums.length !== 1 || !hasClass(sums[0], "s-only")) fail(f, 1, 'esperava um único data-section="summary", num bloco .s-only');
  else for (const l of LANGS) if (fieldCount(sums[0], l, {})["data-f=desc"] !== 1) fail(f, sums[0].line, `resumo do Simplificado sem data-f="desc" em ${l}`);
  // h1: o do Temático (título da área, .t-only) e o do Simplificado (o nome, .s-only).
  const h1s = findAll(tree, (e) => e.tag === "h1");
  if (h1s.length !== 2 || !h1s.some((e) => hasClass(e, "t-only")) || !h1s.some((e) => hasClass(e, "s-only"))) fail(f, 1, "esperava dois h1: um .t-only (título da área) e um .s-only (o nome)");
  // Tópicos: o mesmo número de data-f="bullet" em cada língua, item por item.
  for (const item of findAll(tree, (e) => e.attrs["data-item"] && !LANGS.includes(e.attrs.lang))) { // item que já é de uma língua só entra na contagem geral
    const n = LANGS.map((l) => fieldCount(item, l, {})["data-f=bullet"] || 0);
    if (n.some((v) => v !== n[0])) fail(f, item.line, `tópicos desiguais entre línguas em ${item.attrs["data-item"]} (pt-BR=${n[0]}, en=${n[1]}, fr=${n[2]})`);
  }
  // Destaques de palavra-chave: o mesmo número de <strong> em cada língua, item por item; e nenhum <b> solto no conteúdo.
  const strongs = (el, lang) => findAllLang(el, (e) => e.tag === "strong", lang).length;
  for (const item of findAll(tree, (e) => e.attrs["data-item"] || e.attrs["data-section"])) {
    const n = LANGS.map((l) => strongs(item, l));
    if (n.some((x) => x !== n[0])) fail(f, item.line, `<strong> desigual entre línguas em ${item.attrs["data-item"] || item.attrs["data-section"]} (pt-BR=${n[0]}, en=${n[1]}, fr=${n[2]})`);
  }
  for (const s of findAll(tree, (e) => e.tag === "strong")) if (["h1", "h2", "h3"].includes(s.parent.tag) || ["h1", "h2", "h3"].includes(s.parent.parent?.tag)) fail(f, s.line, "<strong> dentro de título");
  // Campo marcado nunca fica num elemento só do Temático que não tenha par no Simplificado: projeto com status não usa período.
  for (const item of findAll(tree, (e) => e.attrs["data-item"] === "project")) {
    const c = fieldCount(item, "pt-BR", {});
    if (c["data-f=status"] && c["data-f=period"]) fail(f, item.line, "projeto com data-f=\"status\" não deve ter data-f=\"period\"");
  }
  const per = LANGS.map((l) => fieldCount(tree, l, {}));
  if (!Object.keys(per[0]).some((k) => k.startsWith("data-section="))) fail(f, 1, "falta a marcação de campos (data-section, data-item, data-f)");
  for (const k of new Set(per.flatMap((o) => Object.keys(o)))) {
    const n = per.map((o) => o[k] || 0);
    if (n.some((x) => x !== n[0])) fail(f, 1, `${k}: contagem desigual entre línguas (pt-BR=${n[0]}, en=${n[1]}, fr=${n[2]})`);
  }
  eachItem(tree, (item) => {
    if (!["experience", "education"].includes(item.attrs["data-item"])) return;
    for (const l of LANGS) if (!fieldCount(item, l, {})["data-f=title"]) fail(f, item.line, `item de ${item.attrs["data-item"]} sem data-f="title" (${l})`);
  });
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
  // Disponibilidade na abertura da Home, nas três línguas.
  if (!src.includes('<p class="gate-avail"><span class="avail-dot" aria-hidden="true"></span><span lang="pt-BR">Disponível para vagas júnior em engenharia aeronáutica, ciência de dados e TI/Cibersegurança, com início imediato.</span><span lang="en">Available for junior roles in aeronautical engineering, data science and IT/Cybersecurity, with immediate start.</span><span lang="fr">Disponible pour des postes junior en ingénierie aéronautique, science des données et informatique/Cibersécurité, avec démarrage immédiat.</span></p>')) fail(f, 1, "falta a frase de disponibilidade (.gate-avail) nas três línguas");
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
