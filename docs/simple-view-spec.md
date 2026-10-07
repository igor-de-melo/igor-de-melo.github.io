# Modo Simplificado: CV online (especificação)

Complementa `docs/redesign-spec.md`. Valem as regras do `CLAUDE.md` (três línguas juntas, nunca inventar fato, inglês americano, francês com espaço inseparável). Data: 7 out. 2026.

## 1. Objetivo e público
- O Simplificado é o **CV online** do Igor: leitura direta, sem tema, sem decoração.
- Leitores: (a) recrutadores humanos, que querem achar cargo, período, ferramenta e contato em segundos; (b) recrutadores e triagens por IA (ATS, assistentes e rastreadores), que leem o HTML ou um texto extraído dele.
- Princípio: **o mesmo texto visível para todos**. Nada de texto escondido, instruções para IA ou palavras-chave fora de contexto. O que a IA lê é o que o humano lê.

## 2. Decisões já tomadas
| Tema | Decisão |
|---|---|
| Mecanismo | mesmas páginas, com visão alternativa (`data-view` no `<html>`) |
| Visão inicial | Temático |
| Imagens no Simplificado | foto do Igor, fotos de projeto e slides |
| Impressão | o Simplificado sai limpo ao imprimir ou salvar em PDF |
| Tema claro/escuro e idioma | continuam valendo nos dois modos |
| Home | **sempre Temático**; não tem visão Simplificada. Cada cartão de área ganha, logo abaixo, um botão "Ver versão simplificada" que abre a área já no Simplificado (`?view=simple`); o cartão abre a área no Temático (`?view=themed`) |
| Rótulos | PT Simplificado / Temático · EN Simple / Themed · FR Simplifié / Thématique |

## 3. Mecanismo
- Atributo `<html data-view="simple|themed">`. Prioridade: parâmetro de URL `?view=simple` > `localStorage` (`view`) > `themed`.
- Script inline no `<head>` (como o do tema) aplica o atributo antes da primeira pintura, sem piscar.
- O botão atualiza a URL com `history.replaceState` (mantendo `?lang=` e o `#` da seção atual), para que copiar o endereço compartilhe a visão.
- Links internos entre as páginas mantêm a visão (via `localStorage` e, quando a URL tinha o parâmetro, via parâmetro).
- Ao trocar de visão, a página não recarrega: a seção em que o leitor está continua visível (`scrollIntoView` da seção atual depois do reflow).
- No Simplificado, o JS temático fica inativo: sem scroll-spy animado, sem régua, sem animação da Home, sem simulações, sem retrato ASCII.
- Sem JavaScript, a página fica no Temático (comportamento atual). Por isso há também a camada para máquinas (seção 8), que não depende de JavaScript.

## 4. Controles
- **Desktop:** seletor de dois botões (`role="group"`, `aria-label` "Visualização"), logo depois do botão Home, com um separador fino. Idioma e tema ficam à direita.
- **Celular (≤ 760 px):** botão compacto de troca no canto superior direito, ao lado do menu. Ícone de linhas de texto para Simplificado e ícone de paleta para Temático. Rótulo acessível completo.
- **Menu dropdown:** grupo "Visualização" com as duas opções (padrão do grupo "Páginas"), abaixo de "Páginas".
- Acessibilidade: `aria-pressed`, foco visível, alvo de toque ≥ 44 px, anúncio da troca em região `aria-live="polite"`, sem animação ao trocar.

## 5. Layout do CV (Simplificado)
- Uma coluna, `max-width: 46rem` (~70 caracteres por linha), alinhada à esquerda, sem texto justificado.
- Fonte única: Archivo. Escala existente: nome `--fs-h2`, seção `--fs-h3` em peso 700 com filete superior, título de item `--fs-body` em peso 700, texto `--fs-body`, metadados `--fs-small`. Sem monoespaçada (exceto trechos de código, que ficam ocultos).
- Cores neutras: texto #111 sobre #FFF (claro) e #E8E8E8 sobre #111 (escuro), um só tom de link com contraste ≥ 4,5:1 e links sublinhados. Sem gradiente, vidro, sombra ou ícone decorativo.
- Os tokens por área (`body[data-area]`) são ignorados nesta visão: as quatro páginas têm a mesma aparência.
- Barra superior mínima: Home, as três áreas, idioma, tema, seletor de visão. Abaixo do cabeçalho, uma lista simples "Nesta página" com âncoras (sem scroll-spy).
- Espaçamento em múltiplos de 4/8 px; itens separados por margem, não por caixas.

