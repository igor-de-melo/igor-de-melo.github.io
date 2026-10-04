# Redesign v2 do portfólio: especificação para implementação (Claude Code)

Atualizado em 4 out. 2026 (inclui a renomeação das áreas). Leia junto com `claude/site-handoff.md`, `CLAUDE.md` e `PLANO.md` do repositório.
Fonte visual: artifact de design **"Portfólio M1 · Arquitetura"** (pranchas citadas pelo código, ex.: `C1`, `N3`, `CY9`, `H1`).
Os mockups são a referência de aparência, **não** o código final: no site tudo é fluxo normal de CSS (grid/flex), sem
posições absolutas, sem larguras fixas de prancha.

## 0. Divisão do trabalho
| Onde | O quê |
|---|---|
| Claude Code (repositório) | Todos os pacotes abaixo: HTML/CSS/JS, imagens otimizadas, testes, commits. |
| Chat (Claude) | Decidir conteúdo pendente (seção 9), revisar capturas de tela de cada pacote, textos EN/FR. |

Regra: um pacote por vez, Igor aprova antes do próximo. Rodar os testes antes de cada push. Nunca commitar sem o Igor pedir.

## 0.1 Renomeação das áreas (pacote R0, antes de tudo)
| Antes | Depois (PT) | EN (proposta) | FR (proposta) | Pasta |
|---|---|---|---|---|
| Engenharia Aeronáutica | Engenharia Aeronáutica | Aeronautical Engineering | Ingénierie aéronautique | `/aero/` (sem mudança) |
| TI e Dados | **Ciência de Dados** | Data Science | Science des données | `/ti/` → **`/data/`** |
| Cibersegurança | **TI e Cibersegurança** | IT & Cybersecurity | Informatique et cybersécurité | `/cyber/` → **`/it-security/`** |

- Barra de áreas no desktop: `Engenharia Aeronáutica | Ciência de Dados | TI e Cibersegurança`.
- Barra de áreas no celular (rótulos curtos, cabem em 375 px): PT `Aeronáutica | Dados | TI e Ciber`; EN `Aeronautics | Data | IT & Cyber`; FR `Aéronautique | Données | Info et cyber` (propostas EN/FR a confirmar).
- Títulos das páginas: `Ciência de Dados` (antes "Análise e Engenharia de Dados") e `TI e Cibersegurança`.
- Detalhes do terminal: `cd it-security`, painel `[ it-security ]`, barra tmux `it-security` (celular `it-sec`); célula da Home `entrar("ciencia_de_dados")`.
- Mover pastas com `git mv` (preserva o histórico): `ti/` → `data/`, `cyber/` → `it-security/`. Atualizar **todas** as referências: links da barra e dos cartões, `hreflang`, `canonical`, `og:url`, JSON-LD, `sitemap.xml`, `robots.txt`, testes (`check-links`, `check-parity`), `tools/gen-card-art.mjs`, `index.template.html`, classes/variáveis CSS com o nome da área (ex.: `area-ti` → `area-data`), `CLAUDE.md`, `PLANO.md`, README.
- **Sem redirecionamentos**: o site ainda não foi divulgado (ninguém tem links para `/ti/` ou `/cyber/`), então as pastas antigas são simplesmente removidas. Se algum endereço antigo aparecer no Google, ele sai do índice sozinho com o 404.
- `/it-security/` continua `noindex` e fora do sitemap até ter conteúdo próprio (seção 9 do handoff).
- Commit sugerido: `refactor(site)!: rename data and it-security areas and move their routes` com rodapé `BREAKING CHANGE: /ti/ and /cyber/ were moved to /data/ and /it-security/ without redirects` e `Refs: R0`.

