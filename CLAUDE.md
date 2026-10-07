# Portfólio de Igor de Melo
Site estático (GitHub Pages, repositório de usuário). Sem build, sem framework. Plano completo em PLANO.md.

## Regras
- Todo conteúdo existe em PT (lang="pt-BR"), EN (lang="en") e FR (lang="fr"), sempre editado nas três juntas.
- Caminhos relativos em tudo (o site também é aberto via file:// e servidor local).
- Inglês americano em tudo (optimization, modeling, program, color). Decisão de out. 2026. Francês com espaço inseparável antes de ":" e apóstrofo tipográfico.
- Nunca inventar informação sobre o Igor. Se faltar dado, perguntar.
- Respeitar prefers-reduced-motion e manter foco visível por teclado.
- Estrutura alvo: / (porta de entrada), /aero/, /data/, /it-security/ (noindex até ter conteúdo), /assets/, /tests/, /tools/.
- Testes: node tests/check-parity.mjs (PT/EN/FR e início por `<!doctype html>`), node tests/check-maze.mjs (Q-learning), node tests/check-malware.mjs (SIR), node tests/check-links.mjs [--external] (links). Rodam no GitHub Actions a cada push (.github/workflows/checks.yml).
- Esqueleto das páginas: Abertura → Sobre → Experiência → Projetos → Formação → Competências → Contato (+ Pesquisa em Aero, + Estudos e laboratórios em TI e Cibersegurança).
- Simulações: cada uma é um `<figure class="tunnel sim-panel" data-sim="id" data-label-pt-br/en/fr>` dentro de `<div class="sims" data-sims>`; `assets/sims.js` cria as abas quando há mais de uma.
- Tokens por área: `body[data-area]` em `assets/style.css` (bloco "R1 — Tokens por área": `--bg`, `--surface`, `--raise`, `--line`, `--ink`, `--ink2`, `--accent`, fontes `--display`/`--text`/`--mono`). Tema ativo sempre em `<html data-theme="light|dark">` (script no `<head>`; `/it-security/` é só escuro, sem botão); todo novo componente usa só variáveis (nunca cor fixa).
- Páginas de área: barra superior, trilho com a régua de seções e, no celular, barra do título com menu e régua de progresso. Scroll-spy, menu e animação de entrada ficam em `assets/site.js`. Canvas leem cores com getComputedStyle(canvas) e escutam `sitethemechange`.
- Aero: imagens em `assets/img/`, PDFs em `assets/docs/`. Item com figura usa `.media-item` + `.media-item__fig`: a figura flutua e o texto a contorna, por isso o texto não pode ficar numa grade única.
- Dados: em código, os valores de texto são trilíngues e os nomes de função, campo e variável ficam em inglês nas três línguas. Nas células de currículo (`pre.cell-in--cv`) o texto real é o destaque e a sintaxe fica em `--code-faint`.
- TI e Ciber: só tema escuro. Prompts e comandos são decorativos (`aria-hidden`) e ficam em inglês nas três línguas, assim como títulos de painel, rótulos (`role:`, `where:`) e a barra tmux.
- Home: `index.html` e `index.template.html` são iguais e editados juntos. Animações da cadeia só com transform/opacity; colormap viridis.
- Tipografia: todo font-size usa os tokens `--fs-*` e `--lh-*` (exceções: hero da Home e desenhos em SVG, dump hexadecimal e retrato ASCII).

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