## 6. Estrutura de cada página
Cada área é um **CV direcionado**; a Home é o resumo.

**Cabeçalho (todas):** h1 com o nome; linha de título (ex.: "Estudante de Engenharia Aeronáutica, EESC-USP"); local; linha "Disponível para vagas júnior em …"; contatos escritos por extenso (e-mail, LinkedIn, GitHub, botão do currículo em PDF); foto pequena (≈ 96×120, 4:5) com `alt` descritivo.

**Home:** não tem versão Simplificada (sempre Temático, mesmo com `?view=simple` ou preferência salva). O seletor de visão não aparece na Home, nem no menu do celular. Abaixo de cada cartão de área há o botão "Ver versão simplificada" (PT) / "View simple version" (EN) / "Voir la version simplifiée" (FR), com `aria-label` que inclui o nome da área.

**Aero, Dados e TI e Ciber (ordem fixa):**
1. Resumo (3 a 4 linhas)
2. Competências (grupos em lista corrida, termos canônicos)
3. Experiência
4. Projetos
5. Pesquisa e publicações
6. Formação
7. Cursos e certificados
8. Idiomas
9. Contato

Seções vazias na área (ex.: TI e Ciber ainda sem certificados) não aparecem no Simplificado.

**Item (experiência, projeto, pesquisa):**
```
<h3> Cargo — Organização </h3>
<p class="meta"> Local, se houver · <time datetime="2024-12">dez. 2024</time> – <time datetime="2025-03">mar. 2025</time> </p>
<p> Uma linha de contexto (o quê e para quem). </p>
<ul> 2 a 4 tópicos, cada um: verbo + o que + ferramenta/método + resultado verdadeiro </ul>
<p class="stack"> Stack: … </p>
```
- Cada item é autocontido: repete a organização e o período, porque a IA pode ler trechos soltos.
- Slides, artigo e fotos do item aparecem logo após o texto: foto e miniaturas pequenas (altura ≤ 160 px), legenda curta, link de texto para o PDF ou slides.

## 7. Redação para humanos e IA
- Títulos padrão que os parsers reconhecem: PT Experiência, Projetos, Pesquisa e publicações, Formação, Competências, Cursos e certificados, Idiomas, Contato (e equivalentes EN Experience, Projects, Research and publications, Education, Skills, Courses and certificates, Languages, Contact; FR Expérience, Projets, Recherche et publications, Formation, Compétences, Cours et certificats, Langues, Contact).
- Primeiras duas linhas da página: quem é, em que área, o que oferece e disponibilidade. É o trecho que mais pesa em triagens.
- Termos canônicos para ferramentas e métodos (MATLAB, Python, SQL, ANSYS CFX, CFD, LES, Monte Carlo), sempre iguais no site todo. Na primeira ocorrência de cada página, siglas por extenso: "CFD (Computational Fluid Dynamics)".
- Cada tópico começa com verbo no passado (cargo encerrado) ou presente (atual), traz a ferramenta e, quando existir **e for verdadeiro**, o resultado (número, posição, entrega). Números só com o seu OK.
- Datas sempre no padrão da seção 2 de `revisao-r6.md`, com `<time datetime>`.
- Links com texto descritivo ("Artigo no EPTT 2024 (PDF)"), nunca "clique aqui".
- Informação importante nunca só em imagem ou PDF; o PDF do currículo deve ter texto real.
- Proibido: texto invisível, instruções dirigidas a IA, repetição de palavras-chave, adjetivos sem fato ("apaixonado", "dinâmico").
- Sem telefone ou endereço (já decidido na limpeza de segurança).