## 1. Arquitetura comum (todas as áreas)
- **Barra superior** (52 px, borda inferior `--line`): `Início` à esquerda; ao centro as três áreas separadas por traço vertical; área atual marcada com `aria-current="page"` (estilo próprio de cada área).
- **Trilho esquerdo fixo** (`position: sticky`, largura 312 px, padding `40px 24px 32px 56px`): nome em 2 linhas; bloco **"Nesta página"** com a régua de seções (itens de 44 px); no rodapé do trilho, sempre: botão **Baixar currículo (PDF)** (232 × 44), seletor **PT/EN/FR** (44 × 36) e, em Aero e Ciência de Dados, botão de tema.
- **Conteúdo**: `padding: 40px 72px 64px 32px`; títulos de seção com contador à direita ("4 projetos", "5 grupos").
- **Ordem das seções**: Sobre → Experiência → Projetos → (Pesquisa, só Aero) → (Estudos e laboratórios, só TI e Ciber) → Formação → Competências → Contato.
- **Animação de entrada**: blocos sobem 28 px com fade (0,8 s, `cubic-bezier(.2,.7,.2,1)`), atraso escalonado. Tudo desligado com `prefers-reduced-motion`.
- **Foco visível** em todos os links e botões (`outline: 2px solid var(--accent); outline-offset: 3px`).

### 1.1 Régua de seções (scroll-spy)
- Linha vertical de 1 px; o progresso acompanha a seção atual (IntersectionObserver).
- **Aero**: o avião (22 px, nariz para baixo, sem círculo) desce pela linha e deixa um **rastro tracejado** (`repeating-linear-gradient(180deg, accent 0 4px, transparent 4px 8px)`), igual à prancha R1. Sem marcas horizontais.
- **Ciência de Dados**: opção B da R1 (barra de destaque no item atual).
- **TI e Cibersegurança**: opção A da R1 (barra verde de 2 px no item atual, item em negrito).

### 1.2 Celular (≤ 760 px), validado em 375 e 390 px
- **Barra de áreas única em todas as páginas** (pranchas C9, N7, CY7, H2): ícone de casa 40 × 44 com `aria-label="Início"` + `Aeronáutica | Dados | TI e Ciber`, fonte 13 px (12 px mono em TI e Ciber), padding lateral 6 px, `white-space: nowrap`. Cabe em 375 px sem rolagem.
- Linha do título da seção atual (52 px) com botão ☰ de 44 × 44, que abre o menu (pranchas C10, N8, CY8) com régua, currículo, idiomas e tema.
- Régua horizontal de progresso de 10 px abaixo do título.
- Margem lateral de 16 px; nenhum elemento encosta na borda; nenhum scroll horizontal.

## 2. Tokens por área
Cores só por variáveis CSS. A classe do tema fica no `<html>` (`data-theme`).

### Aero "Céu" (`/aero/`), tema claro = dia, escuro = noite
```css
.t-dia  { --bg:#EAF2FB; --surface:rgba(255,255,255,.55); --raise:rgba(255,255,255,.7); --line:rgba(11,31,58,.14);
          --ink:#0B1F3A; --ink2:#3A4A62; --accent:#0B5CD6; --glass:rgba(255,255,255,.62); --glass-b:rgba(255,255,255,.8);
          --shadow:0 10px 34px rgba(20,70,150,.14); }
.t-noite{ --bg:#0F1838; --surface:rgba(255,255,255,.05); --raise:rgba(255,255,255,.12); --line:rgba(255,255,255,.16);
          --ink:#EAF0FF; --ink2:#A9B6D6; --accent:#8FB6FF; --glass:rgba(255,255,255,.07); --glass-b:rgba(255,255,255,.15);
          --shadow:0 12px 40px rgba(0,0,0,.35); }
.t-dia .hm { color:#2C3E57 }  /* "Início" sobre o céu: contraste 5:1 */
```
- Fundo: gradiente de céu (dia `#86B3EA → #F3F8FC`; noite `#09112B → #1C2A5C`) + 3 faixas de nuvens/brilhos borrados em deriva lenta (46–66 s) + grão SVG a 6 %. Copiar os valores de `.sky` da prancha C1.
- Cartões: classe `.glass` (vidro com `backdrop-filter: blur(16px) saturate(1.25)`, raio 14 px).
- Fontes: Archivo (títulos, interface, `font-stretch:112%`) e Source Serif 4 (texto).

