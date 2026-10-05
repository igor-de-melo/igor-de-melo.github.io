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
- Tokens por área: `body[data-area]` em `assets/style.css` (bloco "R1 — Tokens por área": `--bg`, `--surface`, `--raise`, `--line`, `--ink`, `--ink2`, `--accent`, fontes `--display`/`--text`/`--mono`). Tema ativo sempre em `<html data-theme="light|dark">` (script no `<head>`; `/it-security/` é só escuro, sem botão); todo novo componente usa só variáveis (nunca cor fixa).
- Estrutura das páginas de área (R1): `header.topbar` (Início + três áreas + `div.top-tools` com idiomas e tema), `div.now` (celular: título da seção, `div.now-tools` com o tema, ☰, progresso), `div.shell` > `aside.rail#trilho` (nome, `nav.ruler`, currículo e, só no celular, idiomas em `.rail-lang`) + `div.content`. Scroll-spy, menu e animação de entrada ficam em `assets/site.js`. Canvas leem cores com getComputedStyle(canvas) e escutam `sitethemechange`.
- Aero (R2, "Céu"): `div.sky` fixo atrás do conteúdo, cartões `.glass`, títulos de seção em `header.sec-h` com contador `p.sec-n[data-count]` (número calculado em `assets/site.js`), galeria `figure.gallery[data-gallery]` + `dialog.lightbox` (`assets/gallery.js`), pesquisa em `article.research`. Imagens em `assets/img/`, PDFs em `assets/docs/`.
- Dados (R3, "Caderno"): mapas de contorno `div.fx` (SVG inline) fixos atrás do conteúdo; cada item é uma `div.cell` (rótulo `In [n]:` por contador CSS, `pre.cell-in` com realce `.fn/.k/.s/.cm/.kw/.nu`, `div.cell-out`). Em código, os valores de texto são trilíngues e os nomes de função, campo e variável ficam em inglês nas três línguas (`experience(role=, where=)`). Variantes: `.cell--tl` (linha do tempo), `.cell--proj`, `.cell--skill`, `.cell--sim`.
- TI e Ciber (R4, "Terminal"): `pre.hx` (dump hexadecimal) fixos atrás do conteúdo, scanlines em `body::after`, barra tmux `div.sb` (seção atual marcada por `assets/site.js`), blocos `div.blk` = prompt `p.pm` (decorativo, `aria-hidden`, em inglês nas três línguas, assim como títulos de painel, rótulos `role:`/`where:` e a barra tmux) + painel `div.pn` com título `p.pn-t`; `div.tl` para os `git log`; retrato `figure.ph` (ASCII `pre.asc` + `img.crt` de `assets/img/cyber-portrait.*`).
- Home (R5, "Telemetria"): `index.html` e `index.template.html` são iguais e editados juntos. Hero em Newsreader, cadeia `div.chain` com três `div.stage` (nó SVG + `article.hcard--aero|data|it-security`) e a faixa decorativa `svg.chain-sig` (animações só com transform/opacity, em laços periódicos; colormap viridis); rodapé `footer.home-foot` com currículo e ©. Contato por ícones (`a.ic-link`) na Home e no fim de Aero e Dados.

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
