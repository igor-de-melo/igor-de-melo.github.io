# Portfólio de Igor de Melo
Site estático (GitHub Pages, repositório de usuário). Sem build, sem framework. Plano completo em PLANO.md.

## Regras
- Todo conteúdo existe em PT (lang="pt-BR"), EN (lang="en") e FR (lang="fr"), sempre editado nas três juntas.
- Caminhos relativos em tudo (o site também é aberto via file:// e servidor local).
- Inglês americano em tudo (optimization, modeling, program, color). Decisão de out. 2026. Francês com espaço inseparável antes de ":" e apóstrofo tipográfico.
- Nunca inventar informação sobre o Igor. Se faltar dado, perguntar.
- Respeitar prefers-reduced-motion e manter foco visível por teclado.
- Estrutura alvo: / (porta de entrada), /aero/, /data/, /it-security/ (noindex até ter conteúdo), /assets/, /tests/, /tools/.
- Testes: node tests/check-parity.mjs (PT/EN/FR), node tests/check-maze.mjs (Q-learning), node tests/check-malware.mjs (SIR), node tests/check-links.mjs [--external] (links). Rodam no GitHub Actions a cada push (.github/workflows/checks.yml).
- Esqueleto das páginas: Abertura → Sobre → Experiência → Projetos → Formação → Competências → Contato (+ Pesquisa em Aero, + Estudos e laboratórios em TI e Cibersegurança).
- Simulações: cada uma é um `<figure class="tunnel sim-panel" data-sim="id" data-label-pt-br/en/fr>` dentro de `<div class="sims" data-sims>`; `assets/sims.js` cria as abas quando há mais de uma.
- Cor por área: `body[data-area]` e token `--accent` em `assets/style.css` (bloco P5). Modo escuro: `:root[data-theme="dark"]` e `prefers-color-scheme`; todo novo componente usa só variáveis (nunca cor fixa). Canvas leem cores com getComputedStyle(canvas) e escutam `sitethemechange`.
- A Home é gerada de `index.template.html` + `node tools/gen-card-art.mjs` (substituir `<!--ART_AERO|DATA|IT_SECURITY-->`).

## Commits
Conventional Commits em inglês, imperativo, assunto ≤ 72 caracteres:
`<type>(<scope>): <summary>` + corpo explicando o quê e por quê + rodapé `Refs: P<n>` (pacote do PLANO.md) ou `Refs: R<n>` (pacote de docs/redesign-spec.md).
Tipos: feat, fix, content, style, refactor, perf, test, docs, build, chore, revert.
Escopos deste repo: site, home, aero, data, it-security, i18n, sims, assets, tests, tools, plan.
Sempre sugerir a mensagem ao final de cada alteração; nunca commitar sem o Igor pedir.

## UI/UX skills

Taste, a11y, bans, voice, and icon library for this project live in `.ux-profile.md`.
Run `setup-ui-ux-skills` again only to change those defaults.
Before UI or microcopy work, read `.ux-profile.md`, then the matching domain skill (page-patterns, viewports, forms, surfaces, loaders, empty-states, copy, motion).
Before creating a new page, read `page-patterns` and name the pattern. Do not write page markup until the pattern is named.
Layouts must pass `viewports` at 375px and 1280px.
Before finishing UI, run `ux-audit`.
