// Gera a camada para máquinas a partir do conteúdo visível do Simplificado das páginas de área:
//   <área>/cv.pt-BR.md, cv.en.md, cv.fr.md  (CV em Markdown, uma língua por arquivo)
//   o bloco JSON-LD (ProfilePage + Person, e ScholarlyArticle quando o artigo está na página) no <head> de cada página
// Uso: node tools/build-cv.mjs   (ou: npm run build:cv)
// Fonte: os marcadores data-section, data-item e data-f. Nada é escrito aqui que não esteja na página; tudo que é
// só do Temático (.t-only) ou fica oculto no Simplificado é ignorado. Saída determinística (sem data de geração).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SITE = "https://igor-de-melo.github.io/";
export const AREAS = ["aero", "data", "it-security"];
export const LANGS = ["pt-BR", "en", "fr"];
const HEADER = {
  "pt-BR": (u) => `Gerado automaticamente do conteúdo visível de ${u}.`,
  en: (u) => `Automatically generated from the visible content of ${u}.`,
  fr: (u) => `Généré automatiquement à partir du contenu visible de ${u}.`,
};
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style"]);
// Fora do Simplificado: só do Temático, texto para leitor de tela, sintaxe de código e rótulos decorativos.
const HIDDEN = ["t-only", "sr", "sx", "paper-open", "pn-t", "pm", "gallery", "sims", "sample"];
const ENT = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (s) => s.replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e] ?? m);

export function parse(src) {
  const top = { tag: "#root", attrs: {}, children: [] }, stack = [top];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+|<)/gi;
  let m;
  while ((m = re.exec(src))) {
    const cur = stack[stack.length - 1];
    if (m[1]) { const t = m[1].toLowerCase(); for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === t) { stack.length = i; break; } }
    else if (m[2]) {
      const tag = m[2].toLowerCase(), attrs = {};
      for (const a of m[3].matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? "");
      const el = { tag, attrs, children: [], parent: cur };
      cur.children.push(el);
      if (RAW.has(tag)) { const end = src.toLowerCase().indexOf("</" + tag, re.lastIndex); el.raw = src.slice(re.lastIndex, end < 0 ? src.length : end); re.lastIndex = end < 0 ? src.length : end; }
      else if (!VOID.has(tag) && !m[4]) stack.push(el);
    } else if (m[5] !== undefined) cur.children.push({ text: decode(m[5]), parent: cur });
  }
  return top;
}
const cls = (el, c) => (el.attrs?.class || "").split(/\s+/).includes(c);
const skip = (el, lang) => el.text === undefined && (RAW.has(el.tag) || HIDDEN.some((c) => cls(el, c)) || (el.tag === "dt" && cls(el.parent, "kv") === false && el.parent?.parent && cls(el.parent.parent, "kv")) || (LANGS.includes(el.attrs.lang) && el.attrs.lang !== lang));
export function all(el, test, lang, out = []) {
  if (el.text !== undefined || (el.tag !== "#root" && el.tag !== "html" && skip(el, lang))) return out;
  if (test(el)) out.push(el);
  for (const c of el.children) all(c, test, lang, out);
  return out;
}
const abs = (href, area) => /^(https?:|mailto:)/.test(href) ? href : new URL(href.split("?")[0] + (href.includes("#") && !href.split("?")[0].includes("#") ? "#" + href.split("#")[1] : ""), SITE + area + "/").href;
// Texto visível de um elemento numa língua; com md=true, os links viram [texto](endereço).
export function text(el, lang, area, md = false) {
  if (el.text !== undefined) return el.text;
  if (skip(el, lang) || el.tag === "img") return "";
  const inner = el.children.map((c) => text(c, lang, area, md)).join("");
  if (el.tag === "sup") return inner; // 1re, 8e
  if (md && el.tag === "a" && el.attrs.href && inner.trim()) return `[${inner.replace(/\s+/g, " ").trim()}](${abs(el.attrs.href, area)})`;
  return inner;
}
const clean = (s) => s.replace(/[ \t\r\n]+/g, " ").replace(/ ([,.;:)])/g, "$1").trim();
const T = (el, lang, area, md = true) => clean(text(el, lang, area, md));
const colon = (lang) => (lang === "fr" ? "\u00a0:" : ":");
const nextEl = (el) => { const sib = el.parent.children.filter((c) => c.tag); return sib[sib.indexOf(el) + 1]; };
const prevEl = (el) => { const sib = el.parent.children.filter((c) => c.tag); return sib[sib.indexOf(el) - 1]; };
const within = (el, test) => { for (let p = el.parent; p; p = p.parent) if (p.attrs && test(p)) return p; return null; };

