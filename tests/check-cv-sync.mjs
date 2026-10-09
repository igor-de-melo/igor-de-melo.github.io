// Verifica a camada para máquinas. Uso: node tests/check-cv-sync.mjs
// 1) Os arquivos gerados por tools/build-cv.mjs (cv.<língua>.md e o JSON-LD de cada página) estão em dia.
// 2) Todo campo data-f visível no Simplificado aparece no Markdown, e toda palavra do Markdown está na página.
// 3) O JSON-LD é válido e cada valor dele está no texto visível da página (ou é um endereço que a página traz).
// 4) Nenhum telefone, e nenhum e-mail que a página não mostre, nos arquivos gerados nem no llms.txt.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, SITE, AREAS, LANGS, LD_RE, build, parse, all, text, thirdPerson } from "../tools/build-cv.mjs";

const errors = [];
const fail = (m) => errors.push(m);
const norm = (s) => s.replace(/\s+/g, " ").replace(/ ([,.;:)])/g, "$1").trim();
const plain = (md) => norm(md.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").replace(/^(#+|-) /gm, ""));
const words = (s) => new Set((s.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []));
const PHONE = /(\+\d{1,3}[ -]?)?\(?\b\d{2}\)?[ -]?\d{4,5}[- ]\d{4}\b/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const cls = (el, c) => (el.attrs?.class || "").split(/\s+/).includes(c);
const checkPrivacy = (name, content, pageEmails) => {
  if (PHONE.test(content)) fail(`${name}: contém algo com formato de telefone ("${PHONE.exec(content)[0]}")`);
  for (const e of content.match(EMAIL) || []) if (!pageEmails.has(e)) fail(`${name}: e-mail "${e}" não está visível nas páginas`);
};

const files = build();
for (const [f, content] of Object.entries(files)) {
  if (!existsSync(join(ROOT, f))) { fail(`${f}: não existe; rode "npm run build:cv"`); continue; }
  if (readFileSync(join(ROOT, f), "utf8") !== content) fail(`${f}: desatualizado em relação às páginas; rode "npm run build:cv"`);
}

const allEmails = new Set();
for (const area of AREAS) {
  const src = readFileSync(join(ROOT, area, "index.html"), "utf8"), tree = parse(src);
  const body = all(tree, (e) => e.tag === "body", null)[0];
  const hrefs = new Set(all(tree, (e) => e.tag === "a" && e.attrs.href, null).map((a) => a.attrs.href));
  const pageEmails = new Set(LANGS.flatMap((l) => text(body, l, area).match(EMAIL) || []));
  pageEmails.forEach((e) => allEmails.add(e));
  for (const lang of LANGS) {
    const name = `${area}/cv.${lang}.md`, md = files[name], mdPlain = plain(md), page = norm(text(body, lang, area));
    if (!md.startsWith({ "pt-BR": "Gerado automaticamente do conteúdo visível de ", en: "Automatically generated from the visible content of ", fr: "Généré automatiquement à partir du contenu visible de " }[lang] + SITE + area + "/.\n")) fail(`${name}: falta a primeira linha com a origem`);
    // Campos da página -> Markdown
    const fields = all(body, (e) => e.attrs["data-f"], lang);
    if (fields.length < 20) fail(`${name}: só ${fields.length} campos data-f visíveis na página`);
    for (const f of fields) {
      const lis = all(f, (e) => e.tag === "li" && e !== f, lang);
      const parts = cls(f, "paper") ? ["paper-link", "paper-title", "paper-meta"].flatMap((c) => all(f, (e) => cls(e, c), lang)) : lis.length ? lis : [f];
      for (const p of parts) { const t = norm(text(p, lang, area)); if (t && !mdPlain.includes(t)) fail(`${name}: campo ${f.attrs["data-f"]} da página fora do Markdown: "${t.slice(0, 70)}"`); }
    }
    // Markdown -> página (palavra por palavra, sem a linha de origem e sem os endereços)
    // (o texto da página é lido de dois jeitos, com e sem espaço entre elementos vizinhos: "1<sup>re</sup>" e "<li>a</li><li>b</li>")
    const spaced = all(body, () => true, lang).flatMap((e) => e.children.filter((c) => c.text !== undefined).map((c) => c.text)).join(" ");
    const pageWords = new Set([...words(page), ...words(spaced)]);
    const extra = [...words(plain(md.split("\n").slice(1).join("\n").replace(/\]\([^)]*\)/g, "]()")))].filter((w) => !pageWords.has(w));
    if (extra.length) fail(`${name}: palavras que não estão no texto visível da página: ${extra.slice(0, 12).join(", ")}`);
    checkPrivacy(name, md, pageEmails);
  }
  // JSON-LD
  const m = LD_RE.exec(files[`${area}/index.html`]);
  if (!m) { fail(`${area}/index.html: falta o bloco JSON-LD`); continue; }
  let data;
  try { data = JSON.parse(m[0].replace(/^<script[^>]*>\n/, "").replace(/\n<\/script>$/, "")); } catch (e) { fail(`${area}/index.html: JSON-LD inválido (${e.message})`); continue; }
  if ((src.match(/application\/ld\+json/g) || []).length !== 1) fail(`${area}/index.html: esperava um único bloco JSON-LD`);
  const pageEn = norm(text(body, "en", area));
  const walk = (v, key) => {
    if (Array.isArray(v)) return v.forEach((x) => walk(x, key));
    if (v && typeof v === "object") return Object.entries(v).forEach(([k, x]) => walk(x, k));
    if (typeof v !== "string" || key === "@type" || key === "@context") return;
    if (["telephone", "jobTitle", "worksFor", "address"].includes(key)) fail(`${area}/index.html: JSON-LD não deve ter "${key}"`);
    if (key === "inLanguage") { if (![...LANGS, "en"].includes(v)) fail(`${area}/index.html: inLanguage "${v}"`); return; }
    if (/^https?:/.test(v)) { const rel = [...hrefs].some((h) => h === v || new URL(h.split("?")[0], SITE + area + "/").href === v); if (v !== SITE + area + "/" && !rel) fail(`${area}/index.html: endereço do JSON-LD que a página não traz: ${v}`); return; }
    // A description vem do resumo visível, só com a pessoa gramatical trocada (1ª na página, 3ª nos dados estruturados).
    if (key === "description" && thirdPerson(pageEn).includes(norm(v))) return;
    if (!pageEn.includes(norm(v))) fail(`${area}/index.html: valor do JSON-LD (${key}) fora do texto visível: "${v.slice(0, 60)}"`);
  };
  walk(data);
  const person = data["@graph"]?.[0]?.mainEntity;
  if (data["@graph"]?.[0]?.["@type"] !== "ProfilePage" || person?.["@type"] !== "Person" || person.name !== "Igor Augusto de Melo") fail(`${area}/index.html: JSON-LD sem ProfilePage > Person`);
  checkPrivacy(`${area}/index.html (JSON-LD)`, m[0], pageEmails);
  // <head>: um link alternate em Markdown por língua, apontando para o arquivo da própria página
  for (const lang of LANGS) if (!src.includes(`<link rel="alternate" type="text/markdown" hreflang="${lang}" href="cv.${lang}.md">`)) fail(`${area}/index.html: falta o <link rel="alternate" type="text/markdown" hreflang="${lang}">`);
  if (!src.includes(`<link rel="canonical" href="${SITE}${area}/">`)) fail(`${area}/index.html: canonical deve ser ${SITE}${area}/ (sem ?lang= nem ?view=)`);
}

// llms.txt
if (!existsSync(join(ROOT, "llms.txt"))) fail("llms.txt: não existe");
else {
  const llms = readFileSync(join(ROOT, "llms.txt"), "utf8");
  checkPrivacy("llms.txt", llms, allEmails);
  for (const u of llms.match(/https:\/\/igor-de-melo\.github\.io\/[^\s)]*/g) || []) {
    const rel = u.slice(SITE.length);
    const file = rel === "" || rel.endsWith("/") ? rel + "index.html" : rel;
    if (!existsSync(join(ROOT, file))) fail(`llms.txt: ${u} não corresponde a um arquivo do site`);
  }
  for (const f of Object.keys(files).filter((f) => f.endsWith(".md"))) if (!llms.includes(SITE + f)) fail(`llms.txt: falta ${f}`);
}

if (errors.length) { console.error(errors.map((e) => "FALHA  " + e).join("\n")); console.error(`\n${errors.length} problema(s).`); process.exit(1); }
console.log(`CV para máquinas OK: ${Object.keys(files).filter((f) => f.endsWith(".md")).length} arquivos Markdown, JSON-LD de ${AREAS.length} páginas e llms.txt.`);