## 8. Camada para máquinas (não depende de JavaScript)
O HTML tem as três línguas intercaladas (`lang="pt-BR|en|fr"`) e a visão é escolhida por JS e CSS. Um rastreador que não executa JavaScript lê as três línguas misturadas e, em Dados e TI e Ciber, o texto dentro de células de código. Por isso o CV precisa também de saídas limpas:
1. **`cv.pt-BR.md`, `cv.en.md`, `cv.fr.md`** na raiz: o CV completo (as três áreas juntas) em Markdown, gerado por `tools/build-cv.mjs` a partir dos campos marcados nas páginas (`data-f`), uma língua por arquivo.
2. **`llms.txt`** na raiz: título, resumo em uma frase e links para os `cv.*.md`, para as quatro páginas e para o PDF.
3. **`<link rel="alternate" type="text/markdown" hreflang="…" href="/cv.<lang>.md">`** no `<head>` das páginas, além do PDF como `rel="alternate" type="application/pdf"`.
4. **JSON-LD** (`ProfilePage` com `Person`): `name`, `jobTitle`, `description` (inclui a disponibilidade), `knowsAbout` (competências canônicas), `affiliation`/`alumniOf` conforme os fatos, `sameAs` (LinkedIn, GitHub), `email`, `image`, e as publicações como `ScholarlyArticle`. Mesmo texto das páginas.
5. **`robots.txt`**: manter permitido o acesso de rastreadores de busca e de assistentes de IA (decisão do Igor; é o que permite ser encontrado).
6. **`sitemap.xml`** com os `cv.*.md` e o PDF.
7. **Teste de sincronia**: `tests/check-cv-sync.mjs` regenera os arquivos em memória e falha se diferirem dos versionados.
8. O Markdown só tem o que já é público no site.

## 9. Imagens e itens de mídia
- Foto do Igor: 4:5, ≈ 96×120 no Simplificado, ao lado do nome (celular: acima do nome, centralizada ou à esquerda, ≤ 96 px de largura).
- Fotos de projeto: reaproveitam os arquivos do Temático; miniaturas ≤ 160 px de altura, `alt` descritivo e legenda. A galeria com `<dialog>` continua abrindo a imagem inteira.
- Slides e artigo: miniatura + link de texto.
- Simulações e retrato ASCII ficam ocultos. No lugar de cada simulação, uma linha com o link "Ver simulação no modo Temático", que troca a visão e leva até a seção.

## 10. Impressão (`@media print`, Simplificado)
- A4, margens 15 mm, corpo 10,5 pt, cores em preto sobre branco, sem barra superior, sem seletor, sem miniaturas de galeria (só foto do Igor).
- Meta: 2 páginas por área. Itens com `break-inside: avoid`; títulos de seção com `break-after: avoid`.
- Links externos de contato e publicações mostram o endereço depois do texto.
- No Temático, a impressão continua como hoje.

## 11. Marcação no HTML temático
Para extrair o conteúdo sem ler a sintaxe de código, cada valor das células de Dados e TI e Ciber recebe `data-f`:
`title`, `org`, `place`, `period`, `desc`, `bullet`, `stack`, `link`. Nas células de Dados, são os spans de nível 1 e 2 já criados. O CSS do Simplificado oculta a sintaxe e mostra cada campo como bloco, na ordem da seção 6. Nas páginas de Aero, o HTML já é semântico e só precisa dos mesmos `data-f` nos itens.

## 12. Testes
- `check-parity`: seletor de visão e rótulos nas três línguas, nas 4 páginas.
- `check-views`: nas 4 páginas e 3 línguas, em `data-view="simple"` não há elemento com animação, sem scroll horizontal em 375/768/1280 px, h1 único, hierarquia h2 > h3 sem saltos, todo `<img>` com `alt`.
- `check-cv-sync` (seção 8) e `check-links` incluindo os novos arquivos.
- Contraste ≥ 4,5:1 nos dois temas; foco visível; navegação por teclado completa.

## 13. Pacotes
| Pacote | Conteúdo |
|---|---|
| S1 | infraestrutura: atributo, script de início, URL e armazenamento, seletor (desktop, celular, menu), camada neutra de tokens, esqueleto da barra e do cabeçalho, testes de paridade |
| S2 | Aero no Simplificado, com foto, figuras e slides; ocultar os elementos temáticos; impressão básica; botões "Ver versão simplificada" nos cartões da Home (a Home em si fica no Temático) |
| S3 | `data-f` em Dados e TI e Ciber, e o Simplificado dessas duas páginas |
| S4 | redação para humanos e IA (resumos, competências, tópicos, idiomas, disponibilidade), impressão final, `check-views` |
| S5 | camada para máquinas: `build-cv.mjs`, `cv.*.md`, `llms.txt`, JSON-LD, links alternate, robots, sitemap, sincronia |

## 14. Pendências do Igor
1. Resultados verdadeiros e mensuráveis (números, posições, entregas) para os tópicos de cada experiência e projeto.
2. Texto de disponibilidade a publicar (ex.: "Disponível para início imediato; São Carlos e região, São José dos Campos, Araraquara, Gavião Peixoto; remoto ou híbrido").
3. Idiomas e níveis (puxarei do CV e do LinkedIn do projeto para você confirmar).
4. Confirmar que o `robots.txt` deve permitir rastreadores de assistentes de IA.