### Ciência de Dados "Caderno de análise" (`/data/`)
```css
.t-claro { --bg:#EEF3F1; --ink:#1B2A2E; --ink2:#5D6F72; --line:rgba(27,42,46,.13); --chip:rgba(27,42,46,.07);
           --inp:#E3EBE9; --ac:#0F6B63; --str:#2E6A42; --kw:#8E5517; --tag:rgba(15,107,99,.08); }
.t-escuro{ --bg:#0E1719; --ink:#E3EEEC; --ink2:#869A9B; --line:rgba(255,255,255,.12); --chip:rgba(255,255,255,.08);
           --inp:#152225; --ac:#5FCFC0; --str:#8FD3A0; --kw:#E3B170; --tag:rgba(95,207,192,.1); }
```
- `--str` e `--kw` do claro foram escurecidos na revisão (contraste ≥ 5:1 sobre `--inp`).
- Cada item é uma "célula" de notebook: rótulo `In [n]:` na calha, bloco de código Python/SQL com realce, saída em texto serifado.
- Fundo: colormap leve com isolinhas (prancha N1). Fontes: Archivo, Source Serif 4, JetBrains Mono.

### TI e Cibersegurança "Terminal refinado" (`/it-security/`), só tema escuro
```css
.t-escuro{ --bg:#0B0E0D; --ink:#CFE8D5; --ink2:#7E9A87; --line:rgba(92,240,138,.24); --line2:rgba(92,240,138,.58);
           --chip:rgba(92,240,138,.13); --ac:#5CF08A; --am:#F0B45C; --pn:rgba(92,240,138,.035); --on:#0B0E0D; }
```
- Sem botão de tema. Linhas de varredura (scanlines) sobre a página, dump hexadecimal mascarado no fundo (opacidade 7,5 %), barra de status estilo tmux no rodapé (`[igor] 0:sobre* 1:experiencia …`).
- Painéis com moldura e título `[ nome ]` cortando a borda; prompts `igor@seg:~$` com digitação animada (`steps()`).
- Fonte única: JetBrains Mono.

### Home "Cadeia de telemetria" (`/`)
```css
.t-claro { --pa:#2F6FD0; --pb:#1F8A85; --pc:#1B5E6B; --base:#EDF2F5; --hx:#1C8A50; --ink0:#10233B; --nb:#EEF3F1;
           --gl:rgba(255,255,255,.55); --glb:rgba(255,255,255,.8); --gs:0 10px 34px rgba(20,70,150,.14); }
.t-escuro{ --pa:#6FA6F5; --pb:#5FCFC0; --pc:#7FD4C8; --base:#0C1418; --hx:#5CF08A;
           --gl:rgba(255,255,255,.07); --glb:rgba(255,255,255,.15); --gs:0 12px 40px rgba(0,0,0,.35); }
```
- Fundo liso (`--base`), sem data bus, sem avião.
- Hero **centralizado**: rótulo em caixa alta (Archivo 12,5 px, `letter-spacing:.14em`), nome em **Newsreader 500, 64 px**, descrição Newsreader 21 px com `max-width:1080px` (2 linhas).
- Cadeia de sinal da esquerda para a direita: nó Aero (avião) → onda senoidal → nó Dados (grade) → barras de colormap → bytes hex → nó TI e Ciber (`>_`). Um pacote percorre a cadeia (azul → verde-água → verde).
- Três cartões do **mesmo tamanho** (208 px no desktop, 196 px no celular), cada um com a identidade da área: Aero em vidro com texto; Dados como célula `In [1]:`; TI e Ciber como terminal sólido `#0B0E0D`.
- Celular: hero alinhado à esquerda, nome 40 px; cadeia vertical à esquerda dos cartões, sem trilhas entre cartões.