// Seções na ordem do Simplificado (data-simple-before move a seção para antes do alvo; as só do Temático saem).
function sections(tree) {
  const main = all(tree, (e) => e.tag === "main", null)[0];
  let list = main.children.filter((e) => e.tag === "section" && !cls(e, "t-only"));
  for (const s of [...list]) {
    const before = s.attrs["data-simple-before"];
    if (!before) continue;
    list = list.filter((x) => x !== s);
    list.splice(list.findIndex((x) => x.attrs.id === before), 0, s);
  }
  return list;
}
function field(el, lang, area) {
  const f = el.attrs["data-f"];
  if (cls(el, "paper")) { // artigo ou slides: o texto do link e, depois, título e descrição do arquivo
    const part = (c) => all(el, (e) => cls(e, c), lang).map((e) => T(e, lang, area, false)).join("");
    return `[${part("paper-link")}](${abs(el.attrs.href, area)}): ${part("paper-title")}. ${part("paper-meta")}.`;
  }
  let s = T(el, lang, area);
  if (f === "link") {
    s = `[${T(el, lang, area, false)}](${abs(el.attrs.href, area)})`;
    if (el.parent.tag === "li") { const label = clean(el.parent.children.filter((c) => c !== el).map((c) => text(c, lang, area)).join("")); if (label) s = `${label} ${s}`; }
  }
  if (f === "stack") s = (el.tag === "ul" ? all(el, (e) => e.tag === "li", lang).map((li) => T(li, lang, area)).join(", ") : s);
  if (el.tag === "dd" && el.parent.children.some((c) => c.tag === "dt")) { // Problema / Abordagem / Resultado
    const dt = el.parent.children.find((c) => c.tag === "dt" && !skip(c, lang)); const label = dt ? T(dt, lang, area) : "";
    if (label && !label.endsWith(":")) s = `**${label}${colon(lang)}** ${s}`;
  }
  return s;
}
// Campos de primeiro nível de um bloco (um campo dentro de outro já está no texto do de fora).
const topFields = (root, lang, stop) => all(root, (e) => e.attrs["data-f"] && !within(e, (p) => p.attrs["data-f"] && (p === root || within(p, (q) => q === root))) && (!stop || !stop(e)), lang);

export function markdown(area, lang, src) {
  const tree = parse(src), out = [HEADER[lang](SITE + area + "/"), ""];
  const one = (sel) => { const e = all(tree, sel, lang)[0]; return e ? T(e, lang, area) : ""; };
  out.push("# " + one((e) => cls(e, "s-name")), "", "**" + one((e) => cls(e, "s-area")) + "**", "", one((e) => cls(e, "facts")), "");
  const avail = all(tree, (e) => cls(e, "muted") && within(e, (p) => cls(p, "hero")), lang)[0];
  if (avail) out.push(T(avail, lang, area), "");
  for (const sec of sections(tree)) {
    const h2 = all(sec, (e) => e.tag === "h2", lang)[0];
    out.push("## " + T(h2, lang, area), "");
    const emit = (block) => {
      const items = all(block, (e) => e.attrs["data-item"] && e !== block, lang).filter((it) => !within(it, (p) => p !== block && p.attrs["data-section"] && within(p, (q) => q === block)));
      const loose = topFields(block, lang, (e) => within(e, (p) => (p.attrs["data-item"] || (p.attrs["data-section"] && p !== block && within(p, (q) => q === block))) && p !== block) || e.attrs["data-item"] || (e.parent.tag === "dd" && prevEl(e.parent)?.attrs["data-item"]));
      for (const f of loose) { const s = field(f, lang, area); if (s) out.push(f.attrs["data-f"] === "link" ? "- " + s : s, ""); }
      for (const it of items) {
        // Item que é o próprio campo (dt de competências, li de curso, parágrafo de voluntariado); no dt, as etiquetas ficam no dd seguinte.
        const own = it.attrs["data-f"] ? [it].concat(it.tag === "dt" && nextEl(it) ? topFields(nextEl(it), lang) : []) : topFields(it, lang);
        const get = (k) => own.filter((f) => f.attrs["data-f"] === k);
        const kind = it.attrs["data-item"], title = get("title").map((f) => field(f, lang, area)).join(" ");
        const meta = ["org", "period", "status", "place"].flatMap((k) => get(k).map((f) => field(f, lang, area))).filter(Boolean).join(" · ");
        if (kind === "skill-group") { out.push(`- **${title}${colon(lang)}** ${get("stack").map((f) => field(f, lang, area)).join(", ")}`); continue; }
        if (kind === "course") { out.push(`- ${title}${meta ? " — " + meta : ""}`); continue; }
        if (title) out.push("### " + title, "");
        if (meta) out.push(meta, "");
        for (const f of own) {
          const k = f.attrs["data-f"]; if (["title", "org", "period", "status", "place"].includes(k)) continue;
          const s = field(f, lang, area); if (!s) continue;
          if (k === "bullet") out.push("- " + s); else if (k === "stack") out.push("", "Stack" + colon(lang) + " " + s, ""); else if (k === "link") out.push("", "- " + s, ""); else out.push(s, "");
        }
        out.push("");
      }
      for (const sub of all(block, (e) => e.attrs["data-section"] && e !== block, lang).filter((s) => !cls(s, "s-summary"))) {
        const h3 = all(sub, (e) => e.tag === "h3" && !e.attrs["data-f"] && !within(e, (p) => p.attrs["data-item"]), lang)[0];
        if (h3) out.push("", "### " + T(h3, lang, area), "");
        emit(sub);
      }
    };
    const sum = all(sec, (e) => cls(e, "s-summary"), lang)[0];
    if (sum) for (const f of topFields(sum, lang)) out.push(field(f, lang, area), "");
    emit(sec);
  }
  // Linhas em branco: uma antes de cada título, nenhuma entre itens de lista, uma entre lista e parágrafo.
  const res = [], isLi = (l) => l.startsWith("- ");
  for (const l of out.join("\n").split("\n")) {
    const prev = res.filter((x) => x !== "").pop() ?? "", gap = res.length > 0 && res[res.length - 1] === "";
    if (l === "") { if (!gap) res.push(""); continue; }
    if (isLi(l) && isLi(prev) && gap) res.pop();
    else if (!gap && res.length && (l.startsWith("#") || isLi(l) !== isLi(prev))) res.push("");
    res.push(l);
  }
  return res.join("\n").trim() + "\n";
}

