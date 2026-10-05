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
  for (const m of src.matchAll(/\s(href|src)="([^"]*)"/g)) {
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
}

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
