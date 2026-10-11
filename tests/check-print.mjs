// Verifica a impressão (A4, pelo mesmo motor de PDF do Chromium). Uso: node tests/check-print.mjs
// A folha usa sempre o layout do Simplificado, qualquer que seja a visão na tela: para cada página de área, nas três
// línguas e partindo das duas visões, conta as páginas do PDF e confere o limite (Aero e Dados até 4, TI e Ciber até 3);
// partindo do Temático, confere que o número de páginas é o mesmo do Simplificado e que a tela volta ao Temático depois.
// A Home sai em uma página.
import { hasBrowser, withBrowser } from "./lib/cdp.mjs";

const LIMIT = { "aero/index.html": 4, "data/index.html": 4, "it-security/index.html": 3, "index.html": 1 };
const errors = [];
const fail = (msg) => errors.push(msg);
const rows = [];
let checks = 0;

if (!hasBrowser) { console.log("AVISO  sem Chrome/Chromium (ou sem WebSocket no Node): a impressão não foi verificada. Defina CHROME_PATH."); process.exit(0); }
try {
  await withBrowser("check-print", async ({ send, evalJs, open }) => {
    const pdfPages = async () => {
      const r = await send("Page.printToPDF", { preferCSSPageSize: true, paperWidth: 8.27, paperHeight: 11.69, printBackground: true });
      return (Buffer.from(r.data, "base64").toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
    };
    for (const [f, limit] of Object.entries(LIMIT)) for (const lang of ["pt-BR", "en", "fr"]) {
      const n = {};
      for (const view of f === "index.html" ? ["themed"] : ["simple", "themed"]) {
        await open(f, `?lang=${lang}&view=${view}`, 1280);
        n[view] = await pdfPages(); checks++;
        const at = `${f} (${lang}, a partir do ${view === "simple" ? "Simplificado" : "Temático"})`;
        if (!n[view]) fail(`${at}: o PDF saiu sem páginas`);
        if (n[view] > limit) fail(`${at}: ${n[view]} páginas impressas, limite ${limit}`);
        const after = await evalJs("document.documentElement.dataset.view");
        if (after !== view) fail(`${at}: depois de imprimir a tela ficou em "${after}"`);
      }
      if (n.simple && n.themed !== n.simple) fail(`${f} (${lang}): ${n.themed} páginas a partir do Temático e ${n.simple} a partir do Simplificado; a folha deveria ser a mesma`);
      rows.push(`${f} ${lang}: ${n.themed}/${limit}`);
    }
  });
} catch (e) { fail("navegador: " + e.message); }

if (errors.length) { console.error(errors.map((e) => "FALHA  " + e).join("\n")); console.error(`\n${errors.length} problema(s).`); process.exit(1); }
console.log(`Impressão OK (${checks} PDFs; páginas/limite): ${rows.join("; ")}.`);