// JSON-LD: só valores que a página mostra (os textos vêm da versão em inglês da própria página).
export function jsonld(area, src) {
  const tree = parse(src), L = "en", url = SITE + area + "/";
  const txt = (e) => T(e, L, area, false);
  const skills = all(tree, (e) => e.attrs["data-item"] === "skill-group", L).flatMap((g) => all(g.tag === "dt" ? nextEl(g) : g, (e) => e.tag === "li", L).map(txt));
  const langs = all(tree, (e) => e.attrs["data-section"] === "languages", L)[0];
  const summary = all(tree, (e) => cls(e, "s-summary"), L)[0];
  const mail = all(tree, (e) => e.tag === "a" && (e.attrs.href || "").startsWith("mailto:") && e.attrs["data-f"] === "link", L)[0];
  const same = [...new Set(all(tree, (e) => e.tag === "a" && e.attrs["data-f"] === "link" && /linkedin\.com|github\.com\/igor-de-melo$/.test(e.attrs.href || ""), L).map((e) => e.attrs.href))];
  const edu = all(tree, (e) => e.attrs["data-item"] === "education", L).map((it) => all(it, (e) => e.attrs["data-f"] === "org", L).map(txt)[0]);
  const person = {
    "@type": "Person", name: txt(all(tree, (e) => cls(e, "s-name"), L)[0]), url,
    ...(summary ? { description: txt(all(summary, (e) => e.attrs["data-f"] === "desc", L)[0]) } : {}),
    ...(mail ? { email: txt(mail) } : {}),
    alumniOf: edu.filter((n) => /São Carlos School of Engineering|École Centrale de Marseille/.test(n)).map((name) => ({ "@type": "CollegeOrUniversity", name })),
    knowsAbout: skills,
    ...(langs ? { knowsLanguage: txt(all(langs, (e) => e.attrs["data-f"] === "desc", L)[0]).replace(/\.$/, "").split(", ") } : {}),
    sameAs: same,
  };
  const graph = [{ "@type": "ProfilePage", url, inLanguage: LANGS, mainEntity: person }];
  const paper = all(tree, (e) => cls(e, "paper") && !cls(e, "paper--slides"), L)[0];
  if (paper) { // artigo: só quando o cartão com o título está na página
    const item = within(paper, (p) => p.attrs["data-item"]);
    const authors = (/Authors: (.+? and [^.]+)\./.exec(all(item, (e) => e.attrs["data-f"] === "desc", L).map(txt).join(" ")) || [, ""])[1].split(/, | and /).filter(Boolean);
    graph.push({ "@type": "ScholarlyArticle", name: txt(all(paper, (e) => cls(e, "paper-title"), L)[0]), author: authors.map((name) => ({ "@type": "Person", name })), isPartOf: { "@type": "PublicationEvent", name: "EPTT 2024" }, inLanguage: "en", url: abs(paper.attrs.href, area) });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 1);
}
export const LD_RE = /(<script type="application\/ld\+json">\n)[\s\S]*?(\n<\/script>)/;

export function build() {
  const files = {};
  for (const area of AREAS) {
    const p = join(ROOT, area, "index.html"), src = readFileSync(p, "utf8");
    for (const lang of LANGS) files[`${area}/cv.${lang}.md`] = markdown(area, lang, src);
    files[`${area}/index.html`] = src.replace(LD_RE, (m, a, b) => a + jsonld(area, src) + b);
  }
  return files;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const files = build();
  for (const [f, content] of Object.entries(files)) writeFileSync(join(ROOT, f), content);
  console.log("Gerados: " + Object.keys(files).join(", "));
}