## 3. Componentes
| Componente | Onde | Notas |
|---|---|---|
| Linha do tempo | Experiência e Formação (todas as áreas) | Data à esquerda, ponto cheio = atual, vazado = passado |
| Cartão de projeto | Projetos | Problema, Abordagem, Resultado, Stack; galeria de 3 miniaturas com contador (Aero) |
| Abas de simulação | Aero (Joukowski), Dados (Q-learning), TI e Ciber (malware SIR) | Reaproveitar `assets/sims.js`, `flow.js`, `maze.js`, `malware.js`; cores via `getComputedStyle`, ouvir `sitethemechange` |
| Tags/stack | Projetos, Experiência | Aero: pílulas; Dados: `code`; TI e Ciber: `[ Python ]` |
| Retrato | Aero e Dados: foto em vidro/moldura; TI e Ciber: ver 3.1 | `alt="Retrato de Igor Augusto de Melo"` |

### 3.1 Retrato em TI e Cibersegurança (pranchas CY1 e CY9)
- Desktop: à direita de título + `whoami` + `contato` (coluna de 288 px). Celular: entre o título e o `whoami`, 200 px de largura.
- Modo escolhido: **decodificar**. O retrato abre em ASCII e é "descriptografado" de cima para baixo até virar a foto em verde (duotone `#0B0E0D → #5CF08A`) com scanlines. Ao passar o mouse, volta a ASCII. Com movimento reduzido, mostra só a foto.
- Gerar os arquivos com o script `tools/gen-cyber-portrait.py` (criar a partir do trecho abaixo). Saída: `assets/img/cyber-portrait.webp` (2×, ~16 KB) e `cyber-portrait.txt` (ASCII 89 × 63).
```python
# recorte (110,40,450,476) de me-portrait.jpg; fundo branco removido por flood fill a partir das bordas
from PIL import Image, ImageFilter, ImageOps; import numpy as np; from scipy import ndimage
src = Image.open('me-portrait.jpg').convert('L').crop((110,40,450,476)); W,H = 246,316
im = src.resize((W*2,H*2), Image.LANCZOS)
a = np.asarray(im.filter(ImageFilter.GaussianBlur(1.2))) > 215
lab,_ = ndimage.label(a); edge = set(np.unique(np.r_[lab[0], lab[:,0], lab[:,-1]])) - {0}
bg = ndimage.gaussian_filter(ndimage.binary_dilation(np.isin(lab, list(edge)), iterations=4).astype(float), 1.2)
v = (np.asarray(ImageOps.autocontrast(im, cutoff=1))/255.)**1.1
G, D = np.array([92,240,138])/255., np.array([11,14,13])/255.
rgba = np.dstack([D*(1-v[...,None]) + G*v[...,None], 1-bg])
Image.fromarray((rgba.clip(0,1)*255).astype('uint8'), 'RGBA').save('cyber-portrait.webp', quality=78, method=6)
```

## 4. Acessibilidade (achados da revisão M6, já corrigidos nos mockups)
- Contraste: `--ink2` do Aero dia mudou de `#44566F` para `#3A4A62`; "Início" sobre o céu usa `#2C3E57`; `--kw`/`--str` do Dados claro escurecidos. Meta: texto ≥ 4,5:1, texto grande ≥ 3:1.
- Alvos de toque no celular: casa 40 × 44, áreas 32 px de altura, ☰ 44 × 44, idiomas 48 × 44. Links dentro de parágrafos ficam como estão (exceção do WCAG 2.5.8).
- Todo texto visível no celular com fonte ≥ 12 px (a barra do terminal estava em 10,5 px).
- `lang` por idioma, `aria-current` em área e seção, `aria-pressed` nos idiomas, `aria-expanded` no ☰, e o retrato ASCII com `aria-hidden` (o rótulo fica no contêiner).

