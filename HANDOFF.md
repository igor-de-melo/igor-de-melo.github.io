# Handoff: onde estamos (2 out. 2026)

Leia junto com `CLAUDE.md` (regras) e `PLANO.md` (plano completo e decisões). Este arquivo é o ponto de partida
para continuar o trabalho no Claude Code.

## Estado
- Site publicado em https://igor-de-melo.github.io/ (GitHub Pages, repositório `igor-de-melo/igor-de-melo.github.io`).
- Último commit: `4d55cef style(site): add area colors, dark mode and visual components` (P5).
- Revisão de estrutura P1–P5 **concluída**. Fases 0–3 do plano concluídas.
- Pendência local: `assets/favicon.svg`, `robots.txt` e `sitemap.xml` aparecem como modificados, mas a diferença
  é só quebra de linha (CRLF/LF). Resolver com `git checkout -- assets/favicon.svg robots.txt sitemap.xml` ou
  criando `.gitattributes` com `* text=auto eol=lf`.

## Estrutura
| Caminho | Conteúdo |
|---|---|
| `/` (`index.html`) | Home: nome, contato e três cartões. Gerada de `index.template.html` + `node tools/gen-card-art.mjs` |
| `/aero/` | Engenharia Aeronáutica. Simulação: escoamento em aerofólio de Joukowski (`assets/flow.js`) |
| `/ti/` | Análise e Engenharia de Dados. Simulação: Q-learning num labirinto (`assets/maze.js`) |
| `/cyber/` | Cibersegurança (em formação), `noindex`, fora do sitemap. Simulação: malware SIR (`assets/malware.js`) |
| `assets/site.js` | Idioma (PT/EN/FR), tema claro/escuro, menu de seções no celular, seções surgindo ao rolar |
| `assets/sims.js` | Abas para várias simulações por página (uma visível por vez) |
| `assets/style.css` | Estilos; bloco "P5" no fim concentra cores por área, modo escuro e componentes |
| `tests/` | `check-parity`, `check-links`, `check-maze`, `check-malware` (rodam no GitHub Actions) |
| `tools/` | `gen-card-art.mjs` (artes da Home), `to-american.py` (inglês britânico → americano) |

Esqueleto de cada página: Abertura → Sobre → Experiência → Projetos → Formação → Competências → Contato
(+ Pesquisa em Aero; + Estudos e laboratórios em Cibersegurança).

## Convenções (resumo; detalhes no CLAUDE.md)
- Todo texto em PT, EN e FR juntos. Inglês americano. Francês com `&nbsp;` antes de `:` e `;`.
- Nunca inventar informação sobre o Igor.
- Cores só por variáveis CSS; `--accent` por área. Canvas leem cores de `getComputedStyle(canvas)` e escutam `sitethemechange`.
- Respeitar `prefers-reduced-motion` e foco visível.
- Commits: Conventional Commits em inglês, `Refs: P<n>` ou `Refs: F<n>` (fase). Nunca commitar sem o Igor pedir.
- Antes de cada push: `node tests/check-parity.mjs && node tests/check-links.mjs && node tests/check-maze.mjs && node tests/check-malware.mjs`.

## Verificações sugeridas agora (Claude Code)
1. Live Server: testar botão de tema, menu ☰ (janela estreita), abas e as três simulações nos dois temas.
2. Chrome DevTools → Lighthouse (Accessibility, Performance, SEO) nas 4 páginas; corrigir notas abaixo de 90.
3. Google Rich Results Test na URL publicada, para validar o JSON-LD `Person`.
4. Adicionar `node tests/check-malware.mjs` ao `.github/workflows/checks.yml`, se ainda não estiver.

## Próximos passos (ordem recomendada)
1. **Fase 4 — Publicar evidência no GitHub** (a mais importante: o perfil ainda está vazio)
   - Repositório do bot de triagem de e-mails (sem credenciais; `.env.example`, README em inglês).
   - Repositório do motor de busca e classificação de vagas, em versão sem dados pessoais.
   - Depois: trocar os parágrafos `repo-soon` (marcados com `<!-- REPO: ... -->` em `ti/index.html`) pelos links.
2. **Fase 5 — CV de TI, Dados e Cibersegurança** (separado do CV de engenharia); destrava o botão de CV por área (melhoria E).
3. **Fase 6 — Certificados**: preencher os espaços tracejados (`.slot`) de `/cyber/` e a lista de certificados;
   quando houver conteúdo, tirar o `noindex` e incluir `/cyber/` no `sitemap.xml`.
4. **Fase 7 — Imagens e prévia de link**: `og:image` por página (melhoria H).

## Pontos em aberto para o Igor
- Resultados concretos que faltam nos projetos: status atual do VANT e resultado do foguete de 5 km (linha "Resultado" omitida por falta de dado).
- Texto do ICMC na página Aero ainda é mais forte que o CV corrigido; alinhar se quiser.
- CV (PDF) ainda em inglês britânico; ajustar para americano quando revisar.
