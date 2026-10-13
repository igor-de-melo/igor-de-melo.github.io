// Verifica links e recursos das páginas do site.
// Uso: node tests/check-links.mjs              (só links internos; falha se algum quebrar)
//      node tests/check-links.mjs --external   (também testa links externos; só avisa)
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set([".git", "node_modules", "tools", "tests", ".github", "mockups", "screenshots"]);
const SKIP_FILES = new Set(["index.template.html"]);
const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p); }
    else if (name.endsWith(".html") && !SKIP_FILES.has(name)) pages.push(p);
  }
})(root);

const idsCache = new Map();
const idsOf = (file) => {
  if (!idsCache.has(file)) idsCache.set(file, new Set([...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idsCache.get(file);
};

const errors = [], external = new Map();
for (const page of pages) {
  const src = readFileSync(page, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const rel = relative(root, page);
  // srcset e data-srcset: cada variante de imagem entra como um endereço a conferir.
  const sets = [...src.matchAll(/\s(?:data-)?srcset="([^"]*)"/g)].flatMap((m) => m[1].split(",").map((p) => [null, "src", p.trim().split(/\s+/)[0]]));
  for (const m of [...src.matchAll(/\s(href|src|data-cv-[a-z-]+)="([^"]*)"/g), ...sets]) {
    const url = m[2];
    if (!url) { errors.push(`${rel}: ${m[1]} vazio`); continue; }
    if (/^(mailto|tel|data|javascript):/i.test(url)) continue;
    if (/^https?:\/\//i.test(url)) {
      if (!/^https:\/\/igor-de-melo\.github\.io\//.test(url)) { if (!external.has(url)) external.set(url, rel); }
      continue;
    }
    const [pathPart, hash] = url.split("#");
    const clean = pathPart.split("?")[0];
    let target = clean ? resolve(dirname(page), decodeURIComponent(clean)) : page;
    if (clean && clean.endsWith("/")) target = join(target, "index.html");
    if (!existsSync(target)) { errors.push(`${rel}: "${url}" aponta para arquivo inexistente`); continue; }
    if (hash && target.endsWith(".html") && !idsOf(target).has(hash)) errors.push(`${rel}: "${url}" aponta para âncora inexistente #${hash}`);
  }
  // og:image e twitter:image: endereço absoluto do próprio site, que precisa existir no repositório.
  for (const m of src.matchAll(/<meta (?:property|name)="(og:image|twitter:image)" content="([^"]*)"/g)) {
    const file = m[2].replace(/^https:\/\/igor-de-melo\.github\.io\//, "");
    if (file === m[2] || !existsSync(join(root, file))) errors.push(`${rel}: ${m[1]} "${m[2]}" não corresponde a um arquivo do site`);
  }
}

// Currículo em PDF: um arquivo por idioma. Há dois conjuntos: o geral (Home, Aero e TI e Ciber) e o de Dados, usado só
// na página /data/. Cada link de currículo aponta os três idiomas do conjunto da própria página (href em PT e
// data-cv-pt-br / -en / -fr), o nome do arquivo baixado traz a área e o idioma (Igor_de_Melo_CV_<área>_pt.pdf, com o
// sufixo trocado pelo site.js) e o nome antigo, de arquivo único, não aparece mais em lugar nenhum.
const cvSet = (prefix) => ({ "pt-br": `${prefix}-pt.pdf`, en: `${prefix}-en.pdf`, fr: `${prefix}-fr.pdf` });
const CV_GENERAL = cvSet("cv-igor-de-melo");
const CV_DATA = cvSet("cv-igor-de-melo-data");
for (const f of [...Object.values(CV_GENERAL), ...Object.values(CV_DATA)]) if (!existsSync(join(root, "assets", "docs", f))) errors.push(`assets/docs/${f}: currículo não encontrado`);
const AREA_OF = { "aero/index.html": "aero", "data/index.html": "data", "it-security/index.html": "it-security" };
for (const page of [...pages, join(root, "index.template.html")]) {
  const rel = relative(root, page).split("\\").join("/");
  const CV = rel === "data/index.html" ? CV_DATA : CV_GENERAL;
  const area = AREA_OF[rel];
  const wantDownload = area ? `Igor_de_Melo_CV_${area}_pt.pdf` : "Igor_de_Melo_CV_pt.pdf";
  for (const m of readFileSync(page, "utf8").matchAll(/<a\b[^>]*cv-igor-de-melo[^>]*>/g)) {
    for (const [l, f] of Object.entries(CV)) if (!new RegExp(`data-cv-${l}="[^"]*/${f}"`).test(m[0])) errors.push(`${rel}: link de currículo sem data-cv-${l} apontando para ${f}`);
    if (!new RegExp(`\\shref="[^"]*/${CV["pt-br"]}"`).test(m[0])) errors.push(`${rel}: o href do link de currículo deve ser o PDF em português (o site.js troca conforme o idioma): ${CV["pt-br"]}`);
    if (!m[0].includes(`download="${wantDownload}"`)) errors.push(`${rel}: o link de currículo deve ter download="${wantDownload}" (área e idioma no nome do arquivo)`);
  }
}
const OLD_CV = "cv-igor-de-melo" + ".pdf";
const TEXT = /\.(html|md|mjs|js|json|txt|xml|yml|yaml|css)$/;
(function scan(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (![".git", "node_modules", "screenshots", "photos_pdf_certificate"].includes(name)) scan(p); }
    else if (name === OLD_CV) errors.push(`${relative(root, p)}: o PDF antigo do currículo ainda existe`);
    else if (TEXT.test(name) && name !== "package-lock.json" && readFileSync(p, "utf8").includes(OLD_CV)) errors.push(`${relative(root, p)}: ainda cita ${OLD_CV}`);
  }
})(root);

if (errors.length) { console.log(errors.map((e) => "FALHA " + e).join("\n")); }
else console.log(`Links internos OK em ${pages.length} páginas.`);

if (process.argv.includes("--external")) {
  const warn = [];
  await Promise.all([...external].map(async ([url, from]) => {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
      let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctl.signal });
      if (r.status === 405 || r.status === 403) r = await fetch(url, { redirect: "follow", signal: ctl.signal });
      clearTimeout(t);
      // LinkedIn bloqueia robôs (999/403/429): não indica link quebrado.
      const bot = /linkedin\.com/.test(url) && [403, 429, 999].includes(r.status);
      if (r.status >= 400 && !bot) warn.push(`${from}: ${url} respondeu ${r.status}`);
    } catch (e) { warn.push(`${from}: ${url} não respondeu (${e.name})`); }
  }));
  if (warn.length) console.log(warn.map((w) => "AVISO " + w).join("\n"));
  else console.log(`Links externos OK (${external.size}).`);
}
process.exit(errors.length ? 1 : 0);