## 5. Pacotes de implementação (um por vez)
| # | Pacote | Entregas | Commit sugerido |
|---|---|---|---|
| R0 | Renomeação | Seção 0.1: pastas, referências, testes | `refactor(site)!: rename data and it-security areas and move their routes` |
| R1 | Base global | Tokens por área, `data-theme`, barra superior, trilho fixo, régua (scroll-spy) com as 3 variantes, barra de áreas e menu do celular, animação de entrada | `feat(layout): add shared shell with sticky rail and section ruler` |
| R2 | Aero "Céu" | Fundo de céu dia/noite, vidro, cartões de projeto com galeria, régua com avião | `feat(aero): apply sky theme with glass cards and plane ruler` |
| R3 | Dados "Caderno" | Células `In [n]:`, realce de código, fundo colormap, abas de simulação | `feat(data): apply notebook theme to all sections` |
| R4 | TI e Ciber "Terminal" | Painéis, prompts, scanlines, barra tmux, retrato decodificar, malware SIR | `feat(it-security): apply refined terminal theme and ascii portrait` |
| R5 | Home "Telemetria" | Hero centralizado, cadeia de sinal animada, três cartões iguais, versão celular | `feat(home): add telemetry chain landing` |
| R6 | Imagens e desempenho | WebP com `srcset`, EXIF removido, PDFs comprimidos e reunidos numa só pasta de documentos (`assets/docs/`: CV, artigo EPTT 2024, slides), `og:image` por página, fontes com `display=swap` e subset | `perf(assets): optimize images, pdfs and fonts` |
| R7 | Verificação final | 375/768/1280 px nos dois temas, teclado, leitor de tela, Lighthouse ≥ 90, `check-parity`/`check-links`/`check-maze`/`check-malware` | `test(site): verify layout, a11y and parity across areas` |

Cada commit termina com `Refs: R<n>`. Antes de cada push:
`node tests/check-parity.mjs && node tests/check-links.mjs && node tests/check-maze.mjs && node tests/check-malware.mjs`.

## 6. Textos
- Todo texto novo em PT, EN (americano) e FR (com `&nbsp;` antes de `:` e `;`). O PT dos mockups é a referência; o EN e o FR saem do chat para revisão do Igor.
- Nunca inventar informação. Abas de simulações ainda sem nome ficam como **Simulação 2** e **Simulação 3** (EN "Simulation 2", FR "Simulation 2"; no caderno de Dados, `simulacao_2()`), até o Igor definir os nomes.

## 7. Segurança e limpeza (depois do R7)
- CV publicado sem telefone; reescrever o histórico do Git que contém o PDF antigo e limpar o cache do GitHub Pages.
- Alteração de permissões em `.github/workflows/checks.yml`: commitar só quando o Igor pedir.
- Reescrever `.ux-profile.md` com as decisões finais deste documento.

## 8. Pranchas de referência
| Área | Desktop | Celular |
|---|---|---|
| Aero | C1/C2 (abertura dia/noite), C3, C5, C6, C7, C8 | C9, C10 (menu) |
| Ciência de Dados | N1–N6 | N7, N8 (menu) |
| TI e Cibersegurança | CY1–CY6 | CY7, CY8 (menu), CY9 (Sobre com retrato) |
| Home | H1 | H2 |
| Réguas | R1 | — |

## 9. Pendências de conteúdo (decidir no chat antes do pacote correspondente)
- Nomes das simulações 2 e 3 (por enquanto "Simulação 2/3").
- Confirmar os nomes EN/FR das áreas e os rótulos curtos do celular (seção 0.1).
- Entrada da Keep Flying em `aero/index.html` nos três idiomas (já aparece na prancha C5).
- Imagens reais dos projetos (VANT, LASC, CFD) já otimizadas em WebP.
